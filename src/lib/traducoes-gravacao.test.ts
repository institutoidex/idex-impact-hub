// Garante o que os editores (documento, pasta, projeto) mandam ao banco:
// traduções vazias são limpas, o original em português não é tocado e
// registros que já tinham traduções podem ser esvaziados.
import { describe, expect, test } from "bun:test";
import { camposComTraducoes } from "./mutations";
import { lerTraducoes } from "@/i18n/traduzir";

describe("gravação das traduções", () => {
  test("documento: só o título traduzido, demais campos intactos", () => {
    const original = { titulo: "Estatuto", arquivo_url: "https://x/Estatuto.pdf", pasta_id: "p1", ano: 2026 };
    const r = camposComTraducoes(original, { "en-US": { titulo: "Bylaws" }, "es-ES": { titulo: "  " } }, true);
    expect(r).toEqual({ ...original, traducoes: { "en-US": { titulo: "Bylaws" } } });
  });
  test("pasta: nome nos dois idiomas", () => {
    const r = camposComTraducoes({ nome: "Relatórios", slug: "relatorios" }, { "en-US": { nome: "Reports" }, "es-ES": { nome: "Informes" } }, false);
    expect(r.traducoes).toEqual({ "en-US": { nome: "Reports" }, "es-ES": { nome: "Informes" } });
    expect(r.slug).toBe("relatorios");
  });
  test("projeto: título, resumo e descrição", () => {
    const tr = { "en-US": { titulo: "T", resumo: "R", descricao: "D" } };
    expect(camposComTraducoes({ titulo: "x" }, tr, false).traducoes).toEqual(tr);
  });
  test("apagar todas as traduções de registro existente grava objeto vazio", () => {
    expect(camposComTraducoes({ titulo: "x" }, { "en-US": { titulo: "" } }, true).traducoes).toEqual({});
  });
  test("registro novo sem tradução não manda a coluna", () => {
    expect("traducoes" in camposComTraducoes({ titulo: "x" }, {}, false)).toBe(false);
  });
  test("jsonb existente é carregado; inválido vira vazio", () => {
    expect(lerTraducoes({ "es-ES": { titulo: "Estatutos" } })).toEqual({ "es-ES": { titulo: "Estatutos" } });
    expect(lerTraducoes("lixo")).toEqual({});
  });
});
