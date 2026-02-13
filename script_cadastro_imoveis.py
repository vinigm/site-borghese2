import os
import json
import cloudinary
import cloudinary.uploader
import re
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

# Caminhos reais do projeto
PASTA_IMOVEIS_JSON = 'src/data/imoveis/'          # JSONs individuais
ARQUIVO_PRINCIPAL  = 'src/data/imoveis.json'       # Index geral do site
ARQUIVO_MANIFESTO  = 'src/data/config/manifest.json'  # Manifesto que o site lê
PRESET_NAME        = "preset_imoveis"

# ============================================================
# FUNÇÕES AUXILIARES
# ============================================================

def slugify(text):
    """Transforma 'Rua Jacinto Gomes' em 'rua_jacinto_gomes'"""
    text = text.lower().strip()
    text = text.replace(" ", "_").replace(",", "").replace(".", "")
    return re.sub(r'[^a-z0-9_]', '', text)

def proximo_id():
    """Lê o manifesto e os JSONs individuais para encontrar o próximo ID"""
    ids_existentes = []
    for arquivo in os.listdir(PASTA_IMOVEIS_JSON):
        if arquivo.endswith('.json'):
            with open(os.path.join(PASTA_IMOVEIS_JSON, arquivo), 'r', encoding='utf-8') as f:
                dados = json.load(f)
                if 'id' in dados:
                    ids_existentes.append(dados['id'])
    return (max(ids_existentes) + 1) if ids_existentes else 1

def upload_fotos_cloudinary(pasta_input):
    """Faz upload de todas as fotos de uma pasta para o Cloudinary.
    Aceita caminho completo OU apenas nome da pasta."""
    
    # Se o usuário digitou caminho completo, usa direto
    if os.path.isabs(pasta_input) or os.path.exists(pasta_input):
        caminho_local = pasta_input
        # Extrai só o nome da pasta para usar no Cloudinary
        nome_pasta = os.path.basename(caminho_local.rstrip('/\\'))
    else:
        # Se digitou só o nome, junta com o base dir
        caminho_local = os.path.join("assets/images/imoveis", pasta_input)
        nome_pasta = pasta_input
    
    urls = []
    
    if not os.path.exists(caminho_local):
        print(f"⚠️  Pasta não encontrada: {caminho_local}")
        return urls
    
    fotos = sorted([f for f in os.listdir(caminho_local) 
                    if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))])
    
    if not fotos:
        print("⚠️  Nenhuma foto encontrada na pasta.")
        return urls
    
    print(f"\n📸 Enviando {len(fotos)} fotos para o Cloudinary...")
    print(f"   Pasta no Cloudinary: imoveis/{nome_pasta}")
    for i, foto in enumerate(fotos, 1):
        try:
            res = cloudinary.uploader.upload(
                os.path.join(caminho_local, foto),
                upload_preset=PRESET_NAME,
                folder=f"imoveis/{nome_pasta}",
                use_filename=True,
                unique_filename=False
            )
            urls.append(res['secure_url'])
            print(f"   [{i}/{len(fotos)}] ✅ {foto}")
        except Exception as e:
            print(f"   [{i}/{len(fotos)}] ❌ {foto}: {e}")
    
    return urls

def input_sim_nao(pergunta):
    """Pergunta sim/não e retorna True/False"""
    resp = input(f"{pergunta} (s/n): ").strip().lower()
    return resp in ('s', 'sim', 'y', 'yes')

def input_opcional(pergunta, tipo=str):
    """Input que aceita vazio (retorna None)"""
    resp = input(f"{pergunta} (Enter para pular): ").strip()
    if not resp:
        return None
    try:
        return tipo(resp)
    except ValueError:
        print(f"   ⚠️  Valor inválido, pulando.")
        return None

# ============================================================
# COLETA DE DADOS (Formulário completo)
# ============================================================

