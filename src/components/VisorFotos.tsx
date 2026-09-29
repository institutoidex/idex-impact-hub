// Visor (lightbox) de fotos em tela cheia: navegação por teclado (setas, Esc),
// zoom (+/-, roda do mouse, duplo clique) e arraste quando ampliada.
// Usado tanto pela galeria quanto por imagens avulsas clicáveis.
import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import type { Foto } from "@/data/fotos";

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;

export default function VisorFotos({
  fotos,
  inicial = 0,
  onFechar,
}: {
  fotos: Foto[];
  inicial?: number;
  onFechar: () => void;
}) {
  const [indice, setIndice] = useState(inicial);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const arrastando = useRef<{ x: number; y: number } | null>(null);
  const fechaRef = useRef<HTMLButtonElement>(null);

  const reset = useCallback(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const navegar = useCallback(
    (delta: number) => {
      setIndice((i) => (i + delta + fotos.length) % fotos.length);
      reset();
    },
    [fotos.length, reset],
  );

  const ajustarZoom = useCallback((delta: number) => {
    setZoom((z) => {
      const novo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(z + delta).toFixed(2)));
      if (novo === 1) setPos({ x: 0, y: 0 });
      return novo;
    });
  }, []);

  // atalhos de teclado enquanto o visor está aberto
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
      else if (e.key === "ArrowRight") navegar(1);
      else if (e.key === "ArrowLeft") navegar(-1);
      else if (e.key === "+" || e.key === "=") ajustarZoom(0.5);
      else if (e.key === "-" || e.key === "_") ajustarZoom(-0.5);
      else if (e.key === "0") reset();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fechaRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onFechar, navegar, ajustarZoom, reset]);

  const foto = fotos[indice];
  if (!foto) return null;
  const varias = fotos.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de fotos"
      className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-sm"
      onClick={onFechar}
    >
      {/* barra superior */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm text-white/70">
          {varias ? `${indice + 1} / ${fotos.length}` : ""}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => ajustarZoom(-0.5)}
            aria-label="Diminuir zoom"
            className="rounded-full p-2 hover:bg-white/15"
          >
            <ZoomOut className="size-5" />
          </button>
          <span className="w-12 text-center text-sm tabular-nums text-white/70">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => ajustarZoom(0.5)}
            aria-label="Aumentar zoom"
            className="rounded-full p-2 hover:bg-white/15"
          >
            <ZoomIn className="size-5" />
          </button>
          <button
            ref={fechaRef}
            type="button"
            onClick={onFechar}
            aria-label="Fechar (Esc)"
            className="ml-2 rounded-full p-2 hover:bg-white/15"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* imagem */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-4"
        onClick={(e) => {
          // clicar no fundo escuro (fora da imagem e dos botões) também fecha
          if (e.target === e.currentTarget) onFechar();
        }}
        onWheel={(e) => ajustarZoom(e.deltaY < 0 ? 0.25 : -0.25)}
      >
        {varias && (
          <button
            type="button"
            onClick={() => navegar(-1)}
            aria-label="Foto anterior"
            className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/25"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        <img
          src={foto.url}
          srcSet={foto.srcSet}
          sizes="100vw"
          alt={foto.alt}
          decoding="async"
          draggable={false}
          onDoubleClick={() => (zoom > 1 ? reset() : setZoom(2))}
          onPointerDown={(e) => {
            if (zoom === 1) return;
            arrastando.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!arrastando.current) return;
            setPos({ x: e.clientX - arrastando.current.x, y: e.clientY - arrastando.current.y });
          }}
          onPointerUp={() => (arrastando.current = null)}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})` }}
          className={`max-h-full max-w-full select-none rounded-lg object-contain transition-transform duration-150 ${
            zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
          }`}
        />

        {varias && (
          <button
            type="button"
            onClick={() => navegar(1)}
            aria-label="Próxima foto"
            className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/25"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>

      {/* dica de atalhos (sem legenda da foto) */}
      <div className="px-6 pb-6 text-center text-sm text-white/80" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs text-white/50">
          {varias ? "Setas para navegar · " : ""}+ / − para zoom · 0 para redefinir · Esc para fechar
        </p>
      </div>
    </div>
  );
}
