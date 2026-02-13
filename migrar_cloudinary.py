"""
Script para migrar imagens locais para URLs do Cloudinary
Substitui os caminhos locais no imoveis.json pelas URLs do Cloudinary
"""
import json
import os
from datetime import datetime

# Caminhos dos arquivos
JSON_PRINCIPAL = "src/data/imoveis.json"
JSON_CLOUDINARY = "novos_imoveis_cloudinary.json"
JSON_BACKUP = f"src/data/imoveis.json.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"

def extrair_nome_arquivo(caminho):
    """Extrai o nome do arquivo de um caminho (local ou URL)"""
    return os.path.basename(caminho)

def extrair_pasta_imovel(caminho):
    """Extrai a pasta do imóvel do caminho local (incluindo subpastas)
    Ex: assets/images/imoveis/1/foto.jpg -> 1
    Ex: assets/images/imoveis/Fernando machado/foto.jpg -> Fernando machado
    Ex: assets/images/imoveis/jonatan_eso/1/foto.jpg -> jonatan_eso/1
    """
    partes = caminho.replace('\\', '/').split('/')
    try:
        # Encontra 'imoveis' e pega tudo entre 'imoveis' e o nome do arquivo
        idx = partes.index('imoveis')
        # Pega todas as partes entre 'imoveis' e o arquivo final
        pasta_partes = partes[idx + 1:-1]  # -1 para excluir o nome do arquivo
        return '/'.join(pasta_partes) if pasta_partes else None
    except (ValueError, IndexError):
        return None

def criar_mapeamento_cloudinary(json_cloudinary):
    """
    Cria um mapeamento {pasta_imovel: {nome_arquivo: url_cloudinary}}
    Considera subpastas extraindo da própria URL do Cloudinary
    """
    mapeamento = {}
    
    for item in json_cloudinary:
        for url in item['imagens']:
            # Extrai a pasta da URL do Cloudinary
            # Ex: https://res.cloudinary.com/.../imoveis/jonatan_eso/1/foto.jpg
            # Pega "jonatan_eso/1"
            partes_url = url.split('/')
            try:
                idx_imoveis = partes_url.index('imoveis')
                # Pega tudo entre 'imoveis' e o nome do arquivo
                pasta_partes = partes_url[idx_imoveis + 1:-1]
                pasta = '/'.join(pasta_partes)
                
                # URL decode para lidar com espaços (%20)
                from urllib.parse import unquote
                pasta = unquote(pasta)
                
                if pasta not in mapeamento:
                    mapeamento[pasta] = {}
                
                nome_arquivo = extrair_nome_arquivo(url).lower()
                mapeamento[pasta][nome_arquivo] = url
            except (ValueError, IndexError):
                continue
    
    return mapeamento

def encontrar_url_cloudinary(caminho_local, mapeamento):
    """
    Encontra a URL do Cloudinary correspondente ao caminho local
    """
    pasta = extrair_pasta_imovel(caminho_local)
    if not pasta or pasta not in mapeamento:
        print(f"⚠️  Pasta não encontrada no Cloudinary: {pasta} (caminho: {caminho_local})")
        return caminho_local  # Mantém o original se não encontrar
    
    nome_arquivo = extrair_nome_arquivo(caminho_local).lower()
    
    # Tenta encontrar exata
    if nome_arquivo in mapeamento[pasta]:
        return mapeamento[pasta][nome_arquivo]
    
    # Tenta variações de extensão (jpeg/jpg)
    nome_sem_ext = os.path.splitext(nome_arquivo)[0]
    for extensao in ['.jpg', '.jpeg', '.png', '.webp']:
        tentativa = nome_sem_ext + extensao
        if tentativa in mapeamento[pasta]:
            return mapeamento[pasta][tentativa]
    
    print(f"⚠️  Imagem não encontrada no Cloudinary: {nome_arquivo} na pasta {pasta}")
    return caminho_local  # Mantém o original se não encontrar

