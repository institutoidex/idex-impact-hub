// Catálogos tipados de mensagens.
// Cada área do site define seu catálogo com definirMensagens(pt, { "en-US", "es-ES" }).
// O português é a fonte do tipo: se faltar uma chave em inglês ou espanhol,
// o typecheck falha — assim nenhum catálogo fica incompleto.
import { useRouterState } from "@tanstack/react-router";
import { normalizarLocale, type Locale } from "./locales";

/** Troca literais de texto por string, mantendo a forma (objetos, listas, funções). */
export type Ampliar<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Ampliar<R>
    : T extends readonly (infer U)[]
      ? readonly Ampliar<U>[]
      : T extends object
        ? { [K in keyof T]: Ampliar<T[K]> }
        : T;

export type Catalogo<T> = Record<Locale, Ampliar<T>>;

/** Define um catálogo com português obrigatório como referência. */
export function definirMensagens<const T>(
  pt: T,
  outros: Record<Exclude<Locale, "pt-BR">, Ampliar<T>>,
): Catalogo<T> {
  return { "pt-BR": pt as Ampliar<T>, ...outros };
}

/** Idioma atual, lido do ?lang da URL (funciona no SSR, reload e acesso direto). */
export function useLocale(): Locale {
  return useRouterState({
    select: (s) => normalizarLocale((s.location.search as Record<string, unknown>)["lang"]),
  });
}

/** Mensagens de um catálogo no idioma atual. */
export function useMensagens<T>(catalogo: Catalogo<T>): Ampliar<T> {
  return catalogo[useLocale()];
}
