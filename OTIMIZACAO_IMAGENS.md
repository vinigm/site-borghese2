# 🖼️ Otimizador de Imagens - Site Borghese

Script Python para otimização automática de imagens do site, convertendo JPG/PNG para WebP com compressão eficiente.

## 📋 Requisitos

```bash
pip install Pillow tqdm
```

## 🚀 Como Usar

### Uso Básico

```bash
python otimizar_imagens.py
```

Por padrão, processa a pasta `assets/images` e salva em `output_images`.

### Uso com Pastas Customizadas

```bash
python otimizar_imagens.py <pasta_origem> <pasta_destino>
```

**Exemplos:**

```bash
# Processar apenas empreendimentos
python otimizar_imagens.py assets/images/empreendimentos empreendimentos_otimizados

# Processar apenas imóveis
python otimizar_imagens.py assets/images/imoveis imoveis_otimizados

# Processar pasta específica
python otimizar_imagens.py "assets/images/empreendimentos/arven" arven_otimizado
```

## ✨ Recursos

- ✅ **Conversão para WebP** - Formato moderno com melhor compressão
- ✅ **Qualidade 90** - Reduz peso drasticamente sem perda visual perceptível
- ✅ **Compressão otimizada** - Usa method=6 (mais lenta mas mais eficiente)
- ✅ **Preserva orientação** - Corrige EXIF antes de remover metadados
- ✅ **Remove metadados** - Elimina EXIF, GPS e outros dados desnecessários
- ✅ **Estrutura preservada** - Mantém a hierarquia de pastas
- ✅ **Barra de progresso** - Acompanhe o processamento em tempo real
- ✅ **Relatório detalhado** - Estatísticas de economia de espaço

## 📊 Exemplo de Saída

```
================================================================================
🚀 OTIMIZADOR DE IMAGENS - SITE BORGHESE
================================================================================
Pasta de origem: G:\Meu Drive\SiteBorghesi\assets\images
Pasta de destino: G:\Meu Drive\SiteBorghesi\output_images
================================================================================

🔍 Buscando imagens em: assets\images
✅ Encontradas 156 imagens para processar

🖼️  Otimizando imagens: 100%|████████████████████| 156/156 [02:34<00:00,  1.01img/s]

================================================================================
📊 RESUMO DA OTIMIZAÇÃO
================================================================================

✅ Imagens processadas com sucesso: 156

📦 Tamanho original total: 245.87 MB
📦 Tamanho otimizado total: 89.34 MB

💾 Economia de espaço: 156.53 MB
📉 Redução percentual: 63.7%

📊 Economia média por imagem: 1.00 MB

📁 Imagens otimizadas salvas em: G:\Meu Drive\SiteBorghesi\output_images
================================================================================

✨ Processo concluído!
```

## 🎯 Economia Esperada

Baseado em testes com imagens de sites imobiliários:

- **JPG de alta qualidade**: 60-70% de redução
- **PNG**: 70-85% de redução
- **JPG já comprimido**: 30-50% de redução

## ⚙️ Parâmetros de Otimização

```python
img.save(
    caminho_destino,
    'WEBP',
    quality=90,      # Qualidade visual excelente
    method=6,        # Compressão máxima (0-6)
    optimize=True    # Otimização adicional
)
```

## 🔄 Próximos Passos Após Otimização

1. **Revise as imagens** em `output_images/` para garantir qualidade
2. **Backup das originais** antes de substituir
3. **Substitua os arquivos** no site pelas versões WebP
4. **Atualize referências** no código (HTML/CSS/JS):
   ```html
   <!-- Antes -->
   <img src="assets/images/imoveis/1/foto.jpg" alt="...">
   
   <!-- Depois -->
   <img src="assets/images/imoveis/1/foto.webp" alt="...">
   ```

5. **Configure fallback** para navegadores antigos (opcional):
   ```html
   <picture>
     <source srcset="foto.webp" type="image/webp">
     <img src="foto.jpg" alt="...">
   </picture>
   ```

## 📱 Compatibilidade WebP

WebP é suportado por:
- ✅ Chrome/Edge (desde 2010)
- ✅ Firefox (desde 2019)
- ✅ Safari (desde 2020)
- ✅ Navegadores móveis modernos

**Cobertura**: ~96% dos usuários globais

## 🛠️ Solução de Problemas

### Erro: "Biblioteca não encontrada"

```bash
pip install --upgrade Pillow tqdm
```

### Erro de permissão

Execute como administrador ou verifique permissões da pasta.

### Imagens muito grandes

Para imagens muito grandes (>10MB), considere redimensioná-las primeiro:

```python
# Adicione no script antes de salvar:
if img.width > 2000 or img.height > 2000:
    img.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
```

## 📝 Notas Técnicas

- **Orientação**: Usa `ImageOps.exif_transpose()` para corrigir rotação
- **Transparência**: Converte RGBA para RGB com fundo branco
- **Metadados**: Remove todos os EXIF exceto orientação
- **Estrutura**: Mantém pastas e subpastas idênticas
- **Segurança**: Nunca sobrescreve arquivos originais

## 🎨 Qualidade Visual

Com `quality=90` e `method=6`, a qualidade visual é praticamente indistinguível do original, mas com 60-70% menos peso. Ideal para web!

## 📞 Suporte

Para dúvidas ou problemas, verifique:
- Logs de erro no terminal
- Permissões das pastas
- Versão do Python (requer 3.6+)
- Versão do Pillow (requer 8.0+)

---

**Desenvolvido para Site Borghese - Assessoria Imobiliária** 🏠
