import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { MapPin, Instagram, Facebook, Phone, Mail } from "lucide-react";
import { CONTATO } from "@/data/idex";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Placeholder } from "@/components/Placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Instituto IDEX" },
      {
        name: "description",
        content:
          "Fale com o Instituto IDEX: Rua Armando Cardoso Alves, 106 — Penha. Instagram @idexbrasil.",
      },
      { property: "og:title", content: "Contato — Instituto IDEX" },
      { property: "og:description", content: "Envie sua mensagem para o instituto." },
    ],
  }),
  component: Contato,
});

// Validação da mensagem antes de gravar no banco
const esquemaContato = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  assunto: z.string().trim().min(2, "Informe o assunto").max(150),
  mensagem: z.string().trim().min(5, "Escreva sua mensagem").max(2000),
});

function Contato() {
  const [enviando, setEnviando] = useState(false);

  // Grava a mensagem na tabela `mensagens` (leitura só pela equipe logada).
  async function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = new FormData(form);
    const parsed = esquemaContato.safeParse({
      nome: dados.get("nome"),
      email: dados.get("email"),
      assunto: dados.get("assunto"),
      mensagem: dados.get("mensagem"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Confira os campos");
      return;
    }

    setEnviando(true);
    const { error } = await supabase.from("mensagens").insert([parsed.data]);
    setEnviando(false);

    if (error) {
      toast.error("Não conseguimos enviar agora", {
        description: "Tente novamente em instantes ou fale com a gente pelo Instagram.",
      });
      return;
    }
    toast.success("Mensagem enviada!", { description: "A equipe do IDEX vai te responder." });
    form.reset();
  }

  return (
    <>
      {/* Variante fotográfica: mãos unidas em círculo, símbolo do time */}
      <PageHero
        variante="foto"
        foto={FOTO_VOLUNTARIADO}
        titulo="Fala com a gente"
        descricao="Dúvidas, parcerias ou vontade de ajudar."
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Contato
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
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" required placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="voce@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto</Label>
              <Input id="assunto" name="assunto" required placeholder="Sobre o que quer falar?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea id="mensagem" name="mensagem" required rows={6} placeholder="Escreva aqui" />
            </div>
            <Button type="submit" size="lg" className="rounded-full" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar mensagem"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Sua mensagem vai direto para a equipe do instituto.
            </p>
          </form>
        </Reveal>

        <Reveal delay={120}>
          <div className="space-y-4">
            <div className="rounded-3xl bg-ink p-7 text-ink-foreground">
              <h2 className="text-2xl">Onde estamos</h2>
              <p className="mt-4 flex gap-3 text-sm text-ink-foreground/80">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                {CONTATO.endereco}
              </p>
              <div className="mt-5 space-y-3 rounded-2xl bg-ink-card p-5 text-sm">
                <p className="flex items-center gap-3 text-ink-foreground/70">
                  <Phone className="size-4 text-primary" /> {CONTATO.telefone}
                </p>
                <p className="flex items-center gap-3 text-ink-foreground/70">
                  <Mail className="size-4 text-primary" /> {CONTATO.email}
                </p>
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
                <span className="block font-display text-lg">Instagram</span>
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
                <span className="block font-display text-lg">Facebook</span>
                <span className="text-sm text-muted-foreground">{CONTATO.facebook}</span>
              </span>
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
