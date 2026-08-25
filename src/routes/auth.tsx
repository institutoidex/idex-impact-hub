import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSessao } from "@/hooks/useSessao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acesso restrito — Instituto IDEX" },
      { name: "description", content: "Área de login da equipe do Instituto IDEX." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Acesso restrito — Instituto IDEX" },
      { property: "og:description", content: "Login da equipe do instituto." },
    ],
  }),
  component: Login,
});

// Validação simples do formulário de acesso
const esquema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  senha: z.string().min(6, "A senha precisa de ao menos 6 caracteres").max(128),
});

function Login() {
  const navigate = useNavigate();
  const { sessao, carregando } = useSessao();
  const [enviando, setEnviando] = useState(false);

  // Já logado? vai direto para o painel
  useEffect(() => {
    if (!carregando && sessao) navigate({ to: "/admin", replace: true });
  }, [carregando, sessao, navigate]);

  async function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = esquema.safeParse({
      email: form.get("email"),
      senha: form.get("senha"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.senha,
    });
    setEnviando(false);

    if (error) {
      toast.error("Não foi possível entrar", { description: "Confira e-mail e senha." });
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-24">
      <div className="rounded-3xl border border-border bg-card p-8">
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Área da equipe
        </span>
        <h1 className="mt-2 text-3xl">Entrar no painel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesso apenas para a equipe do instituto. Contas são criadas manualmente.
        </p>

        <form onSubmit={aoEnviar} className="mt-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-full" disabled={enviando}>
            <LogIn className="size-4" />
            {enviando ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </section>
  );
}