def coletar_dados_imovel(novo_id):
    """Coleta todos os dados do imóvel via terminal"""
    
    print(f"\n{'='*60}")
    print(f"  CADASTRO DE NOVO IMÓVEL — ID: {novo_id}")
    print(f"{'='*60}")
    
    # --- Dados básicos ---
    print("\n📋 DADOS BÁSICOS:")
    titulo = input("   Título: ")
    tipo = input("   Tipo (apartamento/casa/comercial/terreno): ").strip().lower() or "apartamento"
    transacao = input("   Transação (venda/aluguel): ").strip().lower() or "venda"
    preco = int(input("   Preço (só números): "))
    
    # --- Endereço ---
    print("\n📍 ENDEREÇO:")
    rua = input("   Rua (ex: Rua Jacinto Gomes, 119): ")
    bairro = input("   Bairro: ")
    cidade = input("   Cidade: ") or "Porto Alegre"
    estado = input("   Estado: ") or "RS"
    
    # --- Unidade ---
    print("\n🏢 UNIDADE:")
    unidade = input_opcional("   Unidade/Apto")
    torre = input_opcional("   Torre")
    empreendimento = input_opcional("   Nome do empreendimento")
    empreendimento_id = input_opcional("   ID do empreendimento (número)", int)
    
    # --- Características ---
    print("\n📐 CARACTERÍSTICAS:")
    quartos = int(input("   Quartos: ") or 0)
    banheiros = int(input("   Banheiros: ") or 0)
    vagas = int(input("   Vagas de garagem: ") or 0)
    area = int(input("   Área (m²): ") or 0)
    
    caracteristicas = {
        "quartos": quartos,
        "banheiros": banheiros,
        "vagas": vagas,
        "area": area
    }
    
    # Campos opcionais de características
    suites = input_opcional("   Suítes", int)
    if suites: caracteristicas["suites"] = suites
    
    condominio = input_opcional("   Condomínio (R$)", int)
    if condominio: caracteristicas["condominio"] = condominio
    
    iptu = input_opcional("   IPTU anual (R$)", int)
    if iptu: caracteristicas["iptu"] = iptu
    
    # Extras (sim/não)
    print("\n   Extras (responda s ou n):")
    extras_mapa = {
        "Piscina": "piscina",
        "Elevador": "elevador",
        "Churrasqueira": "churrasqueira",
        "Bicicletário": "bicicletario",
        "Salão de festas": "salaoFestas",
        "Academia": "academia",
        "Portaria 24h": "portaria24h"
    }
    for pergunta, chave in extras_mapa.items():
        if input_sim_nao(f"   {pergunta}"):
            caracteristicas[chave] = True
    
    # --- Descrição ---
    print("\n📝 DESCRIÇÃO:")
    descricao = input("   Descrição do imóvel:\n   ")
    
    # --- Destaque ---
    destaque = input_sim_nao("\n⭐ Colocar em destaque na página inicial")
    
    # --- Fotos ---
    print("\n📷 FOTOS:")
    print("   Pode ser só o nome da pasta (ex: apto_teste)")
    print("   Ou o caminho completo (ex: G:\\...\\apto_teste)")
    pasta_fotos = input("   Pasta de fotos: ").strip().strip('"').strip("'")
    urls_fotos = upload_fotos_cloudinary(pasta_fotos) if pasta_fotos else []
    
    # --- Montar objeto completo ---
    # Extrair número da rua para o nome do arquivo
    match_numero = re.search(r'(\d+)', rua.split(',')[-1]) if ',' in rua else None
    numero_rua = match_numero.group(1) if match_numero else "0"
    
    dados = {
        "id": novo_id,
        "empreendimentoId": empreendimento_id,
        "empreendimento": empreendimento,
        "unidade": unidade,
        "torre": torre,
        "titulo": titulo,
        "tipo": tipo,
        "transacao": transacao,
        "preco": preco,
        "endereco": {
            "rua": rua,
            "bairro": bairro,
            "cidade": cidade,
            "estado": estado
        },
        "caracteristicas": caracteristicas,
        "descricao": descricao,
        "imagens": urls_fotos,
        "destaque": destaque,
        "disponivel": True
    }
    
    return dados, numero_rua

# ============================================================
# SALVAR E REGISTRAR
# ============================================================

def salvar_imovel(dados, numero_rua):
    """Salva o imóvel em todas as camadas do sistema"""
    
    novo_id = dados['id']
    rua_slug = slugify(dados['endereco']['rua'].split(',')[0])
    unidade_slug = dados['unidade'] or "0"
    
    # 1. Nome do arquivo individual
    nome_arquivo = f"id{novo_id}_{rua_slug}_n{numero_rua}_{unidade_slug}.json"
    caminho_individual = os.path.join(PASTA_IMOVEIS_JSON, nome_arquivo)
    
    with open(caminho_individual, 'w', encoding='utf-8') as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Arquivo individual criado: {nome_arquivo}")
    
    # 2. Atualizar o manifesto (para o site carregar)
    with open(ARQUIVO_MANIFESTO, 'r', encoding='utf-8') as f:
        manifesto = json.load(f)
    
    caminho_no_manifesto = f"src/data/imoveis/{nome_arquivo}"
    if caminho_no_manifesto not in manifesto['imoveis']:
        manifesto['imoveis'].append(caminho_no_manifesto)
        with open(ARQUIVO_MANIFESTO, 'w', encoding='utf-8') as f:
            json.dump(manifesto, f, indent=2, ensure_ascii=False)
        print(f"✅ Manifesto atualizado: {ARQUIVO_MANIFESTO}")
    
    # 3. Atualizar imoveis.json principal (backup/compatibilidade)
    if os.path.exists(ARQUIVO_PRINCIPAL):
        with open(ARQUIVO_PRINCIPAL, 'r', encoding='utf-8') as f:
            dados_principal = json.load(f)
        
        lista = dados_principal.get('imoveis', dados_principal if isinstance(dados_principal, list) else [])
        lista.append(dados)
        
        if isinstance(dados_principal, dict):
            dados_principal['imoveis'] = lista
        else:
            dados_principal = lista
        
        with open(ARQUIVO_PRINCIPAL, 'w', encoding='utf-8') as f:
            json.dump(dados_principal, f, indent=2, ensure_ascii=False)
        print(f"✅ Index principal atualizado: {ARQUIVO_PRINCIPAL}")

# ============================================================
# MAIN
# ============================================================

def cadastrar_imovel():
    novo_id = proximo_id()
    dados, numero_rua = coletar_dados_imovel(novo_id)
    
    # Resumo antes de salvar
    print(f"\n{'='*60}")
    print(f"  RESUMO — Confirme os dados:")
    print(f"{'='*60}")
    print(f"  ID: {dados['id']}")
    print(f"  Título: {dados['titulo']}")
    print(f"  Tipo: {dados['tipo']} | Transação: {dados['transacao']}")
    print(f"  Preço: R$ {dados['preco']:,.0f}")
    print(f"  Endereço: {dados['endereco']['rua']}, {dados['endereco']['bairro']}")
    print(f"  Fotos: {len(dados['imagens'])} imagens no Cloudinary")
    print(f"  Destaque: {'Sim' if dados['destaque'] else 'Não'}")
    print(f"{'='*60}")
    
    if input_sim_nao("\n🚀 Salvar imóvel"):
        salvar_imovel(dados, numero_rua)
        print(f"\n🎉 Imóvel ID {novo_id} cadastrado com sucesso!")
        print(f"   Ele já vai aparecer no site automaticamente.")
    else:
        print("\n❌ Cadastro cancelado.")

if __name__ == "__main__":
    cadastrar_imovel()