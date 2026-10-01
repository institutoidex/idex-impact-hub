import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoAsset from "@/assets/logo-idex-horizontal-v2.png.asset.json";
import { normalizarLocale } from "@/i18n/locales";
import { seoPagina } from "@/i18n/seo";
import { useMensagens } from "@/i18n/mensagens";
import { auth } from "@/i18n/catalogos/auth";

export const Route = createFileRoute("/redefinir-senha")({
  ssr: false,
  head: ({ match }) => {
    const m = auth[normalizarLocale(match.search.lang)];
    const s = seoPagina({
      lang: match.search.lang,
      caminho: "/redefinir-senha",
      titulo: m.seo.redefinir.titulo,
      descricao: m.seo.redefinir.descricao,
      noindex: true,
    });
    return { meta: s.meta, links: s.links };
  },
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const navigate = useNavigate();
  const m = useMensagens(auth);
  const [pronto, setPronto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Validação da nova senha (mínimo 6 caracteres, confirmação igual)
  const esquema = z
    .object({
      senha: z.string().min(6, m.redefinir.senhaMinima).max(128),
      confirmar: z.string(),
    })
    .refine((d) => d.senha === d.confirmar, {
      message: m.redefinir.senhasNaoConferem,
      path: ["confirmar"],
    });

  // O link do e-mail chega com type=recovery no hash; o cliente Supabase
  // processa o token e dispara o evento PASSWORD_RECOVERY.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "PASSWORD_RECOVERY") setPronto(true);
    });
    // Fallback: se já houver sessão válida (usuário clicou e o hash já foi tratado)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPronto(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = esquema.safeParse({
      senha: form.get("senha"),
      confirmar: form.get("confirmar"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? m.redefinir.dadosInvalidos);
      return;
    }

    setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.senha });
    setEnviando(false);

    if (error) {
      toast.error(m.redefinir.erroTrocarTitulo, { description: error.message });
      return;
    }
    toast.success(m.redefinir.sucessoTitulo, { description: m.redefinir.sucessoDescricao });
    navigate({ to: "/admin", replace: true });
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-24">
      <div className="rounded-3xl border border-border bg-card p-8">
        {/* Mesma proporção de marca usada no login e no painel. */}
        <img
          src={logoAsset.url}
          alt="Instituto IDEX"
          width={1626}
          height={905}
          decoding="async"
          className="mb-7 h-auto w-36 object-contain"
        />
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          {m.areaEquipe}
        </span>
        <h1 className="mt-2 text-3xl">{m.redefinir.titulo}</h1>

        {pronto ? (
          <form onSubmit={aoEnviar} className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="senha">{m.redefinir.novaSenha}</Label>
              <Input id="senha" name="senha" type="password" required autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmar">{m.redefinir.confirmarSenha}</Label>
              <Input
                id="confirmar"
                name="confirmar"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" size="lg" variant="idex" className="w-full" disabled={enviando}>
              <KeyRound className="size-4" />
              {enviando ? m.redefinir.salvando : m.redefinir.salvar}
            </Button>
          </form>
        ) : (
          <div className="mt-7 space-y-4">
            <p className="text-sm text-muted-foreground">{m.redefinir.validando}</p>
            <Button asChild variant="idexContorno" className="w-full">
              <Link to="/auth">{m.redefinir.voltarLogin}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
