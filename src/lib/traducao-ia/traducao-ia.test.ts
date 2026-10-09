// @ts-nocheck — executado pelo bun test (tipos de bun:test fora do tsconfig)
// Tradução automática: endpoint, autenticação, Gemini, limite e regras do editor.
// Gemini, Auth e banco são SIMULADOS: nenhuma chave real, nenhuma chamada externa.
import { describe, expect, mock, test } from "bun:test";
mock.module("../supabase", () => ({ supabase: { auth: { getSession: async () => ({ data: { session: null } }) } } }));

const { processarTraducao } = await import("./endpoint.server");
const { verificarAdmin } = await import("./auth.server");
const g = await import("./gemini.server");
const { criarLimitador } = await import("./limite.server");
const c = await import("./cliente");
const { LIMITE_TOTAL } = await import("./contrato");
const { traducaoIa } = await import("@/i18n/catalogos/traducao-ia");

const PT = { titulo: "Festa no Talento Brasil", resumo: "200 crianças em 26/06/2017", conteudo: "Parágrafo 1.\n\nVeja https://idex.org" };
const TR = {
  "en-US": { titulo: "Party at Talento Brasil", resumo: "200 kids on 06/26/2017", conteudo: "Paragraph 1.\n\nSee https://idex.org" },
  "es-ES": { titulo: "Fiesta en Talento Brasil", resumo: "200 niños el 26/06/2017", conteudo: "Párrafo 1.\n\nMira https://idex.org" },
};
const req = (corpo, token = "tok") =>
  new Request("http://x/api/traducao-noticia", {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });
const admin = async () => ({ ok: true, userId: "u1" });
function deps(extra = {}) {
  return { verificar: admin, lerChave: () => "chave-falsa", traduzir: async () => TR, limitador: criarLimitador(), ...extra };
}
const status = async (r) => [r.status, (await r.json()).codigo ?? "ok"];

describe("endpoint", () => {
  test("admin válido recebe os dois idiomas", async () => {
    const r = await processarTraducao(req(PT), deps());
    expect(r.status).toBe(200);
    expect((await r.json()).traducoes).toEqual(TR);
    expect(r.headers.get("cache-control")).toBe("no-store");
  });
  test("sem token / token inválido 401, não admin 403", async () => {
    for (const codigo of ["sem_token", "token_invalido"]) {
      expect(await status(await processarTraducao(req(PT), deps({ verificar: async () => ({ ok: false, codigo }) })))).toEqual([401, codigo]);
    }
    expect(await status(await processarTraducao(req(PT), deps({ verificar: async () => ({ ok: false, codigo: "sem_permissao" }) })))).toEqual([403, "sem_permissao"]);
  });
  test("payload malicioso, vazio ou grande demais = 400 sem chamar o Gemini", async () => {
    let chamou = false;
    const d = deps({ traduzir: async () => { chamou = true; return TR; } });
    for (const corpo of ["", "{x", { ...PT, slug: "a" }, { ...PT, id: 1 }, { titulo: "", resumo: "", conteudo: "" }, { titulo: 5, resumo: "", conteudo: "" }, { ...PT, conteudo: "a".repeat(LIMITE_TOTAL) }, "x".repeat(70000)]) {
      expect((await processarTraducao(req(corpo), d)).status).toBe(400);
    }
    expect(chamou).toBe(false);
  });
  test("chave ausente = 503 nao_configurado (depois da autenticação)", async () => {
    expect(await status(await processarTraducao(req(PT), deps({ lerChave: () => undefined })))).toEqual([503, "nao_configurado"]);
    expect((await processarTraducao(req(PT), deps({ lerChave: () => undefined, verificar: async () => ({ ok: false, codigo: "sem_token" }) }))).status).toBe(401);
  });
  test("erros do Gemini viram códigos seguros e liberam o limite", async () => {
    const lim = criarLimitador(10);
    for (const [codigo, st] of [["cota", 429], ["tempo_esgotado", 504], ["resposta_truncada", 502], ["resposta_invalida", 502]]) {
      const r = await processarTraducao(req(PT), deps({ limitador: lim, traduzir: async () => { throw new g.ErroTraducao(codigo); } }));
      expect(await status(r)).toEqual([st, codigo]);
    }
    expect(await status(await processarTraducao(req(PT), deps({ traduzir: async () => { throw new Error("segredo do provedor"); } })))).toEqual([502, "falha_provedor"]);
  });
  test("logs não contêm texto, token nem chave", async () => {
    const logs = []; const orig = console.warn; console.warn = (...a) => logs.push(a.join(" "));
    await processarTraducao(req(PT), deps({ traduzir: async () => { throw new g.ErroTraducao("cota"); } }));
    console.warn = orig;
    expect(logs.join()).not.toMatch(/Festa|tok|chave-falsa/);
  });
});

