// @ts-nocheck — executado pelo bun test (tipos de bun:test fora do tsconfig)
// Formulário de contato: validação, idempotência, ordem banco→e-mail, Resend simulado e HTML.
// Nenhum e-mail real é enviado e nenhum banco real é tocado.
import { describe, expect, mock, test } from "bun:test";
import { processarContato } from "./endpoint.server";
import { criarLimiteContato } from "./limite.server";
import { configTesteIsolado, lerConfigEmail } from "./config.server";
import { corpoResend, enviarViaResend, ErroEmail } from "./resend.server";
import { escaparHtml, montarEmailContato, assuntoEmail } from "./email-html";
import { enviarContato } from "./cliente";
import { contato } from "@/i18n/catalogos/contato";

const ID = "4b7f1c2e-8a3d-4e5f-9a1b-2c3d4e5f6a7b";
const CFG = { chave: "re_falsa", remetente: "Instituto IDEX <contato@exemplo-verificado.org>", para: "equipe@exemplo.org", copia: "copia@exemplo.org" };
const base = { id: ID, nome: "Maria Teste", email: "maria@exemplo.org", assunto: "Parceria", mensagem: "Olá!\n\nQuero ajudar." };

function req(corpo, headers = {}) {
  return new Request("http://x/api/public/contato", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });
}

function deps(over = {}) {
  const linhas = new Map();
  const status = [];
  const enviados = [];
  const d = {
    origem: async () => "h",
    limite: { permitir: () => true },
    banco: {
      inserir: mock(async (m) => {
        if (linhas.has(m.id)) return { tipo: "duplicada" };
        linhas.set(m.id, { ...m, criado_em: "2026-10-20T13:00:00Z", notificacao_status: null });
        return { tipo: "criada", criadoEm: new Date("2026-10-20T13:00:00Z") };
      }),
      buscar: mock(async (id) => linhas.get(id) ?? null),
      marcarNotificacao: mock(async (id, s) => {
        status.push(s);
        if (linhas.has(id)) linhas.get(id).notificacao_status = s;
      }),
    },
    lerConfig: () => CFG,
    enviar: mock(async (_c, e) => void enviados.push(e)),
    agora: () => new Date("2026-10-20T13:05:00Z"),
    ...over,
  };
  return { d, linhas, status, enviados };
}

describe("validação e anti-abuso", () => {
  test("campo extra (destinatário) é recusado pelo esquema estrito", async () => {
    const { d } = deps();
    const r = await processarContato(req({ ...base, to: "atacante@x.com" }), d);
    expect(r.status).toBe(400);
    expect(d.banco.inserir).not.toHaveBeenCalled();
    expect(d.enviar).not.toHaveBeenCalled();
  });
  test("quebra de linha no assunto/e-mail (injeção de cabeçalho) é recusada", async () => {
    const { d } = deps();
    expect((await processarContato(req({ ...base, assunto: "Oi\r\nBcc: x@y.com" }), d)).status).toBe(400);
    expect((await processarContato(req({ ...base, email: "a@b.com\nBcc: x@y.com" }), d)).status).toBe(400);
  });
  test("JSON inválido, corpo vazio e corpo grande demais", async () => {
    const { d } = deps();
    expect((await processarContato(req("{"), d)).status).toBe(400);
    expect((await processarContato(req(""), d)).status).toBe(400);
    expect((await processarContato(req({ ...base, mensagem: "a".repeat(20000) }), d)).status).toBe(400);
  });
  test("armadilha preenchida: finge sucesso sem gravar nem enviar", async () => {
    const { d } = deps();
    const r = await processarContato(req({ ...base, site: "http://spam" }), d);
    expect(r.status).toBe(200);
    expect(d.banco.inserir).not.toHaveBeenCalled();
    expect(d.enviar).not.toHaveBeenCalled();
  });
  test("limite por origem responde 429 antes de qualquer gravação", async () => {
    const lim = criarLimiteContato(2, 1000);
    expect(lim.permitir("a", 0)).toBe(true);
    expect(lim.permitir("a", 1)).toBe(true);
    expect(lim.permitir("a", 2)).toBe(false);
    expect(lim.permitir("b", 2)).toBe(true);
    expect(lim.permitir("a", 2000)).toBe(true);
    const { d } = deps({ limite: { permitir: () => false } });
    expect((await processarContato(req(base), d)).status).toBe(429);
    expect(d.banco.inserir).not.toHaveBeenCalled();
  });
});

