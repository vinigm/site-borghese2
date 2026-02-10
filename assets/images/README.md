# 📁 Pasta de Imagens - Instruções

Esta pasta é destinada para armazenar as imagens dos imóveis e outras imagens do site.

## 📂 Estrutura Recomendada

```
assets/images/
├── imoveis/              # Fotos dos imóveis
│   ├── apto1-sala.jpg
│   ├── apto1-quarto.jpg
│   ├── casa1-frente.jpg
│   └── ...
├── geral/                # Imagens gerais do site
│   ├── logo.png
│   ├── banner.jpg
│   └── ...
└── placeholder.jpg       # Imagem padrão para imóveis sem foto
```

## 🖼️ Recomendações para Imagens de Imóveis

### Tamanhos Recomendados:
- **Card de imóvel**: 800x600px (proporção 4:3)
- **Banner hero**: 1920x600px
- **Logo**: 200x200px

### Formato:
- Use **JPEG** para fotos de imóveis (menor tamanho)
- Use **PNG** para logos e ícones (fundo transparente)
- Use **WebP** para melhor compressão (navegadores modernos)

### Otimização:
- Mantenha as imagens abaixo de 200KB sempre que possível
- Use ferramentas como TinyPNG, Squoosh ou ImageOptim para comprimir
- Considere lazy loading (já implementado no código)

## 📸 Como Adicionar Imagens dos Imóveis

1. **Organize as fotos**: Salve as fotos na pasta `assets/images/imoveis/`
2. **Nomenclatura**: Use nomes descritivos como:
   - `apartamento-centro-sala.jpg`
   - `casa-jardins-fachada.jpg`
   - `studio-vila-madalena-cozinha.jpg`

3. **Atualize o JSON**: No arquivo `src/data/imoveis.json`, adicione os caminhos:
```json
"imagens": [
  "assets/images/imoveis/apto1-sala.jpg",
  "assets/images/imoveis/apto1-quarto.jpg",
  "assets/images/imoveis/apto1-cozinha.jpg"
]
```

## 🎨 Placeholder Temporário

Enquanto você não tem as fotos, o site usa um placeholder cinza.
Você pode usar serviços online gratuitos para placeholders:
- https://placehold.co/800x600/e5e7eb/6b7280?text=Imóvel
- https://via.placeholder.com/800x600
- https://picsum.photos/800/600 (fotos aleatórias)

## 📝 Dicas

- Tire fotos em boa iluminação (preferencialmente luz natural)
- Capture diferentes ângulos de cada cômodo
- Inclua fotos da fachada, áreas comuns e diferenciais
- Mantenha um padrão visual em todas as fotos
- Evite fotos escuras ou desfocadas

## 🚀 Próximos Passos

1. Adicione suas primeiras fotos aqui
2. Atualize as referências no `imoveis.json`
3. Teste o site localmente para verificar se as imagens carregam
4. Otimize as imagens antes do deploy
