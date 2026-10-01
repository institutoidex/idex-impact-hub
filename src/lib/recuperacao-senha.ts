/**
 * Regras do fluxo de recuperação de senha da equipe (sem React, testáveis com mocks).
 *
 * Fluxo configurado hoje no Supabase externo: "implicit". O e-mail leva a
 *   https://idex-impact-hub.lovable.app/redefinir-senha[?lang=xx]#access_token=…&type=recovery
 * ou, quando o link expirou/já foi usado:
 *   …/redefinir-senha#error=access_denied&error_code=otp_expired&error_description=…
 *
 * Importante: nenhum token, hash ou código é registrado em log ou mostrado na tela.
 */
import { SITE_URL } from "./site";
import { urlComLocale, type Locale } from "@/i18n/locales";

/** Tamanho mínimo aceito — o mesmo já usado no login e no Supabase (padrão: 6). */
export const SENHA_MINIMA = 6;
export const SENHA_MAXIMA = 128;

/** Tempo máximo esperando a validação do link antes de desistir (sem spinner infinito). */
export const TEMPO_LIMITE_MS = 10_000;

/**
 * Endereço do link enviado por e-mail: sempre o domínio publicado,
 * mesmo quando o pedido parte do preview ou do localhost.
 */
export function urlRedefinicao(locale: Locale): string {
  return urlComLocale(SITE_URL, "/redefinir-senha", locale);
}

/** O que o endereço de chegada indica (calculado antes de o Supabase limpar o hash). */
export type TipoLink = "recuperacao" | "expirado" | "invalido" | "nenhum";

/** Classifica o link a partir do hash e da query, sem guardar os valores dos tokens. */
export function classificarLink(hash: string, search: string): TipoLink {
  const h = new URLSearchParams(hash.replace(/^#/, ""));
  const q = new URLSearchParams(search.replace(/^\?/, ""));
  const codigoErro = h.get("error_code") ?? q.get("error_code");
  const erro = h.get("error") ?? q.get("error");
  // otp_expired cobre tanto link vencido quanto link já usado
  if (codigoErro === "otp_expired") return "expirado";
  if (erro || codigoErro) return "invalido";
  if (h.get("type") === "recovery" && h.get("access_token")) return "recuperacao";
  // Fluxo PKCE (se um dia for ativado): ?code=… só vale com type=recovery explícito
  if (q.get("code") && q.get("type") === "recovery") return "recuperacao";
  return "nenhum";
}

/** Estados possíveis da tela de redefinição. */
export type EstadoTela =
  | "validando"
  | "pronto"
  | "expirado"
  | "invalido"
  | "semSessao"
  | "tempoEsgotado"
  | "sucesso";

/**
 * Decide o estado inicial da tela.
 * Só aceita uma sessão como "recuperação" se o link chegou com type=recovery
 * ou se o evento PASSWORD_RECOVERY foi visto — qualquer outra sessão (ex.: admin
 * logado) NÃO libera a troca de senha por aqui.
 */
export async function resolverEstadoInicial(opcoes: {
  link: TipoLink;
  /** true se o evento PASSWORD_RECOVERY já disparou (capturado na criação do cliente). */
  recuperacaoVista: () => boolean;
  /** Retorna se existe sessão (getSession espera a inicialização do cliente). */
  temSessao: () => Promise<boolean>;
  tempoLimiteMs?: number;
}): Promise<EstadoTela> {
  if (opcoes.link === "expirado") return "expirado";
  if (opcoes.link === "invalido") return "invalido";
  if (opcoes.link === "nenhum" && !opcoes.recuperacaoVista()) return "semSessao";

  // Corrida contra o tempo: se a validação travar, mostra estado explícito
  const limite = new Promise<"tempo">((r) =>
    setTimeout(() => r("tempo"), opcoes.tempoLimiteMs ?? TEMPO_LIMITE_MS),
  );
  const resultado = await Promise.race([
    opcoes.temSessao().catch(() => false),
    limite,
  ]);
  if (resultado === "tempo") return "tempoEsgotado";
  if (!resultado) return opcoes.link === "recuperacao" ? "invalido" : "semSessao";
  return "pronto";
}

/** Erros de campo do formulário (chaves; o texto vem do catálogo do idioma). */
export type ErroCampo = "senhaMinima" | "senhaMaxima" | "senhasNaoConferem";

export function validarSenhas(senha: string, confirmar: string) {
  const erros: { senha?: ErroCampo; confirmar?: ErroCampo } = {};
  if (senha.length < SENHA_MINIMA) erros.senha = "senhaMinima";
  else if (senha.length > SENHA_MAXIMA) erros.senha = "senhaMaxima";
  if (confirmar !== senha) erros.confirmar = "senhasNaoConferem";
  return erros;
}

/** Falhas da troca de senha, traduzidas na tela pelo catálogo. */
export type FalhaTroca = "fraca" | "igual" | "rede" | "sessao" | "generica";

/** Erro mínimo retornado pelo Supabase (code/status/name/message). */
interface ErroSupabase {
  code?: string | undefined;
  status?: number | undefined;
  name?: string | undefined;
  message?: string | undefined;
}

/** Converte um erro do Supabase numa falha conhecida (sem expor a mensagem crua). */
export function classificarFalha(erro: ErroSupabase): FalhaTroca {
  if (erro.code === "weak_password") return "fraca";
  if (erro.code === "same_password") return "igual";
  if (
    erro.code === "session_not_found" ||
    erro.code === "session_expired" ||
    erro.name === "AuthSessionMissingError" ||
    erro.status === 401 ||
    erro.status === 403
  )
    return "sessao";
  if (erro.name === "AuthRetryableFetchError" || erro.status === 0 || /fetch|network/i.test(erro.message ?? ""))
    return "rede";
  return "generica";
}

/** Troca a senha via função injetada (updateUser real ou mock nos testes). */
export async function trocarSenha(
  atualizar: (senha: string) => Promise<{ error: ErroSupabase | null }>,
  senha: string,
): Promise<{ ok: true } | { ok: false; falha: FalhaTroca }> {
  try {
    const { error } = await atualizar(senha);
    if (error) return { ok: false, falha: classificarFalha(error) };
    return { ok: true };
  } catch {
    // fetch rejeitado (sem internet, DNS etc.)
    return { ok: false, falha: "rede" };
  }
}

/** Impede envio duplicado: enquanto uma execução roda, novas chamadas são ignoradas. */
export function envioUnico<A extends unknown[], R>(fn: (...a: A) => Promise<R>) {
  let emAndamento = false;
  return async (...a: A): Promise<R | undefined> => {
    if (emAndamento) return undefined;
    emAndamento = true;
    try {
      return await fn(...a);
    } finally {
      emAndamento = false;
    }
  };
}
