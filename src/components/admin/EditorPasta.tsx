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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSalvarPasta, type PastaForm } from "@/lib/mutations";
import { achatar, gerarSlug, idsDescendentes, montarArvore } from "@/lib/pastas";
import type { PastaRow } from "@/lib/db-types";

const RAIZ = "__raiz__"; // valor do select para "nenhuma pasta mãe"

/** Cria ou edita uma pasta/subpasta de documentos. */
export function EditorPasta({
  aberto,
  aoFechar,
  pasta,
  paiPadrao,
  pastas,
}: {
  aberto: boolean;
  aoFechar: () => void;
  /** null = criando uma pasta nova */
  pasta: PastaRow | null;
  /** pasta mãe sugerida ao criar (quando veio do botão "nova subpasta") */
  paiPadrao?: string | null;
  pastas: PastaRow[];
}) {
  const salvar = useSalvarPasta();
  const [form, setForm] = useState<PastaForm | null>(null);
  const [slugEditado, setSlugEditado] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setSlugEditado(Boolean(pasta));
    setForm(
      pasta
        ? {
            id: pasta.id,
            nome: pasta.nome,
            slug: pasta.slug,
            pasta_id: pasta.pasta_id,
            ordem: pasta.ordem,
          }
        : { nome: "", slug: "", pasta_id: paiPadrao ?? null, ordem: 0 },
    );
  }, [aberto, pasta, paiPadrao]);

  // Uma pasta não pode ser mãe dela mesma nem de uma descendente
  const proibidos = pasta ? idsDescendentes(pastas, pasta.id) : [];
  const opcoes = achatar(montarArvore(pastas)).filter((p) => !proibidos.includes(p.id));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    await salvar.mutateAsync({ ...form, slug: form.slug || gerarSlug(form.nome) });
    aoFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{pasta ? "Editar pasta" : "Nova pasta"}</DialogTitle>
          <DialogDescription>
            Pastas de primeiro nível aparecem no menu de Transparência. Subpastas ficam dentro
            delas, sem limite de níveis.
          </DialogDescription>
        </DialogHeader>

        {form && (
          <form onSubmit={enviar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-nome">Nome</Label>
              <Input
                id="p-nome"
                required
                value={form.nome}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nome: e.target.value,
                    slug: slugEditado ? form.slug : gerarSlug(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-slug">Endereço (slug)</Label>
              <Input
                id="p-slug"
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugEditado(true);
                  setForm({ ...form, slug: gerarSlug(e.target.value) });
                }}
              />
              <p className="text-xs text-muted-foreground">
                /transparencia?pasta={form.slug || "..."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Pasta mãe</Label>
                <Select
                  value={form.pasta_id ?? RAIZ}
                  onValueChange={(v) => setForm({ ...form, pasta_id: v === RAIZ ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RAIZ}>Nenhuma (primeiro nível)</SelectItem>
                    {opcoes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {"— ".repeat(p.nivel)}
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-ordem">Ordem</Label>
                <Input
                  id="p-ordem"
                  type="number"
                  min={0}
                  value={form.ordem}
                  onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-full" onClick={aoFechar}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-full" disabled={salvar.isPending}>
                {salvar.isPending ? "Salvando..." : pasta ? "Salvar" : "Criar pasta"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
