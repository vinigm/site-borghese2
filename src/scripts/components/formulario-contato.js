/* ========================================
   FORMULÁRIO DE CONTATO - Validação e envio
   ======================================== */

import carregadorDados from '../utils/carregador-dados.js';
import { validarEmail, validarTelefone, mostrarNotificacao } from '../utils/helpers.js';

/**
 * Classe para gerenciar formulário de contato
 */
class FormularioContato {
  constructor() {
    this.formulario = null;
    this.botaoEnviar = null;
    this.inicializado = false;
  }

  /**
   * Inicializa o formulário de contato
   * @param {string} formSelector - Seletor do formulário
   */
  inicializar(formSelector) {
    this.formulario = document.querySelector(formSelector);

    if (!this.formulario) {
      console.error('Formulário não encontrado');
      return;
    }

    this.botaoEnviar = this.formulario.querySelector('[type="submit"]');

    console.log('📝 Inicializando formulário de contato...');

    // Adiciona event listeners
    this.adicionarEventListeners();

    this.inicializado = true;
    console.log('✅ Formulário de contato inicializado');
  }

  /**
   * Adiciona event listeners
   */
  adicionarEventListeners() {
    // Validação em tempo real
    this.formulario.querySelectorAll('input, textarea').forEach(campo => {
      campo.addEventListener('blur', () => {
        this.validarCampo(campo);
      });

      campo.addEventListener('input', () => {
        this.removerErro(campo);
      });
    });

    // Submissão do formulário
    this.formulario.addEventListener('submit', (e) => {
      e.preventDefault();
      this.enviarFormulario();
    });
  }

  /**
   * Valida um campo específico
   * @param {HTMLElement} campo - Campo a validar
   * @returns {boolean} - True se válido
   */
  validarCampo(campo) {
    const nome = campo.name;
    const valor = campo.value.trim();
    const grupo = campo.closest('.form-grupo');

    // Remove erro anterior
    this.removerErro(campo);

    // Validações específicas
    if (campo.hasAttribute('required') && valor === '') {
      this.mostrarErro(campo, 'Este campo é obrigatório');
      return false;
    }

    if (nome === 'email' && valor !== '') {
      if (!validarEmail(valor)) {
        this.mostrarErro(campo, 'Email inválido');
        return false;
      }
    }

    if (nome === 'telefone' && valor !== '') {
      if (!validarTelefone(valor)) {
        this.mostrarErro(campo, 'Telefone inválido');
        return false;
      }
    }

    if (campo.hasAttribute('minlength')) {
      const minLength = parseInt(campo.getAttribute('minlength'));
      if (valor.length < minLength) {
        this.mostrarErro(campo, `Mínimo de ${minLength} caracteres`);
        return false;
      }
    }

    return true;
  }

  /**
   * Mostra erro em um campo
   * @param {HTMLElement} campo - Campo com erro
   * @param {string} mensagem - Mensagem de erro
   */
  mostrarErro(campo, mensagem) {
    const grupo = campo.closest('.form-grupo');
    if (!grupo) return;

    grupo.classList.add('erro');
    
    let erroElemento = grupo.querySelector('.form-erro');
    if (!erroElemento) {
      erroElemento = document.createElement('div');
      erroElemento.className = 'form-erro';
      grupo.appendChild(erroElemento);
    }
    
    erroElemento.textContent = mensagem;
    erroElemento.style.display = 'block';
  }

  /**
   * Remove erro de um campo
   * @param {HTMLElement} campo - Campo a limpar
   */
  removerErro(campo) {
    const grupo = campo.closest('.form-grupo');
    if (!grupo) return;

    grupo.classList.remove('erro');
    const erroElemento = grupo.querySelector('.form-erro');
    if (erroElemento) {
      erroElemento.style.display = 'none';
    }
  }

  /**
   * Valida todo o formulário
   * @returns {boolean} - True se válido
   */
  validarFormulario() {
    let valido = true;
    const campos = this.formulario.querySelectorAll('input[required], textarea[required]');

    campos.forEach(campo => {
      if (!this.validarCampo(campo)) {
        valido = false;
      }
    });

    return valido;
  }

  /**
   * Envia o formulário
   */
  async enviarFormulario() {
    // Valida todos os campos
    if (!this.validarFormulario()) {
      mostrarNotificacao('Por favor, corrija os erros no formulário', 'erro');
      return;
    }

    // Coleta dados
    const formData = new FormData(this.formulario);
    const dados = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      telefone: formData.get('telefone'),
      assunto: formData.get('assunto'),
      mensagem: formData.get('mensagem'),
      aceitePrivacidade: formData.get('privacidade') === 'on',
      dataEnvio: new Date().toISOString()
    };

    // Desabilita botão
    this.desabilitarBotao();

    try {
      console.log('📤 Enviando formulário...', dados);

      // Simula envio (em produção seria uma requisição real)
      const resposta = await carregadorDados.enviarContato(dados);

      if (resposta.sucesso) {
        this.mostrarSucesso(resposta.mensagem);
        this.formulario.reset();
        
        // Scroll para o topo do formulário
        this.formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } catch (erro) {
      console.error('❌ Erro ao enviar formulário:', erro);
      mostrarNotificacao('Erro ao enviar mensagem. Tente novamente.', 'erro');
    } finally {
      this.habilitarBotao();
    }
  }

  /**
   * Mostra mensagem de sucesso
   * @param {string} mensagem - Mensagem de sucesso
   */
  mostrarSucesso(mensagem) {
    let sucessoElemento = this.formulario.querySelector('.form-sucesso');
    
    if (!sucessoElemento) {
      sucessoElemento = document.createElement('div');
      sucessoElemento.className = 'form-sucesso';
      this.formulario.insertBefore(sucessoElemento, this.formulario.firstChild);
    }

    sucessoElemento.innerHTML = `
      <strong>✅ Sucesso!</strong>
      <p>${mensagem}</p>
    `;
    sucessoElemento.classList.add('visivel');

    mostrarNotificacao(mensagem, 'sucesso');

    // Remove mensagem após 5 segundos
    setTimeout(() => {
      sucessoElemento.classList.remove('visivel');
    }, 5000);
  }

  /**
   * Desabilita botão de envio
   */
  desabilitarBotao() {
    if (!this.botaoEnviar) return;

    this.botaoEnviar.disabled = true;
    this.botaoEnviar.classList.add('botao--carregando');
    this.botaoEnviar.dataset.textoOriginal = this.botaoEnviar.textContent;
    this.botaoEnviar.textContent = 'Enviando...';
  }

  /**
   * Habilita botão de envio
   */
  habilitarBotao() {
    if (!this.botaoEnviar) return;

    this.botaoEnviar.disabled = false;
    this.botaoEnviar.classList.remove('botao--carregando');
    
    if (this.botaoEnviar.dataset.textoOriginal) {
      this.botaoEnviar.textContent = this.botaoEnviar.dataset.textoOriginal;
    }
  }
}

// Exporta instância única
const formularioContato = new FormularioContato();
export default formularioContato;
