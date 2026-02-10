# 🏠 Site Imobiliária - Projeto Piloto

## 📁 Estrutura do Projeto

```
ProjetoSite/
├── index.html                      # Página inicial
├── pages/                          # Páginas adicionais
│   ├── imoveis.html               # Catálogo de imóveis
│   ├── sobre.html                 # Sobre a imobiliária
│   └── contato.html               # Formulário de contato
├── src/
│   ├── styles/                    # Estilos CSS organizados
│   │   ├── base/
│   │   │   ├── reset.css         # Reset CSS
│   │   │   ├── variables.css     # Variáveis CSS (cores, fonts, etc)
│   │   │   └── typography.css    # Estilos de tipografia
│   │   ├── components/           # Componentes reutilizáveis
│   │   │   ├── header.css        # Cabeçalho/navegação
│   │   │   ├── footer.css        # Rodapé
│   │   │   ├── button.css        # Botões
│   │   │   ├── card-imovel.css   # Card de imóvel
│   │   │   └── filtros.css       # Sistema de filtros
│   │   ├── pages/                # Estilos específicos de páginas
│   │   │   ├── home.css          # Página inicial
│   │   │   ├── imoveis.css       # Página de imóveis
│   │   │   └── contato.css       # Página de contato
│   │   └── main.css              # Arquivo principal (importa tudo)
│   ├── scripts/                   # JavaScript organizado
│   │   ├── main.js               # Script principal
│   │   ├── components/           # Componentes JS
│   │   │   ├── renderizador-imoveis.js    # Renderiza cards de imóveis
│   │   │   ├── sistema-filtros.js         # Lógica de filtros
│   │   │   └── formulario-contato.js      # Validação do formulário
│   │   └── utils/                # Utilitários
│   │       ├── carregador-dados.js        # Carrega dados (fetch)
│   │       └── helpers.js                 # Funções auxiliares
│   └── data/                      # Dados da aplicação
│       └── imoveis.json          # Base de dados dos imóveis
└── assets/                        # Recursos estáticos
    ├── images/                    # Imagens
    │   ├── imoveis/              # Fotos dos imóveis
    │   └── geral/                # Imagens gerais
    └── icons/                     # Ícones

```

## 🎨 Arquitetura

### Organização CSS (Metodologia BEM)
- **Base**: Estilos fundamentais e variáveis
- **Components**: Componentes reutilizáveis
- **Pages**: Estilos específicos de cada página

### Organização JavaScript (Modular)
- **Components**: Componentes interativos isolados
- **Utils**: Funções utilitárias reutilizáveis
- **Data**: Separação de dados da lógica

## 🚀 Como usar

### Adicionar novos imóveis
Edite o arquivo: `src/data/imoveis.json`

### Modificar cores/tema
Edite o arquivo: `src/styles/base/variables.css`

### Hospedagem gratuita
1. Crie conta no [Netlify](https://netlify.com) ou [Vercel](https://vercel.com)
2. Faça upload da pasta do projeto
3. Conecte seu domínio

## 📝 Tecnologias
- HTML5 semântico
- CSS3 moderno (Flexbox, Grid, CSS Variables)
- JavaScript ES6+ (Vanilla, sem frameworks)
- Mobile-first e responsivo
