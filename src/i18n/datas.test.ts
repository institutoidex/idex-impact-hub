// Testes de datas: dia editorial determinístico e instantes com fuso explícito.
import { describe, expect, test } from "bun:test";
import { anoDe, formatarData, formatarDataHora } from "./formatar";
import { erroColunaTraducoesAusente } from "@/lib/erro-traducoes";

/** Roda a função com o fuso do processo trocado (simula servidor/visitante). */
function comFuso<T>(tz: string, fn: () => T): T {
  const antigo = process.env['TZ'];
  process.env['TZ'] = tz;
  try {
    return fn();
  } finally {
    process.env['TZ'] = antigo;
  }
}

describe("formatarData (dia editorial)", () => {
  for (const tz of ["UTC", "America/Sao_Paulo", "Asia/Tokyo"]) {
    test(`ISO meia-noite UTC preserva o dia em ${tz}`, () => {
      comFuso(tz, () => {
        expect(formatarData("2026-04-18T00:00:00+00:00", "pt-BR")).toBe("18 de abril de 2026");
        expect(formatarData("2026-04-18T00:00:00+00:00", "en-US")).toBe("April 18, 2026");
        expect(formatarData("2026-04-18T00:00:00+00:00", "es-ES")).toBe("18 de abril de 2026");
        expect(formatarData("2026-04-18", "pt-BR")).toBe("18 de abril de 2026");
        expect(formatarData("2026-01-01T00:00:00Z", "pt-BR")).toBe("1 de janeiro de 2026");
        expect(anoDe("2026-01-01T00:00:00+00:00")).toBe(2026);
      });
    });
  }
  test("datas impossíveis viram traço", () => {
    expect(formatarData("2026-02-31", "pt-BR")).toBe("—");
    expect(anoDe("lixo")).toBeNull();
  });
});

describe("formatarDataHora (instante real)", () => {
  for (const tz of ["UTC", "America/Sao_Paulo"]) {
    test(`usa America/Sao_Paulo mesmo com processo em ${tz}`, () => {
      comFuso(tz, () => {
        // 00:00 UTC = 21:00 do dia anterior em São Paulo
        expect(formatarDataHora("2026-04-18T00:00:00+00:00", "pt-BR")).toBe("17/04/2026, 21:00");
        expect(formatarDataHora("2026-04-18T00:00:00+00:00", "pt-BR", "UTC")).toBe("18/04/2026, 00:00");
      });
    });
  }
});

describe("erroColunaTraducoesAusente", () => {
  test("só coluna inexistente", () => {
    expect(erroColunaTraducoesAusente({ code: "42703", message: 'column "traducoes" does not exist' })).toBe(true);
    expect(erroColunaTraducoesAusente({ code: "PGRST204", message: "Could not find the 'traducoes' column" })).toBe(true);
    expect(erroColunaTraducoesAusente({ code: "23514", message: "violates check constraint noticias_traducoes_objeto" })).toBe(false);
    expect(erroColunaTraducoesAusente({ code: "42501", message: "permission denied traducoes" })).toBe(false);
    expect(erroColunaTraducoesAusente({ code: "42703", message: 'column "outra" does not exist' })).toBe(false);
    expect(erroColunaTraducoesAusente(null)).toBe(false);
  });
});
