import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { gerarSlug, useSalvarNoticia, type NoticiaForm } from "@/lib/mutations";
import type { NoticiaRow } from "@/lib/db-types";
import { UploadCapa, UploadMidia } from "@/components/admin/UploadImagem";
import { useMensagens } from "@/i18n/mensagens";
import { editores } from "@/i18n/catalogos/editores";
import { lerTraducoes, limparTraducoes, type Traducoes } from "@/i18n/traduzir";
import { midia } from "@/i18n/catalogos/midia";
import { normalizarGaleria, type Galeria } from "@/lib/galeria";

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
  const t = useMensagens(editores);
  const salvar = useSalvarNoticia();
  const [form, setForm] = useState<NoticiaForm>(vazia());
  const [trad, setTrad] = useState<Traducoes>({});
  // Galeria controlada aqui (salva com a notícia); enviandoGaleria bloqueia o Salvar
  const [galeria, setGaleria] = useState<Galeria>([]);
  const [enviandoGaleria, setEnviandoGaleria] = useState(false);
  const tm = useMensagens(midia).upload;

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
    setTrad(lerTraducoes(noticia?.traducoes));
    // registro antigo/sem migração: galeria vazia (nunca inferida por nome/pasta)
    setGaleria(normalizarGaleria(noticia?.galeria));
  }, [aberto, noticia]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    // não salva durante envio de fotos nem em clique duplo
    if (enviandoGaleria || salvar.isPending) {
      if (enviandoGaleria) toast.warning(tm.galeriaEnviando);
      return;
    }
    try {
      await salvar.mutateAsync({
      ...form,
      slug: form.slug || gerarSlug(form.titulo),
      imagem_url: form.imagem_url || null,
      conteudo: form.conteudo || null,
      projeto_slug: form.projeto_slug || null,
      publicado_em: form.publicado_em || new Date().toISOString().slice(0, 10),
      traducoes: limparTraducoes(trad),
      traducoesColunaExistente: Boolean(noticia && "traducoes" in noticia),
      galeria,
      galeriaColunaExistente: Boolean(noticia && "galeria" in noticia),
      });
    } catch {
      // erro já mostrado pelo onError da mutação; editor e campos ficam como estão
      return;
    }
    aoFechar();
  }

  function campoTrad(locale: "en-US" | "es-ES", campo: "titulo" | "resumo" | "conteudo") {
    return trad[locale]?.[campo] ?? "";
  }

  function mudarTrad(locale: "en-US" | "es-ES", campo: "titulo" | "resumo" | "conteudo", valor: string) {
    setTrad((v) => ({ ...v, [locale]: { ...v[locale], [campo]: valor } }));
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{noticia ? t.noticia.tituloEditar : t.noticia.tituloNova}</DialogTitle>
          <DialogDescription>{t.noticia.descricao}</DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">{t.noticia.campoSlug}</Label>
            <Input
              id="slug"
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
                <Label htmlFor="titulo">{t.noticia.campoTitulo}</Label>
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
                <Label htmlFor="resumo">{t.noticia.campoResumo}</Label>
                <Textarea
                  id="resumo"
                  required
                  rows={2}
                  value={form.resumo}
                  onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conteudo">{t.noticia.campoConteudo}</Label>
                <Textarea
                  id="conteudo"
                  rows={6}
                  value={form.conteudo ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">{t.traducao.aviso}</p>
              <div className="space-y-2">
                <Label htmlFor="en-titulo">{t.noticia.campoTitulo}</Label>
                <Input
                  id="en-titulo"
                  value={campoTrad("en-US", "titulo")}
                  onChange={(e) => mudarTrad("en-US", "titulo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="en-resumo">{t.noticia.campoResumo}</Label>
                <Textarea
                  id="en-resumo"
                  rows={2}
                  value={campoTrad("en-US", "resumo")}
                  onChange={(e) => mudarTrad("en-US", "resumo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="en-conteudo">{t.noticia.campoConteudo}</Label>
                <Textarea
                  id="en-conteudo"
                  rows={6}
                  value={campoTrad("en-US", "conteudo")}
                  onChange={(e) => mudarTrad("en-US", "conteudo", e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="es" className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">{t.traducao.aviso}</p>
              <div className="space-y-2">
                <Label htmlFor="es-titulo">{t.noticia.campoTitulo}</Label>
                <Input
                  id="es-titulo"
                  value={campoTrad("es-ES", "titulo")}
                  onChange={(e) => mudarTrad("es-ES", "titulo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="es-resumo">{t.noticia.campoResumo}</Label>
                <Textarea
                  id="es-resumo"
                  rows={2}
                  value={campoTrad("es-ES", "resumo")}
                  onChange={(e) => mudarTrad("es-ES", "resumo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="es-conteudo">{t.noticia.campoConteudo}</Label>
                <Textarea
                  id="es-conteudo"
                  rows={6}
                  value={campoTrad("es-ES", "conteudo")}
                  onChange={(e) => mudarTrad("es-ES", "conteudo", e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Capa com envio de arquivo e pré-visualização */}
          <UploadCapa
            valor={form.imagem_url || null}
            aoMudar={(url) => setForm((f) => ({ ...f, imagem_url: url }))}
            pasta="noticias"
            tituloCapa={form.titulo}
          />

          <UploadMidia
            pasta="noticias"
            valor={galeria}
            aoMudar={setGaleria}
            aoMudarEnviando={setEnviandoGaleria}
          />

          <div className="space-y-2">
            <Label htmlFor="data">{t.noticia.campoData}</Label>
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
              {t.noticia.publicar}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-full" onClick={aoFechar}>
              {t.acoes.cancelar}
            </Button>
            <Button type="submit" className="rounded-full" disabled={salvar.isPending || enviandoGaleria}>
              {salvar.isPending ? t.acoes.salvando : t.acoes.salvar}
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
