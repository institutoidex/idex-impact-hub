// @ts-nocheck — executado pelo bun test (tipos de bun:test fora do tsconfig)
// Galeria de notícias: normalização, envio (storage simulado) e gravação (banco simulado).
// Nenhuma notícia ou arquivo real é gravado.
import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---- Banco e storage falsos -------------------------------------------------
let colunas = new Set(["id", "slug", "titulo", "resumo", "conteudo", "imagem_url", "projeto_slug", "publicado", "publicado_em", "traducoes", "galeria"]);
const gravacoes: { op: string; campos: any }[] = [];
const banco = new Map<string, any>();
const enviados: string[] = [];
let falharUpload = false;
let falharRede = false;

function resposta(op: string, campos: any, id?: string) {
  const faltando = Object.keys(campos).find((c) => !colunas.has(c));
  if (falharRede) return { data: null, error: { message: "Failed to fetch" } };
  if (faltando) return { data: null, error: { code: "PGRST204", message: `Could not find the '${faltando}' column of 'noticias' in the schema cache` } };
  gravacoes.push({ op, campos });
  const reg = { ...(id ? banco.get(id) : { id: "novo-1" }), ...campos };
  banco.set(reg.id, reg);
  return { data: reg, error: null };
}

mock.module("./supabase", () => ({
  supabase: {
    from: () => ({
      insert: (campos) => ({ select: () => ({ single: async () => resposta("insert", campos) }) }),
      update: (campos) => ({ eq: (_c, id) => ({ select: () => ({ single: async () => resposta("update", campos, id) }) }) }),
    }),
    storage: {
      from: () => ({
        upload: async (caminho) => {
          if (falharUpload) return { error: new Error("rede indisponível") };
          if (enviados.includes(caminho)) return { error: new Error("The resource already exists") };
          enviados.push(caminho);
          return { error: null };
        },
        getPublicUrl: (c) => ({ data: { publicUrl: `https://cdn.exemplo/midia/${c}` } }),
      }),
    },
  },
}));

const g = await import("./galeria");
const { enviarFotoGaleria } = await import("./storage");
const { gravarNoticia, camposGaleria } = await import("./mutations");
const { editores } = await import("@/i18n/catalogos/editores");
const { noticias } = await import("@/i18n/catalogos/noticias");
const { midia } = await import("@/i18n/catalogos/midia");

const base = { slug: "festa", titulo: "Festa", resumo: "r", conteudo: "c", imagem_url: "https://cdn.exemplo/capa.jpg", projeto_slug: null, publicado: true, publicado_em: "2026-10-07" };
const foto = (n = "IMG 1.JPG") => new File(["x"], n, { type: "image/jpeg" });

beforeEach(() => {
  colunas = new Set(["id", "slug", "titulo", "resumo", "conteudo", "imagem_url", "projeto_slug", "publicado", "publicado_em", "traducoes", "galeria"]);
  gravacoes.length = 0; banco.clear(); enviados.length = 0; falharUpload = false; falharRede = false;
});

