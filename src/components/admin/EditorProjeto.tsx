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
import { Switch } from "@/components/ui/switch";
import { gerarSlug, useSalvarProjeto, type ProjetoForm } from "@/lib/mutations";
import type { ProjetoRow } from "@/lib/db-types";
import { UploadCapa, UploadMidia } from "@/components/admin/UploadImagem";

/**
 * Cadastro/edição de projeto — mesmo fluxo simples das notícias:
 * título, endereço, resumo, texto, capa, data e publicar.
 */
export function EditorProjeto({
  aberto,
  aoFechar,
  projeto,
}: {
  aberto: boolean;
  aoFechar: () => void;
  projeto?: ProjetoRow | null;
}) {
  const salvar = useSalvarProjeto();
  const [form, setForm] = useState<ProjetoForm>(vazio());

  // Recarrega os campos sempre que abrir para editar outro registro
  useEffect(() => {
    if (!aberto) return;
    setForm(
      projeto
        ? {
            id: projeto.id,
            slug: projeto.slug,
            titulo: projeto.titulo,
            resumo: projeto.resumo,
            descricao: projeto.descricao,
            imagem_url: projeto.imagem_url,
            iniciado_em: (projeto.iniciado_em ?? "").slice(0, 10) || null,
            publicado: projeto.publicado,
          }
        : vazio(),
    );
  }, [aberto, projeto]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    await salvar.mutateAsync({
      ...form,
      slug: form.slug || gerarSlug(form.titulo),
      imagem_url: form.imagem_url || null,
      iniciado_em: form.iniciado_em || null,
    });
    aoFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{projeto ? "Editar projeto" : "Novo projeto"}</DialogTitle>
          <DialogDescription>
            O que estiver publicado aparece na hora na página de Projetos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-titulo">Título</Label>
            <Input
              id="p-titulo"
              required
              value={form.titulo}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  titulo: e.target.value,
                  slug: f.id ? f.slug : gerarSlug(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-slug">Endereço (slug)</Label>
            <Input
              id="p-slug"
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: gerarSlug(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-resumo">Resumo</Label>
            <Textarea
              id="p-resumo"
              required
              rows={2}
              value={form.resumo}
              onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-descricao">Texto completo</Label>
            <Textarea
              id="p-descricao"
              rows={6}
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            />
          </div>

          {/* Capa com envio de arquivo e pré-visualização */}
          <UploadCapa
            valor={form.imagem_url || null}
            aoMudar={(url) => setForm((f) => ({ ...f, imagem_url: url }))}
            pasta="projetos"
          />

          <UploadMidia pasta="projetos" />

          <div className="space-y-2">
            <Label htmlFor="p-inicio">Data do projeto</Label>
            <Input
              id="p-inicio"
              type="date"
              value={form.iniciado_em ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, iniciado_em: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
            <Switch
              id="p-publicado"
              checked={form.publicado}
              onCheckedChange={(v) => setForm((f) => ({ ...f, publicado: v }))}
            />
            <Label htmlFor="p-publicado" className="cursor-pointer">
              Publicar no site
            </Label>
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
      </DialogContent>
    </Dialog>
  );
}

/** Estado inicial de um projeto novo. */
function vazio(): ProjetoForm {
  return {
    slug: "",
    titulo: "",
    resumo: "",
    descricao: "",
    imagem_url: "",
    iniciado_em: new Date().toISOString().slice(0, 10),
    publicado: false,
  };
}
