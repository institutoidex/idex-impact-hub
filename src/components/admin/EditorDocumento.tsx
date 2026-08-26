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
  const salvar = useSalvarDocumento();
  const pastas = useQuery(pastasQuery);
  const opcoesPasta = achatar(montarArvore(pastas.data ?? []));
  const inputArquivo = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState<DocumentoForm>(() => vazio());

  useEffect(() => {
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
  }, [aberto, documento, pastaInicial]);

  async function anexar(arquivo?: File | null) {
    if (!arquivo) return;
    const erro = validarDocumento(arquivo);
    if (erro) {
      toast.error(erro);
      return;
    }
    setEnviando(true);
    try {
      const { url } = await enviarArquivo(arquivo, "documentos");
      setForm((f) => ({ ...f, arquivo_url: url }));
      toast.success("Arquivo enviado.");
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível enviar o arquivo.");
    } finally {
      setEnviando(false);
      if (inputArquivo.current) inputArquivo.current.value = "";
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    await salvar.mutateAsync(form);
    aoFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{documento ? "Editar documento" : "Novo documento"}</DialogTitle>
          <DialogDescription>
            Documentos publicados aparecem na página de Transparência e na busca do topo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="d-titulo">Título</Label>
            <Input
              id="d-titulo"
              required
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Pasta</Label>
            <Select
              value={form.pasta_id ?? "__raiz__"}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, pasta_id: v === "__raiz__" ? null : v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__raiz__">Sem pasta (raiz)</SelectItem>
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
              <Label>Categoria</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) => setForm((f) => ({ ...f, categoria: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estatuto">Estatuto e atas</SelectItem>
                  <SelectItem value="relatorio">Relatórios de atividades</SelectItem>
                  <SelectItem value="financeiro">Prestação de contas</SelectItem>
                  <SelectItem value="outro">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-ano">Ano</Label>
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
            <Label>Arquivo</Label>
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
                {enviando ? "Enviando..." : form.arquivo_url ? "Trocar arquivo" : "Enviar arquivo"}
              </Button>
              {form.arquivo_url && (
                <Button type="button" variant="ghost" className="rounded-full" asChild>
                  <a href={form.arquivo_url} target="_blank" rel="noreferrer">
                    Ver arquivo atual
                  </a>
                </Button>
              )}
            </div>
            <Input
              placeholder="ou cole uma URL: https://..."
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
              Mostrar no site
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-full" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando..." : "Salvar"}
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
