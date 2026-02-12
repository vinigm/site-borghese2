/* ========================================
   SISTEMA DE FILTROS - Gerencia filtros de imóveis
   ======================================== */

import carregadorDados from '../utils/carregador-dados.js';
import renderizadorImoveis from './renderizador-imoveis.js';
import { debounce, mostrarNotificacao } from '../utils/helpers.js';

/**
 * Classe para gerenciar sistema de filtros
 */
class SistemaFiltros {
  constructor() {
    this.filtros = {};
    this.formulario = null;
    this.containerResultados = null;
    this.inicializado = false;
  }

  /**
   * Inicializa o sistema de filtros
   * @param {string} formSelector - Seletor do formulário
   * @param {string} resultsSelector - Seletor do container de resultados
   */
  async inicializar(formSelector, resultsSelector) {
    this.formulario = document.querySelector(formSelector);
    this.containerResultados = document.querySelector(resultsSelector);

    if (!this.formulario || !this.containerResultados) {
      console.error('Formulário ou container de resultados não encontrado');
      return;
    }

    console.log('🔧 Inicializando sistema de filtros...');

    // Carrega filtros do localStorage
    this.carregarFiltrosSalvos();

    // Adiciona event listeners
    this.adicionarEventListeners();

    // Aplica filtros iniciais
    await this.aplicarFiltros();

    this.inicializado = true;
    console.log('✅ Sistema de filtros inicializado');
  }

  /**
   * Adiciona event listeners aos campos do formulário
   */
  adicionarEventListeners() {
    // Botão aplicar (mantém para quem quiser usar)
    const botaoAplicar = this.formulario.querySelector('[data-acao="aplicar-filtros"]');
    if (botaoAplicar) {
      botaoAplicar.addEventListener('click', (e) => {
        e.preventDefault();
        this.aplicarFiltros();
      });
    }

    // Botão limpar
    const botaoLimpar = this.formulario.querySelector('[data-acao="limpar-filtros"]');
    if (botaoLimpar) {
      botaoLimpar.addEventListener('click', (e) => {
        e.preventDefault();
        this.limparFiltros();
      });
    }

    // Removidos listeners automáticos - agora controlados pela página
    // para evitar duplicação de chamadas

    // Enter no formulário
    this.formulario.addEventListener('submit', (e) => {
      e.preventDefault();
      this.aplicarFiltros();
    });
  }

  /**
   * Coleta filtros do formulário
   * @returns {Object} - Objeto com filtros
   */
  coletarFiltros() {
    const formData = new FormData(this.formulario);
    const filtros = {};

    // Código do imóvel
    const codigo = formData.get('codigo');
    if (codigo && codigo.trim() !== '') {
      filtros.codigo = codigo.trim();
    }

    // Tipo de imóvel
    const tipo = formData.get('tipo');
    if (tipo && tipo !== 'todos') {
      filtros.tipo = tipo;
    }

    // Tipo de transação
    const transacao = formData.get('transacao');
    if (transacao && transacao !== 'todos') {
      filtros.transacao = transacao;
    }

    // Empreendimento
    const empreendimento = formData.get('empreendimento');
    if (empreendimento && empreendimento !== 'todos') {
      filtros.empreendimento = empreendimento;
    }

    // Bairros (múltiplos)
    const bairrosSelecionados = formData.getAll('bairros');
    if (bairrosSelecionados && bairrosSelecionados.length > 0) {
      filtros.bairros = bairrosSelecionados;
    }

    // Preço mínimo e máximo
    const precoMin = formData.get('precoMin');
    if (precoMin && precoMin !== '') {
      filtros.precoMin = parseFloat(precoMin);
    }

    const precoMax = formData.get('precoMax');
    if (precoMax && precoMax !== '') {
      filtros.precoMax = parseFloat(precoMax);
    }

    // Quartos
    const quartos = formData.get('quartos');
    if (quartos && quartos !== '') {
      filtros.quartos = parseInt(quartos);
    }

    // Banheiros
    const banheiros = formData.get('banheiros');
    if (banheiros && banheiros !== '') {
      filtros.banheiros = parseInt(banheiros);
    }

    // Vagas
    const vagas = formData.get('vagas');
    if (vagas && vagas !== '') {
      filtros.vagas = parseInt(vagas);
    }

    // Área mínima
    const areaMin = formData.get('areaMin');
    if (areaMin && areaMin !== '') {
      filtros.areaMin = parseInt(areaMin);
    }

    // Busca por texto
    const busca = formData.get('busca');
    if (busca && busca.trim() !== '') {
      filtros.busca = busca.trim();
    }

    // Ordenação
    const ordenacao = formData.get('ordenacao');
    if (ordenacao && ordenacao !== '') {
      filtros.ordenacao = ordenacao;
    }

    return filtros;
  }

  /**
   * Aplica os filtros e atualiza resultados
   */
  async aplicarFiltros() {
    try {
      // Coleta filtros
      this.filtros = this.coletarFiltros();

      // Salva no localStorage
      this.salvarFiltros();

      // Mostra loading
      renderizadorImoveis.renderizarCarregando(this.containerResultados);

      // Busca imóveis
      const imoveis = await carregadorDados.buscarImoveis(this.filtros);
      
      // Disponibilizar globalmente para navegação de imagens
      window.imoveisData = imoveis;

      // Renderiza resultados
      renderizadorImoveis.renderizarLista(imoveis, this.containerResultados);

      // Atualiza contador
      this.atualizarContador(imoveis.length);

      // Atualiza tags de filtros ativos
      this.atualizarTagsFiltros();

      console.log(`🔍 Filtros aplicados: ${imoveis.length} imóveis encontrados`);

    } catch (erro) {
      console.error('Erro ao aplicar filtros:', erro);
      mostrarNotificacao('Erro ao buscar imóveis. Tente novamente.', 'erro');
    }
  }

