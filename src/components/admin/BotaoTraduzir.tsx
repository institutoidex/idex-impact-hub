import { useEffect, useRef, useState } from "react";
import { Languages, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMensagens } from "@/i18n/mensagens";
import { traducaoIa } from "@/i18n/catalogos/traducao-ia";
import type { Traducoes } from "@/i18n/traduzir";
import { LIMITE_TOTAL, totalCaracteres, type EntradaTraducao, type TraducoesGeradas } from "@/lib/traducao-ia/contrato";
import { pedirTraducao, retrato, temTraducaoExistente } from "@/lib/traducao-ia/cliente";

/**
 * Botão "Traduzir para inglês e espanhol" do editor de notícia.
 * - Só traduz no clique (nunca a cada digitação). type="button": não envia o formulário.
 * - Se já houver tradução, pede confirmação explícita antes de substituir.
 * - Tira um retrato do português + traduções no clique; se algo mudar durante a
 *   espera, o resultado é IGNORADO (nada aplicado).
 * - Desmontar (editor fechado) ou "Cancelar" aborta a chamada; retorno tardio é ignorado.
 * - Falha nunca apaga nada; as duas línguas só são aplicadas juntas após validação.
 *
 * Props:
 * - entrada: título/resumo/texto em português (os únicos dados enviados)
 * - traducoes: traduções atuais do formulário (para confirmar e para o retrato)
 * - aoAplicar: recebe en-US + es-ES validados; o editor mescla no estado
 * - desabilitado: ex. envio de fotos da galeria ou salvamento em andamento
 * - aoMudarTraduzindo: avisa o editor para bloquear o Salvar
 */
export function BotaoTraduzir({
  entrada,
  traducoes,
  aoAplicar,
  desabilitado,
  aoMudarTraduzindo,
}: {
  entrada: EntradaTraducao;
  traducoes: Traducoes;
  aoAplicar: (novas: TraducoesGeradas) => void;
  desabilitado?: boolean;
  aoMudarTraduzindo?: (v: boolean) => void;
}) {
  const t = useMensagens(traducaoIa);
  const [traduzindo, setTraduzindo] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const controle = useRef<AbortController | null>(null);
  // valores mais recentes, lidos quando a resposta chega
  const atual = useRef({ entrada, traducoes });
  atual.current = { entrada, traducoes };

  // editor fechado/desmontado: aborta e esquece a chamada pendente
  useEffect(() => () => controle.current?.abort(), []);

  const total = totalCaracteres(entrada);
  const acima = total > LIMITE_TOTAL;
  const semTitulo = !entrada.titulo.trim();

  function marcar(v: boolean) {
    setTraduzindo(v);
    aoMudarTraduzindo?.(v);
  }

  function clicar() {
    if (traduzindo || desabilitado) return;
    if (semTitulo) return void toast.error(t.semTitulo);
    if (acima) return void toast.error(t.acimaDoLimite);
    if (temTraducaoExistente(traducoes)) return setConfirmando(true);
    void traduzir();
  }

  async function traduzir() {
    setConfirmando(false);
    // revalida tudo: a confirmação aberta não pode contornar bloqueios
    if (traduzindo || controle.current || desabilitado) return;
    if (semTitulo) return void toast.error(t.semTitulo);
    if (acima) return void toast.error(t.acimaDoLimite);
    const meu = new AbortController();
    controle.current = meu;
    const foto = retrato(entrada, traducoes);
    marcar(true);
    const r = await pedirTraducao(entrada, meu.signal);
    // chamada antiga (cancelada, editor fechado ou outra mais nova): ignora
    if (controle.current !== meu || meu.signal.aborted) return;
    controle.current = null;
    marcar(false);
    if (!r.ok) return void toast.error(t.erros[r.codigo]);
    if (retrato(atual.current.entrada, atual.current.traducoes) !== foto) {
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
      <p className="text-xs text-muted-foreground">{t.nota(LIMITE_TOTAL)}</p>
      <p className={`text-xs ${acima ? "text-destructive" : "text-muted-foreground"}`} aria-live="polite">
        {t.contador(total, LIMITE_TOTAL)}
      </p>

      {confirmando ? (
        <div role="alertdialog" aria-labelledby="confirmar-traducao" className="space-y-2 rounded-xl bg-muted p-3">
          <p id="confirmar-traducao" className="text-sm font-semibold">{t.confirmarTitulo}</p>
          <p className="text-sm text-muted-foreground">{t.confirmarTexto}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              disabled={traduzindo || desabilitado || acima || semTitulo}
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
