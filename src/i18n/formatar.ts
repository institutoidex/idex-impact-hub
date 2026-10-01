// Formatação de datas, números e plurais com Intl no idioma correto.
import type { Locale } from "./locales";

const TRACO = "—";

/** Converte texto/Date em Date válido, ou null se inválido. */
function paraData(valor: string | number | Date | null | undefined): Date | null {
  if (valor === null || valor === undefined || valor === "") return null;
  // datas "AAAA-MM-DD" sem hora: fixa meio-dia para não "voltar um dia" pelo fuso
  const d =
    typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)
      ? new Date(`${valor}T12:00:00`)
      : new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Data por extenso (ex.: 13 de abril de 2026 / April 13, 2026). Inválida → "—". */
export function formatarData(
  valor: string | number | Date | null | undefined,
  locale: Locale,
  opcoes: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  const d = paraData(valor);
  return d ? new Intl.DateTimeFormat(locale, opcoes).format(d) : TRACO;
}

/** Data e hora curtas (painel/auditoria). */
export function formatarDataHora(valor: string | null | undefined, locale: Locale): string {
  return formatarData(valor, locale, { dateStyle: "short", timeStyle: "short" });
}

/** Ano numérico de uma data, ou null. */
export function anoDe(valor: string | null | undefined): number | null {
  return paraData(valor)?.getFullYear() ?? null;
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
