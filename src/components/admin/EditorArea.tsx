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
import type { AreaRow } from "@/lib/db-types";

/** Edição dos textos de uma área de atuação (o slug e o ícone seguem fixos). */
export function EditorArea({
  aberto,
  aoFechar,
  area,
}: {
  aberto: boolean;
  aoFechar: () => void;
  area: AreaRow | null;
}) {
  const salvar = useSalvarArea();
  const [form, setForm] = useState<AreaForm | null>(null);

  useEffect(() => {
    if (!aberto || !area) return;
    setForm({
      id: area.id,
      slug: area.slug,
      nome: area.nome,
      resumo: area.resumo,
      descricao: area.descricao,
      ordem: area.ordem,
    });
  }, [aberto, area]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    await salvar.mutateAsync(form);
    aoFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar área</DialogTitle>
          <DialogDescription>
            Os textos aparecem na página de Áreas de Atuação e no topo da página da área.
          </DialogDescription>
        </DialogHeader>

        {form && (
          <form onSubmit={enviar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="a-nome">Nome</Label>
              <Input
                id="a-nome"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="a-ordem">Ordem de exibição</Label>
                <Input
                  id="a-ordem"
                  type="number"
                  min={0}
                  value={form.ordem}
                  onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={`/areas/${form.slug}`} readOnly className="text-muted-foreground" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-full" onClick={aoFechar}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-full" disabled={salvar.isPending}>
                {salvar.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
