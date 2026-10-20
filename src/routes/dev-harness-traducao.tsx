// HARNESS TEMPORÁRIO de desenvolvimento (teste simulado no navegador). REMOVER antes do build final.
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EditorProjeto } from "@/components/admin/EditorProjeto";
import { BotaoTraduzir } from "@/components/admin/BotaoTraduzir";
import { useMensagens } from "@/i18n/mensagens";
import { traducaoIa } from "@/i18n/catalogos/traducao-ia";
import type { ProjetoRow } from "@/lib/db-types";

const PROJETO = {
  id: "pj1", slug: "talento-brasil", titulo: "Talento Brasil", resumo: "Futebol gratuito.",
  descricao: "Treinos na Penha.\n\nAberto à comunidade.", imagem_url: "https://exemplo.invalid/capa.jpg",
  iniciado_em: "2017-06-26", publicado: true, traducoes: { "en-US": { titulo: "Old" } },
} as unknown as ProjetoRow;

export const Route = createFileRoute("/dev-harness-traducao")({ component: Harness });

function Harness() {
  useMensagens(traducaoIa);
  const [ed, setEd] = useState<{ aberto: boolean; item: ProjetoRow | null }>({ aberto: false, item: null });
  const [chave, setChave] = useState("a");
  return (
    <div className="space-y-4 p-8">
      <button id="h-novo" onClick={() => setEd({ aberto: true, item: null })}>novo</button>
      <button id="h-existente" onClick={() => setEd({ aberto: true, item: PROJETO })}>existente</button>
      <button id="h-chave" onClick={() => setChave((c) => (c === "a" ? "b" : "a"))}>trocar chave ({chave})</button>
      <div id="h-botao">
        <BotaoTraduzir entidade="pasta" chaveAbertura={chave} entrada={{ nome: "Mesmo nome" }}
          traducoes={{ "en-US": { nome: "x" } }} aoAplicar={() => { (window as any).aplicou = ((window as any).aplicou ?? 0) + 1; }} />
      </div>
      <EditorProjeto aberto={ed.aberto} projeto={ed.item} aoFechar={() => setEd({ aberto: false, item: null })} />
    </div>
  );
}
