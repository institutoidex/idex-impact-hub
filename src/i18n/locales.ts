// Idiomas suportados pelo site e utilidades de validação.
// pt-BR é o padrão: não aparece na URL (sem ?lang).

export const LOCALES = ["pt-BR", "en-US", "es-ES"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_PADRAO: Locale = "pt-BR";

/** Nomes nativos exibidos no seletor (nunca traduzidos). */
export const NOMES_NATIVOS: Record<Locale, string> = {
  "pt-BR": "Português",
  "en-US": "English",
  "es-ES": "Español",
};

/** Código curto exibido no botão compacto do seletor. */
export const SIGLAS: Record<Locale, string> = { "pt-BR": "PT", "en-US": "EN", "es-ES": "ES" };

/** Valor de og:locale (formato com sublinhado). */
export const OG_LOCALE: Record<Locale, string> = {
  "pt-BR": "pt_BR",
  "en-US": "en_US",
  "es-ES": "es_ES",
};

/** Confere se um valor desconhecido é um idioma suportado. */
export function ehLocale(valor: unknown): valor is Locale {
  return typeof valor === "string" && (LOCALES as readonly string[]).includes(valor);
}

/** Normaliza qualquer valor para um idioma válido (fallback pt-BR). */
export function normalizarLocale(valor: unknown): Locale {
  return ehLocale(valor) ? valor : LOCALE_PADRAO;
}

/** Valor do parâmetro ?lang na URL: pt-BR some (undefined), os demais ficam. */
export function langParaUrl(locale: Locale): Locale | undefined {
  return locale === LOCALE_PADRAO ? undefined : locale;
}

/** Monta a URL de uma página num idioma (usada em canonical/hreflang). */
export function urlComLocale(base: string, caminho: string, locale: Locale): string {
  const url = `${base}${caminho === "/" ? "/" : caminho}`;
  return locale === LOCALE_PADRAO ? url : `${url}?lang=${locale}`;
}

// Persistência da preferência — tolerante a storage indisponível (modo privado, bloqueios).
const CHAVE_STORAGE = "idex-idioma";

export function lerPreferencia(): Locale | null {
  try {
    const v = window.localStorage.getItem(CHAVE_STORAGE);
    return ehLocale(v) ? v : null;
  } catch {
    return null;
  }
}

export function salvarPreferencia(locale: Locale) {
  try {
    window.localStorage.setItem(CHAVE_STORAGE, locale);
  } catch {
    // storage indisponível: a URL continua sendo a fonte da verdade
  }
}
