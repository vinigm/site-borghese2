import os
import json
import cloudinary
import cloudinary.uploader

# 1. Carregar credenciais do arquivo txt
def load_keys(filepath):
    keys = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            # Ignora linhas vazias ou sem '='
            if not line or '=' not in line:
                continue
            # Remove espaços ao redor do '=' e dos valores
            k, v = line.split('=', 1)
            keys[k.strip()] = v.strip()
    return keys

keys = load_keys('keys_cloudnary.txt')  # Nome correto do arquivo

cloudinary.config(
    cloud_name = keys['cloud_name'],
    api_key = keys['api_key'],
    api_secret = keys['api_secret'],
    secure = True
)

BASE_DIR = "assets/images/imoveis/"
PRESET_NAME = "preset_imoveis"
lista_final_imoveis = []

def processar_pasta(caminho_pasta, nome_relativo):
    """Processa uma pasta e suas imagens, retorna lista de URLs"""
    urls_fotos = []
    
    for item in os.listdir(caminho_pasta):
        item_path = os.path.join(caminho_pasta, item)
        
        # Se for subpasta, processa recursivamente
        if os.path.isdir(item_path):
            print(f"   📁 Subpasta: {nome_relativo}/{item}")
            urls_subpasta = processar_pasta(item_path, f"{nome_relativo}/{item}")
            urls_fotos.extend(urls_subpasta)
        
        # Se for imagem, faz upload
        elif item.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            folder_destinatario = f"imoveis/{nome_relativo}"
            
            try:
                res = cloudinary.uploader.upload(
                    item_path,
                    upload_preset = PRESET_NAME,
                    folder = folder_destinatario,
                    use_filename = True,
                    unique_filename = False
                )
                urls_fotos.append(res['secure_url'])
                print(f"      ✅ {item}")
            except Exception as e:
                print(f"      ❌ Erro em {item}: {e}")
    
    return urls_fotos

def processar_imoveis():
    # Varre as pastas de imóveis (ex: Apto ana gomes, jonatan_eso...)
    for pasta_imovel in os.listdir(BASE_DIR):
        caminho_pasta = os.path.join(BASE_DIR, pasta_imovel)
        
        if os.path.isdir(caminho_pasta):
            print(f"\n{'='*60}")
            print(f"📂 Processando: {pasta_imovel}")
            print('='*60)
            
            urls_fotos = processar_pasta(caminho_pasta, pasta_imovel)
            
            # Criar a estrutura JSON para este imóvel
            imovel_data = {
                "id": None,
                "titulo": pasta_imovel,
                "imagens": urls_fotos,
                "disponivel": True
            }
            lista_final_imoveis.append(imovel_data)
            
            print(f"   📊 Total: {len(urls_fotos)} imagens processadas")

    # Salva o resultado em um JSON pronto para o site
    with open('novos_imoveis_cloudinary.json', 'w', encoding='utf-8') as f:
        json.dump(lista_final_imoveis, f, indent=4, ensure_ascii=False)
    
    print("\n✅ Concluído! O arquivo 'novos_imoveis_cloudinary.json' foi gerado.")

if __name__ == "__main__":
    processar_imoveis()