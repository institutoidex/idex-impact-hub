import { useMensagemArquivo } from "@/i18n/erro-arquivo";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Copy,
  ExternalLink,
  Download,
  Folder,
  FolderPlus,
  Home,
  ImagePlus,
  Loader2,
  MoveRight,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { pastaMidiaQuery, todasPastasMidiaQuery } from "@/lib/queries";
import {
  apagarMidia,
  apagarPastaMidia,
  criarPastaMidia,
  enviarImagem,
  formatarTamanho,
  moverMidia,
  validarImagem,
  nomeLimpo,
  urlDownload,
} from "@/lib/storage";
import { useMensagens } from "@/i18n/mensagens";
import { midia } from "@/i18n/catalogos/midia";

/**
 * Biblioteca de imagens do site organizada em pastas e subpastas.
 * Permite navegar, criar pastas, enviar imagens na pasta atual,
 * mover arquivos entre pastas, copiar o endereço e apagar.
 */
export function BibliotecaMidia() {
  const t = useMensagens(midia).biblioteca;
  const ea = useMensagemArquivo();
  const queryClient = useQueryClient();
  const inputArquivo = useRef<HTMLInputElement>(null);

  // caminho da pasta aberta ("" = raiz da biblioteca)
  const [caminho, setCaminho] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [busca, setBusca] = useState("");
  const [criandoPasta, setCriandoPasta] = useState(false);
  const [nomePasta, setNomePasta] = useState("");
  // arraste: destaca a área geral ou a pasta que está sob o cursor
  const [arrastando, setArrastando] = useState(false);
  const [pastaAlvo, setPastaAlvo] = useState<string | null>(null);
  const [aExcluir, setAExcluir] = useState<{
    tipo: "arquivo" | "pasta" | "selecao";
    caminho: string;
    nome: string;
  } | null>(null);
  // seleção múltipla de arquivos (caminhos marcados)
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [processando, setProcessando] = useState(false);

  const conteudo = useQuery(pastaMidiaQuery(caminho));
  const todasPastas = useQuery(todasPastasMidiaQuery);

  // Migalhas de pão para voltar aos níveis anteriores
  const trilha = useMemo(() => {
    const partes = caminho ? caminho.split("/") : [];
    return partes.map((nome, i) => ({ nome, caminho: partes.slice(0, i + 1).join("/") }));
  }, [caminho]);

  const termo = busca.trim().toLowerCase();
  const pastasVisiveis = (conteudo.data?.pastas ?? []).filter(
    (p) => !termo || p.nome.toLowerCase().includes(termo),
  );
  const arquivosVisiveis = (conteudo.data?.arquivos ?? []).filter(
    (a) => !termo || a.nome.toLowerCase().includes(termo),
  );

  // Todos os arquivos visíveis estão marcados?
  const todosMarcados =
    arquivosVisiveis.length > 0 && arquivosVisiveis.every((a) => selecionados.includes(a.caminho));

  // Ao trocar de pasta, a seleção anterior deixa de fazer sentido
  useEffect(() => {
    setSelecionados([]);
  }, [caminho]);

  /** Recarrega listagens após qualquer mudança no armazenamento. */
  async function recarregar() {
    await queryClient.invalidateQueries({ queryKey: ["midia"] });
  }

  async function enviar(lista: FileList | File[] | null, destino?: string) {
    const arquivos = lista ? Array.from(lista) : [];
    if (!arquivos.length) return;
    const pasta = destino ?? caminho;
    setEnviando(true);
    try {
      let enviadas = 0;
      for (const arquivo of arquivos) {
        const erro = validarImagem(arquivo);
        if (erro) {
          toast.error(`${arquivo.name}: ${ea.deCodigo(erro)}`);
          continue;
        }
        // cada arquivo é tratado à parte: um nome repetido não cancela os demais
        try {
          await enviarImagem(arquivo, pasta || "site");
          enviadas++;
        } catch (e) {
          toast.error(ea.deErro(e, t.erroEnviarArquivo(arquivo.name)));
        }
      }
      await recarregar();
      if (enviadas) toast.success(t.enviadasParaPasta(enviadas, pasta || t.bibliotecaRaiz));
    } catch (e) {
      toast.error((e as Error).message || t.erroEnviar);
    } finally {
      setEnviando(false);
      if (inputArquivo.current) inputArquivo.current.value = "";
    }
  }

  async function criarPasta() {
    try {
      await criarPastaMidia(caminho, nomePasta);
      await recarregar();
      setNomePasta("");
      setCriandoPasta(false);
      toast.success(t.pastaCriada);
    } catch (e) {
      toast.error(ea.deErro(e, t.erroCriarPasta));
    }
  }

  async function mover(caminhoArquivo: string, destino: string) {
    try {
      await moverMidia(caminhoArquivo, destino === "__raiz__" ? "" : destino);
      await recarregar();
      toast.success(t.arquivoMovido);
    } catch (e) {
      toast.error((e as Error).message || t.erroMover);
    }
  }

  async function confirmarExclusao() {
    if (!aExcluir) return;
    try {
      if (aExcluir.tipo === "selecao") {
        setProcessando(true);
        for (const c of selecionados) await apagarMidia(c);
        setSelecionados([]);
        await recarregar();
        toast.success(t.arquivosApagados);
      } else if (aExcluir.tipo === "pasta") {
        await apagarPastaMidia(aExcluir.caminho);
        await recarregar();
        toast.success(t.pastaApagada);
      } else {
        await apagarMidia(aExcluir.caminho);
        setSelecionados((s) => s.filter((c) => c !== aExcluir.caminho));
        await recarregar();
        toast.success(t.arquivoApagado);
      }
    } catch (e) {
      toast.error((e as Error).message || t.erroApagar);
    } finally {
      setProcessando(false);
      setAExcluir(null);
    }
  }

  async function copiar(url: string) {
    await navigator.clipboard.writeText(url);
    toast.success(t.enderecoCopiado);
  }

  /** Marca ou desmarca um arquivo da seleção. */
  function alternarSelecao(caminhoArquivo: string) {
    setSelecionados((s) =>
      s.includes(caminhoArquivo) ? s.filter((c) => c !== caminhoArquivo) : [...s, caminhoArquivo],
    );
  }

  /** Move em massa todos os arquivos selecionados. */
  async function moverSelecionados(destino: string) {
    setProcessando(true);
    try {
      for (const c of selecionados) await moverMidia(c, destino === "__raiz__" ? "" : destino);
      setSelecionados([]);
      await recarregar();
      toast.success(t.arquivosMovidos);
    } catch (e) {
      toast.error((e as Error).message || t.erroMover);
    } finally {
      setProcessando(false);
    }
  }

  /** Copia os endereços de todos os arquivos selecionados (um por linha). */
  async function copiarSelecionados() {
    const urls = (conteudo.data?.arquivos ?? [])
      .filter((a) => selecionados.includes(a.caminho))
      .map((a) => a.url);
    await navigator.clipboard.writeText(urls.join("\n"));
    toast.success(t.enderecosCopiados(urls.length));
  }

  /** Extrai só as imagens de um evento de arraste. */
  function imagensDoEvento(e: React.DragEvent) {
    return Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
  }

  /** O arraste em curso traz arquivos? (evita destacar ao arrastar texto) */
  function temArquivos(e: React.DragEvent) {
    return Array.from(e.dataTransfer.types ?? []).includes("Files");
  }

  return (
    <div
      className={`space-y-6 rounded-3xl transition-colors ${
        arrastando && !pastaAlvo ? "bg-primary/5 outline-2 outline-dashed outline-primary/50" : ""
      }`}
      onDragOver={(e) => {
        if (!temArquivos(e)) return;
        e.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        setArrastando(false);
        setPastaAlvo(null);
      }}
      onDrop={(e) => {
        if (!temArquivos(e)) return;
        e.preventDefault();
        setArrastando(false);
        const alvo = pastaAlvo;
        setPastaAlvo(null);
        void enviar(imagensDoEvento(e), alvo ?? undefined);
      }}
    >
      {/* Aviso durante o arraste */}
      {arrastando && (
        <p className="rounded-2xl border border-dashed border-primary/60 bg-primary/10 p-3 text-center text-sm text-primary">
          {pastaAlvo ? t.soltePastaParaEnviar(pastaAlvo) : t.solteParaEnviar}
        </p>
      )}

      {/* Caminho atual (migalhas): mostra onde estou e permite voltar a qualquer nível */}
      <nav
        className="flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-muted/40 px-2 py-1.5 text-sm"
        aria-label={t.caminhoLabel}
      >
        {trilha.length > 0 && (
          <button
            type="button"
            className="mr-1 inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 font-medium hover:border-primary/60"
            onClick={() => setCaminho(trilha[trilha.length - 2]?.caminho ?? "")}
          >
            <ChevronRight className="size-4 rotate-180" /> {t.voltar}
          </button>
        )}
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-muted ${trilha.length === 0 ? "font-semibold text-primary" : ""}`}
          aria-current={trilha.length === 0 ? "page" : undefined}
          onClick={() => setCaminho("")}
        >
          <Home className="size-4" /> {t.biblioteca}
        </button>
        {trilha.map((p, i) => {
          const atual = i === trilha.length - 1;
          return (
            <span key={p.caminho} className="inline-flex items-center gap-1">
              <ChevronRight className="size-4 text-muted-foreground" />
              <button
                type="button"
                aria-current={atual ? "page" : undefined}
                className={`rounded-full px-2 py-1 hover:bg-muted ${atual ? "font-semibold text-primary" : ""}`}
                onClick={() => setCaminho(p.caminho)}
              >
                {p.nome}
              </button>
            </span>
          );
        })}
      </nav>

      {/* Barra de ações */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="min-w-40 flex-1">
          <label className="text-xs text-muted-foreground" htmlFor="m-busca">
            {t.procurar}
          </label>
          <div className="relative mt-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="m-busca"
              className="pl-9"
              placeholder={t.procurarPlaceholder}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <Button variant="outline" className="rounded-full" onClick={() => setCriandoPasta(true)}>
          <FolderPlus className="size-4" /> {t.novaPasta}
        </Button>

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
          {enviando ? t.enviando : t.enviarImagens}
        </Button>

        <p className="w-full text-xs text-muted-foreground">
          {t.dica}
        </p>
      </div>

      {/* Formulário de nova pasta */}
      {criandoPasta && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-dashed border-border bg-muted/40 p-4">
          <div className="min-w-48 flex-1">
            <label className="text-xs text-muted-foreground" htmlFor="m-nova-pasta">
              {caminho ? t.nomeSubpasta : t.nomePasta}
              {caminho ? t.dentroDe(caminho) : ""}
            </label>
            <Input
              id="m-nova-pasta"
              className="mt-1"
              placeholder={t.novaPastaPlaceholder}
              value={nomePasta}
              onChange={(e) => setNomePasta(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void criarPasta()}
            />
          </div>
          <Button className="rounded-full" onClick={() => void criarPasta()}>
            {t.criar}
          </Button>
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => {
              setCriandoPasta(false);
              setNomePasta("");
            }}
          >
            {t.cancelar}
          </Button>
        </div>
      )}

      {conteudo.isLoading && <p className="text-sm text-muted-foreground">{t.carregandoPasta}</p>}
      {conteudo.error && (
        <p className="text-sm text-destructive">{t.erroListar}</p>
      )}

      {/* Subpastas */}
      {pastasVisiveis.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pastasVisiveis.map((p) => (
            <li
              key={p.caminho}
              className={`relative flex items-center rounded-2xl border bg-card transition-colors hover:border-primary/60 hover:bg-primary/5 ${
                pastaAlvo === p.caminho ? "border-primary bg-primary/10" : "border-border"
              }`}
              onDragOver={(e) => {
                if (!temArquivos(e)) return;
                e.preventDefault();
                setPastaAlvo(p.caminho);
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                setPastaAlvo((atual) => (atual === p.caminho ? null : atual));
              }}
            >
              {/* Cartão inteiro clicável: um clique em qualquer ponto abre a pasta */}
              <button
                type="button"
                aria-label={t.abrirPasta(p.nome)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-2xl p-3 pr-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  setCaminho(p.caminho);
                  setBusca("");
                }}
              >
                <Folder className="size-5 shrink-0 text-primary" />
                <span className="truncate text-sm font-medium">{p.nome}</span>
              </button>
              <Button
                size="icon"
                variant="ghost"
                className="mr-2 shrink-0 rounded-full"
                aria-label={t.apagarPasta(p.nome)}
                onClick={(e) => {
                  // impede que o clique na lixeira abra a pasta
                  e.stopPropagation();
                  setAExcluir({ tipo: "pasta", caminho: p.caminho, nome: p.nome });
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {conteudo.data && pastasVisiveis.length === 0 && arquivosVisiveis.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-muted/50 p-6 text-sm text-muted-foreground">
          {t.pastaVazia}
        </p>
      )}

      {/* Barra de ações em massa */}
      {arquivosVisiveis.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <Checkbox
              checked={todosMarcados}
              onCheckedChange={(v) =>
                setSelecionados(v === true ? arquivosVisiveis.map((a) => a.caminho) : [])
              }
              aria-label={t.selecionarTodosAria}
            />
            {t.selecionarTodos}
          </label>

          <span className="text-sm text-muted-foreground">
            {t.selecionados(selecionados.length)}
          </span>

          {selecionados.length > 0 && (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {processando && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              <Select
                value=""
                disabled={processando}
                onValueChange={(destino) => void moverSelecionados(destino)}
              >
                <SelectTrigger className="h-9 w-48 rounded-full text-xs">
                  <span className="inline-flex items-center gap-1">
                    <MoveRight className="size-3" /> {t.moverSelecionados}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__raiz__">{t.bibliotecaRaiz}</SelectItem>
                  {(todasPastas.data ?? [])
                    .filter((p) => p !== (caminho || "__nada__"))
                    .map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={processando}
                onClick={() => void copiarSelecionados()}
              >
                <Copy className="size-3" /> {t.copiarEnderecos}
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={processando}
                onClick={() =>
                  setAExcluir({
                    tipo: "selecao",
                    caminho: "",
                    nome: t.arquivos(selecionados.length),
                  })
                }
              >
                <Trash2 className="size-3" /> {t.apagar}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => setSelecionados([])}
              >
                {t.limparSelecao}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Arquivos da pasta atual */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {arquivosVisiveis.map((a) => (
          <li
            key={a.caminho}
            className={`overflow-hidden rounded-2xl border bg-card ${
              selecionados.includes(a.caminho) ? "border-primary ring-2 ring-primary/30" : "border-border"
            }`}
          >
            <div className="relative">
              <img
                src={a.url}
                alt={a.nome}
                loading="lazy"
                className="aspect-[4/3] w-full cursor-pointer bg-muted object-cover"
                onClick={() => alternarSelecao(a.caminho)}
              />
              <span className="absolute top-2 left-2 rounded-md bg-background/90 p-1 shadow-sm">
                <Checkbox
                  checked={selecionados.includes(a.caminho)}
                  onCheckedChange={() => alternarSelecao(a.caminho)}
                  aria-label={t.selecionarArquivo(a.nome)}
                />
              </span>
            </div>
            <div className="space-y-2 p-3">
              <p className="truncate text-sm" title={nomeLimpo(a.nome)}>
                {nomeLimpo(a.nome)}
              </p>
              <p className="text-xs text-muted-foreground">{formatarTamanho(a.tamanho)}</p>

              {/* Mover para outra pasta */}
              <Select value="" onValueChange={(destino) => void mover(a.caminho, destino)}>
                <SelectTrigger className="h-8 rounded-full text-xs">
                  <span className="inline-flex items-center gap-1">
                    <MoveRight className="size-3" /> {t.moverPara}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__raiz__">{t.bibliotecaRaiz}</SelectItem>
                  {(todasPastas.data ?? [])
                    .filter((p) => p !== (caminho || "__nada__"))
                    .map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-full text-xs"
                  onClick={() => void copiar(a.url)}
                >
                  <Copy className="size-3" /> {t.copiar}
                </Button>
                <Button size="icon" variant="outline" className="rounded-full" asChild>
                  <a href={a.url} target="_blank" rel="noreferrer" aria-label={t.abrir(a.nome)}>
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                {/* Baixa o arquivo original, sem conversão, com o nome limpo */}
                <Button size="icon" variant="outline" className="rounded-full" asChild>
                  <a
                    href={urlDownload(a.url, a.nome)}
                    download={nomeLimpo(a.nome)}
                    aria-label={t.baixar(nomeLimpo(a.nome))}
                    title={t.baixarTitulo}
                  >
                    <Download className="size-4" />
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={t.apagarArquivo(a.nome)}
                  onClick={() => setAExcluir({ tipo: "arquivo", caminho: a.caminho, nome: a.nome })}
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
            <AlertDialogTitle>{t.confirmarApagarTitulo(aExcluir?.nome ?? "")}</AlertDialogTitle>
            <AlertDialogDescription>
              {aExcluir?.tipo === "pasta"
                ? t.confirmarApagarPasta
                : aExcluir?.tipo === "selecao"
                  ? t.confirmarApagarSelecao
                  : t.confirmarApagarArquivo}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancelarDialogo}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmarExclusao()}>{t.apagarDialogo}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
