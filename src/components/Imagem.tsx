// Componente único de imagem do site.
// Centraliza as boas práticas de performance: lazy loading, decodificação
// assíncrona, dimensões declaradas (evita "pulo" de layout) e srcset/sizes
// para o celular baixar só a versão pequena da foto.
import type { ImgHTMLAttributes } from "react";
import type { Foto } from "@/data/fotos";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  /** Foto do acervo (traz srcset responsivo) ou URL simples vinda do banco */
  foto?: Foto;
  src?: string;
  alt?: string;
  /** true para a imagem principal da página (LCP): carrega já, sem lazy */
  prioridade?: boolean;
  /** Dica de largura renderizada, para o navegador escolher a variante certa */
  sizes?: string;
};

export function Imagem({
  foto,
  src,
  alt,
  prioridade = false,
  sizes = "100vw",
  width,
  height,
  ...resto
}: Props) {
  const url = foto?.url ?? src;
  if (!url) return null;

  return (
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
      {...resto}
    />
  );
}

export default Imagem;