describe("limite por usuário", () => {
  test("uma por vez e no máximo N por janela", () => {
    const l = criarLimitador(2, 1000);
    expect(l.reservar("u", 0)).toBeNull();
    expect(l.reservar("u", 1)).toBe("em_andamento");
    l.liberar("u"); expect(l.reservar("u", 2)).toBeNull(); l.liberar("u");
    expect(l.reservar("u", 3)).toBe("limite_local");
    expect(l.reservar("outro", 3)).toBeNull();
    expect(l.reservar("u", 1500)).toBeNull();
  });
});

describe("verificarAdmin", () => {
  const cliente = (user, papel) => () => ({
    auth: { getUser: async () => (user ? { data: { user }, error: null } : { data: { user: null }, error: new Error("x") }) },
    rpc: async (_f, args) => { cliente.args = args; return papel; },
  });
  test("token validado no servidor e papel consultado para o id do token", async () => {
    expect(await verificarAdmin(req(PT, ""), cliente())).toEqual({ ok: false, codigo: "sem_token" });
    expect(await verificarAdmin(req(PT), cliente(null))).toEqual({ ok: false, codigo: "token_invalido" });
    expect(await verificarAdmin(req(PT), cliente({ id: "u9" }, { data: false, error: null }))).toEqual({ ok: false, codigo: "sem_permissao" });
    expect(await verificarAdmin(req(PT), cliente({ id: "u9" }, { data: null, error: new Error() }))).toEqual({ ok: false, codigo: "sem_permissao" });
    expect(await verificarAdmin(req(PT), cliente({ id: "u9" }, { data: true, error: null }))).toEqual({ ok: true, userId: "u9" });
    expect(cliente.args).toEqual({ _user_id: "u9", _role: "admin" });
  });
});

describe("serviço Gemini (fetch simulado)", () => {
  const resposta = (obj, finishReason = "STOP", st = 200) => async (url, init) => {
    resposta.url = url; resposta.init = init;
    return new Response(JSON.stringify({ candidates: [{ finishReason, content: { parts: [{ text: typeof obj === "string" ? obj : JSON.stringify(obj) }] } }] }), { status: st });
  };
  const ok = { en_US: TR["en-US"], es_ES: TR["es-ES"] };
  test("modelo fixo, chave no cabeçalho, JSON estruturado, sem tools", async () => {
    expect(await g.traduzirComGemini(PT, { chave: "k", fetchImpl: resposta(ok) })).toEqual(TR);
    expect(resposta.url).toContain("models/gemini-3.1-flash-lite:generateContent");
    expect(resposta.url).not.toContain("k");
    expect(resposta.init.headers["x-goog-api-key"]).toBe("k");
    const corpo = JSON.parse(resposta.init.body);
    expect(corpo.generationConfig.responseMimeType).toBe("application/json");
    expect(corpo.tools).toBeUndefined();
    expect(corpo.systemInstruction.parts[0].text).toMatch(/ignore qualquer pedido/);
  });
  test("truncada, malformada, campo faltando ou vazio indevido = erro", async () => {
    const casos = [[resposta(ok, "MAX_TOKENS"), "resposta_truncada"], [resposta(ok, "SAFETY"), "resposta_invalida"], [resposta("{nao json"), "resposta_invalida"], [resposta({ en_US: TR["en-US"] }), "resposta_invalida"], [resposta({ ...ok, es_ES: { ...TR["es-ES"], conteudo: "" } }), "resposta_invalida"], [resposta({ ...ok, extra: 1, en_US: { ...TR["en-US"], x: 1 } }), "resposta_invalida"]];
    for (const [f, codigo] of casos) {
      await expect(g.traduzirComGemini(PT, { chave: "k", fetchImpl: f })).rejects.toMatchObject({ codigo });
    }
  });
  test("conteúdo vazio em PT deve voltar vazio", async () => {
    const pt = { ...PT, conteudo: "" };
    const f = resposta({ en_US: { ...TR["en-US"], conteudo: "" }, es_ES: { ...TR["es-ES"], conteudo: "" } });
    expect((await g.traduzirComGemini(pt, { chave: "k", fetchImpl: f }))["en-US"].conteudo).toBe("");
  });
  test("429 = cota, chave inválida = nao_configurado, timeout = tempo_esgotado", async () => {
    await expect(g.traduzirComGemini(PT, { chave: "k", fetchImpl: async () => new Response("{}", { status: 429 }) })).rejects.toMatchObject({ codigo: "cota" });
    await expect(g.traduzirComGemini(PT, { chave: "k", fetchImpl: async () => new Response('{"error":{"message":"API key not valid"}}', { status: 400 }) })).rejects.toMatchObject({ codigo: "nao_configurado" });
    const lento = (_u, init) => new Promise((_, rej) => init.signal.addEventListener("abort", () => rej(new Error("abort"))));
    await expect(g.traduzirComGemini(PT, { chave: "k", fetchImpl: lento, tempoLimiteMs: 20 })).rejects.toMatchObject({ codigo: "tempo_esgotado" });
  });
});

