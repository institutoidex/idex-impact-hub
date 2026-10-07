import { supabase } from "./supabase";

/** Nome do bucket público de mídia do site. */
export const BUCKET_MIDIA = "midia";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const TIPOS_DOCUMENTO = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];
const TAMANHO_MAXIMO = 10 * 1024 * 1024; // 10 MB
const TAMANHO_MAXIMO_DOC = 25 * 1024 * 1024; // 25 MB

/**
 * Gera um caminho seguro para o arquivo dentro do bucket.
 * Com `unico = false` usa apenas o nome do arquivo (sem código numérico).
 */
function caminhoDoArquivo(pasta: string, arquivo: File, unico = true) {
  const extensao = (arquivo.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = arquivo.name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const nomeBase = base || Math.random().toString(36).slice(2, 8);
  const nome = unico
    ? `${Date.now()}-${nomeBase}.${extensao || "jpg"}`
    : `${nomeBase}.${extensao || "jpg"}`;
  return `${pasta}/${nome}`;
}

/** Remove o código numérico antigo (ex.: "1790687470165-") do início do nome. */
export function nomeLimpo(nome: string) {
  return nome.replace(/^\d{10,}-/, "");
}

/** URL que força o download do arquivo original com o nome limpo. */
export function urlDownload(url: string, nome: string) {
  return `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(nomeLimpo(nome))}`;
}

/** Códigos de erro de arquivo; o texto visível vem do catálogo "arquivos" (traduzido). */
export type CodigoErroArquivo =
  | "formatoImagem"
  | "imagemGrande"
  | "formatoDocumento"
  | "documentoGrande"
  | "duplicada"
  | "nomePastaInvalido"
  | "tituloCapaAusente";

/** Erro com código traduzível (nome = nome do arquivo, mantido original). */
export class ErroArquivo extends Error {
  constructor(
    public codigo: CodigoErroArquivo,
    public nome = "",
  ) {
    super(codigo);
  }
}

/** Valida o arquivo antes do envio; devolve o código do erro ou null. */
export function validarImagem(arquivo: File): CodigoErroArquivo | null {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return "formatoImagem";
  }
  if (arquivo.size > TAMANHO_MAXIMO) return "imagemGrande";
  return null;
}

/** Valida documentos (PDF, planilhas) antes do envio. */
export function validarDocumento(arquivo: File): CodigoErroArquivo | null {
  if (!TIPOS_DOCUMENTO.includes(arquivo.type)) {
    return "formatoDocumento";
  }
  if (arquivo.size > TAMANHO_MAXIMO_DOC) return "documentoGrande";
  return null;
}

/**
 * Envia a imagem usando só o nome do arquivo e devolve a URL pública.
 * Nomes repetidos na mesma pasta são proibidos (não sobrescreve).
 */
export async function enviarImagem(arquivo: File, pasta: string): Promise<string> {
  const caminho = caminhoDoArquivo(pasta, arquivo, false);
  const nomeArquivo = caminho.split("/").pop() ?? "";

  // Arquivos antigos foram guardados com prefixo numérico ("1790687470165-foto.jpg").
  // O storage não os enxerga como duplicados, então conferimos o nome visível
  // (sem o prefixo) antes de enviar. Nada é renomeado ou apagado.
  const { data: existentes, error: erroLista } = await supabase.storage
    .from(BUCKET_MIDIA)
    .list(pasta, { search: nomeArquivo, limit: 1000 });
  if (erroLista) throw erroLista;
  if ((existentes ?? []).some((obj) => obj.id && nomeLimpo(obj.name) === nomeArquivo)) {
    throw new ErroArquivo("duplicada", nomeArquivo);
  }

  const { error } = await supabase.storage
    .from(BUCKET_MIDIA)
    .upload(caminho, arquivo, { cacheControl: "31536000", upsert: false });
  if (error) {
    // o storage recusa caminhos já existentes: traduz para uma mensagem clara
    if (/exist|duplicate/i.test(error.message)) {
      throw new ErroArquivo("duplicada", caminho.split("/").pop() ?? "");
    }
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET_MIDIA).getPublicUrl(caminho);
  return data.publicUrl;
}

/* ------------------------------------------------------------------ */
/* Capa de notícia: nome a partir do título + subpasta única por envio */
/* ------------------------------------------------------------------ */

/** Extensão segura a partir do tipo da imagem (o MIME já foi validado). */
const EXTENSAO_POR_TIPO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** Tamanho máximo da parte do título no nome (antes de "-capa"). */
export const LIMITE_BASE_CAPA = 60;

