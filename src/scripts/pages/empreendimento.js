/* ========================================
   PÁGINA EMPREENDIMENTO - Detalhes completos
   ======================================== */

import carregadorDados from '../utils/carregador-dados.js';
import renderizadorImoveis from '../components/renderizador-imoveis.js';
import { formatarEndereco, gerarLinkWhatsApp } from '../utils/helpers.js';

const container = document.querySelector('#empreendimento .empreendimento__container');
const tituloEl = document.querySelector('[data-titulo-empreendimento]');
const breadcrumbEl = document.querySelector('[data-breadcrumb-empreendimento]');
let lightboxState = null;

function criarLightbox() {
  if (document.querySelector('.empreendimento__lightbox')) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'empreendimento__lightbox';
  lightbox.innerHTML = `
    <div class="empreendimento__lightbox-conteudo" role="dialog" aria-modal="true">
      <button class="empreendimento__lightbox-fechar" aria-label="Fechar">&times;</button>
      <button class="empreendimento__lightbox-seta empreendimento__lightbox-seta--esq" aria-label="Imagem anterior">&#8592;</button>
      <img class="empreendimento__lightbox-imagem" src="" alt="">
      <button class="empreendimento__lightbox-seta empreendimento__lightbox-seta--dir" aria-label="Proxima imagem">&#8594;</button>
    </div>
  `;

  document.body.appendChild(lightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      fecharLightbox();
    }
  });

  lightbox.querySelector('.empreendimento__lightbox-fechar').addEventListener('click', fecharLightbox);
  lightbox.querySelector('.empreendimento__lightbox-seta--esq').addEventListener('click', () => trocarLightbox(-1));
  lightbox.querySelector('.empreendimento__lightbox-seta--dir').addEventListener('click', () => trocarLightbox(1));

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('ativo')) return;
    if (e.key === 'Escape') fecharLightbox();
    if (e.key === 'ArrowLeft') trocarLightbox(-1);
    if (e.key === 'ArrowRight') trocarLightbox(1);
  });
}

function abrirLightbox(indice) {
  const lightbox = document.querySelector('.empreendimento__lightbox');
  if (!lightbox || !lightboxState) return;
  lightboxState.indice = indice;
  atualizarLightbox();
  lightbox.classList.add('ativo');
  document.body.style.overflow = 'hidden';
}

function fecharLightbox() {
  const lightbox = document.querySelector('.empreendimento__lightbox');
  if (!lightbox) return;
  lightbox.classList.remove('ativo');
  document.body.style.overflow = '';
}

function trocarLightbox(delta) {
  if (!lightboxState) return;
  const total = lightboxState.imagens.length;
  if (!total) return;
  lightboxState.indice = (lightboxState.indice + delta + total) % total;
  atualizarLightbox();
}

function atualizarLightbox() {
  const lightbox = document.querySelector('.empreendimento__lightbox');
  if (!lightbox || !lightboxState) return;
  const img = lightbox.querySelector('.empreendimento__lightbox-imagem');
  img.src = lightboxState.imagens[lightboxState.indice];
  img.alt = lightboxState.titulo;
}

function renderizarErro(titulo, mensagem) {
  if (!container) return;
  container.innerHTML = `
    <div class="empreendimento__erro">
      <h2>${titulo}</h2>
      <p>${mensagem}</p>
      <a href="empreendimentos.html" class="botao botao--primario">Ver Todos os Empreendimentos</a>
    </div>
  `;
}

