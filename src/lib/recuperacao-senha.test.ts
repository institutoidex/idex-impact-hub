// @ts-nocheck
// Testes do fluxo de recuperação de senha — tudo com mocks: nenhuma senha real é alterada.
import { describe, expect, test } from "bun:test";
import {
  classificarLink,
  envioUnico,
  resolverEstadoInicial,
  trocarSenha,
  urlRedefinicao,
  validarSenhas,
} from "./recuperacao-senha";

describe("urlRedefinicao (link do e-mail)", () => {
  test("usa sempre o domínio publicado e mantém o idioma", () => {
    expect(urlRedefinicao("pt-BR")).toBe("https://idex-impact-hub.lovable.app/redefinir-senha");
    expect(urlRedefinicao("en-US")).toBe("https://idex-impact-hub.lovable.app/redefinir-senha?lang=en-US");
    expect(urlRedefinicao("es-ES")).toBe("https://idex-impact-hub.lovable.app/redefinir-senha?lang=es-ES");
  });
});

describe("classificarLink", () => {
  test("link de recuperação válido (fluxo implicit)", () => {
    expect(classificarLink("#access_token=abc&type=recovery", "?lang=en-US")).toBe("recuperacao");
  });
  test("token expirado ou já usado", () => {
    expect(
      classificarLink("#error=access_denied&error_code=otp_expired&error_description=x", ""),
    ).toBe("expirado");
  });
  test("outro erro vira inválido", () => {
    expect(classificarLink("#error=server_error", "")).toBe("invalido");
  });
  test("token de login comum não é aceito como recuperação", () => {
    expect(classificarLink("#access_token=abc&type=signup", "")).toBe("nenhum");
  });
  test("sem nada no endereço", () => {
    expect(classificarLink("", "?lang=es-ES")).toBe("nenhum");
  });
});

describe("resolverEstadoInicial", () => {
  const comSessao = async () => true;
  const semSessao = async () => false;

  test("expirado não consulta sessão", async () => {
    let consultou = false;
    const e = await resolverEstadoInicial({
      link: "expirado",
      recuperacaoVista: () => false,
      temSessao: async () => ((consultou = true), true),
    });
    expect(e).toBe("expirado");
    expect(consultou).toBe(false);
  });

  test("sessão comum (ex.: admin logado) sem link de recuperação NÃO libera a troca", async () => {
    expect(
      await resolverEstadoInicial({ link: "nenhum", recuperacaoVista: () => false, temSessao: comSessao }),
    ).toBe("semSessao");
  });

  test("link de recuperação mas sessão ausente vira inválido", async () => {
    expect(
      await resolverEstadoInicial({ link: "recuperacao", recuperacaoVista: () => false, temSessao: semSessao }),
    ).toBe("invalido");
  });

  test("corrida: evento PASSWORD_RECOVERY já disparado antes da tela montar", async () => {
    // Hash já limpo pelo cliente ("nenhum"), mas o evento foi ouvido na criação do cliente
    expect(
      await resolverEstadoInicial({ link: "nenhum", recuperacaoVista: () => true, temSessao: comSessao }),
    ).toBe("pronto");
  });

  test("corrida: sessão só aparece depois (getSession espera a inicialização)", async () => {
    const atrasada = () => new Promise((r) => setTimeout(() => r(true), 30));
    expect(
      await resolverEstadoInicial({ link: "recuperacao", recuperacaoVista: () => false, temSessao: atrasada }),
    ).toBe("pronto");
  });

  test("validação travada termina em tempo esgotado (sem spinner infinito)", async () => {
    const nunca = () => new Promise(() => {});
    expect(
      await resolverEstadoInicial({
        link: "recuperacao",
        recuperacaoVista: () => false,
        temSessao: nunca,
        tempoLimiteMs: 20,
      }),
    ).toBe("tempoEsgotado");
  });

  test("falha de rede ao consultar sessão vira inválido", async () => {
    expect(
      await resolverEstadoInicial({
        link: "recuperacao",
        recuperacaoVista: () => false,
        temSessao: () => Promise.reject(new Error("Failed to fetch")),
      }),
    ).toBe("invalido");
  });
});

describe("validarSenhas", () => {
  test("senhas diferentes", () => {
    expect(validarSenhas("abcdef", "abcdeg")).toEqual({ confirmar: "senhasNaoConferem" });
  });
  test("curta demais (mínimo atual de 6)", () => {
    expect(validarSenhas("abc", "abc").senha).toBe("senhaMinima");
  });
  test("válidas", () => {
    expect(validarSenhas("abcdef", "abcdef")).toEqual({});
  });
});

describe("trocarSenha (updateUser mockado)", () => {
  test("sucesso", async () => {
    expect(await trocarSenha(async () => ({ error: null }), "nova123")).toEqual({ ok: true });
  });
  test("token expirado durante a troca", async () => {
    const r = await trocarSenha(
      async () => ({ error: { name: "AuthSessionMissingError", status: 400 } }),
      "nova123",
    );
    expect(r).toEqual({ ok: false, falha: "sessao" });
  });
  test("falha de rede (fetch rejeitado)", async () => {
    const r = await trocarSenha(() => Promise.reject(new TypeError("Failed to fetch")), "nova123");
    expect(r).toEqual({ ok: false, falha: "rede" });
  });
  test("senha fraca e senha igual à atual", async () => {
    expect(await trocarSenha(async () => ({ error: { code: "weak_password" } }), "x")).toEqual({
      ok: false,
      falha: "fraca",
    });
    expect(await trocarSenha(async () => ({ error: { code: "same_password" } }), "x")).toEqual({
      ok: false,
      falha: "igual",
    });
  });
});

describe("envioUnico", () => {
  test("submit duplicado chama updateUser uma vez só", async () => {
    let chamadas = 0;
    const enviar = envioUnico(async () => {
      chamadas++;
      await new Promise((r) => setTimeout(r, 20));
      return "ok";
    });
    const [a, b] = await Promise.all([enviar(), enviar()]);
    expect(chamadas).toBe(1);
    expect(a).toBe("ok");
    expect(b).toBeUndefined();
  });
});
