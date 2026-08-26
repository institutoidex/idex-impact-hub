import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaIcon } from "@/components/AreaIcon";
import { useReordenarAreas } from "@/lib/mutations";
import type { AreaRow } from "@/lib/db-types";
import type { Area } from "@/data/idex";

/**
 * Lista de áreas de atuação com reordenação por arrastar e soltar.
 * A nova ordem é salva no banco (campo `ordem`) assim que o item é solto,
 * refletindo imediatamente na home, no menu e nas páginas públicas.
 */

type Props = {
  areas: AreaRow[];
  aoEditar: (area: AreaRow) => void;
  aoExcluir: (area: AreaRow) => void;
};

export function ListaAreasOrdenavel({ areas, aoEditar, aoExcluir }: Props) {
  // Cópia local para animar o arraste sem esperar o refetch do banco
  const [itens, setItens] = useState<AreaRow[]>(areas);
  const reordenar = useReordenarAreas();

  // Sincroniza a cópia local quando os dados do banco mudam (refetch/realtime)
  useEffect(() => {
    setItens(areas);
  }, [areas]);

  // Sensores: mouse/toque (Pointer) e teclado (setas + espaço) para acessibilidade
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** Ao soltar: reordena a cópia local e persiste a nova sequência no banco. */
  function aoSoltar(evento: DragEndEvent) {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;

    const origem = itens.findIndex((a) => a.id === active.id);
    const destino = itens.findIndex((a) => a.id === over.id);
    if (origem < 0 || destino < 0) return;

    const novaOrdem = arrayMove(itens, origem, destino);
    setItens(novaOrdem); // atualização otimista — a animação não espera o banco
    reordenar.mutate(novaOrdem.map((a) => a.id));
  }

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <GripVertical className="size-3.5" />
        Arraste pela alça para mudar a ordem de exibição no site.
      </p>
      <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={aoSoltar}>
        <SortableContext items={itens.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {itens.map((area, indice) => (
            <ItemArea
              key={area.id}
              area={area}
              posicao={indice + 1}
              aoEditar={aoEditar}
              aoExcluir={aoExcluir}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

/** Um cartão de área arrastável (alça à esquerda, ações à direita). */
function ItemArea({
  area,
  posicao,
  aoEditar,
  aoExcluir,
}: {
  area: AreaRow;
  posicao: number;
  aoEditar: (area: AreaRow) => void;
  aoExcluir: (area: AreaRow) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: area.id,
  });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6 ${
        isDragging
          ? "z-10 border-primary shadow-lg ring-2 ring-primary/20"
          : "border-border"
      }`}
    >
      {/* Alça de arraste — também focável e operável pelo teclado */}
      <button
        type="button"
        className="flex cursor-grab items-center gap-2 rounded-lg px-1 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary active:cursor-grabbing"
        aria-label={`Arrastar ${area.nome} para reordenar (posição atual: ${posicao})`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
        <span className="w-5 text-center text-xs font-semibold tabular-nums">{posicao}</span>
      </button>

      <span className={`grid size-12 shrink-0 place-items-center rounded-full ${area.cor}`}>
        <AreaIcon icone={area.icone as Area["icone"]} className="size-5" />
      </span>
      <div className="min-w-56 flex-1">
        <h2 className="text-lg">{area.nome}</h2>
        <p className="text-sm text-muted-foreground">{area.resumo}</p>
        <p className="mt-1 text-xs text-muted-foreground">/areas/{area.slug}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="rounded-full" onClick={() => aoEditar(area)}>
          <Pencil className="size-4" /> Editar
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          aria-label={`Apagar ${area.nome}`}
          onClick={() => aoExcluir(area)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </article>
  );
}
