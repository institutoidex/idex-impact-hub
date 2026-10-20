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

describe("proteções extras (revisão 305e919)", () => {
  test("falha inesperada do verificarAdmin = 503 JSON seguro, sem token no log", async () => {
    const logs = []; const orig = console.warn; console.warn = (...a) => logs.push(a.join(" "));
    let chamou = false;
    const r = await processarTraducao(req(PT, "tok-secreto"), deps({
      verificar: async () => { throw new Error("falhou com Bearer tok-secreto"); },
      traduzir: async () => { chamou = true; return TR; },
    }));
    console.warn = orig;
    expect(r.headers.get("content-type")).toContain("application/json");
    expect(await status(r)).toEqual([503, "falha_verificacao"]);
    expect(chamou).toBe(false);
    expect(logs.join()).not.toMatch(/tok-secreto|Bearer/);
  });
  test("corpo lido em stream para em 64KB reais sem ler o resto", async () => {
    const e = await import("./endpoint.server");
    let entregues = 0;
    const pedaco = new Uint8Array(16 * 1024).fill(65);
    const corpo = new ReadableStream({ pull(c) { entregues++; if (entregues > 100) c.close(); else c.enqueue(pedaco); } });
    const r = new Request("http://x", { method: "POST", body: corpo, duplex: "half" });
    expect(await e.lerCorpoLimitado(r, 64 * 1024)).toBeNull();
    expect(entregues).toBeLessThan(10);
  });
  test("limite conta bytes (acentos), não caracteres; content-length grande recusa", async () => {
    const e = await import("./endpoint.server");
    const acentos = "ç".repeat(40 * 1024); // 40K caracteres = 80KB
    expect(await e.lerCorpoLimitado(new Request("http://x", { method: "POST", body: acentos }), 64 * 1024)).toBeNull();
    expect(await e.lerCorpoLimitado(new Request("http://x", { method: "POST", body: "ok" }), 64 * 1024)).toBe("ok");
    const grande = new Request("http://x", { method: "POST", body: "ok", headers: { "content-length": "999999" } });
    expect(await e.lerCorpoLimitado(grande, 64 * 1024)).toBeNull();
    expect(await e.lerCorpoLimitado(new Request("http://x", { method: "POST", body: new Uint8Array([0xff, 0xfe]) }), 64)).toBeNull();
  });
  test("bloqueioTraducao: confirmação não contorna galeria/salvamento/limite", () => {
    const base = { traduzindo: false, desabilitado: false, entrada: PT, limite: LIMITE_TOTAL };
    expect(c.bloqueioTraducao(base)).toBeNull();
    expect(c.bloqueioTraducao({ ...base, desabilitado: true })).toBe("bloqueado");
    expect(c.bloqueioTraducao({ ...base, traduzindo: true })).toBe("bloqueado");
    expect(c.bloqueioTraducao({ ...base, entrada: { ...PT, titulo: "  " } })).toBe("semTitulo");
    expect(c.bloqueioTraducao({ ...base, entrada: { ...PT, conteudo: "a".repeat(LIMITE_TOTAL) } })).toBe("acima");
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
  test("429 = cota, chave recusada = chave_recusada, timeout = tempo_esgotado", async () => {
    await expect(g.traduzirComGemini(PT, { chave: "k", fetchImpl: async () => new Response("{}", { status: 429 }) })).rejects.toMatchObject({ codigo: "cota" });
    await expect(g.traduzirComGemini(PT, { chave: "k", fetchImpl: async () => new Response('{"error":{"message":"API key not valid"}}', { status: 400 }) })).rejects.toMatchObject({ codigo: "chave_recusada" });
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
    for (const l of ["pt-BR", "en-US", "es-ES"]) for (const k of ["cota", "nao_configurado", "chave_recusada", "cancelado", "rede"]) expect(traducaoIa[l].erros[k].length).toBeGreaterThan(5);
  });
});

describe("todas as entidades trilíngues (registro/allowlist)", () => {
  const ct = () => import("./contrato");
  test("registro: campos permitidos por entidade", async () => {
    const { ENTIDADES } = await ct();
    expect(ENTIDADES.noticia.campos).toEqual(["titulo", "resumo", "conteudo"]);
    expect(ENTIDADES.projeto.campos).toEqual(["titulo", "resumo", "descricao"]);
    expect(ENTIDADES.documento.campos).toEqual(["titulo"]);
    expect(ENTIDADES.pasta.campos).toEqual(["nome"]);
  });
  test("analisarEntrada: aceita formato antigo da notícia e {entidade,campos}; recusa extras", async () => {
    const { analisarEntrada } = await ct();
    expect(analisarEntrada(PT)).toEqual({ entidade: "noticia", campos: PT });
    expect(analisarEntrada({ entidade: "pasta", campos: { nome: "Relatórios 2023" } })).toEqual({ entidade: "pasta", campos: { nome: "Relatórios 2023" } });
    expect(analisarEntrada({ entidade: "documento", campos: { titulo: "Balanço 2023" } })?.entidade).toBe("documento");
    expect(analisarEntrada({ entidade: "projeto", campos: { titulo: "T", resumo: "", descricao: "D" } })?.entidade).toBe("projeto");
    for (const ruim of [
      { entidade: "pasta", campos: { nome: "X", slug: "x" } },
      { entidade: "pasta", campos: { nome: "  " } },
      { entidade: "documento", campos: { titulo: "X", arquivo_url: "https://a/b.pdf" } },
      { entidade: "documento", campos: { titulo: "X", ano: "2023" } },
      { entidade: "projeto", campos: { titulo: "X", resumo: "", conteudo: "" } },
      { entidade: "usuarios", campos: { titulo: "X" } },
      { entidade: "__proto__", campos: { titulo: "X" } },
      { entidade: "pasta", campos: { nome: "X" }, extra: 1 },
      { entidade: "projeto", campos: { titulo: "X", resumo: "", descricao: "a".repeat(LIMITE_TOTAL) } },
    ]) expect(analisarEntrada(ruim)).toBeNull();
  });
  test("endpoint: pasta/documento/projeto chegam ao tradutor só com campos permitidos", async () => {
    const vistos = [];
    const d = deps({ traduzir: async (p) => { vistos.push(p); return { "en-US": { nome: "Reports" }, "es-ES": { nome: "Informes" } }; } });
    expect((await processarTraducao(req({ entidade: "pasta", campos: { nome: "Relatórios" } }), d)).status).toBe(200);
    expect(vistos[0]).toEqual({ entidade: "pasta", campos: { nome: "Relatórios" } });
    expect((await processarTraducao(req({ entidade: "documento", campos: { titulo: "X", arquivo_url: "u" } }), d)).status).toBe(400);
    expect(vistos.length).toBe(1);
  });
  test("limite por usuário é o MESMO entre entidades (não contorna a cota)", async () => {
    const lim = criarLimitador(2, 60_000);
    const d = deps({ limitador: lim, traduzir: async () => ({ "en-US": { nome: "a" }, "es-ES": { nome: "b" } }) });
    expect((await processarTraducao(req({ entidade: "pasta", campos: { nome: "A" } }), d)).status).toBe(200);
    expect((await processarTraducao(req(PT), deps({ limitador: lim }))).status).toBe(200);
    expect(await status(await processarTraducao(req({ entidade: "pasta", campos: { nome: "B" } }), d))).toEqual([429, "limite_local"]);
  });
  test("Gemini: corpo e esquema só com os campos da entidade; mapeia pasta e projeto", async () => {
    const pasta = { entidade: "pasta", campos: { nome: "Relatórios anuais" } };
    const corpo = g.montarCorpo(pasta);
    expect(JSON.parse(corpo.contents[0].parts[0].text)).toEqual({ nome: "Relatórios anuais" });
    expect(Object.keys(corpo.generationConfig.responseJsonSchema.properties.en_US.properties)).toEqual(["nome"]);
    const f = async () => new Response(JSON.stringify({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify({ en_US: { nome: "Annual reports" }, es_ES: { nome: "Informes anuales" } }) }] } }] }));
    expect(await g.traduzirComGemini(pasta, { chave: "k", fetchImpl: f })).toEqual({ "en-US": { nome: "Annual reports" }, "es-ES": { nome: "Informes anuales" } });
    // projeto: descricao mapeada; campo "conteudo" na resposta é recusado
    const proj = { entidade: "projeto", campos: { titulo: "T", resumo: "", descricao: "D" } };
    const ok = { en_US: { titulo: "T", resumo: "", descricao: "D-en" }, es_ES: { titulo: "T", resumo: "", descricao: "D-es" } };
    const resp = (o) => async () => new Response(JSON.stringify({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(o) }] } }] }));
    expect((await g.traduzirComGemini(proj, { chave: "k", fetchImpl: resp(ok) }))["es-ES"].descricao).toBe("D-es");
    await expect(g.traduzirComGemini(proj, { chave: "k", fetchImpl: resp({ ...ok, en_US: { titulo: "T", resumo: "", conteudo: "D" } }) })).rejects.toMatchObject({ codigo: "resposta_invalida" });
  });
  test("cliente: documento envia só o título (URL/ano/categoria nunca); notícia mantém formato antigo", async () => {
    let corpo;
    const f = async (_u, init) => { corpo = JSON.parse(init.body); return new Response(JSON.stringify({ ok: true, traducoes: { "en-US": { titulo: "Balance" }, "es-ES": { titulo: "Balance" } } })); };
    await c.pedirTraducao({ entidade: "documento", campos: { titulo: "Balanço", arquivo_url: "https://x/a.pdf", ano: 2023, categoria: "financeiro" } }, undefined, f, async () => "t");
    expect(corpo).toEqual({ entidade: "documento", campos: { titulo: "Balanço" } });
    await c.pedirTraducao({ entidade: "noticia", campos: PT }, undefined, async (_u, init) => { corpo = JSON.parse(init.body); return new Response("{}"); }, async () => "t");
    expect(corpo).toEqual(PT);
    // resposta de outra entidade (campo errado) é recusada no navegador
    const r = await c.pedirTraducao({ entidade: "pasta", campos: { nome: "A" } }, undefined, async () => new Response(JSON.stringify({ ok: true, traducoes: TR })), async () => "t");
    expect(r).toEqual({ ok: false, codigo: "resposta_invalida" });
  });
  test("pasta: confirmação só pelo campo nome; mescla preserva outras chaves", () => {
    expect(c.temTraducaoExistente({ "en-US": { titulo: "outro campo" } }, "pasta")).toBe(false);
    expect(c.temTraducaoExistente({ "es-ES": { nome: "Informes" } }, "pasta")).toBe(true);
    const m = c.mesclarTraducoes({ "en-US": { nome: "velho", extra: "fica" } }, { "en-US": { nome: "Reports" }, "es-ES": { nome: "Informes" } });
    expect(m).toEqual({ "en-US": { nome: "Reports", extra: "fica" }, "es-ES": { nome: "Informes" } });
  });
  test("bloqueio: pasta exige nome; documento em envio de arquivo bloqueia", () => {
    expect(c.bloqueioTraducao({ traduzindo: false, desabilitado: false, entrada: { nome: " " }, limite: LIMITE_TOTAL, obrigatorio: "nome" })).toBe("semTitulo");
    expect(c.bloqueioTraducao({ traduzindo: false, desabilitado: false, entrada: { nome: "A" }, limite: LIMITE_TOTAL, obrigatorio: "nome" })).toBeNull();
    expect(c.bloqueioTraducao({ traduzindo: false, desabilitado: true, entrada: { titulo: "Doc" }, limite: LIMITE_TOTAL })).toBe("bloqueado");
  });
  test("textos de envio/confirmação existem para as 4 entidades nos 3 idiomas; documento avisa do PDF", () => {
    for (const l of ["pt-BR", "en-US", "es-ES"]) for (const e of ["noticia", "projeto", "documento", "pasta"]) {
      expect(traducaoIa[l].envio[e].length).toBeGreaterThan(20);
      expect(traducaoIa[l].confirmarTexto[e].length).toBeGreaterThan(20);
    }
    expect(traducaoIa["pt-BR"].envio.documento).toMatch(/PDF/);
  });
});


