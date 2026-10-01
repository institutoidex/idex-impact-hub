// Mensagens das páginas de Notícias (lista e detalhe).
import { definirMensagens } from "../mensagens";

export const noticias = definirMensagens(
  {
    etiqueta: "Notícias",
    hero: {
      titulo: "O que anda acontecendo",
      descricao: "Registros das ações e anúncios do instituto.",
    },
    seo: {
      titulo: "Notícias — Instituto IDEX",
      descricao: "Notícias e novidades publicadas pelo Instituto IDEX.",
      ogDescricao: "Acompanhe as novidades do instituto.",
    },
    busca: { placeholder: "Buscar por título ou assunto", rotulo: "Buscar notícias" },
    todosOsAnos: "Todos os anos",
    carregando: "Carregando notícias...",
    erro: {
      texto: "Não foi possível carregar as notícias agora.",
      tentarNovo: "Tentar de novo",
    },
    vazioInicial: "Ainda não há notícias publicadas. Volte em breve.",
    vazioBusca: "Nenhuma notícia encontrada para essa busca.",
    resultado: (n: number, pagina: number, totalPaginas: number) =>
      `${n} ${n === 1 ? "notícia" : "notícias"} · página ${pagina} de ${totalPaginas}`,
    lerNoticia: "Ler a notícia",
    detalhe: {
      voltar: "Todas as notícias",
      semConteudo: "O texto completo desta notícia ainda não foi publicado.",
      tituloSeoSufixo: "Notícias",
      secaoProjetos: "Projetos",
      secaoInstituto: "Instituto",
      naoEncontrada: {
        titulo: "Notícia não encontrada",
        texto: "Ela pode ter sido despublicada ou o endereço está incorreto.",
        voltar: "Voltar para as notícias",
      },
      erro: {
        titulo: "Não foi possível carregar a notícia",
        texto: "Estamos com dificuldade para acessar as notícias agora. Tente novamente em instantes.",
        voltar: "Voltar para as notícias",
      },
      indisponivel: "Notícia indisponível — Instituto IDEX",
    },
  },
  {
    "en-US": {
      etiqueta: "News",
      hero: {
        titulo: "What's happening",
        descricao: "A record of the institute's actions and announcements.",
      },
      seo: {
        titulo: "News — Instituto IDEX",
        descricao: "News and updates published by Instituto IDEX.",
        ogDescricao: "Follow the institute's updates.",
      },
      busca: { placeholder: "Search by title or topic", rotulo: "Search news" },
      todosOsAnos: "All years",
      carregando: "Loading news...",
      erro: {
        texto: "We couldn't load the news right now.",
        tentarNovo: "Try again",
      },
      vazioInicial: "No news published yet. Check back soon.",
      vazioBusca: "No news found for this search.",
      resultado: (n: number, pagina: number, totalPaginas: number) =>
        `${n} ${n === 1 ? "news item" : "news items"} · page ${pagina} of ${totalPaginas}`,
      lerNoticia: "Read the story",
      detalhe: {
        voltar: "All news",
        semConteudo: "The full text of this news item hasn't been published yet.",
        tituloSeoSufixo: "News",
        secaoProjetos: "Projects",
        secaoInstituto: "Institute",
        naoEncontrada: {
          titulo: "News item not found",
          texto: "It may have been unpublished or the address is incorrect.",
          voltar: "Back to news",
        },
        erro: {
          titulo: "Couldn't load this news item",
          texto: "We're having trouble reaching the news right now. Please try again shortly.",
          voltar: "Back to news",
        },
        indisponivel: "News unavailable — Instituto IDEX",
      },
    },
    "es-ES": {
      etiqueta: "Noticias",
      hero: {
        titulo: "Esto es lo que está pasando",
        descricao: "Registro de las acciones y anuncios del instituto.",
      },
      seo: {
        titulo: "Noticias — Instituto IDEX",
        descricao: "Noticias y novedades publicadas por el Instituto IDEX.",
        ogDescricao: "Sigue las novedades del instituto.",
      },
      busca: { placeholder: "Buscar por título o tema", rotulo: "Buscar noticias" },
      todosOsAnos: "Todos los años",
      carregando: "Cargando noticias...",
      erro: {
        texto: "No hemos podido cargar las noticias ahora mismo.",
        tentarNovo: "Intentar de nuevo",
      },
      vazioInicial: "Todavía no hay noticias publicadas. Vuelve pronto.",
      vazioBusca: "No se encontró ninguna noticia para esta búsqueda.",
      resultado: (n: number, pagina: number, totalPaginas: number) =>
        `${n} ${n === 1 ? "noticia" : "noticias"} · página ${pagina} de ${totalPaginas}`,
      lerNoticia: "Leer la noticia",
      detalhe: {
        voltar: "Todas las noticias",
        semConteudo: "El texto completo de esta noticia todavía no se ha publicado.",
        tituloSeoSufixo: "Noticias",
        secaoProjetos: "Proyectos",
        secaoInstituto: "Instituto",
        naoEncontrada: {
          titulo: "Noticia no encontrada",
          texto: "Puede que se haya despublicado o la dirección sea incorrecta.",
          voltar: "Volver a las noticias",
        },
        erro: {
          titulo: "No se pudo cargar la noticia",
          texto: "Tenemos dificultades para acceder a las noticias ahora. Inténtalo de nuevo en unos instantes.",
          voltar: "Volver a las noticias",
        },
        indisponivel: "Noticia no disponible — Instituto IDEX",
      },
    },
  },
);
