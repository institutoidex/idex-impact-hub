import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ImagePlus, Loader2, Search, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { midiaQuery } from "@/lib/queries";
import { apagarMidia, enviarImagem, formatarTamanho, validarImagem } from "@/lib/storage";

/**
 * Biblioteca de imagens do site: envia, procura, copia o endereço e apaga
 * arquivos guardados no armazenamento público.
 */
export function BibliotecaMidia() {
  const queryClient = useQueryClient();
  const arquivos = useQuery(midiaQuery);
  const inputArquivo = useRef<HTMLInputElement>(null);

  const [enviando, setEnviando] = useState(false);
  const [pastaEnvio, setPastaEnvio] = useState("site");
  const [busca, setBusca] = useState("");
  const [filtroPasta, setFiltroPasta] = useState("todas");
  const [aExcluir, setAExcluir] = useState<{ caminho: string; nome: string } | null>(null);

  const pastas = useMemo(() => {
    const lista = new Set((arquivos.data ?? []).map((a) => a.pasta));
    return ["todas", ...Array.from(lista).sort()];
  }, [arquivos.data]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (arquivos.data ?? []).filter(
      (a) =>
        (filtroPasta === "todas" || a.pasta === filtroPasta) &&
        (!termo || a.nome.toLowerCase().includes(termo) || a.pasta.toLowerCase().includes(termo)),
    );
  }, [arquivos.data, busca, filtroPasta]);

  async function enviar(lista: FileList | null) {
    if (!lista?.length) return;
    setEnviando(true);
    try {
      for (const arquivo of Array.from(lista)) {
        const erro = validarImagem(arquivo);
        if (erro) {
          toast.error(`${arquivo.name}: ${erro}`);
          continue;
        }
        await enviarImagem(arquivo, pastaEnvio);
      }
      await queryClient.invalidateQueries({ queryKey: ["midia"] });
      toast.success("Imagens enviadas para a biblioteca.");
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível enviar.");
    } finally {
      setEnviando(false);
      if (inputArquivo.current) inputArquivo.current.value = "";
    }
  }

  async function confirmarExclusao() {
    if (!aExcluir) return;
    try {
      await apagarMidia(aExcluir.caminho);
      await queryClient.invalidateQueries({ queryKey: ["midia"] });
      toast.success("Arquivo apagado.");
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível apagar.");
    } finally {
      setAExcluir(null);
    }
  }

  async function copiar(url: string) {
    await navigator.clipboard.writeText(url);
    toast.success("Endereço copiado.");
  }

  return (
    <div className="space-y-6">
      {/* Barra de envio e filtros */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="min-w-40 flex-1">
          <label className="text-xs text-muted-foreground" htmlFor="m-busca">
            Procurar por nome
          </label>
          <div className="relative mt-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="m-busca"
              className="pl-9"
              placeholder="ex.: talento-brasil"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="w-40">
          <label className="text-xs text-muted-foreground">Pasta</label>
          <Select value={filtroPasta} onValueChange={setFiltroPasta}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pastas.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <label className="text-xs text-muted-foreground">Enviar para</label>
          <Select value={pastaEnvio} onValueChange={setPastaEnvio}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="site">site</SelectItem>
              <SelectItem value="projetos">projetos</SelectItem>
              <SelectItem value="noticias">noticias</SelectItem>
              <SelectItem value="equipe">equipe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <input
          ref={inputArquivo}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void enviar(e.target.files)}
        />
        <Button
          className="rounded-full"
          disabled={enviando}
          onClick={() => inputArquivo.current?.click()}
        >
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {enviando ? "Enviando..." : "Enviar imagens"}
        </Button>
      </div>

      {arquivos.isLoading && <p className="text-sm text-muted-foreground">Carregando imagens...</p>}
      {arquivos.error && (
        <p className="text-sm text-destructive">Não foi possível listar a biblioteca.</p>
      )}
      {arquivos.data && visiveis.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-muted/50 p-6 text-sm text-muted-foreground">
          Nenhuma imagem encontrada.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visiveis.map((a) => (
          <li key={a.caminho} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img
              src={a.url}
              alt={a.nome}
              loading="lazy"
              className="aspect-[4/3] w-full bg-muted object-cover"
            />
            <div className="space-y-2 p-3">
              <p className="truncate text-sm" title={a.nome}>
                {a.nome}
              </p>
              <p className="text-xs text-muted-foreground">
                {a.pasta} · {formatarTamanho(a.tamanho)}
              </p>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-full text-xs"
                  onClick={() => void copiar(a.url)}
                >
                  <Copy className="size-3" /> Copiar
                </Button>
                <Button size="icon" variant="outline" className="rounded-full" asChild>
                  <a href={a.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${a.nome}`}>
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={`Apagar ${a.nome}`}
                  onClick={() => setAExcluir({ caminho: a.caminho, nome: a.nome })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <AlertDialog open={Boolean(aExcluir)} onOpenChange={(v) => !v && setAExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar “{aExcluir?.nome}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Se essa imagem estiver em uso em alguma página, o espaço vai ficar vazio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmarExclusao()}>Apagar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
