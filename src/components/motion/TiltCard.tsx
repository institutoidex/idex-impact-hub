import { useEffect, useRef, type ReactNode } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

/**
 * Card com leve inclinação 3D seguindo o mouse (microinteração sutil).
 * Em telas touch ou com movimento reduzido, nada acontece.
 */
export function TiltCard({
  children,
  className,
  intensidade = 6,
}: {
  children: ReactNode;
  className?: string;
  intensidade?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const mover = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      animate(el, {
        rotateY: px * intensidade,
        rotateX: -py * intensidade,
        duration: 400,
        ease: "outQuad",
      });
    };
    const sair = () => {
      animate(el, { rotateX: 0, rotateY: 0, duration: 600, ease: "outElastic(1, .6)" });
    };

    el.addEventListener("mousemove", mover);
    el.addEventListener("mouseleave", sair);
    return () => {
      el.removeEventListener("mousemove", mover);
      el.removeEventListener("mouseleave", sair);
    };
  }, [intensidade]);

  return (
    <div ref={ref} className={cn("[transform-style:preserve-3d] [perspective:900px]", className)}>
      {children}
    </div>
  );
}