describe("ordem banco → e-mail", () => {
  test("sucesso: grava, envia uma vez para destinos fixos com Reply-To do visitante", async () => {
    const { d, status, enviados } = deps();
    const r = await processarContato(req(base), d);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, protocolo: ID });
    expect(enviados.length).toBe(1);
    expect(enviados[0].responderPara).toBe("maria@exemplo.org");
    expect(status).toEqual(["enviada"]);
  });
  test("falha no banco: nenhum e-mail é enviado e o visitante vê erro", async () => {
    const { d } = deps();
    d.banco.inserir = mock(async () => ({ tipo: "erro" }));
    const r = await processarContato(req(base), d);
    expect(r.status).toBe(503);
    expect(d.enviar).not.toHaveBeenCalled();
    d.banco.inserir = mock(async () => { throw new Error("rede"); });
    expect((await processarContato(req(base), d)).status).toBe(503);
    expect(d.enviar).not.toHaveBeenCalled();
  });
  test("falha no Resend: mensagem fica guardada e visitante recebe sucesso", async () => {
    const { d, linhas, status } = deps({ enviar: mock(async () => { throw new ErroEmail("recusado"); }) });
    const r = await processarContato(req(base), d);
    expect(r.status).toBe(200);
    expect(linhas.has(ID)).toBe(true);
    expect(status).toEqual(["falhou"]);
  });
  test("sem configuração de e-mail: grava e marca nao_configurado, sem enviar", async () => {
    const { d, linhas, status } = deps({ lerConfig: () => null });
    expect((await processarContato(req(base), d)).status).toBe(200);
    expect(linhas.has(ID)).toBe(true);
    expect(d.enviar).not.toHaveBeenCalled();
    expect(status).toEqual(["nao_configurado"]);
  });
  test("log nunca contém dados do visitante", async () => {
    const avisos = [];
    const orig = console.warn;
    console.warn = (...a) => avisos.push(a.join(" "));
    try {
      const { d } = deps({ enviar: async () => { throw new ErroEmail("timeout"); } });
      await processarContato(req(base), d);
    } finally {
      console.warn = orig;
    }
    expect(avisos.join(" ")).not.toContain("maria");
    expect(avisos.join(" ")).toContain("email_timeout");
  });
});

describe("idempotência (clique duplo / nova tentativa)", () => {
  test("mesmo id e mesmo conteúdo: confirma sem duplicar e sem reenviar o já enviado", async () => {
    const { d, linhas, enviados } = deps();
    await processarContato(req(base), d);
    const r2 = await processarContato(req(base), d);
    expect(r2.status).toBe(200);
    expect(linhas.size).toBe(1);
    expect(enviados.length).toBe(1);
  });
  test("mesmo id com aviso que falhou: nova tentativa reenvia (Resend deduplica pela chave)", async () => {
    let n = 0;
    const { d, enviados } = deps({
      enviar: mock(async (_c, e) => { if (n++ === 0) throw new ErroEmail("timeout"); enviados.push(e); }),
    });
    await processarContato(req(base), d);
    await processarContato(req(base), d);
    expect(enviados.length).toBe(1);
  });
  test("registro com mais de 23h sem aviso enviado: não reenvia (deduplicação do Resend expirou)", async () => {
    const { d, enviados, status } = deps({ lerConfig: () => null });
    await processarContato(req(base), d); // grava como nao_configurado
    d.lerConfig = () => CFG;
    d.agora = () => new Date("2026-10-21T12:01:00Z"); // 23h01 depois
    const r = await processarContato(req(base), d);
    expect(r.status).toBe(200);
    expect(enviados.length).toBe(0);
    expect(status).toEqual(["nao_configurado"]);
  });
  test("registro com 22h59 sem aviso: ainda reenvia uma vez", async () => {
    const { d, enviados } = deps({ lerConfig: () => null });
    await processarContato(req(base), d);
    d.lerConfig = () => CFG;
    d.agora = () => new Date("2026-10-21T11:59:00Z");
    await processarContato(req(base), d);
    expect(enviados.length).toBe(1);
  });
  test("mesmo id com conteúdo diferente: 409 sem sobrescrever nem devolver dados", async () => {
    const { d, linhas } = deps();
    await processarContato(req(base), d);
    const r = await processarContato(req({ ...base, mensagem: "Outro texto aqui" }), d);
    expect(r.status).toBe(409);
    expect(await r.json()).toEqual({ ok: false, codigo: "conflito" });
    expect(linhas.get(ID).mensagem).toBe(base.mensagem);
  });
});

