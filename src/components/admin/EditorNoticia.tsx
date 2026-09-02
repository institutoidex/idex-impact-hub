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
import { gerarSlug, useSalvarNoticia, type NoticiaForm } from "@/lib/mutations";
import type { NoticiaRow } from "@/lib/db-types";
import { UploadCapa, UploadMidia } from "@/components/admin/UploadImagem";


/** Formulário de criação/edição de notícia dentro de um diálogo. */
export function EditorNoticia({
  aberto,
  aoFechar,
  noticia,
}: {
  aberto: boolean;
  aoFechar: () => void;
  noticia?: NoticiaRow | null;
}) {
  const salvar = useSalvarNoticia();
  const [form, setForm] = useState<NoticiaForm>(vazia());

  // Recarrega os campos sempre que abrir para editar outro registro
  useEffect(() => {
    if (!aberto) return;
    setForm(
      noticia
        ? {
            id: noticia.id,
            slug: noticia.slug,
            titulo: noticia.titulo,
            resumo: noticia.resumo,
            conteudo: noticia.conteudo,
            imagem_url: noticia.imagem_url,
            projeto_slug: noticia.projeto_slug,
            publicado: noticia.publicado,
            publicado_em: (noticia.publicado_em ?? "").slice(0, 10),
          }
        : vazia(),
    );
  }, [aberto, noticia]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    await salvar.mutateAsync({
      ...form,
      slug: form.slug || gerarSlug(form.titulo),
      imagem_url: form.imagem_url || null,
      conteudo: form.conteudo || null,
      projeto_slug: form.projeto_slug || null,
      publicado_em: form.publicado_em || new Date().toISOString().slice(0, 10),
    });
    aoFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{noticia ? "Editar notícia" : "Nova notícia"}</DialogTitle>
          <DialogDescription>
            O que estiver publicado aparece na hora na página de Notícias.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
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
            <Label htmlFor="slug">Endereço (slug)</Label>
            <Input
              id="slug"
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: gerarSlug(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumo">Resumo</Label>
            <Textarea
              id="resumo"
              required
              rows={2}
              value={form.resumo}
              onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conteudo">Texto completo</Label>
            <Textarea
              id="conteudo"
              rows={6}
              value={form.conteudo ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
            />
          </div>

          {/* Capa com envio de arquivo e pré-visualização */}
          <UploadCapa
            valor={form.imagem_url || null}
            aoMudar={(url) => setForm((f) => ({ ...f, imagem_url: url }))}
            pasta="noticias"
          />

          <UploadMidia pasta="noticias" />


          <div className="space-y-2">
            <Label htmlFor="data">Data de publicação</Label>
            <Input
              id="data"
              type="date"
              value={form.publicado_em}
              onChange={(e) => setForm((f) => ({ ...f, publicado_em: e.target.value }))}
            />
          </div>


          <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
            <Switch
              id="publicado"
              checked={form.publicado}
              onCheckedChange={(v) => setForm((f) => ({ ...f, publicado: v }))}
            />
            <Label htmlFor="publicado" className="cursor-pointer">
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

/** Estado inicial de uma notícia nova. */
function vazia(): NoticiaForm {
  return {
    slug: "",
    titulo: "",
    resumo: "",
    conteudo: "",
    imagem_url: "",
    projeto_slug: null,
    publicado: false,
    publicado_em: new Date().toISOString().slice(0, 10),
  };
}
