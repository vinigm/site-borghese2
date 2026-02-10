# 🚀 Como Executar o Projeto Localmente

## Opção 1: Live Server (VS Code)

1. **Instale a extensão Live Server no VS Code**:
   - Abra o VS Code
   - Vá em Extensions (Ctrl+Shift+X)
   - Procure por "Live Server"
   - Instale a extensão do Ritwick Dey

2. **Execute**:
   - Abra a pasta do projeto no VS Code
   - Clique com botão direito no arquivo `index.html`
   - Selecione "Open with Live Server"
   - O site abrirá em `http://localhost:5500`

## Opção 2: Python HTTP Server

Se você tem Python instalado:

```powershell
# Python 3
python -m http.server 8000

# Depois acesse: http://localhost:8000
```

## Opção 3: Node.js HTTP Server

Se você tem Node.js instalado:

```powershell
# Instale o http-server globalmente
npm install -g http-server

# Execute
http-server

# Acesse: http://localhost:8080
```

## 🌐 Publicar Online Gratuitamente

### Netlify (Recomendado)

1. Acesse [netlify.com](https://netlify.com)
2. Crie uma conta gratuita
3. Arraste a pasta do projeto para o site
4. Pronto! Seu site está online
5. Conecte seu domínio nas configurações

### Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Crie uma conta gratuita
3. Instale o Vercel CLI:
   ```powershell
   npm install -g vercel
   ```
4. Na pasta do projeto, execute:
   ```powershell
   vercel
   ```
5. Siga as instruções
6. Conecte seu domínio

### GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Vá em Settings > Pages
4. Selecione a branch main
5. Seu site estará em `seuusuario.github.io/nome-repo`

## 📝 Conectar seu Domínio

Após hospedar no Netlify/Vercel:

1. Acesse as configurações do seu site
2. Vá em "Domain Settings"
3. Adicione seu domínio personalizado
4. Configure os DNS conforme instruções:
   - Tipo A: aponte para o IP fornecido
   - Tipo CNAME: www aponte para o endereço fornecido

## ⚙️ Customização

### Alterar Cores
Edite: `src/styles/base/variables.css`

### Adicionar/Remover Imóveis
Edite: `src/data/imoveis.json`

### Alterar Informações de Contato
Edite os arquivos HTML nas seções de footer e contato

### Alterar Número do WhatsApp
Procure por `11999999999` em todos os arquivos e substitua

## 🛠️ Resolução de Problemas

**Os imóveis não aparecem:**
- Verifique se está executando com um servidor HTTP
- Abrir o `index.html` diretamente no navegador pode causar erros de CORS
- Use uma das opções de servidor acima

**Imagens não carregam:**
- Verifique os caminhos no arquivo `imoveis.json`
- As imagens devem estar em `assets/images/imoveis/`

**JavaScript não funciona:**
- Verifique o console do navegador (F12)
- Certifique-se de que está usando um navegador moderno
- Limpe o cache do navegador

## 📱 Testar em Dispositivos Móveis

1. Execute o servidor local
2. Descubra seu IP local:
   ```powershell
   ipconfig
   ```
3. No celular, acesse: `http://SEU-IP:PORTA`
4. Exemplo: `http://192.168.1.100:8000`

## 🚀 Performance

Para melhor performance em produção:

1. **Otimize as imagens** com TinyPNG ou Squoosh
2. **Minifique CSS/JS** (Netlify/Vercel fazem isso automaticamente)
3. **Use WebP** para imagens quando possível
4. **Configure cache** headers (automático em Netlify/Vercel)

---

**Dúvidas?** Revise o README.md principal ou os comentários no código!
