// Componente único de imagem do site.
// Centraliza as boas práticas de performance: lazy loading, decodificação
// assíncrona, dimensões declaradas (evita "pulo" de layout) e srcset/sizes
// para o celular baixar só a versão pequena da foto.
// Com `ampliavel`, a imagem vira um botão que abre o visor em tela cheia.
import { useState, type ImgHTMLAttributes } from "react";
import { Maximize2 } from "lucide-react";
import type { Foto } from "@/data/fotos";
import VisorFotos from "@/components/VisorFotos";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  /** Foto do acervo (traz srcset responsivo) ou URL simples vinda do banco */
  foto?: Foto | undefined;
  src?: string | undefined;
  alt?: string | undefined;
  /** true para a imagem principal da página (LCP): carrega já, sem lazy */
  prioridade?: boolean;
  /** Dica de largura renderizada, para o navegador escolher a variante certa */
  sizes?: string;
  /** true permite clicar para expandir a imagem em tela cheia */
  ampliavel?: boolean;
};

export function Imagem({
  foto,
  src,
  alt,
  prioridade = false,
  sizes = "100vw",
  width,
  height,
  ampliavel = false,
  className = "",
  ...resto
}: Props) {
  const [aberta, setAberta] = useState(false);
  const url = foto?.url ?? src;
  if (!url) return null;

  const img = (
    <img
      src={url}
      srcSet={foto?.srcSet}
      sizes={foto?.srcSet ? sizes : undefined}
      alt={alt ?? foto?.alt ?? ""}
      width={width ?? foto?.largura ?? 1400}
      height={height ?? foto?.altura ?? 900}
      loading={prioridade ? "eager" : "lazy"}
      decoding={prioridade ? "sync" : "async"}
      fetchPriority={prioridade ? "high" : "auto"}
      className={className}
      {...resto}
    />
  );

  if (!ampliavel) return img;

  const fotoVisor: Foto = foto ?? { url, alt: alt ?? "" };

  return (
    <>
      <button
        type="button"
        onClick={() => setAberta(true)}
        aria-label={`Ampliar imagem: ${fotoVisor.alt}`}
        className="group relative block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {img}
        {/* dica visual de que dá para expandir */}
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 p-2 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="size-4" />
        </span>
      </button>
      {aberta && <VisorFotos fotos={[fotoVisor]} onFechar={() => setAberta(false)} />}
    </>
  );
}

export default Imagem;
