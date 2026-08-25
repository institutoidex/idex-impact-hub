import {
  GraduationCap,
  Palette,
  Trophy,
  Leaf,
  Briefcase,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import type { Area } from "@/data/idex";

// Mapeia o nome do ícone salvo nos dados para o componente lucide correspondente.
const MAPA: Record<Area["icone"], LucideIcon> = {
  GraduationCap,
  Palette,
  Trophy,
  Leaf,
  Briefcase,
  HeartPulse,
};

export function AreaIcon({
  icone,
  className,
}: {
  icone: Area["icone"];
  className?: string;
}) {
  const Icone = MAPA[icone];
  return <Icone className={className} aria-hidden />;
}
