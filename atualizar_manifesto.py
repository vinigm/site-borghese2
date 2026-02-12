#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para atualizar o manifesto de arquivos automaticamente
"""

import json
import os
from pathlib import Path

def atualizar_manifesto():
    """Atualiza o arquivo manifest.json com a lista de todos os arquivos"""
    
    base_path = Path('src/data')
    
    # Lista todos os arquivos de imóveis
    imoveis_path = base_path / 'imoveis'
    imoveis_files = sorted([
        f'src/data/imoveis/{f.name}' 
        for f in imoveis_path.glob('*.json')
    ])
    
    # Lista todos os arquivos de empreendimentos
    empreendimentos_path = base_path / 'empreendimentos'
    empreendimentos_files = sorted([
        f'src/data/empreendimentos/{f.name}' 
        for f in empreendimentos_path.glob('*.json')
    ])
    
    # Cria o manifesto
    manifesto = {
        'imoveis': imoveis_files,
        'empreendimentos': empreendimentos_files
    }
    
    # Salva o manifesto
    manifest_path = base_path / 'config' / 'manifest.json'
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifesto, f, ensure_ascii=False, indent=2)
    
    print("✓ Manifesto atualizado com sucesso!")
    print(f"  - {len(imoveis_files)} imóveis")
    print(f"  - {len(empreendimentos_files)} empreendimentos")

if __name__ == "__main__":
    atualizar_manifesto()
