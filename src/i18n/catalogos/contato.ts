// Mensagens da página de contato (formulário, validação, toasts, canais).
import { definirMensagens } from "../mensagens";

export const contato = definirMensagens(
  {
    seo: {
      titulo: "Contato — Instituto IDEX",
      descricao:
        "Fale com o Instituto IDEX: Rua Cel. José Eusébio, 95 – Higienópolis – São Paulo/SP. Telefone (11) 92544-6046. Instagram @idexbrasil.",
      ogDescricao: "Envie sua mensagem para o instituto.",
    },
    hero: {
      selo: "Contato",
      titulo: "Fala com a gente",
      descricao: "Dúvidas, parcerias ou vontade de ajudar.",
    },
    validacao: {
      nome: "Informe seu nome",
      email: "E-mail inválido",
      assunto: "Informe o assunto",
      mensagem: "Escreva sua mensagem",
      conferirCampos: "Confira os campos",
    },
    form: {
      nome: { rotulo: "Nome", placeholder: "Seu nome" },
      email: { rotulo: "Email", placeholder: "voce@email.com" },
      assunto: { rotulo: "Assunto", placeholder: "Sobre o que quer falar?" },
      mensagem: { rotulo: "Mensagem", placeholder: "Escreva aqui" },
      enviando: "Enviando...",
      enviar: "Enviar mensagem",
      aviso: "Sua mensagem vai direto para a equipe do instituto.",
    },
    toasts: {
      falhaTitulo: "Não conseguimos enviar agora",
      falhaDescricao: "Tente novamente em instantes ou fale com a gente pelo Instagram.",
      sucessoTitulo: "Mensagem enviada!",
      sucessoDescricao: "A equipe do IDEX vai te responder.",
      limiteTitulo: "Muitas mensagens seguidas",
      limiteDescricao: "Aguarde alguns minutos e tente de novo.",
    },
    onde: {
      titulo: "Onde estamos",
      cnpj: (cnpj: string) => `CNPJ ${cnpj}`,
    },
    redes: {
      instagram: "Instagram",
      facebook: "Facebook",
    },
  },
  {
    "en-US": {
      seo: {
        titulo: "Contact — Instituto IDEX",
        descricao:
          "Get in touch with Instituto IDEX: Rua Cel. José Eusébio, 95 – Higienópolis – São Paulo/SP. Phone (11) 92544-6046. Instagram @idexbrasil.",
        ogDescricao: "Send your message to the institute.",
      },
      hero: {
        selo: "Contact",
        titulo: "Talk to us",
        descricao: "Questions, partnerships or willingness to help.",
      },
      validacao: {
        nome: "Please enter your name",
        email: "Invalid email",
        assunto: "Please enter a subject",
        mensagem: "Please write your message",
        conferirCampos: "Please check the fields",
      },
      form: {
        nome: { rotulo: "Name", placeholder: "Your name" },
        email: { rotulo: "Email", placeholder: "you@email.com" },
        assunto: { rotulo: "Subject", placeholder: "What would you like to talk about?" },
        mensagem: { rotulo: "Message", placeholder: "Write here" },
        enviando: "Sending...",
        enviar: "Send message",
        aviso: "Your message goes straight to the institute's team.",
      },
      toasts: {
        falhaTitulo: "We couldn't send it right now",
        falhaDescricao: "Try again in a moment or reach us on Instagram.",
        sucessoTitulo: "Message sent!",
        sucessoDescricao: "IDEX's team will get back to you.",
      limiteTitulo: "Too many messages in a row",
        limiteDescricao: "Please wait a few minutes and try again.",
      },
      onde: {
        titulo: "Where we are",
        cnpj: (cnpj: string) => `Tax ID (CNPJ) ${cnpj}`,
      },
      redes: {
        instagram: "Instagram",
        facebook: "Facebook",
      },
    },
    "es-ES": {
      seo: {
        titulo: "Contacto — Instituto IDEX",
        descricao:
          "Habla con el Instituto IDEX: Rua Cel. José Eusébio, 95 – Higienópolis – São Paulo/SP. Teléfono (11) 92544-6046. Instagram @idexbrasil.",
        ogDescricao: "Envía tu mensaje al instituto.",
      },
      hero: {
        selo: "Contacto",
        titulo: "Habla con nosotros",
        descricao: "Dudas, alianzas o ganas de ayudar.",
      },
      validacao: {
        nome: "Indica tu nombre",
        email: "Correo electrónico no válido",
        assunto: "Indica el asunto",
        mensagem: "Escribe tu mensaje",
        conferirCampos: "Revisa los campos",
      },
      form: {
        nome: { rotulo: "Nombre", placeholder: "Tu nombre" },
        email: { rotulo: "Correo electrónico", placeholder: "tu@correo.com" },
        assunto: { rotulo: "Asunto", placeholder: "¿Sobre qué quieres hablar?" },
        mensagem: { rotulo: "Mensaje", placeholder: "Escribe aquí" },
        enviando: "Enviando...",
        enviar: "Enviar mensaje",
        aviso: "Tu mensaje va directo al equipo del instituto.",
      },
      toasts: {
        falhaTitulo: "No hemos podido enviarlo ahora",
        falhaDescricao: "Inténtalo de nuevo en unos instantes o escríbenos por Instagram.",
        sucessoTitulo: "¡Mensaje enviado!",
        sucessoDescricao: "El equipo del IDEX te responderá.",
      limiteTitulo: "Demasiados mensajes seguidos",
        limiteDescricao: "Espera unos minutos y vuelve a intentarlo.",
      },
      onde: {
        titulo: "Dónde estamos",
        cnpj: (cnpj: string) => `CNPJ ${cnpj}`,
      },
      redes: {
        instagram: "Instagram",
        facebook: "Facebook",
      },
    },
  },
);
