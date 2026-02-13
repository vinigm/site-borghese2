"""
Script para reenviar fotos de um imóvel já cadastrado.
Faz upload para o Cloudinary e atualiza os JSONs.
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

PRESET_NAME = "preset_imoveis"

# ============================================================
# CONFIGURAR AQUI
# ============================================================
ID_IMOVEL = 406
PASTA_FOTOS = r"G:\Meu Drive\SiteBorghesi\assets\images\imoveis\apto_teste"
NOME_PASTA_CLOUDINARY = "apto_teste"  # Nome da pasta no Cloudinary

# Arquivos que serão atualizados
ARQUIVO_INDIVIDUAL = "src/data/imoveis/id406_rua_cip_n392_0.json"
ARQUIVO_PRINCIPAL = "src/data/imoveis.json"
# ============================================================

def reenviar():
    print(f"\n📸 Reenviando fotos do imóvel ID {ID_IMOVEL}...")
    print(f"   Pasta local: {PASTA_FOTOS}")
    print(f"   Destino Cloudinary: imoveis/{NOME_PASTA_CLOUDINARY}\n")
    
    # 1. Upload das fotos
    fotos = sorted([f for f in os.listdir(PASTA_FOTOS) 
                    if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))])
    
    urls = []
    for i, foto in enumerate(fotos, 1):
        try:
            res = cloudinary.uploader.upload(
                os.path.join(PASTA_FOTOS, foto),
                upload_preset=PRESET_NAME,
                folder=f"imoveis/{NOME_PASTA_CLOUDINARY}",
                use_filename=True,
                unique_filename=False
            )
            urls.append(res['secure_url'])
            print(f"   [{i}/{len(fotos)}] ✅ {foto}")
        except Exception as e:
            print(f"   [{i}/{len(fotos)}] ❌ {foto}: {e}")
    
    if not urls:
        print("\n❌ Nenhuma foto enviada. Abortando.")
        return
    
    print(f"\n✅ {len(urls)} fotos enviadas com sucesso!")
    
    # 2. Atualizar JSON individual
    with open(ARQUIVO_INDIVIDUAL, 'r', encoding='utf-8') as f:
        dados = json.load(f)
    
    dados['imagens'] = urls
    
    with open(ARQUIVO_INDIVIDUAL, 'w', encoding='utf-8') as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)
    print(f"✅ Atualizado: {ARQUIVO_INDIVIDUAL}")
    
    # 3. Atualizar imoveis.json principal
    if os.path.exists(ARQUIVO_PRINCIPAL):
        with open(ARQUIVO_PRINCIPAL, 'r', encoding='utf-8') as f:
            dados_principal = json.load(f)
        
        lista = dados_principal.get('imoveis', dados_principal)
        for imovel in lista:
            if imovel.get('id') == ID_IMOVEL:
                imovel['imagens'] = urls
                break
        
        with open(ARQUIVO_PRINCIPAL, 'w', encoding='utf-8') as f:
            json.dump(dados_principal, f, indent=2, ensure_ascii=False)
        print(f"✅ Atualizado: {ARQUIVO_PRINCIPAL}")
    
    print(f"\n🎉 Imóvel ID {ID_IMOVEL} agora tem {len(urls)} fotos!")

if __name__ == "__main__":
    reenviar()
