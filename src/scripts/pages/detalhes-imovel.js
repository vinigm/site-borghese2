/* ========================================
   DETALHES DO IMOVEL - Preenche a pagina com dados
   ======================================== */

import carregadorDados from '../utils/carregador-dados.js';
import { formatarMoeda, formatarEndereco, gerarLinkWhatsApp } from '../utils/helpers.js';

const container = document.querySelector('#detalhes-imovel .detalhes-imovel__container');
const tituloEl = document.querySelector('[data-titulo-imovel]');
const breadcrumbEl = document.querySelector('[data-breadcrumb-imovel]');

function renderizarErro(titulo, mensagem) {
  if (!container) return;
  container.innerHTML = `
    <div class="detalhes-imovel__erro">
      <h2>${titulo}</h2>
      <p>${mensagem}</p>
      <a href="imoveis.html" class="botao botao--primario">Voltar para Imoveis</a>
    </div>
  `;
}

function criarBadges(imovel) {
  const badges = [];
  if (imovel.destaque) {
    badges.push('<span class="badge badge--alerta">Destaque</span>');
  }
  badges.push(`<span class="badge badge--primario">${imovel.tipo}</span>`);
  badges.push(`<span class="badge badge--secundario">${imovel.transacao}</span>`);
  return badges.join('');
}

function criarCaracteristicas(imovel) {
  const { quartos, banheiros, vagas, area } = imovel.caracteristicas;
  return `
    <div class="detalhes-imovel__caracteristica"><strong>${quartos}</strong> quartos</div>
    <div class="detalhes-imovel__caracteristica"><strong>${banheiros}</strong> banheiros</div>
    <div class="detalhes-imovel__caracteristica"><strong>${vagas}</strong> vagas</div>
    <div class="detalhes-imovel__caracteristica"><strong>${area}m²</strong> area</div>
  `;
}

function configurarGaleria(imagens, titulo) {
  const imagemPrincipal = document.querySelector('#imagem-principal');
  const miniaturas = document.querySelector('#miniaturas');

  if (!imagemPrincipal || !miniaturas) return;

  const resolverCaminhoImagem = (src) => {
    if (src.startsWith('http') || src.startsWith('/') || src.startsWith('../') || src.startsWith('./')) {
      return src;
    }
    const estaEmPages = window.location.pathname.includes('/pages/');
    return estaEmPages ? `../${src}` : src;
  };

  const listaOriginal = imagens.length ? imagens : ['assets/images/placeholder.jpg'];
  const lista = listaOriginal.map(resolverCaminhoImagem);
  imagemPrincipal.src = lista[0];
  imagemPrincipal.alt = titulo;

  miniaturas.innerHTML = lista.map((src, index) => `
    <button class="detalhes-imovel__miniatura${index === 0 ? ' ativo' : ''}" data-index="${index}" aria-label="Ver imagem ${index + 1}">
      <img src="${src}" alt="${titulo} - ${index + 1}">
    </button>
  `).join('');

  miniaturas.querySelectorAll('.detalhes-imovel__miniatura').forEach((botao) => {
    botao.addEventListener('click', () => {
      const index = parseInt(botao.getAttribute('data-index'), 10);
      imagemPrincipal.src = lista[index];
      miniaturas.querySelectorAll('.detalhes-imovel__miniatura').forEach(b => b.classList.remove('ativo'));
      botao.classList.add('ativo');
    });
  });
}

async function carregarDetalhes() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    renderizarErro('Imovel nao encontrado', 'Nenhum ID foi informado na URL.');
    return;
  }

  try {
    const imovel = await carregadorDados.carregarImovelPorId(id);

    if (!imovel) {
      renderizarErro('Imovel nao encontrado', 'Nao encontramos um imovel com esse ID.');
      return;
    }

    if (!container) return;

    if (tituloEl) {
      tituloEl.textContent = imovel.titulo;
    }

    if (breadcrumbEl) {
      breadcrumbEl.textContent = imovel.titulo;
    }

    document.title = `Borghese - ${imovel.titulo}`;

    const precoFormatado = formatarMoeda(imovel.preco);
    const enderecoFormatado = formatarEndereco(imovel.endereco);
    const mensagemWhatsApp = `Ola! Tenho interesse no imovel: ${imovel.titulo} - ${precoFormatado}`;
    const linkWhatsApp = gerarLinkWhatsApp('51993016930', mensagemWhatsApp);

    container.innerHTML = `
      <div class="detalhes-imovel__layout">
        <div class="detalhes-imovel__galeria">
          <div class="detalhes-imovel__imagem-principal">
            <img id="imagem-principal" src="" alt="${imovel.titulo}">
          </div>
          <div class="detalhes-imovel__miniaturas" id="miniaturas"></div>
        </div>

        <div class="detalhes-imovel__info">
          <div class="detalhes-imovel__badges">
            ${criarBadges(imovel)}
          </div>
          <h2 class="detalhes-imovel__titulo">${imovel.titulo}</h2>
          <div class="detalhes-imovel__preco">${precoFormatado}</div>
          <div class="detalhes-imovel__endereco">${enderecoFormatado}</div>

          <div class="detalhes-imovel__caracteristicas">
            ${criarCaracteristicas(imovel)}
          </div>

          <p class="detalhes-imovel__descricao">${imovel.descricao}</p>

          <div class="detalhes-imovel__acoes">
            <a href="${linkWhatsApp}" target="_blank" rel="noopener" class="botao botao--whatsapp">WhatsApp</a>
            <a href="imoveis.html" class="botao botao--outline">Voltar para Imoveis</a>
          </div>
        </div>
      </div>
    `;

    configurarGaleria(imovel.imagens || [], imovel.titulo);
  } catch (erro) {
    console.error('Erro ao carregar detalhes do imovel:', erro);
    if (window.location.protocol === 'file:') {
      renderizarErro('Erro ao carregar', 'Abra o site usando um servidor local (ex: Live Server) para carregar os dados.');
      return;
    }
    renderizarErro('Erro ao carregar', 'Ocorreu um erro ao carregar o imovel.');
  }
}

carregarDetalhes();
