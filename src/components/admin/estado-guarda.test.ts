// @ts-nocheck
// Regressão: falha passageira do papel não pode derrubar o painel (e o editor aberto).
import { describe, expect, test } from "bun:test";
import { estadoGuarda } from "./estado-guarda";

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
