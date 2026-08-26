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
    area: "esportes",
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

export interface Noticia {
  slug: string;
  titulo: string;
  data: string;
  resumo: string;
  real: boolean;
}

export const NOTICIAS: Noticia[] = [
  {
    slug: "lancamento-talento-brasil",
    titulo: "Lançamento do projeto Talento Brasil",
    data: "26/06/2017",
    resumo:
      "O projeto Talento Brasil foi lançado na Câmara dos Vereadores de Santa Cruz do Rio Pardo, em parceria com o Clube Esportivo Penha.",
    real: true,
  },
];

export const CONTATO = {
  endereco: "Rua Armando Cardoso Alves, 106 — Penha",
  instagram: "@idexbrasil",
  instagramUrl: "https://instagram.com/idexbrasil",
  facebook: "/idexsocial",
  facebookUrl: "https://facebook.com/idexsocial",
  telefone: "[telefone a definir]",
  email: "[e-mail a definir]",
};

export const NAV = [
  { to: "/", label: "Início" },
  { to: "/quem-somos", label: "Quem Somos" },
  { to: "/areas", label: "Áreas de Atuação" },
  { to: "/projetos", label: "Projetos" },
  { to: "/transparencia", label: "Transparência" },
  { to: "/noticias", label: "Notícias" },
  { to: "/contato", label: "Contato" },
] as const;
