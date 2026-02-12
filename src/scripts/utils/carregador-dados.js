/* ========================================
   CARREGADOR DE DADOS - Gerencia requisições e cache
   ======================================== */

/**
 * Classe para gerenciar carregamento de dados (estrutura modular)
 */
class CarregadorDados {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.manifestoCarregado = false;
    this.manifesto = null;
  }

  resolverCaminhos(caminho) {
    if (caminho.startsWith('http') || caminho.startsWith('/') || caminho.startsWith('../') || caminho.startsWith('./')) {
      return [caminho];
    }

    const estaEmPages = window.location.pathname.includes('/pages/');
    const caminhos = estaEmPages ? [`../${caminho}`, caminho] : [caminho, `./${caminho}`];
    return [...new Set(caminhos)];
  }

  /**
   * Carrega dados de um arquivo JSON
   * @param {string} caminho - Caminho do arquivo JSON
   * @param {boolean} usarCache - Se deve usar cache
   * @returns {Promise<Object>} - Dados carregados
   */
  async carregarJSON(caminho, usarCache = true) {
    const caminhos = this.resolverCaminhos(caminho);
    let ultimoErro = null;

    for (const caminhoAtual of caminhos) {
      // Verifica cache
      if (usarCache && this.cache.has(caminhoAtual)) {
        const dadosCache = this.cache.get(caminhoAtual);
        const agora = Date.now();

        if (agora - dadosCache.timestamp < this.cacheTimeout) {
          console.log(`📦 Dados carregados do cache: ${caminhoAtual}`);
          return dadosCache.data;
        } else {
          this.cache.delete(caminhoAtual);
        }
      }

      try {
        console.log(`🔄 Carregando dados: ${caminhoAtual}`);
        const resposta = await fetch(caminhoAtual);

        if (!resposta.ok) {
          throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        // Armazena no cache
        if (usarCache) {
          this.cache.set(caminhoAtual, {
            data: dados,
            timestamp: Date.now()
          });
        }

        console.log(`✅ Dados carregados com sucesso: ${caminhoAtual}`);
        return dados;
      } catch (erro) {
        ultimoErro = erro;
      }
    }

    console.error(`❌ Erro ao carregar dados: ${caminho}`, ultimoErro);
    throw ultimoErro;
  }

  /**
   * Carrega o manifesto com lista de arquivos
   * @returns {Promise<Object>} - Manifesto de arquivos
   */
  async carregarManifesto() {
    if (this.manifestoCarregado && this.manifesto) {
      return this.manifesto;
    }
    
    this.manifesto = await this.carregarJSON('src/data/config/manifest.json');
    this.manifestoCarregado = true;
    return this.manifesto;
  }

  /**
   * Carrega todos os imóveis (de múltiplos arquivos)
   * @returns {Promise<Array>} - Array de imóveis
   */
  async carregarImoveis() {
    // Verifica cache geral
    const cacheKey = 'todos_imoveis';
    if (this.cache.has(cacheKey)) {
      const dadosCache = this.cache.get(cacheKey);
      const agora = Date.now();
      if (agora - dadosCache.timestamp < this.cacheTimeout) {
        console.log('📦 Todos os imóveis carregados do cache');
        return dadosCache.data;
      }
    }

    const manifesto = await this.carregarManifesto();
    const promessas = manifesto.imoveis.map(caminho => 
      this.carregarJSON(caminho, false)
    );
    
    const imoveis = await Promise.all(promessas);
    
    // Armazena no cache geral
    this.cache.set(cacheKey, {
      data: imoveis,
      timestamp: Date.now()
    });
    
    console.log(`✅ ${imoveis.length} imóveis carregados de arquivos individuais`);
    return imoveis;
  }

  /**
   * Carrega imóveis em destaque
   * @returns {Promise<Array>} - Array de imóveis em destaque
   */
  async carregarImoveisDestaque() {
    const imoveis = await this.carregarImoveis();
    return imoveis.filter(imovel => imovel.destaque && imovel.disponivel);
  }

  /**
   * Carrega um imóvel específico por ID
   * @param {number} id - ID do imóvel
   * @returns {Promise<Object|null>} - Imóvel ou null
   */
  async carregarImovelPorId(id) {
    const imoveis = await this.carregarImoveis();
    return imoveis.find(imovel => imovel.id === parseInt(id)) || null;
  }

  /**
   * Busca imóveis com filtros
   * @param {Object} filtros - Objeto com filtros
   * @returns {Promise<Array>} - Array de imóveis filtrados
   */
  async buscarImoveis(filtros = {}) {
    let imoveis = await this.carregarImoveis();
    
    // Filtra apenas disponíveis
    imoveis = imoveis.filter(imovel => imovel.disponivel);

    // Aplica filtros
    if (filtros.tipo && filtros.tipo !== 'todos') {
      imoveis = imoveis.filter(imovel => imovel.tipo === filtros.tipo);
    }

    if (filtros.transacao && filtros.transacao !== 'todos') {
      imoveis = imoveis.filter(imovel => imovel.transacao === filtros.transacao);
    }

    // Filtro por empreendimento
    if (filtros.empreendimentoId) {
      imoveis = imoveis.filter(imovel => 
        imovel.empreendimentoId === parseInt(filtros.empreendimentoId)
      );
    }

    if (filtros.empreendimento && filtros.empreendimento !== 'todos') {
      imoveis = imoveis.filter(imovel => imovel.empreendimento === filtros.empreendimento);
    }

    // Filtro por bairros (múltiplos)
    if (filtros.bairros && filtros.bairros.length > 0) {
      imoveis = imoveis.filter(imovel => 
        filtros.bairros.includes(imovel.endereco.bairro)
      );
    }

    if (filtros.precoMin !== undefined) {
      imoveis = imoveis.filter(imovel => imovel.preco >= filtros.precoMin);
    }

    if (filtros.precoMax !== undefined) {
      imoveis = imoveis.filter(imovel => imovel.preco <= filtros.precoMax);
    }

    if (filtros.quartos !== undefined && filtros.quartos > 0) {
      imoveis = imoveis.filter(imovel => 
        imovel.caracteristicas.quartos >= filtros.quartos
      );
    }

    if (filtros.banheiros !== undefined && filtros.banheiros > 0) {
      imoveis = imoveis.filter(imovel => 
        imovel.caracteristicas.banheiros >= filtros.banheiros
      );
    }

    if (filtros.vagas !== undefined && filtros.vagas > 0) {
      imoveis = imoveis.filter(imovel => 
        imovel.caracteristicas.vagas >= filtros.vagas
      );
    }

    if (filtros.areaMin !== undefined) {
      imoveis = imoveis.filter(imovel => 
        imovel.caracteristicas.area >= filtros.areaMin
      );
    }

    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase();
      imoveis = imoveis.filter(imovel => {
        const titulo = imovel.titulo.toLowerCase();
        const descricao = imovel.descricao.toLowerCase();
        const bairro = imovel.endereco.bairro.toLowerCase();
        const cidade = imovel.endereco.cidade.toLowerCase();
        
        return titulo.includes(termoBusca) ||
               descricao.includes(termoBusca) ||
               bairro.includes(termoBusca) ||
               cidade.includes(termoBusca);
      });
    }

    // Ordenação
    if (filtros.ordenacao) {
      switch (filtros.ordenacao) {
        case 'preco-asc':
          imoveis.sort((a, b) => a.preco - b.preco);
          break;
        case 'preco-desc':
          imoveis.sort((a, b) => b.preco - a.preco);
          break;
        case 'area-asc':
          imoveis.sort((a, b) => a.caracteristicas.area - b.caracteristicas.area);
          break;
        case 'area-desc':
          imoveis.sort((a, b) => b.caracteristicas.area - a.caracteristicas.area);
          break;
        case 'recentes':
          imoveis.sort((a, b) => b.id - a.id);
          break;
        default:
          // Mantém ordem padrão
          break;
      }
    }

    return imoveis;
  }

  /**
   * Carrega configurações de filtros
   * @returns {Promise<Object>} - Configurações de filtros
   */
  async carregarConfigFiltros() {
    const dados = await this.carregarJSON('src/data/config/filtros.json');
    return dados || {};
  }

  /**
   * Obtém estatísticas dos imóveis
   * @returns {Promise<Object>} - Objeto com estatísticas
   */
  async obterEstatisticas() {
    const imoveis = await this.carregarImoveis();
    const disponiveis = imoveis.filter(i => i.disponivel);

    const estatisticas = {
      total: imoveis.length,
      disponiveis: disponiveis.length,
      venda: disponiveis.filter(i => i.transacao === 'venda').length,
      aluguel: disponiveis.filter(i => i.transacao === 'aluguel').length,
      apartamentos: disponiveis.filter(i => i.tipo === 'apartamento').length,
      casas: disponiveis.filter(i => i.tipo === 'casa').length,
      precoMedio: 0
    };

    if (disponiveis.length > 0) {
      const somaPrecos = disponiveis.reduce((soma, i) => soma + i.preco, 0);
      estatisticas.precoMedio = Math.round(somaPrecos / disponiveis.length);
    }

    return estatisticas;
  }

  /**
   * Limpa cache
   */
  limparCache() {
    this.cache.clear();
    console.log('🧹 Cache limpo');
  }

  /**
   * Carrega todos os empreendimentos (de múltiplos arquivos)
   * @returns {Promise<Array>} - Array de empreendimentos
   */
  async carregarEmpreendimentos() {
    // Verifica cache geral
    const cacheKey = 'todos_empreendimentos';
    if (this.cache.has(cacheKey)) {
      const dadosCache = this.cache.get(cacheKey);
      const agora = Date.now();
      if (agora - dadosCache.timestamp < this.cacheTimeout) {
        console.log('📦 Todos os empreendimentos carregados do cache');
        return dadosCache.data;
      }
    }

    const manifesto = await this.carregarManifesto();
    const promessas = manifesto.empreendimentos.map(caminho => 
      this.carregarJSON(caminho, false)
    );
    
    const empreendimentos = await Promise.all(promessas);
    
    // Armazena no cache geral
    this.cache.set(cacheKey, {
      data: empreendimentos,
      timestamp: Date.now()
    });
    
    console.log(`✅ ${empreendimentos.length} empreendimentos carregados de arquivos individuais`);
    return empreendimentos;
  }

  /**
   * Carrega empreendimentos em destaque
   * @returns {Promise<Array>} - Array de empreendimentos em destaque
   */
  async carregarEmpreendimentosDestaque() {
    const empreendimentos = await this.carregarEmpreendimentos();
    return empreendimentos.filter(emp => emp.destaque && emp.disponivel);
  }

  /**
   * Carrega um empreendimento específico por ID ou slug
   * @param {number|string} idOuSlug - ID ou slug do empreendimento
   * @returns {Promise<Object|null>} - Empreendimento ou null
   */
  async carregarEmpreendimentoPorId(idOuSlug) {
    const empreendimentos = await this.carregarEmpreendimentos();
    return empreendimentos.find(emp => 
      emp.id === parseInt(idOuSlug) || emp.slug === idOuSlug
    ) || null;
  }

  /**
   * Envia formulário de contato via FormSubmit
   * @param {Object} dados - Dados do formulário
   * @returns {Promise<Object>} - Resposta do servidor
   */
  async enviarContato(dados) {
    try {
      // FormSubmit - Serviço gratuito de envio de emails
      // Email configurado: contato@borghese.com.br
      const formData = new FormData();
      
      formData.append('name', dados.nome);
      formData.append('email', dados.email);
      formData.append('phone', dados.telefone);
      formData.append('subject', dados.assunto);
      formData.append('message', dados.mensagem);
      formData.append('_captcha', 'false'); // Desabilita captcha
      formData.append('_template', 'table'); // Template limpo
      
      const response = await fetch('https://formsubmit.co/contato@borghese.com.br', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Email enviado com sucesso!');
        return {
          sucesso: true,
          mensagem: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
        };
      } else {
        throw new Error('Erro ao enviar email');
      }
      
    } catch (erro) {
      console.error('❌ Erro ao enviar email:', erro);
      return {
        sucesso: false,
        mensagem: 'Erro ao enviar mensagem. Por favor, tente pelo WhatsApp.'
      };
    }
  }
}

// Exporta instância única (singleton)
const carregadorDados = new CarregadorDados();
export default carregadorDados;
