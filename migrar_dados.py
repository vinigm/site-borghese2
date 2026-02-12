#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para migrar dados de arquivos únicos para arquivos individuais
"""

import json
import os
import re
from pathlib import Path

def normalizar_string(texto):
    """Remove caracteres especiais e normaliza string para nome de arquivo"""
    if not texto:
        return ""
    # Remove acentos e caracteres especiais
    texto = texto.lower()
    texto = texto.replace('ç', 'c')
    texto = texto.replace('ã', 'a')
    texto = texto.replace('á', 'a')
    texto = texto.replace('à', 'a')
    texto = texto.replace('â', 'a')
    texto = texto.replace('é', 'e')
    texto = texto.replace('ê', 'e')
    texto = texto.replace('í', 'i')
    texto = texto.replace('ó', 'o')
    texto = texto.replace('ô', 'o')
    texto = texto.replace('õ', 'o')
    texto = texto.replace('ú', 'u')
    texto = texto.replace("'", "")
    # Remove espaços e caracteres especiais
    texto = re.sub(r'[^a-z0-9]+', '_', texto)
    texto = texto.strip('_')
    return texto

def extrair_numero_rua(rua):
    """Extrai o número da rua"""
    match = re.search(r',?\s*(\d+)', rua)
    return match.group(1) if match else "0"

def gerar_nome_arquivo_imovel(imovel):
    """Gera o nome do arquivo para um imóvel"""
    imovel_id = imovel['id']
    rua = imovel['endereco']['rua'].split(',')[0]  # Pega só o nome da rua
    rua_norm = normalizar_string(rua)
    numero = extrair_numero_rua(imovel['endereco']['rua'])
    unidade = imovel.get('unidade', 'sem_unidade')
    
    if unidade:
        return f"id{imovel_id}_{rua_norm}_n{numero}_{unidade}.json"
    else:
        return f"id{imovel_id}_{rua_norm}_n{numero}.json"

def gerar_nome_arquivo_empreendimento(emp):
    """Gera o nome do arquivo para um empreendimento"""
    nome = normalizar_string(emp['nome'])
    bairro = normalizar_string(emp['endereco']['bairro'])
    return f"emp_{nome}_{bairro}.json"

def migrar_imoveis():
    """Migra imóveis para arquivos individuais"""
    # Carregar dados originais
    with open('src/data/imoveis.json', 'r', encoding='utf-8') as f:
        dados = json.load(f)
    
    imoveis = dados['imoveis']
    print(f"Migrando {len(imoveis)} imóveis...")
    
    for imovel in imoveis:
        nome_arquivo = gerar_nome_arquivo_imovel(imovel)
        caminho = f"src/data/imoveis/{nome_arquivo}"
        
        with open(caminho, 'w', encoding='utf-8') as f:
            json.dump(imovel, f, ensure_ascii=False, indent=2)
        
        print(f"  ✓ Criado: {nome_arquivo}")
    
    print(f"\n✓ {len(imoveis)} imóveis migrados com sucesso!")

def migrar_empreendimentos():
    """Migra empreendimentos para arquivos individuais"""
    # Carregar dados originais
    with open('src/data/empreendimentos.json', 'r', encoding='utf-8') as f:
        dados = json.load(f)
    
    empreendimentos = dados['empreendimentos']
    print(f"\nMigrando {len(empreendimentos)} empreendimentos...")
    
    for emp in empreendimentos:
        nome_arquivo = gerar_nome_arquivo_empreendimento(emp)
        caminho = f"src/data/empreendimentos/{nome_arquivo}"
        
        with open(caminho, 'w', encoding='utf-8') as f:
            json.dump(emp, f, ensure_ascii=False, indent=2)
        
        print(f"  ✓ Criado: {nome_arquivo}")
    
    print(f"\n✓ {len(empreendimentos)} empreendimentos migrados com sucesso!")

def criar_arquivo_filtros():
    """Cria arquivo de configuração de filtros"""
    with open('src/data/imoveis.json', 'r', encoding='utf-8') as f:
        dados = json.load(f)
    
    filtros = dados.get('filtros', {})
    
    with open('src/data/config/filtros.json', 'w', encoding='utf-8') as f:
        json.dump(filtros, f, ensure_ascii=False, indent=2)
    
    print("\n✓ Arquivo de filtros criado!")

def main():
    print("=" * 60)
    print("MIGRAÇÃO DE DADOS - ESTRUTURA MODULAR")
    print("=" * 60)
    
    migrar_imoveis()
    migrar_empreendimentos()
    criar_arquivo_filtros()
    
    print("\n" + "=" * 60)
    print("✓ MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 60)
    print("\nPróximos passos:")
    print("1. Atualizar carregador-dados.js")
    print("2. Testar o sistema")
    print("3. Fazer backup dos arquivos antigos")

if __name__ == "__main__":
    main()
