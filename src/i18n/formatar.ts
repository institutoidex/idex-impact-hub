// Formatação de datas, números e plurais com Intl no idioma correto.
import type { Locale } from "./locales";

const TRACO = "—";

/** Fuso oficial do instituto, usado para exibir instantes reais (data + hora). */
export const FUSO_PADRAO = "America/Sao_Paulo";

/**
 * Extrai o dia editorial (data de calendário) de um valor.
 * - Texto "AAAA-MM-DD..." (com ou sem hora/fuso): usa só os 10 primeiros caracteres,
 *   pois `publicado_em` é salvo como dia editorial (EditorNoticia faz .slice(0, 10))
 *   e o banco devolve meia-noite UTC — converter para o fuso local "voltaria um dia".
 * - Date/número: usa os componentes em UTC, para ser igual no SSR e no navegador.
 * Retorna uma Date em meio-dia UTC daquele dia (formatada sempre com timeZone UTC).
 */
function diaEditorial(valor: string | number | Date | null | undefined): Date | null {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor.trim());
    if (m) {
      const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12));
      // rejeita datas impossíveis (ex.: 2026-02-31)
      return d.getUTCDate() === Number(m[3]) ? d : null;
    }
  }
  const bruto = new Date(valor);
  if (Number.isNaN(bruto.getTime())) return null;
  return new Date(
    Date.UTC(bruto.getUTCFullYear(), bruto.getUTCMonth(), bruto.getUTCDate(), 12),
  );
}

/** Converte em instante real (Date) ou null se inválido. */
function instante(valor: string | number | Date | null | undefined): Date | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Data de calendário por extenso (ex.: 13 de abril de 2026 / April 13, 2026).
 * Determinística: não depende do fuso do servidor nem do visitante. Inválida → "—".
 */
export function formatarData(
  valor: string | number | Date | null | undefined,
  locale: Locale,
  opcoes: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  const d = diaEditorial(valor);
  return d ? new Intl.DateTimeFormat(locale, { ...opcoes, timeZone: "UTC" }).format(d) : TRACO;
}

/**
 * Data e hora de um instante real (painel/auditoria/mensagens), sempre no fuso
 * explícito (padrão America/Sao_Paulo) para SSR e cliente concordarem.
 */
export function formatarDataHora(
  valor: string | number | Date | null | undefined,
  locale: Locale,
  fuso: string = FUSO_PADRAO,
): string {
  const d = instante(valor);
  return d
    ? new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short", timeZone: fuso }).format(d)
    : TRACO;
}

/** Ano do dia editorial (mesma regra de formatarData), ou null. */
export function anoDe(valor: string | number | Date | null | undefined): number | null {
  return diaEditorial(valor)?.getUTCFullYear() ?? null;
}

/** Número com separadores do idioma. */
export function formatarNumero(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(n);
}

/** Escolhe a forma plural correta (Intl.PluralRules) e insere o número formatado. */
export function plural(
  n: number,
  locale: Locale,
  formas: { one: string; other: string },
): string {
  // O CLDR do português trata 0 como singular ("0 foto"); no uso brasileiro
  // corrente o zero leva plural ("0 fotos"), igual ao inglês e ao espanhol.
  const regra = n === 0 ? "other" : new Intl.PluralRules(locale).select(n);
  const molde = regra === "one" ? formas.one : formas.other;
  return molde.replace("{n}", formatarNumero(n, locale));
}
