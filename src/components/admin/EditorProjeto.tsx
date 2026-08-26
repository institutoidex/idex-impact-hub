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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { gerarSlug, useSalvarProjeto, type ProjetoForm } from "@/lib/mutations";
import { AREAS } from "@/data/idex";
import type { ProjetoRow } from "@/lib/db-types";
import { UploadCapa, UploadMidia } from "@/components/admin/UploadImagem";


/** Formulário de criação/edição de projeto dentro de um diálogo. */
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
            area_slug: projeto.area_slug,
            imagem_url: projeto.imagem_url,
            local: projeto.local,
            parceiro: projeto.parceiro,
            status: projeto.status,
            iniciado_em: (projeto.iniciado_em ?? "").slice(0, 10) || null,
            beneficiados: projeto.beneficiados,
            destaque: projeto.destaque,
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
      local: form.local || null,
      parceiro: form.parceiro || null,
      iniciado_em: form.iniciado_em || null,
      beneficiados: form.beneficiados ?? null,
    });
    aoFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{projeto ? "Editar projeto" : "Novo projeto"}</DialogTitle>
          <DialogDescription>
            Projetos publicados aparecem na hora nas páginas de Projetos e Áreas.
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
            <Label htmlFor="p-descricao">Descrição</Label>
            <Textarea
              id="p-descricao"
              rows={6}
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Área de atuação</Label>
              <Select
                value={form.area_slug ?? ""}
                onValueChange={(v) => setForm((f) => ({ ...f, area_slug: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => (
                    <SelectItem key={a.slug} value={a.slug}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="em-breve">Em breve</SelectItem>
                  <SelectItem value="encerrado">Encerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-local">Local</Label>
              <Input
                id="p-local"
                value={form.local ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-parceiro">Parceiro</Label>
              <Input
                id="p-parceiro"
                value={form.parceiro ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, parceiro: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-inicio">Início</Label>
              <Input
                id="p-inicio"
                type="date"
                value={form.iniciado_em ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, iniciado_em: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-benef">Pessoas atendidas</Label>
              <Input
                id="p-benef"
                type="number"
                min={0}
                value={form.beneficiados ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    beneficiados: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          {/* Capa com envio de arquivo e pré-visualização */}
          <UploadCapa
            valor={form.imagem_url || null}
            aoMudar={(url) => setForm((f) => ({ ...f, imagem_url: url }))}
            pasta="projetos"
          />

          <UploadMidia pasta="projetos" />


          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
              <Switch
                id="p-destaque"
                checked={form.destaque}
                onCheckedChange={(v) => setForm((f) => ({ ...f, destaque: v }))}
              />
              <Label htmlFor="p-destaque" className="cursor-pointer">
                Destaque na home
              </Label>
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
    area_slug: null,
    imagem_url: "",
    local: "",
    parceiro: "",
    status: "ativo",
    iniciado_em: null,
    beneficiados: null,
    destaque: false,
    publicado: false,
  };
}
