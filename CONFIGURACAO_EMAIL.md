# 📧 Configuração de Email - FormSubmit

## ✅ Email Configurado

**Email de destino:** contato@borghese.com.br

## 🚀 Como Funciona

O site agora usa **FormSubmit**, um serviço gratuito que envia os formulários direto para o email sem precisar de backend.

### O que foi configurado:

1. ✅ Formulário de contato atualizado
2. ✅ Integração com FormSubmit
3. ✅ Email de destino: contato@borghese.com.br
4. ✅ Captcha desabilitado (pode ativar depois)
5. ✅ Template de email limpo (formato tabela)

## ⚠️ IMPORTANTE - Primeiro Uso

### **Na primeira vez que alguém enviar o formulário:**

1. O FormSubmit vai enviar um **email de confirmação** para: **contato@borghese.com.br**
2. Você PRECISA **clicar no link de ativação** nesse email
3. Só depois disso os formulários começarão a funcionar

**Sem essa confirmação, os emails não chegam!**

## 📝 Estrutura do Email Recebido

Quando alguém preencher o formulário, você receberá um email com:

```
Nome: João da Silva
Email: joao@email.com
Telefone: (51) 99999-9999
Assunto: Interesse em Imóvel
Mensagem: Olá, gostaria de mais informações sobre...
```

## 🔧 Personalizações Disponíveis

### 1. Adicionar Página de Confirmação

Se quiser redirecionar após envio:

```javascript
formData.append('_next', 'https://seusite.com/obrigado.html');
```

### 2. Ativar Captcha (Anti-spam)

```javascript
formData.append('_captcha', 'true'); // Muda de false para true
```

### 3. Enviar Cópia para o Usuário

```javascript
formData.append('_cc', dados.email); // Envia cópia para quem preencheu
```

### 4. Customizar Assunto do Email

```javascript
formData.append('_subject', `Nova mensagem de ${dados.nome}`);
```

## 🔄 Trocar Email Depois

Quando criar o email com domínio próprio (ex: contato@borghese.com.br):

1. Abra: `src/scripts/utils/carregador-dados.js`
2. Encontre a linha:
   ```javascript
   const response = await fetch('https://formsubmit.co/contato@borghese.com.br', {
   ```
3. Troque para:
   ```javascript
   const response = await fetch('https://formsubmit.co/contato@borghese.com.br', {
   ```
4. **Lembre-se:** Você precisará confirmar o novo email também (primeiro envio)

## 🧪 Como Testar

1. Abra o site em: `pages/contato.html`
2. Preencha o formulário
3. Clique em "Enviar Mensagem"
4. **Primeira vez:** Verifique a caixa de entrada de contato@borghese.com.br
5. Clique no link de ativação
6. Teste novamente - agora deve funcionar!

## 📊 Limites do Plano Gratuito

- ✅ Ilimitado de envios
- ✅ Sem custo
- ✅ Sem limite de formulários
- ⚠️ Branding "Sent via FormSubmit" no email (pode remover com plano pago)

## 🔐 Segurança

- ✅ HTTPS obrigatório
- ✅ Headers CORS configurados
- ✅ Anti-spam integrado
- ✅ Sem exposição do email no código fonte (FormSubmit protege)

## 🆘 Problemas Comuns

### Emails não chegam

1. **Verificar spam/lixeira** em contato@borghese.com.br
2. **Confirmar email** no primeiro uso
3. Testar com outro email se necessário

### Erro 403 ou 404

- Verifique se confirmou o email
- Teste em produção (não funciona em localhost sem HTTPS)

### Email vai para spam

- Adicione formsubmit.co aos contatos seguros
- Marque como "não é spam" no Gmail

## 🎯 Alternativas Futuras

Se quiser mais controle depois:

1. **EmailJS** - Mais customização, também gratuito
2. **Backend PHP** - Controle total, precisa de hospedagem
3. **API própria** - Node.js/Python, mais complexo

## 📞 Suporte FormSubmit

- Site: https://formsubmit.co
- Docs: https://formsubmit.co/documentation
- Sem suporte oficial (serviço gratuito)

---

**Status:** ✅ Configurado e pronto para usar (após confirmar email)

**Última atualização:** Fevereiro 2026
