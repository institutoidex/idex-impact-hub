// @ts-nocheck — arquivo executado pelo bun test (tipos de bun:test fora do tsconfig)
// Prova de USO REAL: todo catálogo é importado por alguma tela, e toda rota com
// texto visível usa useMensagens (pega catálogos criados mas esquecidos).
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(import.meta.dir, "..");
function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const c = join(dir, n);
    if (statSync(c).isDirectory()) return arquivos(c);
    return /\.(ts|tsx)$/.test(n) && !n.endsWith(".test.ts") ? [c] : [];
  });
}
const fontes = arquivos(RAIZ).filter((f) => !f.includes("/i18n/catalogos/"));
const conteudo = new Map(fontes.map((f) => [f, readFileSync(f, "utf8")]));

describe("catálogos em uso", () => {
  for (const cat of readdirSync(join(RAIZ, "i18n/catalogos"))) {
    const nome = cat.replace(/\.ts$/, "");
    test(`${nome} é importado e usado por alguma tela`, () => {
      const usuarios = [...conteudo].filter(([, s]) => s.includes(`catalogos/${nome}"`));
      expect(usuarios.length).toBeGreaterThan(0);
    });
  }
});

describe("rotas com texto usam o catálogo", () => {
  // rotas que só redirecionam ou são endpoints não têm texto visível
  const SEM_TEXTO = ["__root.tsx", "login.tsx", "painel.tsx", "projetos.tsx", "noticias.tsx", "sitemap[.]xml.ts"];
  const rotas = readdirSync(join(RAIZ, "routes")).filter(
    (n) => /\.tsx?$/.test(n) && !SEM_TEXTO.includes(n),
  );
  for (const r of rotas) {
    test(`${r} usa useMensagens`, () => {
      expect(readFileSync(join(RAIZ, "routes", r), "utf8")).toContain("useMensagens(");
    });
  }
});
