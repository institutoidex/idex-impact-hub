import { useMensagemArquivo } from "@/i18n/erro-arquivo";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enviarCapa, enviarImagem, nomeCapa, validarImagem } from "@/lib/storage";
import { useMensagens } from "@/i18n/mensagens";
import { midia } from "@/i18n/catalogos/midia";

/**
 * Campo de capa: envia a imagem para o armazenamento, mostra a pré-visualização
 * e mantém a possibilidade de colar uma URL externa.
 *
 * Prop opcional `tituloCapa` (usada pelo editor de notícia com o título em
 * português): quando informada, o arquivo é salvo como
 * "<titulo>-capa.<ext>" numa subpasta única por envio (ver enviarCapa) e o
 * envio é recusado, com aviso traduzido, se o título estiver vazio.
 * Sem a prop, o comportamento antigo (nome do arquivo original) continua.
 * URL colada no campo de texto não é baixada nem renomeada: fica como está.
 * Se o envio falhar, a capa anterior e o formulário ficam intactos.
 */
export function UploadCapa({
  valor,
  aoMudar,
  pasta,
  rotulo,
  tituloCapa,
}: {
  valor: string | null;
  aoMudar: (url: string | null) => void;
  pasta: string;
  rotulo?: string;
  /** Título que dá nome ao arquivo da capa (ativa o modo "titulo-capa.ext") */
  tituloCapa?: string;
}) {
  const t = useMensagens(midia).upload;
  const ea = useMensagemArquivo();
  const inputArquivo = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  /** Título ainda sem letras/números: avisa e não abre o seletor. */
  const tituloInvalido = () =>
    tituloCapa !== undefined && !nomeCapa(tituloCapa, { name: "", type: "image/jpeg" });

  function abrirSeletor() {
    if (tituloInvalido()) {
      toast.error(ea.deCodigo("tituloCapaAusente"));
      return;
    }
    inputArquivo.current?.click();
  }

  async function selecionar(arquivo?: File | null) {
    if (!arquivo) return; // seletor cancelado: nada muda
    const erro = validarImagem(arquivo);
    if (erro) {
      toast.error(ea.deCodigo(erro));
      if (inputArquivo.current) inputArquivo.current.value = "";
      return;
    }
    setEnviando(true);
    try {
      const url =
        tituloCapa !== undefined
          ? await enviarCapa(arquivo, pasta, tituloCapa)
          : await enviarImagem(arquivo, pasta);
      aoMudar(url);
      toast.success(t.imagemEnviada);
    } catch (e) {
      toast.error(ea.deErro(e, t.erroEnviar));
    } finally {
      setEnviando(false);
      if (inputArquivo.current) inputArquivo.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <Label>{rotulo ?? t.imagemCapa}</Label>

      {/* Pré-visualização de como a capa vai aparecer no site */}
      <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-muted/50">
        {valor ? (
          <img
                  loading="lazy"
                  decoding="async"
            src={valor}
            alt={t.previa}
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center text-sm text-muted-foreground">
            {t.nenhumaImagem}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputArquivo}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void selecionar(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={enviando}
          onClick={abrirSeletor}
        >
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {enviando ? t.enviando : valor ? t.trocarImagem : t.enviarImagem}
        </Button>
        {valor && (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => aoMudar(null)}
          >
            <Trash2 className="size-4" /> {t.remover}
          </Button>
        )}
      </div>

      <Input
        placeholder={t.colarUrl}
        value={valor ?? ""}
        onChange={(e) => aoMudar(e.target.value || null)}
      />
    </div>
  );
}

/**
 * Envio de mídias extras (fotos do projeto/notícia). Mostra as miniaturas
 * enviadas e permite copiar a URL para usar dentro do texto.
 */
export function UploadMidia({ pasta }: { pasta: string }) {
  const m = useMensagens(midia);
  const ea = useMensagemArquivo();
  const t = m.upload;
  const inputArquivo = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);

  async function selecionar(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    setEnviando(true);
    try {
      for (const arquivo of Array.from(arquivos)) {
        const erro = validarImagem(arquivo);
        if (erro) {
          toast.error(`${arquivo.name}: ${ea.deCodigo(erro)}`);
          continue;
        }
        const url = await enviarImagem(arquivo, `${pasta}/midia`);
        setUrls((atuais) => [...atuais, url]);
      }
      toast.success(t.midiaEnviada);
    } catch (e) {
      toast.error(ea.deErro(e, t.erroEnviarMidia));
    } finally {
      setEnviando(false);
      if (inputArquivo.current) inputArquivo.current.value = "";
    }
  }

  async function copiar(url: string) {
    await navigator.clipboard.writeText(url);
    toast.success(m.biblioteca.enderecoCopiado);
  }

  return (
    <div className="space-y-3">
      <Label>{t.midiaAdicional}</Label>
      <p className="text-xs text-muted-foreground">
        {t.midiaDica}
      </p>

      {urls.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((url) => (
            <li key={url} className="space-y-1">
              <img
                  loading="lazy"
                  decoding="async"
                src={url}
                alt={t.midiaAlt}
                className="aspect-square w-full rounded-xl object-cover"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="w-full rounded-full text-xs"
                onClick={() => void copiar(url)}
              >
                <Copy className="size-3" /> {m.biblioteca.copiar}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputArquivo}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void selecionar(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        disabled={enviando}
        onClick={() => inputArquivo.current?.click()}
      >
        {enviando ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        {enviando ? t.enviando : t.enviarFotos}
      </Button>
    </div>
  );
}
