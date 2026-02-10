/* ========================================
   HELPERS - Funções auxiliares reutilizáveis
   ======================================== */

/**
 * Formata número para moeda brasileira
 * @param {number} valor - Valor a ser formatado
 * @returns {string} - Valor formatado em R$
 */
export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
}

/**
 * Formata número para exibição
 * @param {number} numero - Número a ser formatado
 * @returns {string} - Número formatado
 */
export function formatarNumero(numero) {
  return new Intl.NumberFormat('pt-BR').format(numero);
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param {string} texto - Texto a ser formatado
 * @returns {string} - Texto capitalizado
 */
export function capitalizarTexto(texto) {
  return texto
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

/**
 * Gera slug a partir de texto
 * @param {string} texto - Texto para gerar slug
 * @returns {string} - Slug gerado
 */
export function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Debounce - Limita execução de função
 * @param {Function} func - Função a ser executada
 * @param {number} delay - Tempo de espera em ms
 * @returns {Function} - Função com debounce
 */
export function debounce(func, delay = 300) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle - Limita frequência de execução
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Limite de tempo em ms
 * @returns {Function} - Função com throttle
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Formata endereço completo
 * @param {Object} endereco - Objeto com dados do endereço
 * @returns {string} - Endereço formatado
 */
export function formatarEndereco(endereco) {
  const { rua, bairro, cidade, estado } = endereco;
  return `${rua}, ${bairro} - ${cidade}/${estado}`;
}

/**
 * Formata endereço curto (apenas bairro e cidade)
 * @param {Object} endereco - Objeto com dados do endereço
 * @returns {string} - Endereço curto
 */
export function formatarEnderecoCurto(endereco) {
  const { bairro, cidade } = endereco;
  return `${bairro}, ${cidade}`;
}

/**
 * Valida email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - True se válido
 */
export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida telefone brasileiro
 * @param {string} telefone - Telefone a ser validado
 * @returns {boolean} - True se válido
 */
export function validarTelefone(telefone) {
  const regex = /^(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
  return regex.test(telefone);
}

/**
 * Formata telefone
 * @param {string} telefone - Telefone a ser formatado
 * @returns {string} - Telefone formatado
 */
export function formatarTelefone(telefone) {
  const numeros = telefone.replace(/\D/g, '');
  
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
}

/**
 * Gera link do WhatsApp
 * @param {string} telefone - Número do WhatsApp
 * @param {string} mensagem - Mensagem pré-definida
 * @returns {string} - Link do WhatsApp
 */
export function gerarLinkWhatsApp(telefone, mensagem = '') {
  const numeroLimpo = telefone.replace(/\D/g, '');
  const mensagemCodificada = encodeURIComponent(mensagem);
  return `https://wa.me/55${numeroLimpo}?text=${mensagemCodificada}`;
}

/**
 * Mostra notificação toast
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo: 'sucesso', 'erro', 'info', 'alerta'
 */
export function mostrarNotificacao(mensagem, tipo = 'info') {
  // Remove notificações anteriores
  const notificacaoExistente = document.querySelector('.notificacao-toast');
  if (notificacaoExistente) {
    notificacaoExistente.remove();
  }

  const notificacao = document.createElement('div');
  notificacao.className = `notificacao-toast notificacao-toast--${tipo}`;
  notificacao.textContent = mensagem;
  
  notificacao.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  const cores = {
    sucesso: '#10b981',
    erro: '#ef4444',
    info: '#3b82f6',
    alerta: '#f59e0b'
  };

  notificacao.style.backgroundColor = cores[tipo] || cores.info;

  document.body.appendChild(notificacao);

  setTimeout(() => {
    notificacao.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => notificacao.remove(), 300);
  }, 3000);
}

/**
 * Adiciona animações CSS necessárias
 */
export function adicionarAnimacoes() {
  const estilo = document.createElement('style');
  estilo.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(estilo);
}

/**
 * Scroll suave para elemento
 * @param {string} seletor - Seletor CSS do elemento
 */
export function scrollParaElemento(seletor) {
  const elemento = document.querySelector(seletor);
  if (elemento) {
    elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Verifica se elemento está visível no viewport
 * @param {HTMLElement} elemento - Elemento a ser verificado
 * @returns {boolean} - True se visível
 */
export function estaVisivel(elemento) {
  const rect = elemento.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Armazena dados no localStorage
 * @param {string} chave - Chave de armazenamento
 * @param {*} valor - Valor a ser armazenado
 */
export function salvarNoStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    console.error('Erro ao salvar no localStorage:', erro);
  }
}

/**
 * Recupera dados do localStorage
 * @param {string} chave - Chave de armazenamento
 * @returns {*} - Valor armazenado ou null
 */
export function obterDoStorage(chave) {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : null;
  } catch (erro) {
    console.error('Erro ao obter do localStorage:', erro);
    return null;
  }
}

/**
 * Remove dados do localStorage
 * @param {string} chave - Chave de armazenamento
 */
export function removerDoStorage(chave) {
  try {
    localStorage.removeItem(chave);
  } catch (erro) {
    console.error('Erro ao remover do localStorage:', erro);
  }
}

// Inicializa animações ao carregar o módulo
adicionarAnimacoes();
