// @ts-nocheck
import { describe, expect, test } from "bun:test";
import { escolherSlugLivre } from "./mutations";

// Testes da escolha de endereço livre para notícias com títulos iguais.
describe("escolherSlugLivre", () => {
  test("mantém o slug quando ninguém usa", () => {
    expect(escolherSlugLivre("treino", ["treino-de-futebol"])).toBe("treino");
  });
  test("acrescenta -2 quando já existe", () => {
    expect(escolherSlugLivre("treino", ["treino"])).toBe("treino-2");
  });
  test("pula sufixos ocupados", () => {
    expect(escolherSlugLivre("treino", ["treino", "treino-2", "treino-3"])).toBe("treino-4");
  });
});
