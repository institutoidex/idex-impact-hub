// Conteúdo do Instituto IDEX.
// REGRA: nada aqui é inventado. Onde não há informação real confirmada,
// usamos marcadores explícitos de placeholder (texto entre colchetes).

export interface Projeto {
  slug: string;
  nome: string;
  ano: number;
  resumo: string;
  real: boolean;
  objetivo?: string;
  publico?: string;
  parceria?: string;
  local?: string;
  lancamento?: string;
  /** capa vinda do painel (URL pública do banco); vazio = imagem padrão */
  imagem?: string | null;
}


export const PROJETOS: Projeto[] = [
  {
    slug: "talento-brasil",
    nome: "Talento Brasil",
    
    ano: 2017,
    resumo:
      "Treinamento de futebol gratuito para 200 crianças e jovens nas categorias de base, em parceria com o Clube Esportivo Penha.",
    real: true,
    objetivo:
      "Oferecer treinamento de futebol gratuito para crianças e jovens nas categorias de base.",
    publico: "200 crianças e jovens das categorias de base.",
    parceria: "Clube Esportivo Penha",
    local: "Rua Armando Cardoso Alves, 106 — Penha",
    lancamento:
      "26/06/2017, na Câmara dos Vereadores de Santa Cruz do Rio Pardo",
  },
];

// Notícias vêm somente do banco (publicadas); não há mais notícia fixa aqui.

export const CONTATO = {
  endereco: "Rua Armando Cardoso Alves, 106 — Penha",
  instagram: "@idexbrasil",
  instagramUrl: "https://instagram.com/idexbrasil",
  facebook: "/idexsocial",
  facebookUrl: "https://facebook.com/idexsocial",
  // Telefone e e-mail oficiais ainda não foram informados: ficam fora do site
  // até o instituto confirmar (não inventar).
  telefone: null as string | null,
  email: null as string | null,
};

export const NAV = [
  { to: "/", label: "Início" },
  { to: "/quem-somos", label: "Quem Somos" },
  { to: "/programa-esportivo", label: "Programa Esportivo" },
  // Projetos está oculto no site por enquanto (a pedido da diretoria)
  { to: "/transparencia", label: "Transparência" },
  { to: "/noticias", label: "Notícias" },
  { to: "/contato", label: "Contato" },
] as const;
