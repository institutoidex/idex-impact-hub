import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enviarImagem, validarImagem } from "@/lib/storage";

/**
 * Campo de capa: envia a imagem para o armazenamento, mostra a pré-visualização
 * e mantém a possibilidade de colar uma URL externa.
 */
export function UploadCapa({
  valor,
  aoMudar,
  pasta,
  rotulo = "Imagem de capa",
}: {
  valor: string | null;
  aoMudar: (url: string | null) => void;
  pasta: string;
  rotulo?: string;
}) {
  const inputArquivo = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  async function selecionar(arquivo?: File | null) {
    if (!arquivo) return;
    const erro = validarImagem(arquivo);
    if (erro) {
      toast.error(erro);
      return;
    }
    setEnviando(true);
    try {
      const url = await enviarImagem(arquivo, pasta);
      aoMudar(url);
      toast.success("Imagem enviada.");
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível enviar a imagem.");
    } finally {
      setEnviando(false);
      if (inputArquivo.current) inputArquivo.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <Label>{rotulo}</Label>

      {/* Pré-visualização de como a capa vai aparecer no site */}
      <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-muted/50">
        {valor ? (
          <img
                  loading="lazy"
                  decoding="async"
            src={valor}
            alt="Pré-visualização da capa"
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center text-sm text-muted-foreground">
            Nenhuma imagem escolhida
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
          onClick={() => inputArquivo.current?.click()}
        >
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {enviando ? "Enviando..." : valor ? "Trocar imagem" : "Enviar imagem"}
        </Button>
        {valor && (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => aoMudar(null)}
          >
            <Trash2 className="size-4" /> Remover
          </Button>
        )}
      </div>

      <Input
        placeholder="ou cole uma URL: https://..."
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
          toast.error(`${arquivo.name}: ${erro}`);
          continue;
        }
        const url = await enviarImagem(arquivo, `${pasta}/midia`);
        setUrls((atuais) => [...atuais, url]);
      }
      toast.success("Mídia enviada.");
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível enviar a mídia.");
    } finally {
      setEnviando(false);
      if (inputArquivo.current) inputArquivo.current.value = "";
    }
  }

  async function copiar(url: string) {
    await navigator.clipboard.writeText(url);
    toast.success("Endereço copiado.");
  }

  return (
    <div className="space-y-3">
      <Label>Mídia adicional</Label>
      <p className="text-xs text-muted-foreground">
        Fotos extras para usar no texto. Depois de enviar, copie o endereço da imagem.
      </p>

      {urls.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((url) => (
            <li key={url} className="space-y-1">
              <img
                  loading="lazy"
                  decoding="async"
                src={url}
                alt="Mídia enviada"
                className="aspect-square w-full rounded-xl object-cover"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="w-full rounded-full text-xs"
                onClick={() => void copiar(url)}
              >
                <Copy className="size-3" /> Copiar
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
        {enviando ? "Enviando..." : "Enviar fotos"}
      </Button>
    </div>
  );
}
