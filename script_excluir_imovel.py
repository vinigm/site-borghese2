"""
Script para excluir um imóvel do site Borghese.
Remove de: JSON individual, manifesto, imoveis.json e Cloudinary.
Registra vendas em CSV para análise de dados.
"""
import os
import json
import csv
import re
import cloudinary
import cloudinary.uploader
import cloudinary.api
from datetime import datetime

# ============================================================
# CONFIGURAÇÃO
# ============================================================

def load_keys(filepath):
    keys = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line:
                k, v = line.strip().split('=', 1)
                keys[k.strip()] = v.strip()
    return keys

keys = load_keys('keys_cloudnary.txt')
cloudinary.config(cloud_name=keys['cloud_name'], api_key=keys['api_key'], api_secret=keys['api_secret'], secure=True)

PASTA_IMOVEIS_JSON = 'src/data/imoveis/'
ARQUIVO_PRINCIPAL  = 'src/data/imoveis.json'
ARQUIVO_MANIFESTO  = 'src/data/config/manifest.json'
ARQUIVO_HISTORICO  = 'historico_imoveis.csv'

# ============================================================
# FUNÇÕES AUXILIARES
# ============================================================

def extrair_public_id(url_cloudinary):
    """Extrai o public_id de uma URL do Cloudinary para poder deletar.
    Ex: https://res.cloudinary.com/xxx/image/upload/v123/imoveis/pasta/foto.jpg
    -> imoveis/pasta/foto
    """
    # Remove a base URL e o versionamento
    match = re.search(r'/upload/(?:v\d+/)?(.*?)(?:\.\w+)$', url_cloudinary)
    if match:
        return match.group(1)
    return None

def encontrar_imovel_por_id(id_busca):
    """Busca o imóvel nos JSONs individuais e retorna (dados, caminho_arquivo)"""
    for arquivo in os.listdir(PASTA_IMOVEIS_JSON):
        if arquivo.endswith('.json'):
            caminho = os.path.join(PASTA_IMOVEIS_JSON, arquivo)
            with open(caminho, 'r', encoding='utf-8') as f:
                dados = json.load(f)
            if dados.get('id') == id_busca:
                return dados, caminho
    return None, None

def formatar_preco(valor):
    return f"R$ {valor:,.0f}".replace(",", ".")

# ============================================================
# REGISTRAR NO HISTÓRICO (CSV)
# ============================================================

