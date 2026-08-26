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

/** Gera um caminho único e seguro para o arquivo dentro do bucket. */
function caminhoDoArquivo(pasta: string, arquivo: File) {
  const extensao = (arquivo.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = arquivo.name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const nome = `${Date.now()}-${base || Math.random().toString(36).slice(2, 8)}.${extensao || "jpg"}`;
  return `${pasta}/${nome}`;
}

/** Valida o arquivo antes do envio; devolve a mensagem de erro ou null. */
export function validarImagem(arquivo: File): string | null {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return "Formato não aceito. Use JPG, PNG, WEBP, GIF ou AVIF.";
  }
  if (arquivo.size > TAMANHO_MAXIMO) return "Arquivo muito grande. O limite é 10 MB.";
  return null;
}

/** Valida documentos (PDF, planilhas) antes do envio. */
export function validarDocumento(arquivo: File): string | null {
  if (!TIPOS_DOCUMENTO.includes(arquivo.type)) {
    return "Formato não aceito. Use PDF, XLSX ou CSV.";
  }
  if (arquivo.size > TAMANHO_MAXIMO_DOC) return "Arquivo muito grande. O limite é 25 MB.";
  return null;
}

/** Envia a imagem para o bucket e devolve a URL pública. */
export async function enviarImagem(arquivo: File, pasta: string): Promise<string> {
  const caminho = caminhoDoArquivo(pasta, arquivo);
  const { error } = await supabase.storage
    .from(BUCKET_MIDIA)
    .upload(caminho, arquivo, { cacheControl: "31536000", upsert: false });
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