describe("falhas inesperadas depois de gravar", () => {
  test("lerConfig lança: mensagem guardada, visitante recebe sucesso e JSON seguro", async () => {
    const { d, linhas, enviados } = deps({ lerConfig: () => { throw new Error("segredo"); } });
    const r = await processarContato(req(base), d);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, protocolo: ID });
    expect(linhas.size).toBe(1);
    expect(enviados.length).toBe(0);
  });
  test("montagem/envio e status lançam: ainda sucesso após gravar", async () => {
    const { d } = deps({ enviar: () => { throw new Error("x"); } });
    d.banco.marcarNotificacao = () => { throw new Error("y"); };
    const r = await processarContato(req(base), d);
    expect(r.status).toBe(200);
  });
  test("cálculo da origem falha: formulário segue funcionando", async () => {
    const { d, linhas } = deps({ origem: async () => { throw new Error("hash"); } });
    const r = await processarContato(req(base), d);
    expect(r.status).toBe(200);
    expect(linhas.size).toBe(1);
  });
});

describe("configuração e Resend", () => {
  test("config: só remetente institutoidex.org, destinos fixos de produção", () => {
    expect(lerConfigEmail({})).toBeNull();
    // só a chave é obrigatória: remetente padrão formularios@institutoidex.org
    expect(lerConfigEmail({ RESEND_API_KEY: "k" })).toEqual({
      chave: "k", remetente: "Instituto IDEX <formularios@institutoidex.org>", para: "idex.secretaria@gmail.com", copia: "idex2007@hotmail.com",
    });
    expect(lerConfigEmail({ RESEND_FROM_EMAIL: "Instituto IDEX <formularios@institutoidex.org>" })).toBeNull();
    for (const r of ["IDEX <c@zas.com.br>", "onboarding@resend.dev", "IDEX <c@institutoidex.org.evil.com>", "IDEX <c@institutoidex.org>\r\nBcc: x@y.z"])
      expect(lerConfigEmail({ RESEND_API_KEY: "k", RESEND_FROM_EMAIL: r })).toBeNull();
    // variáveis antigas/extras não mudam destinos
    expect(lerConfigEmail({ RESEND_API_KEY: "k", RESEND_FROM_EMAIL: "Instituto IDEX <contato@institutoidex.org>", CONTATO_EMAIL_PARA: "x@y.z" })).toEqual({
      chave: "k", remetente: "Instituto IDEX <contato@institutoidex.org>", para: "idex.secretaria@gmail.com", copia: "idex2007@hotmail.com",
    });
  });
  test("teste isolado: um destinatário, sem cópia, exige config válida", () => {
    const env = { RESEND_API_KEY: "k", RESEND_FROM_EMAIL: "contato@institutoidex.org" };
    expect(configTesteIsolado(env, "tecnologia@zas.com.br")).toEqual({ chave: "k", remetente: "contato@institutoidex.org", para: "tecnologia@zas.com.br", copia: null });
    expect(configTesteIsolado({}, "tecnologia@zas.com.br")).toBeNull();
    expect(configTesteIsolado(env, "a@b.c,d@e.f")).toBeNull();
  });
  test("pedido ao Resend: destinos fixos, Reply-To, Idempotency-Key e sem CRLF", async () => {
    const f = mock(async () => new Response("{}", { status: 200 }));
    const m = montarEmailContato({ ...base, recebidoEm: new Date() });
    await enviarViaResend(CFG, { id: ID, responderPara: "maria@exemplo.org\r\nBcc: x@y.z", ...m }, { fetch: f });
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers["Idempotency-Key"]).toBe(`contato-${ID}`);
    expect(init.headers.Authorization).toBe("Bearer re_falsa");
    const corpo = JSON.parse(init.body);
    expect(corpo.to).toEqual(["equipe@exemplo.org"]);
    expect(corpo.cc).toEqual(["copia@exemplo.org"]);
    expect(corpo.reply_to).not.toMatch(/[\r\n]/);
    expect(corpo.text).toContain("Quero ajudar.");
  });
  test("erro do provedor e timeout viram códigos seguros", async () => {
    const m = { id: ID, responderPara: "a@b.org", assunto: "x", html: "", texto: "" };
    await expect(enviarViaResend(CFG, m, { fetch: async () => new Response("detalhe interno", { status: 403 }) })).rejects.toMatchObject({ codigo: "recusado" });
    const lento = (_u, init) => new Promise((_, rej) => init.signal.addEventListener("abort", () => rej(Object.assign(new Error(), { name: "TimeoutError" }))));
    await expect(enviarViaResend(CFG, m, { fetch: lento, tempoMs: 5 })).rejects.toMatchObject({ codigo: "timeout" });
  });
  test("cópia ausente não manda cc", () => {
    expect(corpoResend({ ...CFG, copia: null }, { id: ID, responderPara: "a@b.org", assunto: "s", html: "", texto: "" }).cc).toBeUndefined();
  });
});

