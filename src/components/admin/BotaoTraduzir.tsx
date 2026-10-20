import { useEffect, useRef, useState } from "react";
import { Languages, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMensagens } from "@/i18n/mensagens";
import { traducaoIa } from "@/i18n/catalogos/traducao-ia";
import type { Traducoes } from "@/i18n/traduzir";
import {
  ENTIDADES,
  LIMITE_TOTAL,
  totalCaracteres,
  type CamposDe,
  type Entidade,
  type PedidoTraducao,
  type TraducoesCampos,
} from "@/lib/traducao-ia/contrato";
import {
  bloqueioTraducao,
  camposPermitidos,
  pedirTraducao,
  retrato,
  temTraducaoExistente,
} from "@/lib/traducao-ia/cliente";

/**
 * Botão "Traduzir para inglês e espanhol", reutilizado por TODOS os editores
 * trilíngues (notícia, projeto, documento, pasta).
 * - Só traduz no clique (nunca a cada digitação). type="button": não envia o formulário.
 * - Se já houver tradução NOS CAMPOS-ALVO, pede confirmação antes de substituir.
 * - Tira um retrato dos campos PT + traduções no clique; se algo mudar durante a
 *   espera, o resultado é IGNORADO (nada aplicado).
 * - Desmontar, trocar `chaveAbertura` (outro registro/reabertura) ou "Cancelar"
 *   aborta a chamada; retorno tardio é ignorado.
 * - Falha nunca apaga nada; as duas línguas só são aplicadas juntas após validação.
 *
 * Props:
 * - entidade: tipo do cadastro (define campos permitidos e textos da nota)
 * - entrada: campos em português da entidade (os únicos dados enviados)
 * - traducoes: traduções atuais do formulário (para confirmar e para o retrato)
 * - aoAplicar: recebe en-US + es-ES validados; o editor mescla no estado
 * - desabilitado: ex. envio de arquivo/fotos ou salvamento em andamento
 * - aoMudarTraduzindo: avisa o editor para bloquear o Salvar
 * - chaveAbertura: identidade da abertura do editor (ex.: `${aberto}:${id}`)
 */
export function BotaoTraduzir<E extends Entidade = "noticia">({
  entidade = "noticia" as E,
  entrada,
  traducoes,
  aoAplicar,
  desabilitado,
  aoMudarTraduzindo,
  chaveAbertura,
}: {
  entidade?: E;
  entrada: CamposDe<E>;
  traducoes: Traducoes;
  aoAplicar: (novas: TraducoesCampos) => void;
  desabilitado?: boolean;
  aoMudarTraduzindo?: (v: boolean) => void;
  chaveAbertura?: string;
}) {
  const t = useMensagens(traducaoIa);
  const [traduzindo, setTraduzindo] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const controle = useRef<AbortController | null>(null);
  // só os campos do registro, nunca outros dados do formulário
  const campos = camposPermitidos(entidade, entrada as Record<string, unknown>);
  const obrigatorio = ENTIDADES[entidade].obrigatorio;
  // valores mais recentes, lidos quando a resposta chega
  const atual = useRef({ campos, traducoes });
  atual.current = { campos, traducoes };
  const avisar = useRef(aoMudarTraduzindo);
  avisar.current = aoMudarTraduzindo;
  // identidade ATUAL (entidade + abertura), atualizada já no render: a resposta
  // só é aplicada se ainda bater com a identidade capturada no clique
  const identidade = useRef("");
  identidade.current = `${entidade}|${chaveAbertura ?? ""}`;

  // Toda troca de chaveAbertura (fechou, reabriu, outro registro, outra pasta mãe)
  // ou desmontagem: fecha a confirmação SEMPRE e aborta a chamada pendente, se houver.
  useEffect(
    () => () => {
      setConfirmando(false);
      if (!controle.current) return;
      controle.current.abort();
      controle.current = null;
      setTraduzindo(false);
      avisar.current?.(false);
    },
    [chaveAbertura],
  );

  const total = totalCaracteres(campos);
  const acima = total > LIMITE_TOTAL;
  const semObrigatorio = !(campos[obrigatorio] ?? "").trim();

  function marcar(v: boolean) {
    setTraduzindo(v);
    aoMudarTraduzindo?.(v);
  }

  // mesma checagem no clique e no "Substituir"; true = pode seguir
  function liberado() {
    const motivo = bloqueioTraducao({
      traduzindo: traduzindo || !!controle.current,
      desabilitado,
      entrada: campos,
      limite: LIMITE_TOTAL,
      obrigatorio,
    });
    if (motivo === "semTitulo") toast.error(obrigatorio === "nome" ? t.semNome : t.semTitulo);
    if (motivo === "acima") toast.error(t.acimaDoLimite);
    return motivo === null;
  }

  function clicar() {
    if (!liberado()) return;
    if (temTraducaoExistente(traducoes, entidade)) return setConfirmando(true);
    void traduzir();
  }

  async function traduzir() {
    setConfirmando(false);
    // revalida tudo: a confirmação aberta não pode contornar bloqueios
    if (!liberado()) return;
    const meu = new AbortController();
    controle.current = meu;
    const minhaIdentidade = identidade.current;
    const foto = retrato(campos, traducoes);
    marcar(true);
    const r = await pedirTraducao({ entidade, campos } as PedidoTraducao, meu.signal);
    // chamada antiga (cancelada, editor fechado ou outra mais nova): ignora
    if (controle.current !== meu || meu.signal.aborted) return;
    // trocou de entidade/abertura antes do cleanup rodar: aborta e ignora
    if (identidade.current !== minhaIdentidade) {
      meu.abort();
      controle.current = null;
      return marcar(false);
    }
    controle.current = null;
    marcar(false);
    if (!r.ok) return void toast.error(t.erros[r.codigo]);
    if (retrato(atual.current.campos, atual.current.traducoes) !== foto) {
      return void toast.warning(t.ignorado);
    }
    aoAplicar(r.traducoes);
    toast.success(t.sucesso);
  }

  function cancelar() {
    controle.current?.abort();
    controle.current = null;
    marcar(false);
    toast.info(t.erros.cancelado);
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border p-4">
      <p className="text-xs text-muted-foreground">
        {t.envio[entidade]} {t.revisar(LIMITE_TOTAL)}
      </p>
      <p className={`text-xs ${acima ? "text-destructive" : "text-muted-foreground"}`} aria-live="polite">
        {t.contador(total, LIMITE_TOTAL)}
      </p>

      {confirmando ? (
        <div role="alertdialog" aria-labelledby="confirmar-traducao" className="space-y-2 rounded-xl bg-muted p-3">
          <p id="confirmar-traducao" className="text-sm font-semibold">{t.confirmarTitulo}</p>
          <p className="text-sm text-muted-foreground">{t.confirmarTexto[entidade]}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              disabled={traduzindo || desabilitado || acima || semObrigatorio}
              onClick={() => void traduzir()}
            >
              {t.confirmarSim}
            </Button>
            <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => setConfirmando(false)}>
              {t.confirmarNao}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={traduzindo || desabilitado || acima}
            onClick={clicar}
          >
            {traduzindo ? <Loader2 className="size-4 animate-spin" /> : <Languages className="size-4" />}
            {traduzindo ? t.traduzindo : t.botao}
          </Button>
          {traduzindo && (
            <Button type="button" variant="ghost" className="rounded-full" onClick={cancelar}>
              <X className="size-4" /> {t.cancelar}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