describe("normalizarGaleria", () => {
  test("valores malformados viram lista vazia", () => {
    for (const v of [null, undefined, "x", 3, {}, { 0: "https://a" }]) expect(g.normalizarGaleria(v)).toEqual([]);
  });
  test("só http/https, sem repetidos, ordem mantida", () => {
    const r = g.normalizarGaleria(["https://a/1.jpg", "javascript:alert(1)", "data:image/png;base64,AA", "/rel.jpg", 5, " https://a/1.jpg ", "http://b/2.jpg", "blob:https://x"]);
    expect(r).toEqual(["https://a/1.jpg", "http://b/2.jpg"]);
  });
  test("corta no limite", () => {
    const muitas = Array.from({ length: 50 }, (_, i) => `https://a/${i}.jpg`);
    expect(g.normalizarGaleria(muitas)).toHaveLength(g.LIMITE_GALERIA);
  });
  test("mover troca vizinhos e ignora bordas", () => {
    expect(g.moverNaGaleria(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(g.moverNaGaleria(["a", "b"], 0, -1)).toEqual(["a", "b"]);
  });
  test("detecta só coluna galeria ausente", () => {
    expect(g.erroColunaGaleriaAusente({ code: "42703", message: "column noticias.galeria does not exist" })).toBe(true);
    expect(g.erroColunaGaleriaAusente({ code: "42501", message: "galeria" })).toBe(false);
    expect(g.erroColunaGaleriaAusente({ code: "PGRST204", message: "traducoes" })).toBe(false);
  });
});

describe("enviarFotoGaleria", () => {
  test("mesma foto duas vezes vai para caminhos únicos", async () => {
    let n = 0;
    const id = () => `uuid-${++n}`;
    const u1 = await enviarFotoGaleria(foto(), "noticias", id);
    const u2 = await enviarFotoGaleria(foto(), "noticias", id);
    expect(u1).not.toBe(u2);
    expect(enviados).toEqual(["noticias/galeria/uuid-1/img-1.jpg", "noticias/galeria/uuid-2/img-1.jpg"]);
  });
  test("falha de upload propaga erro sem URL", async () => {
    falharUpload = true;
    await expect(enviarFotoGaleria(foto(), "noticias", () => "u")).rejects.toThrow();
  });
});

describe("gravarNoticia com galeria", () => {
  test("payload inclui galeria, capa distinta e traduções; reabrir conserva", async () => {
    const galeria = ["https://cdn.exemplo/g/1.jpg", "https://cdn.exemplo/g/2.jpg"];
    const traducoes = { "es-ES": { titulo: "Fiesta" } };
    const { dado } = await gravarNoticia({ ...base, galeria, traducoes });
    expect(gravacoes[0].campos.galeria).toEqual(galeria);
    expect(gravacoes[0].campos.imagem_url).toBe("https://cdn.exemplo/capa.jpg");
    expect(gravacoes[0].campos.traducoes).toEqual(traducoes);
    // "reabrir": o registro salvo normaliza para a mesma lista
    expect(g.normalizarGaleria(banco.get(dado.id).galeria)).toEqual(galeria);
  });
  test("esvaziar galeria de registro que já tinha coluna manda []", async () => {
    await gravarNoticia({ ...base, id: "n1", galeria: [], galeriaColunaExistente: true });
    expect(gravacoes[0].campos.galeria).toEqual([]);
  });
  test("migração pendente + galeria vazia: edição antiga continua salvando", async () => {
    colunas.delete("galeria");
    await gravarNoticia({ ...base, id: "n1", galeria: [] });
    expect("galeria" in gravacoes[0].campos).toBe(false);
  });
  test("migração pendente + fotos: erro explícito, nada gravado sem a galeria", async () => {
    colunas.delete("galeria");
    await expect(gravarNoticia({ ...base, galeria: ["https://a/1.jpg"] })).rejects.toBeInstanceOf(g.ErroGaleriaColunaAusente);
    expect(gravacoes).toHaveLength(0);
  });
  test("fallback de traducoes ausente mantém a galeria", async () => {
    colunas.delete("traducoes");
    const { avisoColunaAusente } = await gravarNoticia({ ...base, galeria: ["https://a/1.jpg"], traducoes: { "en-US": { titulo: "Party" } } });
    expect(avisoColunaAusente).toBe(true);
    expect(gravacoes[0].campos.galeria).toEqual(["https://a/1.jpg"]);
  });
  test("falha de rede rejeita (editor trata e fica aberto)", async () => {
    falharRede = true;
    await expect(gravarNoticia({ ...base, galeria: ["https://a/1.jpg"] })).rejects.toBeTruthy();
  });
  test("camposGaleria filtra URLs perigosas antes de gravar", () => {
    expect(camposGaleria(["javascript:x", "https://a/1.jpg"], false)).toEqual({ galeria: ["https://a/1.jpg"] });
  });
});

describe("textos PT/EN/ES", () => {
  test("aviso de migração, título e alt da galeria nos três idiomas", () => {
    for (const l of ["pt-BR", "en-US", "es-ES"]) {
      expect(editores[l].erros.galeriaColunaAusente).not.toMatch(/sql|migra|banco|database|base de datos/i);
      expect(midia[l].upload.galeriaAguardeFechar.length).toBeGreaterThan(3);
      expect(noticias[l].detalhe.galeriaTitulo.length).toBeGreaterThan(3);
      expect(noticias[l].detalhe.galeriaAlt("T", 1, 3)).toContain("T");
      expect(midia[l].upload.galeriaEnviando.length).toBeGreaterThan(3);
    }
    expect(noticias["en-US"].detalhe.galeriaTitulo).toBe("Photo gallery");
    expect(noticias["es-ES"].detalhe.galeriaTitulo).toBe("Galería de fotos");
  });
});
