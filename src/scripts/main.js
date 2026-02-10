/* ========================================
   MAIN.JS - Script principal do site
   ======================================== */

import { scrollParaElemento, throttle } from './utils/helpers.js';

/**
 * Classe principal da aplicação
 */
class App {
  constructor() {
    this.header = null;
    this.menuMobile = null;
    this.inicializado = false;
  }

  /**
   * Inicializa a aplicação
   */
  async inicializar() {
    console.log('🚀 Inicializando aplicação...');

    // Aguarda DOM carregar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      await this.init();
    }
  }

  /**
   * Inicialização principal
   */
  async init() {
    this.header = document.querySelector('.header');
    this.menuMobile = document.querySelector('.header__menu-toggle');

    // Inicializacomponentes globais
    this.inicializarHeader();
    this.inicializarMenuMobile();
    this.inicializarScrollSuave();
    this.inicializarAnimacoesScroll();

    this.inicializado = true;
    console.log('✅ Aplicação inicializada');
  }

  /**
   * Inicializa comportamento do header
   */
  inicializarHeader() {
    if (!this.header) return;

    const handleScroll = throttle(() => {
      if (window.scrollY > 50) {
        this.header.classList.add('rolado');
      } else {
        this.header.classList.remove('rolado');
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);

    // Marca link ativo
    this.marcarLinkAtivo();
  }

  /**
   * Inicializa menu mobile
   */
  inicializarMenuMobile() {
    if (!this.menuMobile) return;

    const nav = document.querySelector('.header__nav');

    this.menuMobile.addEventListener('click', () => {
      this.menuMobile.classList.toggle('ativo');
      nav.classList.toggle('ativo');
      document.body.style.overflow = nav.classList.contains('ativo') ? 'hidden' : '';
    });

    // Fecha menu ao clicar em link
    const links = nav.querySelectorAll('.nav__link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        this.menuMobile.classList.remove('ativo');
        nav.classList.remove('ativo');
        document.body.style.overflow = '';
      });
    });

    // Fecha menu ao clicar fora
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !this.menuMobile.contains(e.target)) {
        this.menuMobile.classList.remove('ativo');
        nav.classList.remove('ativo');
        document.body.style.overflow = '';
      }
    });
  }

  /**
   * Marca link ativo no menu
   */
  marcarLinkAtivo() {
    const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav__link');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === paginaAtual || (paginaAtual === '' && href === 'index.html')) {
        link.classList.add('ativo');
      } else {
        link.classList.remove('ativo');
      }
    });
  }

  /**
   * Inicializa scroll suave para âncoras
   */
  inicializarScrollSuave() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        scrollParaElemento(href);
      });
    });
  }

  /**
   * Inicializa animações no scroll
   */
  inicializarAnimacoesScroll() {
    const elementos = document.querySelectorAll('[data-animar]');
    
    if (elementos.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animado');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elementos.forEach(el => observer.observe(el));
  }
}

// Cria instância e inicializa
const app = new App();
app.inicializar();

// Exporta para uso global se necessário
window.app = app;
export default app;
