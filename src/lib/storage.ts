import { supabase } from "./supabase";

/** Nome do bucket público de mídia do site. */
export const BUCKET_MIDIA = "midia";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const TAMANHO_MAXIMO = 10 * 1024 * 1024; // 10 MB

/** Gera um caminho único e seguro para o arquivo dentro do bucket. */
function caminhoDoArquivo(pasta: string, arquivo: File) {
  const extensao = (arquivo.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const nome = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao || "jpg"}`;
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