describe("HTML do e-mail", () => {
  test("escapa XSS em todos os campos e no mailto", () => {
    const { html, texto } = montarEmailContato({
      id: ID,
      nome: '<script>alert(1)</script>',
      email: 'a"onmouseover="x@b.org',
      assunto: '<img src=x onerror=alert(1)>',
      mensagem: "<b>oi</b>\n\nlinha 2",
      recebidoEm: new Date("2026-10-20T15:30:00Z"),
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<b>oi</b>");
    expect(html).not.toContain('"onmouseover="');
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("20/10/2026, 12:30");
    expect(html).toContain('href="https://institutoidex.org/admin"');
    expect(html).toContain('alt="Instituto IDEX"');
    expect(texto).toContain("<b>oi</b>"); // texto puro mostra literal, sem HTML
  });
  test("acessibilidade: idioma/direção e cores com contraste AA", () => {
    const { html } = montarEmailContato({ ...base, recebidoEm: new Date() });
    expect(html).toContain('<html lang="pt-BR" dir="ltr">');
    expect(html).toContain('<body lang="pt-BR" dir="ltr"');
    expect(html).not.toContain("#A0A09F");
    expect(html).toContain("#626964");
    expect(html).toContain('bgcolor="#007A45"');
  });
  test("parágrafos preservados e assunto sem quebra", () => {
    const { html } = montarEmailContato({ ...base, recebidoEm: new Date() });
    expect(html.match(/<p style/g).length).toBeGreaterThanOrEqual(3);
    expect(assuntoEmail("a\r\nBcc: x")).not.toMatch(/[\r\n]/);
    expect(escaparHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});

describe("cliente e mensagens", () => {
  test("falha de rede no navegador vira falha_registro (formulário mantém os dados)", async () => {
    const r = await enviarContato(base, async () => { throw new Error("offline"); });
    expect(r).toEqual({ ok: false, codigo: "falha_registro" });
  });
  test("aviso de limite existe em PT/EN/ES", () => {
    for (const l of ["pt-BR", "en-US", "es-ES"]) {
      expect(contato[l].toasts.limiteTitulo.length).toBeGreaterThan(5);
      expect(contato[l].toasts.sucessoTitulo.length).toBeGreaterThan(5);
    }
  });
});
