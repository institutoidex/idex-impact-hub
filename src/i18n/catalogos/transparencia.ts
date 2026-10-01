// Mensagens da página de Transparência (pastas, busca e documentos).
import { definirMensagens } from "../mensagens";

export const transparencia = definirMensagens(
  {
    etiqueta: "Transparência",
    hero: {
      titulo: "Conta aberta com quem apoia",
      descricao:
        "Os documentos do instituto ficam organizados em pastas. Busque pelo nome ou navegue pelas pastas para baixar os arquivos.",
    },
    seo: {
      titulo: "Transparência — Instituto IDEX",
      descricao:
        "Documentos, relatórios, projetos e prestação de contas do Instituto IDEX, organizados por pastas.",
      ogDescricao: "Documentos e prestação de contas do instituto.",
    },
    buscarEm: (nomePasta: string) => `Buscar em ${nomePasta}`,
    buscarEmTodas: "Buscar em todos os documentos",
    buscaConsideraPasta: "A busca considera os arquivos desta pasta.",
    buscaConsideraTodas: (n: number) => `Procure pelo nome do arquivo em ${n} documento(s) publicados.`,
    buscaPlaceholder: "Ex.: relatório de atividades, estatuto, balanço...",
    buscaRotulo: "Buscar documentos",
    todasAsPastas: "Todas as pastas",
    pastasRotulo: "Pastas",
    recolherPasta: (nome: string) => `Recolher ${nome}`,
    expandirPasta: (nome: string) => `Expandir ${nome}`,
    todosOsDocumentos: "Todos os documentos",
    documentos: (n: number) => `${n} documento(s)`,
    arquivos: (n: number) => `${n} arquivo(s)`,
    ano: (ano: number) => `Ano ${ano}`,
    documentoPublicado: "Documento publicado",
    visualizar: "Visualizar",
    baixar: "Baixar",
    vazioComBusca: {
      titulo: "Nenhum documento encontrado",
      nota: "Tente outro termo ou mude de pasta.",
    },
    vazioSemArquivos: {
      titulo: "Pasta ainda sem arquivos",
      nota: "Os PDFs oficiais entram aqui quando enviados pelo painel.",
    },
  },
  {
    "en-US": {
      etiqueta: "Transparency",
      hero: {
        titulo: "Open books with our supporters",
        descricao:
          "The institute's documents are organized into folders. Search by name or browse the folders to download the files.",
      },
      seo: {
        titulo: "Transparency — Instituto IDEX",
        descricao:
          "Documents, reports, projects and financial accountability of Instituto IDEX, organized into folders.",
        ogDescricao: "Documents and financial accountability of the institute.",
      },
      buscarEm: (nomePasta: string) => `Search in ${nomePasta}`,
      buscarEmTodas: "Search in all documents",
      buscaConsideraPasta: "The search covers the files in this folder.",
      buscaConsideraTodas: (n: number) => `Search by file name among ${n} published document(s).`,
      buscaPlaceholder: "E.g.: activity report, bylaws, balance sheet...",
      buscaRotulo: "Search documents",
      todasAsPastas: "All folders",
      pastasRotulo: "Folders",
      recolherPasta: (nome: string) => `Collapse ${nome}`,
      expandirPasta: (nome: string) => `Expand ${nome}`,
      todosOsDocumentos: "All documents",
      documentos: (n: number) => `${n} document(s)`,
      arquivos: (n: number) => `${n} file(s)`,
      ano: (ano: number) => `Year ${ano}`,
      documentoPublicado: "Published document",
      visualizar: "View",
      baixar: "Download",
      vazioComBusca: {
        titulo: "No document found",
        nota: "Try another term or switch folders.",
      },
      vazioSemArquivos: {
        titulo: "This folder has no files yet",
        nota: "Official PDFs appear here once uploaded from the dashboard.",
      },
    },
    "es-ES": {
      etiqueta: "Transparencia",
      hero: {
        titulo: "Cuentas claras con quienes nos apoyan",
        descricao:
          "Los documentos del instituto están organizados en carpetas. Busca por el nombre o navega por las carpetas para descargar los archivos.",
      },
      seo: {
        titulo: "Transparencia — Instituto IDEX",
        descricao:
          "Documentos, informes, proyectos y rendición de cuentas del Instituto IDEX, organizados por carpetas.",
        ogDescricao: "Documentos y rendición de cuentas del instituto.",
      },
      buscarEm: (nomePasta: string) => `Buscar en ${nomePasta}`,
      buscarEmTodas: "Buscar en todos los documentos",
      buscaConsideraPasta: "La búsqueda considera los archivos de esta carpeta.",
      buscaConsideraTodas: (n: number) => `Busca por el nombre del archivo entre ${n} documento(s) publicados.`,
      buscaPlaceholder: "Ej.: informe de actividades, estatuto, balance...",
      buscaRotulo: "Buscar documentos",
      todasAsPastas: "Todas las carpetas",
      pastasRotulo: "Carpetas",
      recolherPasta: (nome: string) => `Contraer ${nome}`,
      expandirPasta: (nome: string) => `Expandir ${nome}`,
      todosOsDocumentos: "Todos los documentos",
      documentos: (n: number) => `${n} documento(s)`,
      arquivos: (n: number) => `${n} archivo(s)`,
      ano: (ano: number) => `Año ${ano}`,
      documentoPublicado: "Documento publicado",
      visualizar: "Ver",
      baixar: "Descargar",
      vazioComBusca: {
        titulo: "No se encontró ningún documento",
        nota: "Prueba con otro término o cambia de carpeta.",
      },
      vazioSemArquivos: {
        titulo: "Esta carpeta todavía no tiene archivos",
        nota: "Los PDFs oficiales aparecen aquí cuando se suben desde el panel.",
      },
    },
  },
);
