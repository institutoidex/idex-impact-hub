// @ts-nocheck
// Regressão: falha passageira do papel não pode derrubar o painel (e o editor aberto),
// mas a confirmação pertence estritamente ao usuário atual.
import { describe, expect, test } from "bun:test";
import { confirmacaoPara, estadoGuarda } from "./estado-guarda";

const base = { carregandoSessao: false, temSessao: true, papel: true, papelSucesso: true, papelErro: false, confirmadoNoServidor: true };

describe("estadoGuarda", () => {
  test("admin confirmado: liberado", () => expect(estadoGuarda(base)).toBe("liberado"));
  test("revalidação falhou depois de confirmado: continua liberado", () =>
    expect(estadoGuarda({ ...base, papelSucesso: false, papelErro: true })).toBe("liberado"));
  test("falha antes de qualquer confirmação (só cache otimista): bloqueia", () =>
    expect(estadoGuarda({ ...base, papelSucesso: false, papelErro: true, confirmadoNoServidor: false })).toBe("erro"));
  test("servidor respondeu que não é admin: sem permissão", () =>
    expect(estadoGuarda({ ...base, papel: false })).toBe("semPermissao"));
  test("sessão encerrada de verdade: sai do painel", () =>
    expect(estadoGuarda({ ...base, temSessao: false })).toBe("semSessao"));
  test("ainda carregando sessão: verificando", () =>
    expect(estadoGuarda({ ...base, carregandoSessao: true, temSessao: false })).toBe("verificando"));
});

describe("confirmacaoPara (vínculo com usuario.id)", () => {
  const s = (userId, respostaServidor, temSessao = true) => ({ userId, temSessao, respostaServidor });

  test("A confirmado → B só com cache otimista → falha: B NÃO é liberado", () => {
    let c = confirmacaoPara(null, s("A", true));
    expect(c).toBe("A");
    c = confirmacaoPara(c, s("B", undefined)); // troca de identidade zera na hora
    expect(c).toBeNull();
    const estado = estadoGuarda({ ...base, papelSucesso: false, papelErro: true, confirmadoNoServidor: c === "B" });
    expect(estado).toBe("erro");
  });
  test("mesmo usuário com falha depois de confirmar: mantém", () =>
    expect(confirmacaoPara("A", s("A", undefined))).toBe("A"));
  test("saída (sem sessão) zera", () => expect(confirmacaoPara("A", s("A", undefined, false))).toBeNull());
  test("usuário perdido (id nulo) zera", () => expect(confirmacaoPara("A", s(null, undefined))).toBeNull());
  test("resposta real false revoga imediatamente", () => {
    const c = confirmacaoPara("A", s("A", false));
    expect(c).toBeNull();
    expect(estadoGuarda({ ...base, papel: false, confirmadoNoServidor: false })).toBe("semPermissao");
  });
  test("cache otimista sozinho nunca confirma", () => expect(confirmacaoPara(null, s("A", undefined))).toBeNull());
});
