import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, History } from "lucide-react";
import { auditoriaQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { AuditoriaRow } from "@/lib/db-types";
import { useLocale, useMensagens } from "@/i18n/mensagens";
import { admin } from "@/i18n/catalogos/admin";
import { formatarDataHora } from "@/i18n/formatar";

/** Cores por tipo de ação registrada (rótulos vêm do catálogo de mensagens). */
const CLASSES_ACAO: Record<string, string> = {
  criado: "bg-secondary/10 text-secondary",
  atualizado: "bg-muted text-foreground/80",
  publicado: "bg-primary/10 text-primary",
  despublicado: "bg-accent/20 text-foreground",
  excluido: "bg-destructive/10 text-destructive",
};

/** Mostra um valor do banco de forma legível e curta. */
function valorLegivel(v: unknown, m: ReturnType<typeof useMensagens<typeof admin>>) {
  if (v === null || v === undefined || v === "") return m.historico.vazioValor;
  if (typeof v === "boolean") return v ? m.historico.sim : m.historico.nao;
  const texto = typeof v === "string" ? v : JSON.stringify(v);
  return texto.length > 120 ? `${texto.slice(0, 120)}…` : texto;
}

/** Item da trilha, com detalhamento dos campos alterados. */
function ItemHistorico({ item }: { item: AuditoriaRow }) {
  const [aberto, setAberto] = useState(false);
  const locale = useLocale();
  const m = useMensagens(admin);
  const rotuloAcao = m.historico.acoes[item.acao as keyof typeof m.historico.acoes] ?? item.acao;
  const classeAcao = CLASSES_ACAO[item.acao] ?? "bg-muted";
  const rotuloTabela = m.historico.tabelas[item.tabela as keyof typeof m.historico.tabelas] ?? item.tabela;
  const campos = Object.entries(item.alteracoes ?? {});

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", classeAcao)}>
          {rotuloAcao}
        </span>
        <span className="text-xs text-muted-foreground">{rotuloTabela}</span>
        <span className="font-display">{item.titulo || m.historico.semTitulo}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {formatarDataHora(item.criado_em, locale)}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {m.historico.por(item.autor_email || m.historico.autorDesconhecido)}
        {campos.length ? m.historico.camposAlterados(campos.length) : ""}
      </p>

      {campos.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary"
          >
            <ChevronDown className={cn("size-3 transition-transform", aberto && "rotate-180")} />
            {aberto ? m.historico.ocultarDetalhes : m.historico.verMudanca}
          </button>
          {aberto && (
            <ul className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
              {campos.map(([campo, dif]) => (
                <li key={campo} className="grid gap-1 sm:grid-cols-[10rem_1fr]">
                  <span className="font-semibold">{campo}</span>
                  <span className="text-muted-foreground">
                    <span className="line-through">{valorLegivel(dif?.antes, m)}</span>{" "}
                    <span aria-hidden>→</span>{" "}
                    <span className="text-foreground">{valorLegivel(dif?.depois, m)}</span>
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
  const m = useMensagens(admin);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{m.historico.carregando}</p>;
  }
  if (error) {
    return <p className="text-sm text-muted-foreground">{m.historico.erroCarregar}</p>;
  }
  if (!data?.length) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <History className="size-5" aria-hidden />
        {m.historico.vazio}
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
