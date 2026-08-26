import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, History } from "lucide-react";
import { auditoriaQuery, formatarData } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { AuditoriaRow } from "@/lib/db-types";

/** Cores e rótulos por tipo de ação registrada. */
const ACOES: Record<string, { rotulo: string; classe: string }> = {
  criado: { rotulo: "Criado", classe: "bg-secondary/10 text-secondary" },
  atualizado: { rotulo: "Atualizado", classe: "bg-muted text-foreground/80" },
  publicado: { rotulo: "Publicado", classe: "bg-primary/10 text-primary" },
  despublicado: { rotulo: "Despublicado", classe: "bg-accent/20 text-foreground" },
  excluido: { rotulo: "Excluído", classe: "bg-destructive/10 text-destructive" },
};

const TABELAS: Record<string, string> = {
  noticias: "Notícia",
  projetos: "Projeto",
  documentos: "Documento",
  areas: "Área",
};

/** Mostra um valor do banco de forma legível e curta. */
function valorLegivel(v: unknown) {
  if (v === null || v === undefined || v === "") return "vazio";
  if (typeof v === "boolean") return v ? "sim" : "não";
  const texto = typeof v === "string" ? v : JSON.stringify(v);
  return texto.length > 120 ? `${texto.slice(0, 120)}…` : texto;
}

/** Item da trilha, com detalhamento dos campos alterados. */
function ItemHistorico({ item }: { item: AuditoriaRow }) {
  const [aberto, setAberto] = useState(false);
  const acao = ACOES[item.acao] ?? { rotulo: item.acao, classe: "bg-muted" };
  const campos = Object.entries(item.alteracoes ?? {});

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", acao.classe)}>
          {acao.rotulo}
        </span>
        <span className="text-xs text-muted-foreground">
          {TABELAS[item.tabela] ?? item.tabela}
        </span>
        <span className="font-display">{item.titulo || "(sem título)"}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {formatarData(item.criado_em)}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        por {item.autor_email || "autor não identificado"}
        {campos.length ? ` — ${campos.length} campo(s) alterado(s)` : ""}
      </p>

      {campos.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary"
          >
            <ChevronDown className={cn("size-3 transition-transform", aberto && "rotate-180")} />
            {aberto ? "Ocultar detalhes" : "Ver o que mudou"}
          </button>
          {aberto && (
            <ul className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
              {campos.map(([campo, dif]) => (
                <li key={campo} className="grid gap-1 sm:grid-cols-[10rem_1fr]">
                  <span className="font-semibold">{campo}</span>
                  <span className="text-muted-foreground">
                    <span className="line-through">{valorLegivel(dif?.antes)}</span>{" "}
                    <span aria-hidden>→</span>{" "}
                    <span className="text-foreground">{valorLegivel(dif?.depois)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </article>
  );
}

/** Trilha de auditoria completa do painel. */
/** `limite` mostra só as alterações mais recentes (usado na visão geral). */
export function Historico({ limite }: { limite?: number }) {
  const { data, isLoading, error } = useQuery(auditoriaQuery);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando histórico...</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível ler o histórico (verifique as permissões da tabela).
      </p>
    );
  }
  if (!data?.length) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <History className="size-5" aria-hidden />
        Nenhuma alteração registrada ainda. Tudo que for criado, publicado, editado ou apagado
        aparece aqui.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(limite ? data.slice(0, limite) : data).map((item) => (
        <ItemHistorico key={item.id} item={item} />
      ))}
    </div>
  );
}
