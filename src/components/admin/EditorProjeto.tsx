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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gerarSlug, useSalvarProjeto, type ProjetoForm } from "@/lib/mutations";
import type { ProjetoRow } from "@/lib/db-types";
import { UploadCapa, UploadMidia } from "@/components/admin/UploadImagem";
import { useMensagens } from "@/i18n/mensagens";
import { editores } from "@/i18n/catalogos/editores";
import { lerTraducoes, limparTraducoes, type Traducoes } from "@/i18n/traduzir";

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
  const t = useMensagens(editores);
  const salvar = useSalvarProjeto();
  const [form, setForm] = useState<ProjetoForm>(vazio());
  const [trad, setTrad] = useState<Traducoes>({});

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
    setTrad(lerTraducoes(projeto?.traducoes));
  }, [aberto, projeto]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    await salvar.mutateAsync({
      ...form,
      slug: form.slug || gerarSlug(form.titulo),
      imagem_url: form.imagem_url || null,
      iniciado_em: form.iniciado_em || null,
      traducoes: limparTraducoes(trad),
      traducoesColunaExistente: Boolean(projeto && "traducoes" in projeto),
    });
    aoFechar();
  }

  function campoTrad(locale: "en-US" | "es-ES", campo: "titulo" | "resumo" | "descricao") {
    return trad[locale]?.[campo] ?? "";
  }

  function mudarTrad(
    locale: "en-US" | "es-ES",
    campo: "titulo" | "resumo" | "descricao",
    valor: string,
  ) {
    setTrad((v) => ({ ...v, [locale]: { ...v[locale], [campo]: valor } }));
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{projeto ? t.projeto.tituloEditar : t.projeto.tituloNovo}</DialogTitle>
          <DialogDescription>{t.projeto.descricao}</DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-slug">{t.projeto.campoSlug}</Label>
            <Input
              id="p-slug"
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: gerarSlug(e.target.value) }))}
            />
          </div>

          <Tabs defaultValue="pt" className="w-full">
            <TabsList>
              <TabsTrigger value="pt">{t.traducao.portugues}</TabsTrigger>
              <TabsTrigger value="en">{t.traducao.ingles}</TabsTrigger>
              <TabsTrigger value="es">{t.traducao.espanhol}</TabsTrigger>
            </TabsList>

            <TabsContent value="pt" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="p-titulo">{t.projeto.campoTitulo}</Label>
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
                <Label htmlFor="p-resumo">{t.projeto.campoResumo}</Label>
                <Textarea
                  id="p-resumo"
                  required
                  rows={2}
                  value={form.resumo}
                  onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-descricao">{t.projeto.campoDescricao}</Label>
                <Textarea
                  id="p-descricao"
                  rows={6}
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">{t.traducao.aviso}</p>
              <div className="space-y-2">
                <Label htmlFor="p-en-titulo">{t.projeto.campoTitulo}</Label>
                <Input
                  id="p-en-titulo"
                  value={campoTrad("en-US", "titulo")}
                  onChange={(e) => mudarTrad("en-US", "titulo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-en-resumo">{t.projeto.campoResumo}</Label>
                <Textarea
                  id="p-en-resumo"
                  rows={2}
                  value={campoTrad("en-US", "resumo")}
                  onChange={(e) => mudarTrad("en-US", "resumo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-en-descricao">{t.projeto.campoDescricao}</Label>
                <Textarea
                  id="p-en-descricao"
                  rows={6}
                  value={campoTrad("en-US", "descricao")}
                  onChange={(e) => mudarTrad("en-US", "descricao", e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="es" className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">{t.traducao.aviso}</p>
              <div className="space-y-2">
                <Label htmlFor="p-es-titulo">{t.projeto.campoTitulo}</Label>
                <Input
                  id="p-es-titulo"
                  value={campoTrad("es-ES", "titulo")}
                  onChange={(e) => mudarTrad("es-ES", "titulo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-es-resumo">{t.projeto.campoResumo}</Label>
                <Textarea
                  id="p-es-resumo"
                  rows={2}
                  value={campoTrad("es-ES", "resumo")}
                  onChange={(e) => mudarTrad("es-ES", "resumo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-es-descricao">{t.projeto.campoDescricao}</Label>
                <Textarea
                  id="p-es-descricao"
                  rows={6}
                  value={campoTrad("es-ES", "descricao")}
                  onChange={(e) => mudarTrad("es-ES", "descricao", e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Capa com envio de arquivo e pré-visualização */}
          <UploadCapa
            valor={form.imagem_url || null}
            aoMudar={(url) => setForm((f) => ({ ...f, imagem_url: url }))}
            pasta="projetos"
          />

          <UploadMidia pasta="projetos" />

          <div className="space-y-2">
            <Label htmlFor="p-inicio">{t.projeto.campoData}</Label>
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
              {t.projeto.publicar}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-full" onClick={aoFechar}>
              {t.acoes.cancelar}
            </Button>
            <Button type="submit" className="rounded-full" disabled={salvar.isPending}>
              {salvar.isPending ? t.acoes.salvando : t.acoes.salvar}
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
