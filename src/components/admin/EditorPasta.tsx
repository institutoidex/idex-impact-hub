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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useMensagens } from "@/i18n/mensagens";
import { editores } from "@/i18n/catalogos/editores";
import { lerTraducoes, limparTraducoes, type Traducoes } from "@/i18n/traduzir";

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
  const t = useMensagens(editores);
  const salvar = useSalvarPasta();
  const [form, setForm] = useState<PastaForm | null>(null);
  const [slugEditado, setSlugEditado] = useState(false);
  const [trad, setTrad] = useState<Traducoes>({});

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
    setTrad(lerTraducoes(pasta?.traducoes));
  }, [aberto, pasta, paiPadrao]);

  function campoTrad(locale: "en-US" | "es-ES") {
    return trad[locale]?.nome ?? "";
  }

  function mudarTrad(locale: "en-US" | "es-ES", valor: string) {
    setTrad((v) => ({ ...v, [locale]: { ...v[locale], nome: valor } }));
  }

  // Uma pasta não pode ser mãe dela mesma nem de uma descendente
  const proibidos = pasta ? idsDescendentes(pastas, pasta.id) : [];
  const opcoes = achatar(montarArvore(pastas)).filter((p) => !proibidos.includes(p.id));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    await salvar.mutateAsync({
      ...form,
      slug: form.slug || gerarSlug(form.nome),
      traducoes: limparTraducoes(trad),
      traducoesColunaExistente: Boolean(pasta && "traducoes" in pasta),
    });
    aoFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{pasta ? t.pasta.tituloEditar : t.pasta.tituloNova}</DialogTitle>
          <DialogDescription>{t.pasta.descricao}</DialogDescription>
        </DialogHeader>

        {form && (
          <form onSubmit={enviar} className="space-y-4">
            <Tabs defaultValue="pt" className="w-full">
              <TabsList>
                <TabsTrigger value="pt">{t.traducao.portugues}</TabsTrigger>
                <TabsTrigger value="en">{t.traducao.ingles}</TabsTrigger>
                <TabsTrigger value="es">{t.traducao.espanhol}</TabsTrigger>
              </TabsList>

              <TabsContent value="pt" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="p-nome">{t.pasta.campoNome}</Label>
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
              </TabsContent>

              <TabsContent value="en" className="space-y-4 pt-2">
                <p className="text-xs text-muted-foreground">{t.traducao.aviso}</p>
                <div className="space-y-2">
                  <Label htmlFor="p-en-nome">{t.pasta.campoNome}</Label>
                  <Input
                    id="p-en-nome"
                    value={campoTrad("en-US")}
                    onChange={(e) => mudarTrad("en-US", e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="es" className="space-y-4 pt-2">
                <p className="text-xs text-muted-foreground">{t.traducao.aviso}</p>
                <div className="space-y-2">
                  <Label htmlFor="p-es-nome">{t.pasta.campoNome}</Label>
                  <Input
                    id="p-es-nome"
                    value={campoTrad("es-ES")}
                    onChange={(e) => mudarTrad("es-ES", e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="p-slug">{t.pasta.campoSlug}</Label>
              <Input
                id="p-slug"
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugEditado(true);
                  setForm({ ...form, slug: gerarSlug(e.target.value) });
                }}
              />
              <p className="text-xs text-muted-foreground">{t.pasta.enderecoPrevia(form.slug || "...")}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t.pasta.campoPastaMae}</Label>
                <Select
                  value={form.pasta_id ?? RAIZ}
                  onValueChange={(v) => setForm({ ...form, pasta_id: v === RAIZ ? null : v })}
                >
                  <SelectTrigger aria-label={t.pasta.arialabelPastaMae}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RAIZ}>{t.pasta.nenhumaPrimeiroNivel}</SelectItem>
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
                <Label htmlFor="p-ordem">{t.pasta.campoOrdem}</Label>
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
                {t.acoes.cancelar}
              </Button>
              <Button type="submit" className="rounded-full" disabled={salvar.isPending}>
                {salvar.isPending ? t.acoes.salvando : pasta ? t.acoes.salvar : t.pasta.criarPasta}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
