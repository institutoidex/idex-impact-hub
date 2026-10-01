// Mensagens comuns: seletor de idioma, 404, erro geral, avisos de fallback.
import { definirMensagens } from "../mensagens";

export const comum = definirMensagens(
  {
    idioma: {
      rotulo: "Idioma",
      escolher: "Escolher idioma",
      atual: "Idioma atual",
    },
    naoEncontrada: {
      titulo: "Página não encontrada",
      texto: "A página que você procura não existe ou mudou de endereço.",
      voltar: "Voltar ao início",
    },
    erro: {
      titulo: "Esta página não carregou",
      texto: "Algo deu errado do nosso lado. Tente recarregar ou volte para o início.",
      tentar: "Tentar de novo",
      voltar: "Voltar ao início",
    },
    emPortugues: "Conteúdo disponível apenas em português.",
    carregando: "Carregando…",
    pularConteudo: "Pular para o conteúdo",
    descricaoSite:
      "Instituto dedicado ao desenvolvimento social e à formação de crianças e jovens por meio do esporte, desde 2007.",
    tituloSite: "Instituto IDEX — desenvolvimento social desde 2007",
    altLogo: "Logotipo do Instituto IDEX",
  },
  {
    "en-US": {
      idioma: { rotulo: "Language", escolher: "Choose language", atual: "Current language" },
      naoEncontrada: {
        titulo: "Page not found",
        texto: "The page you're looking for doesn't exist or has moved.",
        voltar: "Back to home",
      },
      erro: {
        titulo: "This page didn't load",
        texto: "Something went wrong on our end. Try reloading or go back to the home page.",
        tentar: "Try again",
        voltar: "Back to home",
      },
      emPortugues: "This content is only available in Portuguese.",
      carregando: "Loading…",
      pularConteudo: "Skip to content",
      descricaoSite:
        "An institute dedicated to social development and to educating children and young people through sport, since 2007.",
      tituloSite: "Instituto IDEX — social development since 2007",
      altLogo: "Instituto IDEX logo",
    },
    "es-ES": {
      idioma: { rotulo: "Idioma", escolher: "Elegir idioma", atual: "Idioma actual" },
      naoEncontrada: {
        titulo: "Página no encontrada",
        texto: "La página que buscas no existe o ha cambiado de dirección.",
        voltar: "Volver al inicio",
      },
      erro: {
        titulo: "Esta página no se ha cargado",
        texto: "Algo ha fallado por nuestra parte. Prueba a recargar o vuelve al inicio.",
        tentar: "Intentar de nuevo",
        voltar: "Volver al inicio",
      },
      emPortugues: "Este contenido solo está disponible en portugués.",
      carregando: "Cargando…",
      pularConteudo: "Saltar al contenido",
      descricaoSite:
        "Instituto dedicado al desarrollo social y a la formación de niños y jóvenes a través del deporte, desde 2007.",
      tituloSite: "Instituto IDEX — desarrollo social desde 2007",
      altLogo: "Logotipo del Instituto IDEX",
    },
  },
);
