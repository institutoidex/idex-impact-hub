// @ts-nocheck — executado pelo bun test (tipos de bun:test fora do tsconfig)
// Capa de notícia: nome "titulo-capa.ext" e caminho único por envio.
// O armazenamento é SIMULADO: nenhum arquivo real é enviado.
import { beforeEach, describe, expect, mock, test } from "bun:test";

// Armazenamento falso: guarda os caminhos e recusa caminho repetido (como o real com upsert false)
const enviados: { caminho: string; opcoes: any }[] = [];
let falhar = false;
mock.module("./supabase", () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: async (caminho: string, _arq: unknown, opcoes: any) => {
          if (falhar) return { error: new Error("rede indisponível") };
          if (enviados.some((e) => e.caminho === caminho)) return { error: new Error("The resource already exists") };
          enviados.push({ caminho, opcoes });
          return { error: null };
        },
        getPublicUrl: (c: string) => ({ data: { publicUrl: `https://cdn/midia/${c}` } }),
      }),
    },
  },
}));

const { nomeCapa, enviarCapa, validarImagem, ErroArquivo, LIMITE_BASE_CAPA } = await import("./storage");
const { arquivos } = await import("@/i18n/catalogos/arquivos");

const foto = (name = "IMG_2034 Final (1).JPG", type = "image/jpeg") => new File(["x"], name, { type });

beforeEach(() => {
  enviados.length = 0;
  falhar = false;
});

describe("nomeCapa", () => {
  test("Talento Brasil → talento-brasil-capa.jpg (nunca o nome original)", () =>
    expect(nomeCapa("Talento Brasil", foto())).toBe("talento-brasil-capa.jpg"));
  test("acentos, espaços e caracteres inseguros", () =>
    expect(nomeCapa("  Ação: Copa São João / 2026!  ", foto())).toBe("acao-copa-sao-joao-2026-capa.jpg"));
  test("extensão segue o MIME (png, webp)", () => {
    expect(nomeCapa("A", foto("x.jpeg", "image/png"))).toBe("a-capa.png");
    expect(nomeCapa("A", foto("semext", "image/webp"))).toBe("a-capa.webp");
  });
  test("título longo: corta a base antes de acrescentar -capa", () => {
    const n = nomeCapa("palavra ".repeat(40), foto())!;
    expect(n.endsWith("-capa.jpg")).toBe(true);
    expect(n.replace(/-capa\.jpg$/, "").length).toBeLessThanOrEqual(LIMITE_BASE_CAPA);
    expect(n).not.toContain("--");
  });
  test("vazio ou só símbolos: null", () => {
    expect(nomeCapa("", foto())).toBeNull();
    expect(nomeCapa("   !!! ", foto())).toBeNull();
  });
});

describe("enviarCapa (armazenamento simulado)", () => {
  test("mesma foto em duas notícias: dois caminhos, nomes pelos títulos", async () => {
    const a = await enviarCapa(foto(), "noticias", "Talento Brasil");
    const b = await enviarCapa(foto(), "noticias", "Festa Junina");
    expect(a).toMatch(/noticias\/capas\/[^/]+\/talento-brasil-capa\.jpg$/);
    expect(b).toMatch(/noticias\/capas\/[^/]+\/festa-junina-capa\.jpg$/);
    expect(enviados.every((e) => e.opcoes.upsert === false && e.opcoes.contentType === "image/jpeg")).toBe(true);
  });
  test("títulos iguais e reenvio/troca: nada sobrescreve", async () => {
    const urls = [
      await enviarCapa(foto(), "noticias", "Talento Brasil"),
      await enviarCapa(foto(), "noticias", "Talento  BRASIL"),
      await enviarCapa(foto("outra.png", "image/png"), "noticias", "Talento Brasil"),
    ];
    expect(new Set(urls).size).toBe(3);
    expect(enviados.length).toBe(3);
  });
  test("profundidade 3 (pasta/capas/uuid/arquivo), compatível com listarMidia", async () => {
    await enviarCapa(foto(), "noticias", "X", () => "id-fixo");
    expect(enviados[0].caminho).toBe("noticias/capas/id-fixo/x-capa.jpg");
  });
  test("sem título: erro tituloCapaAusente, nada enviado", async () => {
    await expect(enviarCapa(foto(), "noticias", " ")).rejects.toBeInstanceOf(ErroArquivo);
    expect(enviados.length).toBe(0);
  });
  test("arquivo inválido é barrado antes do envio", () =>
    expect(validarImagem(foto("doc.txt", "text/plain"))).toBe("formatoImagem"));
  test("falha do armazenamento: rejeita (o componente mantém a capa anterior)", async () => {
    falhar = true;
    let capa = "https://cdn/antiga.jpg";
    try {
      capa = await enviarCapa(foto(), "noticias", "Talento Brasil");
    } catch {
      /* UploadCapa só chama aoMudar no sucesso */
    }
    expect(capa).toBe("https://cdn/antiga.jpg");
  });
});

describe("aviso de título ausente nos 3 idiomas", () => {
  test("pt-BR / en-US / es-ES", () => {
    expect(arquivos["pt-BR"].tituloCapaAusente).toContain("título");
    expect(arquivos["en-US"].tituloCapaAusente).toContain("title");
    expect(arquivos["es-ES"].tituloCapaAusente).toContain("título");
  });
});
