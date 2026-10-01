// Converte um código/erro de arquivo no texto traduzido do idioma atual.
import { useMensagens } from "./mensagens";
import { arquivos } from "./catalogos/arquivos";
import { ErroArquivo, type CodigoErroArquivo } from "@/lib/storage";

export function useMensagemArquivo() {
  const m = useMensagens(arquivos);
  /** Texto de um código de validação. */
  const deCodigo = (codigo: CodigoErroArquivo, nome = "") =>
    codigo === "duplicada" ? m.duplicada(nome) : m[codigo];
  /** Texto de um erro capturado; erros sem código usam o fallback traduzido. */
  const deErro = (e: unknown, fallback: string) =>
    e instanceof ErroArquivo ? deCodigo(e.codigo, e.nome) : (e as Error)?.message || fallback;
  return { deCodigo, deErro };
}
