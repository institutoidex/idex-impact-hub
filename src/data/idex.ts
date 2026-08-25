// Conteúdo do Instituto IDEX.
// REGRA: nada aqui é inventado. Onde não há informação real confirmada,
// usamos marcadores explícitos de placeholder (texto entre colchetes).

export type AreaSlug =
  | "educacao"
  | "cultura"
  | "esportes"
  | "meio-ambiente"
  | "negocios"
  | "saude";

export interface Area {
  slug: AreaSlug;
  nome: string;
  resumo: string;
  descricao: string;
  /** nome do ícone lucide usado na página */
  icone: "GraduationCap" | "Palette" | "Trophy" | "Leaf" | "Briefcase" | "HeartPulse";
  /** classe utilitária de cor (tokens da paleta oficial) */
  cor: string;
}

export const AREAS: Area[] = [
  {
    slug: "educacao",
    nome: "Educação",
    resumo: "Apoio e desenvolvimento",
    descricao:
      "Frente de apoio e desenvolvimento educacional. [Descrição detalhada a definir com a equipe do instituto]",
    icone: "GraduationCap",
    cor: "bg-primary text-primary-foreground",
  },
  {
    slug: "cultura",
    nome: "Cultura",
    resumo: "Artes e oficinas",
    descricao:
      "Frente de artes e oficinas culturais. [Descrição detalhada a definir com a equipe do instituto]",
    icone: "Palette",
    cor: "bg-secondary text-secondary-foreground",
  },
  {
    slug: "esportes",
    nome: "Esportes",
    resumo: "Projetos e ações sociais",
    descricao:
      "Frente de projetos e ações sociais por meio do esporte. É onde está o projeto Talento Brasil.",
    icone: "Trophy",
    cor: "bg-primary text-primary-foreground",
  },
  {
    slug: "meio-ambiente",
    nome: "Meio Ambiente",
    resumo: "Sustentabilidade",
    descricao:
      "Frente de sustentabilidade. [Descrição detalhada a definir com a equipe do instituto]",
    icone: "Leaf",
    cor: "bg-primary text-primary-foreground",
  },
  {
    slug: "negocios",
    nome: "Negócios",
    resumo: "Indústria e comércio",
    descricao:
      "Frente ligada a indústria e comércio — origem histórica do instituto, em projetos de comércio exterior e competitividade. [Descrição detalhada a definir]",
    icone: "Briefcase",
    cor: "bg-secondary text-secondary-foreground",
  },
  {
    slug: "saude",
    nome: "Saúde",
    resumo: "Qualidade de vida",
    descricao:
      "Frente de qualidade de vida. [Descrição detalhada a definir com a equipe do instituto]",
    icone: "HeartPulse",
    cor: "bg-secondary text-secondary-foreground",
  },
];

export interface Projeto {
  slug: string;
  nome: string;
  area: AreaSlug;
  ano: number;
  resumo: string;
  real: boolean;
  objetivo?: string;
  publico?: string;
  parceria?: string;
  local?: string;
  lancamento?: string;
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
  { to: "/parceiros", label: "Parceiros" },
  { to: "/transparencia", label: "Transparência" },
  { to: "/noticias", label: "Notícias" },
  { to: "/contato", label: "Contato" },
] as const;
