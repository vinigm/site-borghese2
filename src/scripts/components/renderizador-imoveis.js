/* ========================================
   RENDERIZADOR DE IMÓVEIS - Renderiza cards de imóveis
   ======================================== */

import { formatarMoeda, formatarEnderecoCurto, gerarLinkWhatsApp } from '../utils/helpers.js';

/**
 * Classe para renderizar imóveis
 */
class RenderizadorImoveis {
  /**
   * Renderiza um card de imóvel
   * @param {Object} imovel - Dados do imóvel
   * @returns {string} - HTML do card
   */
  renderizarCard(imovel) {
    const precoFormatado = formatarMoeda(imovel.preco);
    const periodo = imovel.transacao === 'aluguel' ? '/mês' : '';
    const enderecoFormatado = formatarEnderecoCurto(imovel.endereco);
    
    const badges = [];
    if (imovel.destaque) {
      badges.push('<span class="card-imovel__badge card-imovel__badge--destaque">⭐ Destaque</span>');
    }
    badges.push(`<span class="card-imovel__badge card-imovel__badge--tipo">${this.capitalizarTipo(imovel.tipo)}</span>`);
    badges.push(`<span class="card-imovel__badge card-imovel__badge--transacao">${this.capitalizarTransacao(imovel.transacao)}</span>`);

    // Mensagem padrão do WhatsApp
    const mensagemWhatsApp = `Olá! Tenho interesse no imóvel: ${imovel.titulo} - ${precoFormatado}`;
    const linkWhatsApp = gerarLinkWhatsApp('51993016930', mensagemWhatsApp);

    return `
      <article class="card-imovel" data-imovel-id="${imovel.id}">
        <div class="card-imovel__imagem-container">
          <img 
            src="${imovel.imagens[0] || 'assets/images/placeholder.jpg'}" 
            alt="${imovel.titulo}"
            class="card-imovel__imagem"
            loading="lazy"
          />
          <div class="card-imovel__badges">
            ${badges.join('')}
          </div>
          <button class="card-imovel__favorito" data-id="${imovel.id}" title="Adicionar aos favoritos">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <div class="card-imovel__conteudo">
          <div class="card-imovel__preco">
            ${precoFormatado}
            ${periodo ? `<span class="card-imovel__preco-periodo">${periodo}</span>` : ''}
          </div>

          <h3 class="card-imovel__titulo">${imovel.titulo}</h3>

          <div class="card-imovel__endereco">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${enderecoFormatado}</span>
          </div>

          <div class="card-imovel__caracteristicas">
            ${this.renderizarCaracteristica('quartos', imovel.caracteristicas.quartos)}
            ${this.renderizarCaracteristica('banheiros', imovel.caracteristicas.banheiros)}
            ${this.renderizarCaracteristica('vagas', imovel.caracteristicas.vagas)}
            ${this.renderizarCaracteristica('area', imovel.caracteristicas.area)}
          </div>
        </div>

        <div class="card-imovel__footer">
          <a href="${linkWhatsApp}" target="_blank" rel="noopener" class="botao botao--whatsapp botao--pequeno card-imovel__botao">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
          <button class="botao botao--outline botao--pequeno card-imovel__botao" onclick="alert('Página de detalhes em desenvolvimento')">
            Ver Detalhes
          </button>
        </div>
      </article>
    `;
  }

  /**
   * Renderiza uma característica do imóvel
   * @param {string} tipo - Tipo da característica
   * @param {number} valor - Valor
   * @returns {string} - HTML da característica
   */
  renderizarCaracteristica(tipo, valor) {
    const icones = {
      quartos: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
      banheiros: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l11 0"></path><path d="M12 3l0 3"></path><path d="M6 8v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"></path></svg>',
      vagas: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><circle cx="12" cy="16" r="2"></circle><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>',
      area: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 3v18"></path><path d="M15 3v18"></path></svg>'
    };

    const labels = {
      quartos: `${valor} ${valor === 1 ? 'quarto' : 'quartos'}`,
      banheiros: `${valor} ${valor === 1 ? 'banheiro' : 'banheiros'}`,
      vagas: `${valor} ${valor === 1 ? 'vaga' : 'vagas'}`,
      area: `${valor}m²`
    };

    return `
      <div class="card-imovel__caracteristica">
        ${icones[tipo]}
        <span class="card-imovel__caracteristica-valor">${labels[tipo]}</span>
      </div>
    `;
  }

  /**
   * Renderiza lista de imóveis
   * @param {Array} imoveis - Array de imóveis
   * @param {string} containerSelector - Seletor do container
   */
  renderizarLista(imoveis, containerSelector) {
    const container = document.querySelector(containerSelector);
    
    if (!container) {
      console.error(`Container não encontrado: ${containerSelector}`);
      return;
    }

    if (imoveis.length === 0) {
      container.innerHTML = this.renderizarVazio();
      return;
    }

    const html = imoveis.map(imovel => this.renderizarCard(imovel)).join('');
    container.innerHTML = html;

    // Adiciona event listeners para favoritos
    this.adicionarEventListenersFavoritos(container);
  }

  /**
   * Renderiza estado vazio
   * @returns {string} - HTML do estado vazio
   */
  renderizarVazio() {
    return `
      <div class="imoveis-vazio">
        <div class="imoveis-vazio__icone">🏠</div>
        <h3 class="imoveis-vazio__titulo">Nenhum imóvel encontrado</h3>
        <p class="imoveis-vazio__texto">
          Não encontramos imóveis com os filtros selecionados.
          Tente ajustar os filtros ou limpar a busca.
        </p>
        <button class="botao botao--primario" onclick="window.location.reload()">
          Limpar Filtros
        </button>
      </div>
    `;
  }

  /**
   * Renderiza estado de carregamento
   * @param {string} containerSelector - Seletor do container
   */
  renderizarCarregando(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner loading-spinner--large"></div>
        <p style="margin-top: 1rem; color: var(--cor-texto-secundario);">Carregando imóveis...</p>
      </div>
    `;
  }

  /**
   * Adiciona event listeners para botões de favoritos
   * @param {HTMLElement} container - Container dos cards
   */
  adicionarEventListenersFavoritos(container) {
    const botoesFavorito = container.querySelectorAll('.card-imovel__favorito');
    
    botoesFavorito.forEach(botao => {
      botao.addEventListener('click', (e) => {
        e.stopPropagation();
        botao.classList.toggle('ativo');
        
        const id = botao.dataset.id;
        // Implementar lógica de favoritos aqui
        console.log(`Imóvel ${id} ${botao.classList.contains('ativo') ? 'adicionado aos' : 'removido dos'} favoritos`);
      });
    });
  }

  /**
   * Capitaliza tipo de imóvel
   */
  capitalizarTipo(tipo) {
    const tipos = {
      'apartamento': 'Apartamento',
      'casa': 'Casa',
      'terreno': 'Terreno',
      'comercial': 'Comercial'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Capitaliza tipo de transação
   */
  capitalizarTransacao(transacao) {
    const transacoes = {
      'venda': 'Venda',
      'aluguel': 'Aluguel'
    };
    return transacoes[transacao] || transacao;
  }
}

// Exporta instância única
const renderizadorImoveis = new RenderizadorImoveis();
export default renderizadorImoveis;
