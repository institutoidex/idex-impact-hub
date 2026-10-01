// @ts-nocheck — arquivo executado pelo bun test (tipos de bun:test fora do tsconfig)
// Testes da camada de idiomas. Rodar com: bun test src/i18n
import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { ehLocale, langParaUrl, normalizarLocale, urlComLocale, LOCALES } from "./locales";
import { formatarData, plural } from "./formatar";
import { lerTraducoes, limparTraducoes, traduzir } from "./traduzir";
import { seoPagina } from "./seo";

describe("locale", () => {
  test("valida e normaliza", () => {
    expect(ehLocale("en-US")).toBe(true);
    expect(ehLocale("fr-FR")).toBe(false);
    expect(normalizarLocale("xx")).toBe("pt-BR");
    expect(normalizarLocale(undefined)).toBe("pt-BR");
    expect(langParaUrl("pt-BR")).toBeUndefined();
    expect(langParaUrl("es-ES")).toBe("es-ES");
  });
  test("URLs por idioma", () => {
    expect(urlComLocale("https://x.app", "/contato", "pt-BR")).toBe("https://x.app/contato");
    expect(urlComLocale("https://x.app", "/", "en-US")).toBe("https://x.app/?lang=en-US");
  });
});

describe("formatação", () => {
  test("datas no idioma e data inválida", () => {
    expect(formatarData("2026-04-13", "pt-BR")).toBe("13 de abril de 2026");
    expect(formatarData("2026-04-13", "en-US")).toBe("April 13, 2026");
    expect(formatarData("2026-04-13", "es-ES")).toBe("13 de abril de 2026");
    expect(formatarData("não é data", "en-US")).toBe("—");
    expect(formatarData(null, "es-ES")).toBe("—");
  });
  test("plural", () => {
    const f = { one: "{n} foto", other: "{n} fotos" };
    expect(plural(1, "pt-BR", f)).toBe("1 foto");
    expect(plural(0, "pt-BR", f)).toBe("0 fotos");
    expect(plural(2000, "en-US", { one: "{n} item", other: "{n} items" })).toBe("2,000 items");
  });
});

describe("traduções de conteúdo", () => {
  const noticia = {
    titulo: "Título",
    resumo: "Resumo",
    conteudo: "Texto",
    traducoes: { "en-US": { titulo: "Title", resumo: "Summary" } },
  };
  test("usa tradução quando existe", () => {
    const r = traduzir(noticia, "en-US", ["titulo", "resumo"]);
    expect(r.titulo).toBe("Title");
    expect(r.emPortugues).toBe(false);
  });
  test("fallback explícito para português", () => {
    const r = traduzir(noticia, "en-US", ["titulo", "conteudo"]);
    expect(r.conteudo).toBe("Texto");
    expect(r.emPortugues).toBe(true);
    const es = traduzir(noticia, "es-ES", ["titulo"]);
    expect(es.titulo).toBe("Título");
  });
  test("registro sem a coluna ou com valor inválido", () => {
    expect(traduzir({ titulo: "A" }, "en-US", ["titulo"]).titulo).toBe("A");
    expect(lerTraducoes("lixo")).toEqual({});
    expect(lerTraducoes(null)).toEqual({});
  });
  test("limpa campos vazios", () => {
    expect(limparTraducoes({ "en-US": { titulo: " " }, "es-ES": { titulo: "Hola" } })).toEqual({
      "es-ES": { titulo: "Hola" },
    });
  });
});

describe("SEO", () => {
  test("canonical e hreflang", () => {
    const s = seoPagina({ lang: "en-US", caminho: "/contato", titulo: "T", descricao: "D" });
    const canonical = s.links.find((l) => l.rel === "canonical");
    expect(canonical?.href).toContain("/contato?lang=en-US");
    expect(s.links.filter((l) => l.rel === "alternate")).toHaveLength(4);
  });
  test("lang inválido cai no canonical em português", () => {
    const s = seoPagina({ lang: "zz", caminho: "/", titulo: "T", descricao: "D" });
    expect(s.links.find((l) => l.rel === "canonical")?.href.endsWith("/")).toBe(true);
  });
});

/** Coleta os caminhos de chave de um objeto (funções contam como folha). */
function chaves(o: unknown, prefixo = ""): string[] {
  if (o === null || typeof o !== "object" || Array.isArray(o)) return [prefixo];
  return Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
    chaves(v, prefixo ? `${prefixo}.${k}` : k),
  );
}

describe("catálogos completos", async () => {
  const pasta = join(import.meta.dir, "catalogos");
  for (const arquivo of readdirSync(pasta).filter((f) => f.endsWith(".ts"))) {
    const mod = (await import(join(pasta, arquivo))) as Record<string, unknown>;
    for (const [nome, cat] of Object.entries(mod)) {
      if (!cat || typeof cat !== "object" || !("pt-BR" in cat)) continue;
      test(`${arquivo}:${nome} tem as mesmas chaves nos 3 idiomas`, () => {
        const c = cat as Record<string, unknown>;
        const base = chaves(c["pt-BR"]).sort();
        for (const l of LOCALES) expect(chaves(c[l]).sort()).toEqual(base);
      });
    }
  }
});

// Contagens reais da Transparência: singular/plural natural nos três idiomas
import { transparencia as catTransp } from "./catalogos/transparencia";
describe("contagens da Transparência", () => {
  test("singular e plural", () => {
    expect(catTransp["pt-BR"].arquivos(1)).toBe("1 arquivo");
    expect(catTransp["pt-BR"].arquivos(0)).toBe("0 arquivos");
    expect(catTransp["en-US"].documentos(1)).toBe("1 document");
    expect(catTransp["en-US"].documentos(3)).toBe("3 documents");
    expect(catTransp["es-ES"].arquivos(1)).toBe("1 archivo");
    expect(catTransp["es-ES"].documentos(2)).toBe("2 documentos");
  });
  test("nenhum catálogo usa '(s)'", () => {
    const { readdirSync, readFileSync } = require("node:fs");
    const pasta = require("node:path").join(import.meta.dir, "catalogos");
    for (const f of readdirSync(pasta)) expect(readFileSync(`${pasta}/${f}`, "utf8")).not.toMatch(/\((s|ns|es)\)/);
  });
});
