import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { notificarContato } from "@/lib/notificar-contato.functions";
import { MapPin, Instagram, Facebook, Phone, Building2 } from "lucide-react";
import { CONTATO } from "@/data/idex";
import { FOTO_VOLUNTARIADO } from "@/data/fotos";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { normalizarLocale } from "@/i18n/locales";
import { seoPagina } from "@/i18n/seo";
import { useMensagens } from "@/i18n/mensagens";
import { contato } from "@/i18n/catalogos/contato";

export const Route = createFileRoute("/contato")({
  // SEO por idioma, com canonical e hreflang
  head: ({ match }) => {
    const t = contato[normalizarLocale(match.search.lang)];
    const s = seoPagina({
      lang: match.search.lang,
      caminho: "/contato",
      titulo: t.seo.titulo,
      descricao: t.seo.descricao,
    });
    return { meta: s.meta, links: s.links };
  },
  component: Contato,
});

type MensagensContato = (typeof contato)[keyof typeof contato];

// Ordem dos campos usada para focar o primeiro erro na submissão.
const CAMPOS = ["nome", "email", "assunto", "mensagem"] as const;
type Campo = (typeof CAMPOS)[number];

/** Monta o schema de validação com as mensagens do idioma atual. */
function criarEsquemaContato(t: MensagensContato) {
  return z.object({
    nome: z.string().trim().min(2, t.validacao.nome).max(120, t.validacao.nome),
    email: z.string().trim().email(t.validacao.email).max(255, t.validacao.email),
    assunto: z.string().trim().min(2, t.validacao.assunto).max(150, t.validacao.assunto),
    mensagem: z.string().trim().min(5, t.validacao.mensagem).max(2000, t.validacao.mensagem),
  });
}

// Guarda só QUAIS campos têm erro; o texto vem do catálogo na hora de exibir,
// assim a mensagem troca de idioma junto com a página sem apagar o que foi digitado.
type ErrosContato = Partial<Record<Campo, true>>;

