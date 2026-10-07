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
  // Endereço oficial da sede (informado pelo instituto em 29/09/2026)
  endereco: "Rua Cel. José Eusébio, 95 – casa 13 – Higienópolis – São Paulo/SP – CEP 01.239-030",
  // Telefone institucional atualizado em 07/10/2026 (informado pelo Pedro)
  telefone: "(11) 92544-6046",
  cnpj: "08.666.490/0001-71",
  // Decisão do instituto: e-mail NÃO aparece no site (anti-spam contra robôs).
  // Não adicionar por conta própria — o contato é pelo formulário, telefone e redes.
  email: null as string | null,
  instagram: "@idexbrasil",
  instagramUrl: "https://instagram.com/idexbrasil",
  facebook: "/idexsocial",
  facebookUrl: "https://facebook.com/idexsocial",
};

// `chave` identifica o item de forma estável para buscar o rótulo traduzido
// no catálogo `layout.nav` (Header/Footer). `label` é mantido em português
// como referência/fallback.
export const NAV = [
  { to: "/", label: "Início", chave: "inicio" },
  { to: "/quem-somos", label: "Quem Somos", chave: "quemSomos" },
  { to: "/programa-esportivo", label: "Programa Esportivo", chave: "programaEsportivo" },
  // Projetos está oculto no site por enquanto (a pedido da diretoria)
  { to: "/transparencia", label: "Transparência", chave: "transparencia" },
  { to: "/noticias", label: "Notícias", chave: "noticias" },
  { to: "/contato", label: "Contato", chave: "contato" },
] as const;