/**
 * Nome final da capa: "titulo-normalizado-capa.ext" (ex.: "Talento Brasil"
 * + JPEG → "talento-brasil-capa.jpg"). A palavra "capa" é literal em
 * qualquer idioma; o nome do arquivo original nunca é usado.
 * Título longo é cortado ANTES de acrescentar "-capa".
 * Devolve null se o título não tiver nenhuma letra/número aproveitável.
 */
export function nomeCapa(titulo: string, arquivo: Pick<File, "name" | "type">): string | null {
  const base = (titulo ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, LIMITE_BASE_CAPA)
    .replace(/-+$/g, "");
  if (!base) return null;
  const doNome = (arquivo.name.includes(".") ? arquivo.name.split(".").pop() : "") ?? "";
  const extensao =
    EXTENSAO_POR_TIPO[arquivo.type] ?? (doNome.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg");
  return `${base}-capa.${extensao}`;
}

/** Identificador único da subpasta de cada envio de capa. */
function novoIdEnvio() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Envia a capa como `<pasta>/capas/<uuid>/<titulo>-capa.<ext>` e devolve a URL.
 * - A subpasta UUID torna cada envio único: a mesma foto pode ser capa de
 *   duas notícias, títulos iguais não colidem e trocar a capa nunca
 *   sobrescreve a anterior (upsert sempre false; nada é apagado/renomeado).
 * - Profundidade 3 a partir da raiz: continua visível em listarMidia
 *   (que desce até o nível 3) e navegável em listarConteudoPasta.
 * - Lança ErroArquivo("tituloCapaAusente") se o título não servir de nome.
 * - URL colada à mão no campo da capa NÃO passa por aqui (fica como está).
 */
export async function enviarCapa(
  arquivo: File,
  pasta: string,
  titulo: string,
  gerarId: () => string = novoIdEnvio,
): Promise<string> {
  const nome = nomeCapa(titulo, arquivo);
  if (!nome) throw new ErroArquivo("tituloCapaAusente");
  const caminho = `${pasta}/capas/${gerarId()}/${nome}`;
  const { error } = await supabase.storage.from(BUCKET_MIDIA).upload(caminho, arquivo, {
    cacheControl: "31536000",
    upsert: false,
    contentType: arquivo.type || undefined, // preserva o MIME original
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET_MIDIA).getPublicUrl(caminho);
  return data.publicUrl;
}

/** Envia qualquer arquivo (documento) e devolve caminho + URL pública. */
export async function enviarArquivo(arquivo: File, pasta: string) {
  const caminho = caminhoDoArquivo(pasta, arquivo);
  const { error } = await supabase.storage
    .from(BUCKET_MIDIA)
    .upload(caminho, arquivo, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET_MIDIA).getPublicUrl(caminho);
  return { caminho, url: data.publicUrl };
}

/** Um arquivo da biblioteca de mídia do site. */
export type ArquivoMidia = {
  caminho: string;
  nome: string;
  pasta: string;
  url: string;
  tamanho: number | null;
  atualizado_em: string | null;
  tipo: string | null;
};

/** Lista recursivamente os arquivos do bucket (biblioteca de mídia). */
export async function listarMidia(prefixo = "", profundidade = 0): Promise<ArquivoMidia[]> {
  if (profundidade > 3) return [];
  const { data, error } = await supabase.storage.from(BUCKET_MIDIA).list(prefixo, {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;

  const arquivos: ArquivoMidia[] = [];
  for (const item of data ?? []) {
    const caminho = prefixo ? `${prefixo}/${item.name}` : item.name;
    // Pastas vêm sem metadados; entramos nelas para buscar os arquivos.
    if (!item.id) {
      arquivos.push(...(await listarMidia(caminho, profundidade + 1)));
      continue;
    }
    if (item.name === ".emptyFolderPlaceholder") continue;
    const { data: pub } = supabase.storage.from(BUCKET_MIDIA).getPublicUrl(caminho);
    arquivos.push({
      caminho,
      nome: item.name,
      pasta: prefixo || "raiz",
      url: pub.publicUrl,
      tamanho: (item.metadata?.["size"] as number | undefined) ?? null,
      atualizado_em: item.updated_at ?? item.created_at ?? null,
      tipo: (item.metadata?.["mimetype"] as string | undefined) ?? null,
    });
  }
  return arquivos;
}

/** Apaga um arquivo do bucket pelo caminho. */
export async function apagarMidia(caminho: string) {
  const { error } = await supabase.storage.from(BUCKET_MIDIA).remove([caminho]);
  if (error) throw error;
}

/** Formata bytes em texto curto (KB/MB). */
export function formatarTamanho(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ */
/* Pastas e subpastas da biblioteca de imagens                         */
/* ------------------------------------------------------------------ */

/** Marcador usado pelo Supabase para manter uma pasta vazia visível. */
const MARCADOR_PASTA = ".emptyFolderPlaceholder";

/** Uma pasta (prefixo) dentro do bucket de mídia. */
export type PastaMidia = { nome: string; caminho: string };

/** Deixa o nome da pasta seguro para virar parte do caminho. */
export function normalizarNomePasta(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Lista somente o conteúdo direto de uma pasta: subpastas e arquivos. */
export async function listarConteudoPasta(
  prefixo = "",
): Promise<{ pastas: PastaMidia[]; arquivos: ArquivoMidia[] }> {
  const { data, error } = await supabase.storage.from(BUCKET_MIDIA).list(prefixo, {
    limit: 500,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;

  const pastas: PastaMidia[] = [];
  const arquivos: ArquivoMidia[] = [];
  for (const item of data ?? []) {
    const caminho = prefixo ? `${prefixo}/${item.name}` : item.name;
    if (!item.id) {
      pastas.push({ nome: item.name, caminho });
      continue;
    }
    if (item.name === MARCADOR_PASTA) continue;
    const { data: pub } = supabase.storage.from(BUCKET_MIDIA).getPublicUrl(caminho);
    arquivos.push({
      caminho,
      nome: item.name,
      pasta: prefixo || "raiz",
      url: pub.publicUrl,
      tamanho: (item.metadata?.["size"] as number | undefined) ?? null,
      atualizado_em: item.updated_at ?? item.created_at ?? null,
      tipo: (item.metadata?.["mimetype"] as string | undefined) ?? null,
    });
  }
  return { pastas, arquivos };
}

/** Lista todos os caminhos de pastas (para escolher destino ao mover). */
export async function listarTodasPastas(prefixo = "", profundidade = 0): Promise<string[]> {
  if (profundidade > 3) return [];
  const { data, error } = await supabase.storage
    .from(BUCKET_MIDIA)
    .list(prefixo, { limit: 500, sortBy: { column: "name", order: "asc" } });
  if (error) return [];
  const caminhos: string[] = [];
  for (const item of data ?? []) {
    if (item.id) continue;
    const caminho = prefixo ? `${prefixo}/${item.name}` : item.name;
    caminhos.push(caminho);
    caminhos.push(...(await listarTodasPastas(caminho, profundidade + 1)));
  }
  return caminhos;
}

/** Cria uma pasta (ou subpasta) gravando um marcador vazio dentro dela. */
export async function criarPastaMidia(caminhoPai: string, nome: string) {
  const seguro = normalizarNomePasta(nome);
  if (!seguro) throw new ErroArquivo("nomePastaInvalido");
  const caminho = caminhoPai ? `${caminhoPai}/${seguro}` : seguro;
  const { error } = await supabase.storage
    .from(BUCKET_MIDIA)
    .upload(`${caminho}/${MARCADOR_PASTA}`, new Blob([""]), { upsert: true });
  if (error) throw error;
  return caminho;
}

/** Apaga a pasta e tudo que estiver dentro dela (inclusive subpastas). */
export async function apagarPastaMidia(caminho: string) {
  const arquivos = await listarMidia(caminho);
  const marcadores = [caminho, ...(await listarTodasPastas(caminho))].map(
    (p) => `${p}/${MARCADOR_PASTA}`,
  );
  const alvos = [...arquivos.map((a) => a.caminho), ...marcadores];
  if (alvos.length) {
    const { error } = await supabase.storage.from(BUCKET_MIDIA).remove(alvos);
    if (error) throw error;
  }
}

/** Move um arquivo para outra pasta do bucket. */
export async function moverMidia(caminho: string, pastaDestino: string) {
  const nome = caminho.split("/").pop()!;
  const destino = pastaDestino ? `${pastaDestino}/${nome}` : nome;
  if (destino === caminho) return destino;
  const { error } = await supabase.storage.from(BUCKET_MIDIA).move(caminho, destino);
  if (error) throw error;
  return destino;
}