function criarGaleriaEmpreendimento(imagens, nome) {
  if (!imagens || imagens.length === 0) {
    return '<p>Nenhuma imagem disponível</p>';
  }

  const resolverCaminhoImagem = (src) => {
    if (!src) return 'assets/images/placeholder.jpg';
    if (src.startsWith('http') || src.startsWith('/') || src.startsWith('../') || src.startsWith('./')) {
      return src;
    }
    return `../${src}`;
  };

  const imagemPrincipal = resolverCaminhoImagem(imagens[0]);
  
  return `
    <div class="empreendimento__galeria">
      <div class="empreendimento__imagem-principal" id="imagem-principal-emp">
        <img src="${imagemPrincipal}" alt="${nome}" data-index="0">
        ${imagens.length > 1 ? `
          <button class="empreendimento__nav empreendimento__nav--prev" id="nav-prev-emp">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button class="empreendimento__nav empreendimento__nav--next" id="nav-next-emp">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        ` : ''}
      </div>
      ${imagens.length > 1 ? `
        <div class="empreendimento__miniaturas" id="miniaturas-emp">
          ${imagens.map((img, index) => `
            <div class="empreendimento__miniatura${index === 0 ? ' ativo' : ''}" data-index="${index}">
              <img src="${resolverCaminhoImagem(img)}" alt="${nome} - ${index + 1}">
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

async function carregarEmpreendimento() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const slug = params.get('slug');

  if (!id && !slug) {
    renderizarErro('Empreendimento não encontrado', 'Nenhum ID ou slug foi informado na URL.');
    return;
  }

  try {
    const empreendimento = await carregadorDados.carregarEmpreendimentoPorId(id || slug);

    if (!empreendimento) {
      renderizarErro('Empreendimento não encontrado', 'Não encontramos um empreendimento com esse ID.');
      return;
    }

    if (!container) return;

    // Atualiza título e breadcrumb
    if (tituloEl) tituloEl.textContent = empreendimento.nome;
    if (breadcrumbEl) breadcrumbEl.textContent = empreendimento.nome;
    document.title = `Borghese - ${empreendimento.nome}`;

    const enderecoFormatado = formatarEndereco(empreendimento.endereco);
    const mensagemWhatsApp = `Olá! Quero saber mais sobre o empreendimento ${empreendimento.nome}. Podemos conversar?`;
    const linkWhatsApp = gerarLinkWhatsApp('51993016930', mensagemWhatsApp);

    // Renderiza informações do empreendimento
    container.innerHTML = `
      <div class="empreendimento__conteudo">
        <div class="empreendimento__principal">
          ${criarGaleriaEmpreendimento(empreendimento.imagens, empreendimento.nome)}

          <div class="empreendimento__info">
            <div class="empreendimento__header">
              <h2>${empreendimento.nome}</h2>
              <div class="empreendimento__endereco">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>${enderecoFormatado}</span>
              </div>
            </div>

            <div class="empreendimento__banner-contato">
              <div class="banner-contato__conteudo">
                <span class="banner-contato__texto">💬 Fale com um de nossos corretores para unidades disponíveis!</span>
                <a href="${linkWhatsApp}" target="_blank" rel="noopener" class="banner-contato__botao">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>

            <div class="empreendimento__descricao">
              <p>${empreendimento.descricaoCompleta || empreendimento.descricao}</p>
            </div>

            <div class="empreendimento__caracteristicas-gerais">
              <div class="caracteristica-item">
                <span class="caracteristica-label">Unidades:</span>
                <span class="caracteristica-valor">${empreendimento.caracteristicas.unidades || 'N/A'}</span>
              </div>
              <div class="caracteristica-item">
                <span class="caracteristica-label">Torres:</span>
                <span class="caracteristica-valor">${empreendimento.caracteristicas.torres || 'N/A'}</span>
              </div>
              <div class="caracteristica-item">
                <span class="caracteristica-label">Andares:</span>
                <span class="caracteristica-valor">${empreendimento.caracteristicas.andares || 'N/A'}</span>
              </div>
              <div class="caracteristica-item">
                <span class="caracteristica-label">Status:</span>
                <span class="caracteristica-valor badge badge--info">${formatarStatus(empreendimento.caracteristicas.status)}</span>
              </div>
            </div>

            ${empreendimento.lazer && empreendimento.lazer.length > 0 ? `
              <div class="empreendimento__lazer">
                <h3>Áreas de Lazer</h3>
                <ul class="lazer-lista">
                  ${empreendimento.lazer.map(item => `<li>✓ ${item}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${empreendimento.diferenciais && empreendimento.diferenciais.length > 0 ? `
              <div class="empreendimento__diferenciais">
                <h3>Diferenciais</h3>
                <ul class="diferenciais-lista">
                  ${empreendimento.diferenciais.map(item => `<li>⭐ ${item}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <div class="empreendimento__acoes">
              <a href="${linkWhatsApp}" target="_blank" rel="noopener" class="botao botao--whatsapp botao--grande">
                WhatsApp
              </a>
              <a href="contato.html" class="botao botao--primario botao--grande">
                Solicitar Informações
              </a>
            </div>
          </div>
        </div>

        <div class="empreendimento__unidades">
          <h3>Unidades Disponíveis</h3>
          <div class="unidades-grid" id="unidades-grid">
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p>Carregando unidades...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Configura lightbox
    criarLightbox();
    const resolverCaminhoImagem = (src) => {
      if (!src) return 'assets/images/placeholder.jpg';
      if (src.startsWith('http') || src.startsWith('/') || src.startsWith('../') || src.startsWith('./')) {
        return src;
      }
      return `../${src}`;
    };

    lightboxState = {
      imagens: empreendimento.imagens.map(img => resolverCaminhoImagem(img)),
      titulo: empreendimento.nome,
      indice: 0
    };

    // Adiciona funcionalidade de troca de imagens na galeria
    setTimeout(() => {
      const imagemPrincipal = document.getElementById('imagem-principal-emp');
      const miniaturas = document.querySelectorAll('.empreendimento__miniatura');
      const btnPrev = document.getElementById('nav-prev-emp');
      const btnNext = document.getElementById('nav-next-emp');
      
      if (imagemPrincipal && miniaturas.length > 0) {
        // Clique na imagem principal abre lightbox
        imagemPrincipal.addEventListener('click', (e) => {
          // Não abre lightbox se clicou nos botões de navegação
          if (e.target.closest('.empreendimento__nav')) return;
          
          const indice = parseInt(imagemPrincipal.querySelector('img').getAttribute('data-index') || '0');
          abrirLightbox(indice);
        });

        // Função para atualizar imagem
        const atualizarImagem = (novoIndex) => {
          const imgElement = imagemPrincipal.querySelector('img');
          if (imgElement && empreendimento.imagens[novoIndex]) {
            imgElement.src = resolverCaminhoImagem(empreendimento.imagens[novoIndex]);
            imgElement.setAttribute('data-index', novoIndex);
            
            // Remove classe ativo de todas e adiciona na nova
            miniaturas.forEach(m => m.classList.remove('ativo'));
            miniaturas[novoIndex].classList.add('ativo');
          }
        };

        // Navegação com setas
        if (btnPrev) {
          btnPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentIndex = parseInt(imagemPrincipal.querySelector('img').getAttribute('data-index') || '0');
            const novoIndex = (currentIndex - 1 + empreendimento.imagens.length) % empreendimento.imagens.length;
            atualizarImagem(novoIndex);
          });
        }

        if (btnNext) {
          btnNext.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentIndex = parseInt(imagemPrincipal.querySelector('img').getAttribute('data-index') || '0');
            const novoIndex = (currentIndex + 1) % empreendimento.imagens.length;
            atualizarImagem(novoIndex);
          });
        }

        // Clique nas miniaturas
        miniaturas.forEach((miniatura, index) => {
          miniatura.addEventListener('click', () => {
            atualizarImagem(index);
          });
        });
      }
    }, 100);

    // Carrega unidades do empreendimento
    await carregarUnidades(empreendimento.id);

  } catch (erro) {
    console.error('Erro ao carregar empreendimento:', erro);
    renderizarErro('Erro ao carregar', 'Ocorreu um erro ao carregar o empreendimento.');
  }
}

async function carregarUnidades(empreendimentoId) {
  try {
    const unidades = await carregadorDados.buscarImoveis({
      empreendimentoId: empreendimentoId
    });

    const gridUnidades = document.getElementById('unidades-grid');
    const secaoUnidades = document.querySelector('.empreendimento__unidades');
    if (!gridUnidades) return;

    if (unidades.length === 0) {
      // Oculta a seção inteira se não houver unidades
      if (secaoUnidades) {
        secaoUnidades.style.display = 'none';
      }
      return;
    }

    renderizadorImoveis.renderizarLista(unidades, '#unidades-grid');
  } catch (erro) {
    console.error('Erro ao carregar unidades:', erro);
  }
}

function formatarStatus(status) {
  const statusMap = {
    'em-construcao': 'Em Construção',
    'lancamento': 'Lançamento',
    'pronto-para-morar': 'Pronto para Morar',
    'na-planta': 'Na Planta'
  };
  return statusMap[status] || status;
}

// Inicia carregamento
carregarEmpreendimento();
