# Imagens dos Imóveis

## 📂 Estrutura de Pastas

Cada imóvel tem sua própria pasta numerada pelo ID:

```
imoveis/
├── 1/
│   ├── sala.jpg
│   ├── quarto.jpg
│   └── cozinha.jpg
├── 2/
│   ├── frente.jpg
│   ├── quintal.jpg
│   └── piscina.jpg
└── ...
```

## ✅ Como Adicionar Fotos de um Novo Imóvel

### 1. Crie uma pasta com o ID do imóvel
```
imoveis/7/
```

### 2. Adicione as fotos na pasta
- Use nomes descritivos: `sala.jpg`, `quarto.jpg`, `cozinha.jpg`, `fachada.jpg`, etc.
- Formatos aceitos: JPG, PNG, WebP
- Tamanho recomendado: máximo 1920x1080px
- Peso recomendado: até 500KB por imagem (use ferramentas de compressão)

### 3. Atualize o arquivo `src/data/imoveis.json`

Adicione os caminhos no array de imagens:

```json
{
  "id": 7,
  "titulo": "Meu Imóvel",
  "imagens": [
    "assets/images/imoveis/7/sala.jpg",
    "assets/images/imoveis/7/quarto.jpg",
    "assets/images/imoveis/7/cozinha.jpg"
  ]
}
```

## 💡 Dicas Importantes

- **A primeira imagem** do array é a que aparece no card principal
- Organize as imagens em ordem de importância
- Use nomes consistentes para facilitar a manutenção
- Sempre comprima as imagens antes de adicionar (use TinyPNG, Squoosh, etc.)

## 🔧 Ferramentas de Compressão Recomendadas

- [TinyPNG](https://tinypng.com/) - Online, fácil de usar
- [Squoosh](https://squoosh.app/) - Online, do Google
- [ImageOptim](https://imageoptim.com/) - Desktop (Mac)
- [RIOT](https://riot-optimizer.com/) - Desktop (Windows)
