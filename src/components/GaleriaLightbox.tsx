// Galeria de fotos: miniaturas clicáveis que abrem o visor em tela cheia.
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import VisorFotos from "@/components/VisorFotos";
import { Maximize2 } from "lucide-react";

import type { Foto } from "@/data/fotos";
import { altDaFoto } from "@/data/fotos";
import { useLocale, useMensagens } from "@/i18n/mensagens";
import { galeria } from "@/i18n/catalogos/galeria";

export type FotoGaleria = Foto;

export default function GaleriaLightbox({
  fotos,
  className = "",
}: {
  fotos: FotoGaleria[];
  className?: string;
}) {
  // índice da foto aberta (null = visor fechado)
  const locale = useLocale();
  const t = useMensagens(galeria);
  const [aberta, setAberta] = useState<number | null>(null);

  return (
    <>
      <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 ${className}`}>
        {fotos.map((f, i) => {
          const alt = altDaFoto(f, locale);
          return (
          <Reveal key={f.url} delay={i * 50}>
            <button
              type="button"
              onClick={() => setAberta(i)}
              aria-label={t.ampliarFoto(alt)}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <img
                src={f.url}
                srcSet={f.srcSet}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                alt={alt}
                loading="lazy"
                decoding="async"
                width={f.largura ?? 1400}
                height={f.altura ?? 900}
                className="lift aspect-[4/3] w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {/* dica visual de que dá para expandir */}
              <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <Maximize2 className="size-4" />
              </span>
            </button>
          </Reveal>
          );
        })}
      </div>

      {aberta !== null && (
        <VisorFotos fotos={fotos} inicial={aberta} onFechar={() => setAberta(null)} />
      )}
    </>
  );
}
