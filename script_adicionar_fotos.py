"""
Script para adicionar mais fotos a um imóvel já cadastrado.
Mantém as fotos existentes e adiciona as novas.
"""
import os
import json
import cloudinary
import cloudinary.uploader

# Configuração
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
PRESET_NAME = "preset_imoveis"

# ============================================================
# FUNÇÕES
# ============================================================

def encontrar_imovel_por_id(id_busca):
    """Busca o imóvel e retorna (dados, caminho_arquivo)"""
    for arquivo in os.listdir(PASTA_IMOVEIS_JSON):
        if arquivo.endswith('.json'):
            caminho = os.path.join(PASTA_IMOVEIS_JSON, arquivo)
            with open(caminho, 'r', encoding='utf-8') as f:
                dados = json.load(f)
            if dados.get('id') == id_busca:
                return dados, caminho
    return None, None

def upload_fotos(pasta_input, nome_pasta_cloudinary, urls_existentes):
    """Faz upload apenas das fotos que ainda não estão no Cloudinary"""
    # Aceita caminho completo ou relativo
    if os.path.isabs(pasta_input) or os.path.exists(pasta_input):
        caminho_local = pasta_input
    else:
        caminho_local = os.path.join("assets/images/imoveis", pasta_input)
    
    if not os.path.exists(caminho_local):
        print(f"⚠️  Pasta não encontrada: {caminho_local}")
        return []
    
    fotos = sorted([f for f in os.listdir(caminho_local) 
                    if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))])
    
    if not fotos:
        print("⚠️  Nenhuma foto encontrada na pasta.")
        return []
    
    # Extrair nomes de arquivos das URLs existentes (para comparar)
    nomes_existentes = set()
    for url in urls_existentes:
        nome_arquivo = os.path.basename(url).lower()
        # Remove extensão e compara
        nome_sem_ext = os.path.splitext(nome_arquivo)[0]
        nomes_existentes.add(nome_sem_ext)
    
    # Filtrar apenas fotos novas
    fotos_novas = []
    fotos_ja_existem = []
    for foto in fotos:
        nome_sem_ext = os.path.splitext(foto.lower())[0]
        if nome_sem_ext in nomes_existentes:
            fotos_ja_existem.append(foto)
        else:
            fotos_novas.append(foto)
    
    if fotos_ja_existem:
        print(f"\n⏭️  {len(fotos_ja_existem)} fotos já existem (pulando):")
        for foto in fotos_ja_existem[:5]:  # Mostra até 5
            print(f"      {foto}")
        if len(fotos_ja_existem) > 5:
            print(f"      ... e mais {len(fotos_ja_existem) - 5}")
    
    if not fotos_novas:
        print(f"\n✅ Todas as fotos da pasta já estão no Cloudinary!")
        return []
    
    urls = []
    print(f"\n📸 Enviando {len(fotos_novas)} NOVAS fotos para o Cloudinary...")
    print(f"   Destino: imoveis/{nome_pasta_cloudinary}\n")
    
    for i, foto in enumerate(fotos_novas, 1):
        try:
            res = cloudinary.uploader.upload(
                os.path.join(caminho_local, foto),
                upload_preset=PRESET_NAME,
                folder=f"imoveis/{nome_pasta_cloudinary}",
                use_filename=True,
                unique_filename=False
            )
            urls.append(res['secure_url'])
            print(f"   [{i}/{len(fotos_novas)}] ✅ {foto}")
        except Exception as e:
            print(f"   [{i}/{len(fotos_novas)}] ❌ {foto}: {e}")
    
    return urls

def atualizar_jsons(id_imovel, caminho_individual, novas_urls, urls_antigas):
    """Atualiza os JSONs adicionando as novas URLs"""
    todas_urls = urls_antigas + novas_urls
    
    # 1. Atualizar JSON individual
    with open(caminho_individual, 'r', encoding='utf-8') as f:
        dados = json.load(f)
    
    dados['imagens'] = todas_urls
    
    with open(caminho_individual, 'w', encoding='utf-8') as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)
    print(f"   ✅ {os.path.basename(caminho_individual)}")
    
    # 2. Atualizar imoveis.json principal
    if os.path.exists(ARQUIVO_PRINCIPAL):
        with open(ARQUIVO_PRINCIPAL, 'r', encoding='utf-8') as f:
            dados_principal = json.load(f)
        
        lista = dados_principal.get('imoveis', dados_principal)
        for imovel in lista:
            if imovel.get('id') == id_imovel:
                imovel['imagens'] = todas_urls
                break
        
        with open(ARQUIVO_PRINCIPAL, 'w', encoding='utf-8') as f:
            json.dump(dados_principal, f, indent=2, ensure_ascii=False)
        print(f"   ✅ {ARQUIVO_PRINCIPAL}")

# ============================================================
# MAIN
# ============================================================

def adicionar_fotos():
    print(f"\n{'='*60}")
    print(f"  ADICIONAR FOTOS A UM IMÓVEL")
    print(f"{'='*60}")
    
    # 1. Pedir ID
    try:
        id_busca = int(input("\n🔍 ID do imóvel: "))
    except ValueError:
        print("❌ ID inválido.")
        return
    
    # 2. Buscar imóvel
    dados, caminho_arquivo = encontrar_imovel_por_id(id_busca)
    
    if not dados:
        print(f"❌ Imóvel ID {id_busca} não encontrado.")
        return
    
    # 3. Mostrar informações
    urls_antigas = dados.get('imagens', [])
    print(f"\n📋 Imóvel: {dados.get('titulo')}")
    print(f"   Fotos atuais: {len(urls_antigas)}")
    
    # 4. Pedir pasta das novas fotos
    print(f"\n📷 NOVAS FOTOS:")
    print("   Pode ser o nome da pasta ou caminho completo")
    pasta_input = input("   Pasta com as novas fotos: ").strip().strip('"').strip("'")
    
    if not pasta_input:
        print("❌ Nenhuma pasta informada.")
        return
    
    # Extrair nome para usar no Cloudinary
    nome_pasta_cloud = os.path.basename(pasta_input.rstrip('/\\'))
    
    # 5. Upload
    novas_urls = upload_fotos(pasta_input, nome_pasta_cloud, urls_antigas)
    
    if not novas_urls:
        print("\n❌ Nenhuma foto enviada. Abortando.")
        return
    
    print(f"\n✅ {len(novas_urls)} fotos enviadas com sucesso!")
    
    # 6. Atualizar JSONs
    print(f"\n💾 Atualizando arquivos...")
    atualizar_jsons(id_busca, caminho_arquivo, novas_urls, urls_antigas)
    
    # 7. Relatório final
    total_final = len(urls_antigas) + len(novas_urls)
    print(f"\n{'='*60}")
    print(f"  ✅ FOTOS ADICIONADAS COM SUCESSO!")
    print(f"{'='*60}")
    print(f"  Antes:  {len(urls_antigas)} fotos")
    print(f"  Novas:  +{len(novas_urls)} fotos")
    print(f"  Total:  {total_final} fotos")
    print(f"{'='*60}")

if __name__ == "__main__":
    adicionar_fotos()
