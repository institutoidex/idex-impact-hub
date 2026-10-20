import { useMensagemArquivo } from "@/i18n/erro-arquivo";
import { useEffect, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useSalvarDocumento, type DocumentoForm } from "@/lib/mutations";
import { pastasQuery } from "@/lib/queries";
import { achatar, montarArvore } from "@/lib/pastas";
import { enviarArquivo, validarDocumento } from "@/lib/storage";
import type { DocumentoRow } from "@/lib/db-types";
import { useMensagens } from "@/i18n/mensagens";
import { editores } from "@/i18n/catalogos/editores";
import { lerTraducoes, limparTraducoes, type Traducoes } from "@/i18n/traduzir";
import { BotaoTraduzir } from "@/components/admin/BotaoTraduzir";
import { mesclarTraducoes } from "@/lib/traducao-ia/cliente";
import { traducaoIa } from "@/i18n/catalogos/traducao-ia";

/** Formulário de documento da página de Transparência (PDF, planilhas). */
export function EditorDocumento({
  aberto,
  aoFechar,
  documento,
  pastaInicial = null,
}: {
  aberto: boolean;
  aoFechar: () => void;
  documento?: DocumentoRow | null;
  /** pasta pré-selecionada ao criar (vem do botão da árvore de pastas) */
  pastaInicial?: string | null;
}) {
  const t = useMensagens(editores);
  const ea = useMensagemArquivo();
  const salvar = useSalvarDocumento();
  const pastas = useQuery(pastasQuery);
  const opcoesPasta = achatar(montarArvore(pastas.data ?? []));
  const inputArquivo = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState<DocumentoForm>(() => vazio());
  const [trad, setTrad] = useState<Traducoes>({});
  // Tradução automática (Gemini) em andamento: bloqueia o Salvar.
  const ti = useMensagens(traducaoIa);
  const [traduzindo, setTraduzindo] = useState(false);

  useEffect(() => {
    setTraduzindo(false); // nova abertura: nenhuma tradução pendente vale
    if (!aberto) return;
    setForm(
      documento
        ? {
            id: documento.id,
            titulo: documento.titulo,
            categoria: documento.categoria,
            pasta_id: documento.pasta_id,
            ano: documento.ano,
            arquivo_url: documento.arquivo_url,
            publicado: documento.publicado,
          }
        : vazio(pastaInicial),
    );
    setTrad(lerTraducoes(documento?.traducoes));
  }, [aberto, documento, pastaInicial]);

  function campoTrad(locale: "en-US" | "es-ES") {
    return trad[locale]?.titulo ?? "";
  }

  function mudarTrad(locale: "en-US" | "es-ES", valor: string) {
    setTrad((v) => ({ ...v, [locale]: { ...v[locale], titulo: valor } }));
  }

  async function anexar(arquivo?: File | null) {
    if (!arquivo) return;
    const erro = validarDocumento(arquivo);
    if (erro) {
      toast.error(ea.deCodigo(erro));
      return;
    }
    setEnviando(true);
    try {
      const { url } = await enviarArquivo(arquivo, "documentos");
      setForm((f) => ({ ...f, arquivo_url: url }));
      toast.success(t.documento.arquivoEnviado);
    } catch (e) {
      toast.error(ea.deErro(e, t.documento.erroEnviarArquivo));
    } finally {
      setEnviando(false);
      if (inputArquivo.current) inputArquivo.current.value = "";
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (salvar.isPending) return;
    if (traduzindo) return void toast.warning(ti.aguardeSalvar);
    try {
      await salvar.mutateAsync({
        ...form,
        traducoes: limparTraducoes(trad),
        traducoesColunaExistente: Boolean(documento && "traducoes" in documento),
      });
    } catch {
      // erro já mostrado pelo onError da mutação; editor e campos ficam como estão
      return;
    }
    aoFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{documento ? t.documento.tituloEditar : t.documento.tituloNovo}</DialogTitle>
          <DialogDescription>{t.documento.descricao}</DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <Tabs defaultValue="pt" className="w-full">
            <TabsList>
              <TabsTrigger value="pt">{t.traducao.portugues}</TabsTrigger>
              <TabsTrigger value="en">{t.traducao.ingles}</TabsTrigger>
              <TabsTrigger value="es">{t.traducao.espanhol}</TabsTrigger>
            </TabsList>

            <TabsContent value="pt" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="d-titulo">{t.documento.campoTitulo}</Label>
                <Input
                  id="d-titulo"
                  required
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">{t.traducao.aviso}</p>
              <div className="space-y-2">
                <Label htmlFor="d-en-titulo">{t.documento.campoTitulo}</Label>
                <Input
                  id="d-en-titulo"
                  value={campoTrad("en-US")}
                  onChange={(e) => mudarTrad("en-US", e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="es" className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">{t.traducao.aviso}</p>
              <div className="space-y-2">
                <Label htmlFor="d-es-titulo">{t.documento.campoTitulo}</Label>
                <Input
                  id="d-es-titulo"
                  value={campoTrad("es-ES")}
                  onChange={(e) => mudarTrad("es-ES", e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Tradução automática: só o TÍTULO vai ao Gemini (arquivo, URL, ano,
              categoria e pasta nunca). Bloqueada durante envio do arquivo. */}
          <BotaoTraduzir
            entidade="documento"
            chaveAbertura={`${aberto}:${documento?.id ?? "novo"}`}
            entrada={{ titulo: form.titulo }}
            traducoes={trad}
            aoAplicar={(novas) => setTrad((v) => mesclarTraducoes(v, novas))}
            aoMudarTraduzindo={setTraduzindo}
            desabilitado={enviando || salvar.isPending}
          />

          <div className="space-y-2">
            <Label>{t.documento.campoPasta}</Label>
            <Select
              value={form.pasta_id ?? "__raiz__"}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, pasta_id: v === "__raiz__" ? null : v }))
              }
            >
              <SelectTrigger aria-label={t.documento.arialabelPasta}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__raiz__">{t.documento.semPasta}</SelectItem>
                {opcoesPasta.map((pasta) => (
                  <SelectItem key={pasta.id} value={pasta.id}>
                    {"— ".repeat(pasta.nivel)}
                    {pasta.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t.documento.campoCategoria}</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) => setForm((f) => ({ ...f, categoria: v }))}
              >
                <SelectTrigger aria-label={t.documento.arialabelCategoria}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estatuto">{t.documento.categoriaEstatuto}</SelectItem>
                  <SelectItem value="relatorio">{t.documento.categoriaRelatorio}</SelectItem>
                  <SelectItem value="financeiro">{t.documento.categoriaFinanceiro}</SelectItem>
                  <SelectItem value="outro">{t.documento.categoriaOutro}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-ano">{t.documento.campoAno}</Label>
              <Input
                id="d-ano"
                type="number"
                min={2000}
                max={2100}
                value={form.ano ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ano: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.documento.campoArquivo}</Label>
            <input
              ref={inputArquivo}
              type="file"
              accept=".pdf,.xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => void anexar(e.target.files?.[0])}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={enviando}
                onClick={() => inputArquivo.current?.click()}
              >
                {enviando ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileUp className="size-4" />
                )}
                {enviando
                  ? t.documento.enviando
                  : form.arquivo_url
                    ? t.documento.trocarArquivo
                    : t.documento.enviarArquivo}
              </Button>
              {form.arquivo_url && (
                <Button type="button" variant="ghost" className="rounded-full" asChild>
                  <a href={form.arquivo_url} target="_blank" rel="noreferrer">
                    {t.documento.verArquivoAtual}
                  </a>
                </Button>
              )}
            </div>
            <Input
              placeholder={t.documento.placeholderUrl}
              value={form.arquivo_url ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, arquivo_url: e.target.value || null }))}
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
            <Switch
              id="d-publicado"
              checked={form.publicado}
              onCheckedChange={(v) => setForm((f) => ({ ...f, publicado: v }))}
            />
            <Label htmlFor="d-publicado" className="cursor-pointer">
              {t.documento.mostrarNoSite}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-full" onClick={aoFechar}>
              {t.acoes.cancelar}
            </Button>
            <Button type="submit" className="rounded-full" disabled={salvar.isPending || traduzindo}>
              {salvar.isPending ? t.acoes.salvando : t.acoes.salvar}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Estado inicial de um documento novo. */
function vazio(pastaId: string | null = null): DocumentoForm {
  return {
    titulo: "",
    categoria: "relatorio",
    pasta_id: pastaId,
    ano: new Date().getFullYear(),
    arquivo_url: null,
    publicado: true,
  };
}
