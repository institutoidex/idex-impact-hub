import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSalvarArea, type AreaForm } from "@/lib/mutations";
import { AreaIcon, ICONES_AREA } from "@/components/AreaIcon";
import type { Area } from "@/data/idex";
import type { AreaRow } from "@/lib/db-types";

/** Opções de cor do selo da área, sempre com tokens da paleta oficial. */
const CORES = [
  { rotulo: "Verde", classe: "bg-primary text-primary-foreground" },
  { rotulo: "Azul", classe: "bg-secondary text-secondary-foreground" },
  { rotulo: "Amarelo", classe: "bg-brand-yellow text-foreground" },
  { rotulo: "Neutro", classe: "bg-muted text-foreground" },
] as const;

/** Gera um slug amigável a partir do nome (minúsculas, sem acentos). */
function gerarSlug(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Criação e edição de uma área de atuação (textos, ícone, cor e ordem). */
export function EditorArea({
  aberto,
  aoFechar,
  area,
}: {
  aberto: boolean;
  aoFechar: () => void;
  area: AreaRow | null; // null + aberto = cadastro de nova área
}) {
  const salvar = useSalvarArea();
  const [form, setForm] = useState<AreaForm | null>(null);
  const [slugEditado, setSlugEditado] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setSlugEditado(Boolean(area));
    setForm(
      area
        ? {
            id: area.id,
            slug: area.slug,
            nome: area.nome,
            resumo: area.resumo,
            descricao: area.descricao,
            icone: area.icone,
            cor: area.cor,
            ordem: area.ordem,
          }
        : {
            slug: "",
            nome: "",
            resumo: "",
            descricao: "",
            icone: "Trophy",
            cor: CORES[0].classe,
            ordem: 0,
          },
    );
  }, [aberto, area]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    await salvar.mutateAsync(form);
    aoFechar();
  }

  const criando = aberto && !area;

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{criando ? "Nova área" : "Editar área"}</DialogTitle>
          <DialogDescription>
            As áreas aparecem na home, no menu e nas páginas de Áreas de Atuação.
          </DialogDescription>
        </DialogHeader>

        {form && (
          <form onSubmit={enviar} className="space-y-4">
            {/* Pré-visualização do selo como aparece no site */}
            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/40 p-4">
              <span className={`grid size-16 shrink-0 place-items-center rounded-full ${form.cor}`}>
                <AreaIcon icone={form.icone as Area["icone"]} className="size-7" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{form.nome || "Nome da área"}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {form.resumo || "O resumo aparece aqui."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="a-nome">Nome</Label>
                <Input
                  id="a-nome"
                  required
                  value={form.nome}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nome: e.target.value,
                      // no cadastro, o endereço acompanha o nome até ser editado à mão
                      slug: slugEditado ? form.slug : gerarSlug(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-slug">Endereço (slug)</Label>
                <Input
                  id="a-slug"
                  required
                  value={form.slug}
                  disabled={!criando}
                  onChange={(e) => {
                    setSlugEditado(true);
                    setForm({ ...form, slug: gerarSlug(e.target.value) });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  /areas/{form.slug || "..."}
                  {!criando && " · fixo para não quebrar links"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="a-resumo">Resumo</Label>
              <Textarea
                id="a-resumo"
                rows={2}
                value={form.resumo}
                onChange={(e) => setForm({ ...form, resumo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="a-descricao">Descrição</Label>
              <Textarea
                id="a-descricao"
                rows={6}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>

            {/* Seletor de ícone */}
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2">
                {ICONES_AREA.map((icone) => (
                  <button
                    key={icone}
                    type="button"
                    aria-label={`Ícone ${icone}`}
                    aria-pressed={form.icone === icone}
                    onClick={() => setForm({ ...form, icone })}
                    className={`grid size-11 place-items-center rounded-xl border transition-colors ${
                      form.icone === icone
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <AreaIcon icone={icone} className="size-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Seletor de cor do selo */}
            <div className="space-y-2">
              <Label>Cor do selo</Label>
              <div className="flex flex-wrap gap-2">
                {CORES.map((cor) => (
                  <button
                    key={cor.classe}
                    type="button"
                    aria-pressed={form.cor === cor.classe}
                    onClick={() => setForm({ ...form, cor: cor.classe })}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      form.cor === cor.classe
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className={`size-4 rounded-full ${cor.classe}`} aria-hidden />
                    {cor.rotulo}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 sm:max-w-40">
              <Label htmlFor="a-ordem">Ordem de exibição</Label>
              <Input
                id="a-ordem"
                type="number"
                min={0}
                value={form.ordem}
                onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-full" onClick={aoFechar}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-full" disabled={salvar.isPending}>
                {salvar.isPending ? "Salvando..." : criando ? "Criar área" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
