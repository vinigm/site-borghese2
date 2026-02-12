# Estrutura Modular de Dados

## 📁 Nova Organização

A partir desta refatoração, os dados do sistema estão organizados em arquivos individuais para facilitar a manutenção e modificações pontuais.

### Estrutura de Diretórios

```
src/data/
├── config/
│   ├── filtros.json          # Configurações de filtros do sistema
│   └── manifest.json          # Lista de todos os arquivos de dados
├── imoveis/
│   ├── id<id>_<rua>_n<numero>_<unidade>.json
│   └── ...
└── empreendimentos/
    ├── emp_<nome>_<bairro>.json
    └── ...
```

## 📝 Convenção de Nomenclatura

### Imóveis
**Formato:** `id<id>_<rua>_n<numero>_<unidade>.json`

**Exemplo:** `id52_rua_fernando_machado_n265_504.json`
- `id52` = ID do imóvel
- `rua_fernando_machado` = Nome da rua normalizado
- `n265` = Número do prédio
- `504` = Unidade/apartamento

### Empreendimentos
**Formato:** `emp_<nome>_<bairro>.json`

**Exemplo:** `emp_condominio_tom_menino_deus.json`
- `emp_` = Prefixo para empreendimentos
- `condominio_tom` = Nome do empreendimento normalizado
- `menino_deus` = Bairro normalizado

## 🔧 Scripts Utilitários

### migrar_dados.py
Converte os arquivos JSON únicos antigos em arquivos individuais.

```bash
python migrar_dados.py
```

### atualizar_manifesto.py
Atualiza o arquivo `manifest.json` com a lista de todos os arquivos de dados.

**Execute sempre que adicionar/remover arquivos:**
```bash
python atualizar_manifesto.py
```

## ➕ Como Adicionar um Novo Imóvel

1. **Crie o arquivo JSON** seguindo a convenção de nomenclatura
2. **Adicione os dados do imóvel** no formato padrão
3. **Execute o script de atualização:**
   ```bash
   python atualizar_manifesto.py
   ```
4. **Commit e push** das alterações

### Template de Imóvel

```json
{
  "id": 999,
  "empreendimentoId": null,
  "empreendimento": "Nome do Edifício",
  "unidade": "101",
  "torre": null,
  "titulo": "Título do Anúncio",
  "tipo": "apartamento",
  "transacao": "venda",
  "preco": 500000,
  "endereco": {
    "rua": "Rua Exemplo, 123",
    "bairro": "Bairro",
    "cidade": "Porto Alegre",
    "estado": "RS"
  },
  "caracteristicas": {
    "quartos": 2,
    "banheiros": 2,
    "vagas": 1,
    "area": 80,
    "condominio": 500,
    "iptu": 1200
  },
  "descricao": "Descrição completa do imóvel...",
  "imagens": [
    "assets/images/imoveis/pasta/foto1.jpg"
  ],
  "destaque": false,
  "disponivel": true
}
```

## ➕ Como Adicionar um Novo Empreendimento

1. **Crie o arquivo JSON** seguindo a convenção de nomenclatura
2. **Adicione os dados do empreendimento** no formato padrão
3. **Execute o script de atualização:**
   ```bash
   python atualizar_manifesto.py
   ```
4. **Commit e push** das alterações

### Template de Empreendimento

```json
{
  "id": 999,
  "nome": "Nome do Empreendimento",
  "slug": "nome-do-empreendimento",
  "endereco": {
    "rua": "Rua Exemplo",
    "bairro": "Bairro",
    "cidade": "Porto Alegre",
    "estado": "RS"
  },
  "descricao": "Descrição breve...",
  "descricaoCompleta": "Descrição detalhada...",
  "caracteristicas": {
    "unidades": 48,
    "torres": 1,
    "andares": 12,
    "elevadores": 2,
    "status": "pronto-para-morar"
  },
  "lazer": [
    "Piscina",
    "Academia"
  ],
  "diferenciais": [
    "Localização privilegiada"
  ],
  "imagens": [
    "assets/images/empreendimentos/pasta/foto1.jpg"
  ],
  "destaque": true,
  "disponivel": true,
  "metaKeywords": "palavras, chave, seo"
}
```

## ⚙️ Sistema de Carregamento

O `carregador-dados.js` foi atualizado para:

1. **Carregar o manifesto** que lista todos os arquivos
2. **Carregar arquivos individuais** em paralelo usando Promise.all()
3. **Manter cache** para performance
4. **Manter a mesma API pública** - compatibilidade total com código existente

## ✅ Vantagens da Nova Estrutura

- ✨ **Modificações pontuais**: Altere apenas o arquivo do imóvel/empreendimento específico
- 🚀 **Escalabilidade**: Suporta facilmente 500+ imóveis sem arquivo gigante
- 📊 **Controle de versão**: Git mostra exatamente o que mudou
- 🔍 **Busca fácil**: Encontre arquivos pelo nome descritivo
- 🛡️ **Menos conflitos**: Múltiplas pessoas podem trabalhar simultaneamente
- 📝 **Manutenção**: Código mais organizado e fácil de manter

## 📦 Arquivos de Backup

Os arquivos originais foram mantidos como backup:
- `src/data/imoveis.json.backup`
- `src/data/empreendimentos.json.backup`