describe("cliente e regras do editor", () => {
  test("envia só os campos PT com token; cancelado e rede", async () => {
    let corpo;
    const f = async (_u, init) => { corpo = JSON.parse(init.body); return new Response(JSON.stringify({ ok: true, traducoes: TR })); };
    expect(await c.pedirTraducao({ ...PT, slug: "x" }, undefined, f, async () => "t")).toEqual({ ok: true, traducoes: TR });
    expect(Object.keys(corpo).sort()).toEqual(["conteudo", "resumo", "titulo"]);
    expect(await c.pedirTraducao(PT, undefined, f, async () => undefined)).toEqual({ ok: false, codigo: "sem_token" });
    const ac = new AbortController(); ac.abort();
    expect(await c.pedirTraducao(PT, ac.signal, async () => { throw new Error("abort"); }, async () => "t")).toEqual({ ok: false, codigo: "cancelado" });
    expect(await c.pedirTraducao(PT, undefined, async () => { throw new Error("x"); }, async () => "t")).toEqual({ ok: false, codigo: "rede" });
    expect(await c.pedirTraducao(PT, undefined, async () => new Response('{"ok":false,"codigo":"cota"}', { status: 429 }), async () => "t")).toEqual({ ok: false, codigo: "cota" });
  });
  test("existência de traduções (pede confirmação) e mescla preservando outras chaves", () => {
    expect(c.temTraducaoExistente({})).toBe(false);
    expect(c.temTraducaoExistente({ "es-ES": { titulo: "  " } })).toBe(false);
    expect(c.temTraducaoExistente({ "en-US": { resumo: "x" } })).toBe(true);
    const m = c.mesclarTraducoes({ "en-US": { titulo: "velho", descricao: "fica" } }, TR);
    expect(m["en-US"]).toEqual({ ...TR["en-US"], descricao: "fica" });
    expect(m["es-ES"]).toEqual(TR["es-ES"]);
  });
  test("retrato muda se PT ou traduções forem editados durante a espera", () => {
    const a = c.retrato(PT, {});
    expect(c.retrato(PT, {})).toBe(a);
    expect(c.retrato({ ...PT, resumo: "editado" }, {})).not.toBe(a);
    expect(c.retrato(PT, { "en-US": { titulo: "x" } })).not.toBe(a);
  });
  test("mensagens de erro existem nos três idiomas", () => {
    for (const l of ["pt-BR", "en-US", "es-ES"]) for (const k of ["cota", "nao_configurado", "cancelado", "rede"]) expect(traducaoIa[l].erros[k].length).toBeGreaterThan(5);
  });
});