def registrar_historico(dados, foi_vendido, motivo='outro'):
    """Salva registro no CSV de histórico para análise de dados"""
    
    arquivo_novo = not os.path.exists(ARQUIVO_HISTORICO)
    
    registro = {
        'data_exclusao': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'id': dados.get('id'),
        'titulo': dados.get('titulo'),
        'tipo': dados.get('tipo'),
        'transacao': dados.get('transacao'),
        'preco': dados.get('preco'),
        'rua': dados.get('endereco', {}).get('rua'),
        'bairro': dados.get('endereco', {}).get('bairro'),
        'cidade': dados.get('endereco', {}).get('cidade'),
        'estado': dados.get('endereco', {}).get('estado'),
        'quartos': dados.get('caracteristicas', {}).get('quartos'),
        'banheiros': dados.get('caracteristicas', {}).get('banheiros'),
        'vagas': dados.get('caracteristicas', {}).get('vagas'),
        'area_m2': dados.get('caracteristicas', {}).get('area'),
        'empreendimento': dados.get('empreendimento'),
        'qtd_fotos': len(dados.get('imagens', [])),
        'vendido': 'SIM' if foi_vendido else 'NAO',
        'motivo': motivo
    }
    
    with open(ARQUIVO_HISTORICO, 'a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=registro.keys())
        if arquivo_novo:
            writer.writeheader()
        writer.writerow(registro)
    
    print(f"📊 Registro salvo em: {ARQUIVO_HISTORICO}")

# ============================================================
# DELETAR DO CLOUDINARY
# ============================================================

def deletar_fotos_cloudinary(imagens):
    """Deleta todas as fotos do imóvel no Cloudinary"""
    if not imagens:
        print("   Nenhuma foto para deletar no Cloudinary.")
        return
    
    public_ids = []
    for url in imagens:
        pid = extrair_public_id(url)
        if pid:
            public_ids.append(pid)
    
    if not public_ids:
        print("   ⚠️  Não foi possível extrair IDs das imagens.")
        return
    
    print(f"\n🗑️  Deletando {len(public_ids)} fotos do Cloudinary...")
    
    # Cloudinary permite deletar até 100 de uma vez
    for i in range(0, len(public_ids), 100):
        lote = public_ids[i:i+100]
        try:
            resultado = cloudinary.api.delete_resources(lote)
            deletados = sum(1 for v in resultado.get('deleted', {}).values() if v == 'deleted')
            nao_encontrados = sum(1 for v in resultado.get('deleted', {}).values() if v == 'not_found')
            print(f"   ✅ {deletados} deletadas | ⚠️ {nao_encontrados} não encontradas")
        except Exception as e:
            print(f"   ❌ Erro ao deletar lote: {e}")

# ============================================================
# REMOVER DO SISTEMA LOCAL
# ============================================================

def remover_do_manifesto(caminho_arquivo):
    """Remove o imóvel do manifest.json"""
    with open(ARQUIVO_MANIFESTO, 'r', encoding='utf-8') as f:
        manifesto = json.load(f)
    
    # Normaliza o caminho
    caminho_relativo = caminho_arquivo.replace('\\', '/')
    
    antes = len(manifesto['imoveis'])
    manifesto['imoveis'] = [c for c in manifesto['imoveis'] if c.replace('\\', '/') != caminho_relativo]
    depois = len(manifesto['imoveis'])
    
    if antes != depois:
        with open(ARQUIVO_MANIFESTO, 'w', encoding='utf-8') as f:
            json.dump(manifesto, f, indent=2, ensure_ascii=False)
        print(f"   ✅ Removido do manifesto")
    else:
        print(f"   ⚠️  Não encontrado no manifesto")

def remover_do_principal(id_imovel):
    """Remove o imóvel do imoveis.json principal"""
    if not os.path.exists(ARQUIVO_PRINCIPAL):
        return
    
    with open(ARQUIVO_PRINCIPAL, 'r', encoding='utf-8') as f:
        dados = json.load(f)
    
    lista = dados.get('imoveis', dados if isinstance(dados, list) else [])
    antes = len(lista)
    lista_filtrada = [i for i in lista if i.get('id') != id_imovel]
    depois = len(lista_filtrada)
    
    if antes != depois:
        if isinstance(dados, dict):
            dados['imoveis'] = lista_filtrada
        else:
            dados = lista_filtrada
        
        with open(ARQUIVO_PRINCIPAL, 'w', encoding='utf-8') as f:
            json.dump(dados, f, indent=2, ensure_ascii=False)
        print(f"   ✅ Removido do index principal")
    else:
        print(f"   ⚠️  Não encontrado no index principal")

def remover_arquivo_individual(caminho_arquivo):
    """Deleta o arquivo JSON individual"""
    if os.path.exists(caminho_arquivo):
        os.remove(caminho_arquivo)
        print(f"   ✅ Arquivo deletado: {os.path.basename(caminho_arquivo)}")
    else:
        print(f"   ⚠️  Arquivo não encontrado: {caminho_arquivo}")

# ============================================================
# FLUXO PRINCIPAL
# ============================================================

def excluir_imovel():
    print(f"\n{'='*60}")
    print(f"  EXCLUSÃO DE IMÓVEL")
    print(f"{'='*60}")
    
    # 1. Pedir ID
    try:
        id_busca = int(input("\n🔍 Qual o ID do imóvel que você quer excluir: "))
    except ValueError:
        print("❌ ID inválido.")
        return
    
    # 2. Buscar imóvel
    dados, caminho_arquivo = encontrar_imovel_por_id(id_busca)
    
    if not dados:
        print(f"❌ Imóvel ID {id_busca} não encontrado.")
        return
    
    # 3. Mostrar informações para confirmação
    caract = dados.get('caracteristicas', {})
    endereco = dados.get('endereco', {})
    
    print(f"\n{'='*60}")
    print(f"  📋 DADOS DO IMÓVEL:")
    print(f"{'='*60}")
    print(f"  ID:              {dados['id']}")
    print(f"  Título:          {dados.get('titulo', '-')}")
    print(f"  Tipo:            {dados.get('tipo', '-')} | {dados.get('transacao', '-')}")
    print(f"  Preço:           {formatar_preco(dados.get('preco', 0))}")
    print(f"  Endereço:        {endereco.get('rua', '-')}")
    print(f"  Bairro:          {endereco.get('bairro', '-')}")
    print(f"  Quartos:         {caract.get('quartos', '-')}")
    print(f"  Banheiros:       {caract.get('banheiros', '-')}")
    print(f"  Área:            {caract.get('area', '-')} m²")
    print(f"  Vagas:           {caract.get('vagas', '-')}")
    print(f"  Empreendimento:  {dados.get('empreendimento', '-')}")
    print(f"  Fotos:           {len(dados.get('imagens', []))} imagens no Cloudinary")
    print(f"{'='*60}")
    
    # 4. Confirmação
    confirma = input(f"\n⚠️  Tem certeza que deseja EXCLUIR este imóvel? (s/n): ").strip().lower()
    if confirma not in ('s', 'sim'):
        print("❌ Exclusão cancelada.")
        return
    
    # 5. Perguntar se foi vendido (para analytics)
    foi_vendido = input("\n💰 O imóvel foi vendido? (s/n): ").strip().lower() in ('s', 'sim')
    motivo = 'venda'
    
    if foi_vendido:
        print("   ✅ Registrado como VENDA no histórico!")
    else:
        print("\n   Qual o motivo da exclusão?")
        print("   1 - Desistência do proprietário")
        print("   2 - Imóvel alugado por fora")
        print("   3 - Contrato encerrado")
        print("   4 - Erro de cadastro")
        print("   5 - Outro")
        opcao = input("   Opção (1-5): ").strip()
        
        motivos = {
            '1': 'desistencia_proprietario',
            '2': 'alugado_por_fora',
            '3': 'contrato_encerrado',
            '4': 'erro_cadastro',
            '5': 'outro'
        }
        motivo = motivos.get(opcao, 'outro')
        
        if opcao == '5':
            motivo_livre = input("   Descreva o motivo: ").strip()
            if motivo_livre:
                motivo = motivo_livre
        
        print(f"   ℹ️  Registrado como exclusão: {motivo}")
    
    # 6. EXECUTAR EXCLUSÃO
    print(f"\n🔄 Excluindo imóvel ID {id_busca}...\n")
    
    # 6a. Registrar no histórico CSV (ANTES de deletar!)
    registrar_historico(dados, foi_vendido, motivo)
    
    # 6b. Deletar fotos do Cloudinary
    deletar_fotos_cloudinary(dados.get('imagens', []))
    
    # 6c. Remover do manifesto
    caminho_no_manifesto = caminho_arquivo.replace('\\', '/')
    remover_do_manifesto(caminho_no_manifesto)
    
    # 6d. Remover do imoveis.json principal
    remover_do_principal(id_busca)
    
    # 6e. Deletar arquivo individual
    remover_arquivo_individual(caminho_arquivo)
    
    # 7. Relatório
    print(f"\n{'='*60}")
    print(f"  ✅ IMÓVEL ID {id_busca} EXCLUÍDO COM SUCESSO!")
    print(f"{'='*60}")
    print(f"  📊 Histórico salvo em: {ARQUIVO_HISTORICO}")
    print(f"  🗑️  Fotos removidas do Cloudinary")
    print(f"  📁 Arquivo JSON deletado")
    print(f"  📋 Manifesto e index atualizados")
    print(f"{'='*60}")

if __name__ == "__main__":
    excluir_imovel()