  /**
   * Limpa todos os filtros
   */
  async limparFiltros() {
    // Reseta formulário
    this.formulario.reset();

    // Limpa filtros
    this.filtros = {};

    // Remove do localStorage
    localStorage.removeItem('filtrosImoveis');

    // Aplica filtros (vazio)
    await this.aplicarFiltros();

    mostrarNotificacao('Filtros limpos com sucesso', 'sucesso');
  }

  /**
   * Atualiza contador de resultados
   * @param {number} quantidade - Quantidade de resultados
   */
  atualizarContador(quantidade) {
    const contador = document.querySelector('[data-contador-imoveis]');
    if (contador) {
      contador.innerHTML = `<span>Encontramos <strong>${quantidade}</strong> ${quantidade === 1 ? 'imóvel' : 'imóveis'}</span>`;
    }
  }

  /**
   * Atualiza tags de filtros ativos
   */
  atualizarTagsFiltros() {
    const containerTags = document.querySelector('[data-filtros-ativos]');
    if (!containerTags) return;

    const tags = [];

    if (this.filtros.tipo) {
      tags.push(this.criarTag('tipo', `Tipo: ${this.capitalizarTipo(this.filtros.tipo)}`));
    }

    if (this.filtros.transacao) {
      tags.push(this.criarTag('transacao', `Transação: ${this.capitalizarTransacao(this.filtros.transacao)}`));
    }

    if (this.filtros.empreendimento) {
      tags.push(this.criarTag('empreendimento', `Empreendimento: ${this.filtros.empreendimento}`));
    }

    if (this.filtros.precoMin || this.filtros.precoMax) {
      const min = this.filtros.precoMin || 0;
      const max = this.filtros.precoMax || '∞';
      tags.push(this.criarTag('preco', `Preço: R$ ${min} - ${max}`));
    }

    if (this.filtros.quartos) {
      tags.push(this.criarTag('quartos', `${this.filtros.quartos}+ quartos`));
    }

    if (this.filtros.banheiros) {
      tags.push(this.criarTag('banheiros', `${this.filtros.banheiros}+ banheiros`));
    }

    if (this.filtros.vagas) {
      tags.push(this.criarTag('vagas', `${this.filtros.vagas}+ vagas`));
    }

    if (this.filtros.areaMin) {
      tags.push(this.criarTag('areaMin', `Área mín: ${this.filtros.areaMin}m²`));
    }

    if (this.filtros.busca) {
      tags.push(this.criarTag('busca', `Busca: "${this.filtros.busca}"`));
    }

    if (tags.length > 0) {
      containerTags.innerHTML = `
        <div class="filtros__ativos-titulo">Filtros ativos:</div>
        <div class="filtros__tags">${tags.join('')}</div>
      `;
      containerTags.style.display = 'block';
    } else {
      containerTags.style.display = 'none';
    }
  }

  /**
   * Cria HTML de uma tag de filtro
   * @param {string} chave - Chave do filtro
   * @param {string} texto - Texto da tag
   * @returns {string} - HTML da tag
   */
  criarTag(chave, texto) {
    return `
      <span class="filtros__tag" data-filtro="${chave}">
        ${texto}
        <span class="filtros__tag-remover" onclick="sistemaFiltros.removerFiltro('${chave}')">
          ✕
        </span>
      </span>
    `;
  }

  /**
   * Remove um filtro específico
   * @param {string} chave - Chave do filtro a remover
   */
  async removerFiltro(chave) {
    const campo = this.formulario.querySelector(`[name="${chave}"]`);
    if (campo) {
      campo.value = '';
    }

    delete this.filtros[chave];
    await this.aplicarFiltros();
  }

  /**
   * Salva filtros no localStorage
   */
  salvarFiltros() {
    try {
      localStorage.setItem('filtrosImoveis', JSON.stringify(this.filtros));
    } catch (erro) {
      console.error('Erro ao salvar filtros:', erro);
    }
  }

  /**
   * Carrega filtros salvos do localStorage
   */
  carregarFiltrosSalvos() {
    try {
      const filtrosSalvos = localStorage.getItem('filtrosImoveis');
      if (filtrosSalvos) {
        this.filtros = JSON.parse(filtrosSalvos);
        this.preencherFormulario(this.filtros);
      }
    } catch (erro) {
      console.error('Erro ao carregar filtros:', erro);
    }
  }

  /**
   * Preenche formulário com filtros
   * @param {Object} filtros - Filtros a preencher
   */
  preencherFormulario(filtros) {
    Object.keys(filtros).forEach(chave => {
      const campo = this.formulario.querySelector(`[name="${chave}"]`);
      if (campo) {
        campo.value = filtros[chave];
      }
    });
  }

  capitalizarTipo(tipo) {
    const tipos = {
      'apartamento': 'Apartamento',
      'casa': 'Casa',
      'terreno': 'Terreno',
      'comercial': 'Comercial'
    };
    return tipos[tipo] || tipo;
  }

  capitalizarTransacao(transacao) {
    const transacoes = {
      'venda': 'Venda',
      'aluguel': 'Aluguel'
    };
    return transacoes[transacao] || transacao;
  }
}

// Exporta instância única window para acesso global
const sistemaFiltros = new SistemaFiltros();
window.sistemaFiltros = sistemaFiltros;
export default sistemaFiltros;