function Contato() {
  const t = useMensagens(contato);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<ErrosContato>({});
  const refs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  // Limpa o erro de um campo assim que o usuário começa a corrigi-lo.
  function aoMudar(campo: Campo) {
    setErros((anteriores) => {
      if (!anteriores[campo]) return anteriores;
      const novo = { ...anteriores };
      delete novo[campo];
      return novo;
    });
  }

  // Grava a mensagem na tabela `mensagens` (leitura só pela equipe logada).
  async function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = new FormData(form);
    const parsed = criarEsquemaContato(t).safeParse({
      nome: dados.get("nome"),
      email: dados.get("email"),
      assunto: dados.get("assunto"),
      mensagem: dados.get("mensagem"),
    });

    if (!parsed.success) {
      const novosErros: ErrosContato = {};
      for (const issue of parsed.error.issues) {
        novosErros[issue.path[0] as Campo] = true;
      }
      setErros(novosErros);
      const primeiroErro = CAMPOS.find((campo) => novosErros[campo]);
      toast.error(primeiroErro ? t.validacao[primeiroErro] : t.validacao.conferirCampos);
      // Foca no primeiro campo com erro, na ordem do formulário.
      if (primeiroErro) refs.current[primeiroErro]?.focus();
      return;
    }

    setErros({});
    setEnviando(true);
    const { error } = await supabase.from("mensagens").insert([parsed.data]);
    setEnviando(false);

    if (error) {
      toast.error(t.toasts.falhaTitulo, { description: t.toasts.falhaDescricao });
      return;
    }
    // Aviso por e-mail à equipe (inativo até definir o remetente); falha não afeta o visitante
    notificarContato({ data: parsed.data }).catch(() => {});
    toast.success(t.toasts.sucessoTitulo, { description: t.toasts.sucessoDescricao });
    form.reset();
  }

  return (
    <>
      {/* Variante fotográfica: mãos unidas em círculo, símbolo do time */}
      <PageHero
        variante="foto"
        foto={FOTO_VOLUNTARIADO}
        titulo={t.hero.titulo}
        descricao={t.hero.descricao}
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t.hero.selo}
        </span>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <form
            onSubmit={aoEnviar}
            className="space-y-5 rounded-3xl border border-border bg-card p-7 sm:p-9"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">{t.form.nome.rotulo}</Label>
                <Input
                  id="nome"
                  name="nome"
                  required
                  placeholder={t.form.nome.placeholder}
                  aria-invalid={!!erros.nome}
                  aria-describedby={erros.nome ? "erro-nome" : undefined}
                  ref={(el) => { refs.current['nome'] = el; }}
                  onChange={() => aoMudar("nome")}
                />
                {erros.nome && (
                  <p id="erro-nome" className="text-sm text-destructive">
                    {t.validacao.nome}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.form.email.rotulo}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={t.form.email.placeholder}
                  aria-invalid={!!erros.email}
                  aria-describedby={erros.email ? "erro-email" : undefined}
                  ref={(el) => { refs.current['email'] = el; }}
                  onChange={() => aoMudar("email")}
                />
                {erros.email && (
                  <p id="erro-email" className="text-sm text-destructive">
                    {t.validacao.email}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assunto">{t.form.assunto.rotulo}</Label>
              <Input
                id="assunto"
                name="assunto"
                required
                placeholder={t.form.assunto.placeholder}
                aria-invalid={!!erros.assunto}
                aria-describedby={erros.assunto ? "erro-assunto" : undefined}
                ref={(el) => { refs.current['assunto'] = el; }}
                onChange={() => aoMudar("assunto")}
              />
              {erros.assunto && (
                <p id="erro-assunto" className="text-sm text-destructive">
                  {t.validacao.assunto}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mensagem">{t.form.mensagem.rotulo}</Label>
              <Textarea
                id="mensagem"
                name="mensagem"
                required
                rows={6}
                placeholder={t.form.mensagem.placeholder}
                aria-invalid={!!erros.mensagem}
                aria-describedby={erros.mensagem ? "erro-mensagem" : undefined}
                ref={(el) => { refs.current['mensagem'] = el; }}
                onChange={() => aoMudar("mensagem")}
              />
              {erros.mensagem && (
                <p id="erro-mensagem" className="text-sm text-destructive">
                  {t.validacao.mensagem}
                </p>
              )}
            </div>
            <Button type="submit" size="lg" variant="idex" disabled={enviando}>
              {enviando ? t.form.enviando : t.form.enviar}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t.form.aviso}
            </p>
          </form>
        </Reveal>

        <Reveal delay={120}>
          <div className="space-y-4">
            <div className="rounded-3xl bg-ink p-7 text-ink-foreground">
              <h2 className="text-2xl">{t.onde.titulo}</h2>
              <p className="mt-4 flex gap-3 text-sm text-ink-foreground/80">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                {CONTATO.endereco}
              </p>
              {/* E-mail fica de fora por decisão do instituto (anti-spam);
                  canais oficiais: telefone, formulário e redes sociais */}
              <div className="mt-5 space-y-3 rounded-2xl bg-ink-card p-5 text-sm">
                {CONTATO.telefone && (
                  <a
                    {/* Link de telefone com código do país (tel:+55...) para discagem correta */}
                    href={`tel:+55${CONTATO.telefone.replace(/\D/g, "")}`}
                    className="flex items-center gap-3 text-ink-foreground/70 transition-colors hover:text-ink-foreground"
                  >
                    <Phone className="size-4 text-primary" /> {CONTATO.telefone}
                  </a>
                )}
                {CONTATO.cnpj && (
                  <p className="flex items-center gap-3 text-ink-foreground/70">
                    <Building2 className="size-4 text-primary" /> {t.onde.cnpj(CONTATO.cnpj)}
                  </p>
                )}
              </div>
            </div>

            <a
              href={CONTATO.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="lift flex items-center gap-4 rounded-3xl border border-border bg-card p-6"
            >
              <Instagram className="size-6 text-primary" />
              <span>
                <span className="block font-display text-lg">{t.redes.instagram}</span>
                <span className="text-sm text-muted-foreground">{CONTATO.instagram}</span>
              </span>
            </a>
            <a
              href={CONTATO.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="lift flex items-center gap-4 rounded-3xl border border-border bg-card p-6"
            >
              <Facebook className="size-6 text-secondary" />
              <span>
                <span className="block font-display text-lg">{t.redes.facebook}</span>
                <span className="text-sm text-muted-foreground">{CONTATO.facebook}</span>
              </span>
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