def migrar_imagens():
    """
    Função principal que faz a migração
    """
    print("🚀 Iniciando migração para Cloudinary...\n")
    
    # 1. Carregar JSONs
    print("📂 Carregando arquivos...")
    with open(JSON_PRINCIPAL, 'r', encoding='utf-8') as f:
        dados_principais = json.load(f)
    
    with open(JSON_CLOUDINARY, 'r', encoding='utf-8') as f:
        dados_cloudinary = json.load(f)
    
    # 2. Criar backup
    print(f"💾 Criando backup em: {JSON_BACKUP}")
    with open(JSON_BACKUP, 'w', encoding='utf-8') as f:
        json.dump(dados_principais, f, indent=2, ensure_ascii=False)
    
    # 3. Criar mapeamento
    print("🗺️  Criando mapeamento de imagens...\n")
    mapeamento = criar_mapeamento_cloudinary(dados_cloudinary)
    
    print(f"   Encontradas {len(mapeamento)} pastas no Cloudinary")
    total_imagens_cloudinary = sum(len(imgs) for imgs in mapeamento.values())
    print(f"   Total de {total_imagens_cloudinary} imagens no Cloudinary\n")
    
    # 4. Migrar imagens
    print("🔄 Migrando imagens...\n")
    total_imoveis = len(dados_principais.get('imoveis', []))
    imoveis_migrados = 0
    imagens_migradas = 0
    imagens_nao_encontradas = 0
    
    for imovel in dados_principais.get('imoveis', []):
        if 'imagens' in imovel and imovel['imagens']:
            teve_migracao = False
            novas_imagens = []
            
            for caminho_local in imovel['imagens']:
                # Já é URL do Cloudinary? Pula
                if caminho_local.startswith('http'):
                    novas_imagens.append(caminho_local)
                    continue
                
                url_cloudinary = encontrar_url_cloudinary(caminho_local, mapeamento)
                novas_imagens.append(url_cloudinary)
                
                if url_cloudinary != caminho_local:
                    imagens_migradas += 1
                    teve_migracao = True
                else:
                    imagens_nao_encontradas += 1
            
            imovel['imagens'] = novas_imagens
            if teve_migracao:
                imoveis_migrados += 1
                print(f"   ✅ Imóvel ID {imovel.get('id', '?')}: {len([img for img in novas_imagens if img.startswith('http')])} imagens migradas")
    
    # 5. Salvar resultado
    print(f"\n💾 Salvando resultado em: {JSON_PRINCIPAL}")
    with open(JSON_PRINCIPAL, 'w', encoding='utf-8') as f:
        json.dump(dados_principais, f, indent=2, ensure_ascii=False)
    
    # 5b. Migrar JSONs modulares (src/data/imoveis/*.json)
    pasta_modulares = "src/data/imoveis"
    if os.path.isdir(pasta_modulares):
        print(f"\n🔄 Migrando JSONs modulares em: {pasta_modulares}\n")
        for arquivo in os.listdir(pasta_modulares):
            if arquivo.endswith('.json'):
                caminho_modular = os.path.join(pasta_modulares, arquivo)
                with open(caminho_modular, 'r', encoding='utf-8') as f:
                    dados_modular = json.load(f)
                
                if 'imagens' in dados_modular and dados_modular['imagens']:
                    teve_migracao_mod = False
                    novas_imagens_mod = []
                    
                    for caminho_local in dados_modular['imagens']:
                        if caminho_local.startswith('http'):
                            novas_imagens_mod.append(caminho_local)
                            continue
                        
                        url_cloudinary = encontrar_url_cloudinary(caminho_local, mapeamento)
                        novas_imagens_mod.append(url_cloudinary)
                        
                        if url_cloudinary != caminho_local:
                            imagens_migradas += 1
                            teve_migracao_mod = True
                        else:
                            imagens_nao_encontradas += 1
                    
                    dados_modular['imagens'] = novas_imagens_mod
                    
                    with open(caminho_modular, 'w', encoding='utf-8') as f:
                        json.dump(dados_modular, f, indent=2, ensure_ascii=False)
                    
                    if teve_migracao_mod:
                        imoveis_migrados += 1
                        print(f"   ✅ {arquivo}: {len([img for img in novas_imagens_mod if img.startswith('http')])} imagens migradas")
                    else:
                        print(f"   ⏭️  {arquivo}: já migrado ou sem imagens locais")
    
    # 6. Relatório final
    print("\n" + "="*60)
    print("📊 RELATÓRIO DA MIGRAÇÃO")
    print("="*60)
    print(f"   Total de imóveis no arquivo: {total_imoveis}")
    print(f"   Imóveis com imagens migradas: {imoveis_migrados}")
    print(f"   Imagens migradas com sucesso: {imagens_migradas}")
    print(f"   Imagens não encontradas: {imagens_nao_encontradas}")
    print(f"   Backup salvo em: {JSON_BACKUP}")
    print("="*60)
    
    if imagens_nao_encontradas > 0:
        print(f"\n⚠️  ATENÇÃO: {imagens_nao_encontradas} imagens não foram encontradas no Cloudinary")
        print("   Verifique se todas as pastas foram enviadas corretamente")
    
    print("\n✅ Migração concluída!")
    print("\n📝 Próximos passos:")
    print("   1. Teste o site para garantir que as imagens estão carregando")
    print("   2. Se tudo estiver OK, você pode deletar as pastas de imagens locais")
    print("   3. Atualize o .gitignore se necessário")
    print("   4. Faça commit das alterações")

if __name__ == "__main__":
    try:
        migrar_imagens()
    except FileNotFoundError as e:
        print(f"❌ Erro: Arquivo não encontrado - {e}")
        print("   Certifique-se de que os arquivos existem:")
        print(f"   - {JSON_PRINCIPAL}")
        print(f"   - {JSON_CLOUDINARY}")
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        import traceback
        traceback.print_exc()
