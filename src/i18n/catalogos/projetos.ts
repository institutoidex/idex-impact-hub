// Mensagens das páginas de Projetos (lista e detalhe).
import { definirMensagens } from "../mensagens";

export const projetos = definirMensagens(
  {
    etiqueta: "Projetos",
    hero: {
      titulo: "Projetos que acontecem no campo, não no papel",
      descricao:
        "Hoje temos um projeto ativo publicado. Novos projetos entram nesta lista conforme forem lançados.",
    },
    seo: {
      titulo: "Projetos — Instituto IDEX",
      descricao:
        "Projetos do Instituto IDEX, incluindo o Talento Brasil, futebol gratuito para 200 crianças e jovens.",
      ogDescricao: "Conheça os projetos do instituto.",
    },
    busca: { placeholder: "Buscar por nome ou assunto", rotulo: "Buscar projetos" },
    todosOsAnos: "Todos os anos",
    vazio: "Nenhum projeto encontrado.",
    resultado: (n: number, pagina: number, totalPaginas: number) =>
      `${n} ${n === 1 ? "projeto" : "projetos"} · página ${pagina} de ${totalPaginas}`,
    verProjeto: "Ver o projeto",
    novoEmBreve: "novo projeto em breve",
    espacoReservado: "Espaço reservado para os próximos projetos do instituto.",
    altImagem: (nome: string) => `Imagem do projeto ${nome}`,
    detalhe: {
      voltar: "Todos os projetos",
      altFoto: (nome: string) => `Foto do projeto ${nome}`,
      semTexto: "[texto do projeto a definir]",
      apoiar: "Apoiar este projeto",
      galeria: "Galeria",
      naoEncontrado: "Projeto não encontrado — Instituto IDEX",
    },
  },
  {
    "en-US": {
      etiqueta: "Projects",
      hero: {
        titulo: "Projects that happen on the field, not on paper",
        descricao:
          "Today we have one active project published. New projects join this list as they launch.",
      },
      seo: {
        titulo: "Projects — Instituto IDEX",
        descricao:
          "Instituto IDEX projects, including Talento Brasil, free soccer for 200 kids and young people.",
        ogDescricao: "Get to know the institute's projects.",
      },
      busca: { placeholder: "Search by name or topic", rotulo: "Search projects" },
      todosOsAnos: "All years",
      vazio: "No projects found.",
      resultado: (n: number, pagina: number, totalPaginas: number) =>
        `${n} ${n === 1 ? "project" : "projects"} · page ${pagina} of ${totalPaginas}`,
      verProjeto: "View project",
      novoEmBreve: "new project coming soon",
      espacoReservado: "Reserved space for the institute's upcoming projects.",
      altImagem: (nome: string) => `Image of the ${nome} project`,
      detalhe: {
        voltar: "All projects",
        altFoto: (nome: string) => `Photo of the ${nome} project`,
        semTexto: "[project text to be defined]",
        apoiar: "Support this project",
        galeria: "Gallery",
        naoEncontrado: "Project not found — Instituto IDEX",
      },
    },
    "es-ES": {
      etiqueta: "Proyectos",
      hero: {
        titulo: "Proyectos que ocurren en el campo, no en el papel",
        descricao:
          "Hoy tenemos un proyecto activo publicado. Nuevos proyectos se irán sumando a esta lista a medida que se lancen.",
      },
      seo: {
        titulo: "Proyectos — Instituto IDEX",
        descricao:
          "Proyectos del Instituto IDEX, incluido Talento Brasil, fútbol gratuito para 200 niños y jóvenes.",
        ogDescricao: "Conoce los proyectos del instituto.",
      },
      busca: { placeholder: "Buscar por nombre o tema", rotulo: "Buscar proyectos" },
      todosOsAnos: "Todos los años",
      vazio: "No se encontró ningún proyecto.",
      resultado: (n: number, pagina: number, totalPaginas: number) =>
        `${n} ${n === 1 ? "proyecto" : "proyectos"} · página ${pagina} de ${totalPaginas}`,
      verProjeto: "Ver el proyecto",
      novoEmBreve: "nuevo proyecto próximamente",
      espacoReservado: "Espacio reservado para los próximos proyectos del instituto.",
      altImagem: (nome: string) => `Imagen del proyecto ${nome}`,
      detalhe: {
        voltar: "Todos los proyectos",
        altFoto: (nome: string) => `Foto del proyecto ${nome}`,
        semTexto: "[texto del proyecto por definir]",
        apoiar: "Apoyar este proyecto",
        galeria: "Galería",
        naoEncontrado: "Proyecto no encontrado — Instituto IDEX",
      },
    },
  },
);