// Diagnóstico seguro (permanente): só status/códigos allowlisted, nunca mensagem ou texto do corpo
import { diagnosticoSeguro, traduzirComGemini as traduzirDiag, ErroTraducao as ErroDiag } from "./gemini.server";
describe("diagnosticoSeguro", () => {
  test("resume região bloqueada sem copiar a mensagem", () => {
    const corpo = JSON.stringify({ error: { code: 400, status: "FAILED_PRECONDITION", message: "User location is not supported for the API use. segredo@x.com" } });
    const d = diagnosticoSeguro(400, corpo);
    expect(d).toBe("http=400 status=FAILED_PRECONDITION code=400 reason=- regiao_bloqueada=true");
    expect(d).not.toContain("segredo");
  });
  test("descarta campos fora do formato e corpo não-JSON", () => {
    expect(diagnosticoSeguro(500, "<html>chave AIza123</html>")).toBe("http=500 status=- code=- reason=- regiao_bloqueada=false");
    const d = diagnosticoSeguro(403, JSON.stringify({ error: { status: "texto livre com PII", details: [{ reason: "API_KEY_INVALID" }] } }));
    expect(d).toBe("http=403 status=- code=- reason=API_KEY_INVALID regiao_bloqueada=false");
  });
  test("details que não é array, null ou error não-objeto não quebram", () => {
    expect(diagnosticoSeguro(500, JSON.stringify({ error: { details: { reason: "X" } } }))).toBe("http=500 status=- code=- reason=- regiao_bloqueada=false");
    expect(diagnosticoSeguro(500, "null")).toBe("http=500 status=- code=- reason=- regiao_bloqueada=false");
    expect(diagnosticoSeguro(500, JSON.stringify({ error: "texto" }))).toBe("http=500 status=- code=- reason=- regiao_bloqueada=false");
  });
  test("classificação: 500 → falha_provedor; 403 de chave → chave_recusada; 503 → provedor_ocupado; rede → falha_provedor", async () => {
    const entrada = { entidade: "pasta", campos: { nome: "Pasta fictícia" } } as never;
    const f500 = (async () => new Response(JSON.stringify({ error: { code: 500, status: "INTERNAL" } }), { status: 500 })) as unknown as typeof fetch;
    const e1 = await traduzirDiag(entrada, { chave: "k", fetchImpl: f500 }).catch((e) => e);
    expect(e1).toBeInstanceOf(ErroDiag);
    expect(e1.codigo).toBe("falha_provedor");
    expect(e1.diag).toBe("http=500 status=INTERNAL code=500 reason=- regiao_bloqueada=false");
    const f403 = (async () => new Response(JSON.stringify({ error: { code: 403, status: "PERMISSION_DENIED" } }), { status: 403 })) as unknown as typeof fetch;
    const e2 = await traduzirDiag(entrada, { chave: "k", fetchImpl: f403 }).catch((e) => e);
    expect(e2.codigo).toBe("chave_recusada");
    const f503 = (async () => new Response(JSON.stringify({ error: { code: 503, status: "UNAVAILABLE", message: "overloaded" } }), { status: 503 })) as unknown as typeof fetch;
    const e4 = await traduzirDiag(entrada, { chave: "k", fetchImpl: f503 }).catch((e) => e);
    expect(e4.codigo).toBe("provedor_ocupado");
    expect(e4.diag).toBe("http=503 status=UNAVAILABLE code=503 reason=- regiao_bloqueada=false");
    const fRede = (async () => { throw new TypeError("detalhe sensível"); }) as unknown as typeof fetch;
    const e3 = await traduzirDiag(entrada, { chave: "k", fetchImpl: fRede }).catch((e) => e);
    expect(e3.codigo).toBe("falha_provedor");
    expect(e3.diag).toBe("rede=TypeError");
  });
});
