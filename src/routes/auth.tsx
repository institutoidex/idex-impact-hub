import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
  // Motivo (opcional) da chegada ao login: ex. redirecionado do painel sem sessão
  validateSearch: (search: Record<string, unknown>): { motivo?: "restrito" } =>
    search["motivo"] === "restrito" ? { motivo: "restrito" } : {},
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
  const { motivo } = Route.useSearch();
  const { sessao, carregando } = useSessao();
  const [enviando, setEnviando] = useState(false);
  // Alterna entre login e pedido de redefinição de senha (não há cadastro)
  const [modo, setModo] = useState<"login" | "recuperar">("login");
  const avisou = useRef(false); // dispara o aviso de acesso restrito só uma vez

  // Chegou redirecionado do painel sem sessão? mostra o aviso discreto
  useEffect(() => {
    if (motivo === "restrito" && !avisou.current) {
      avisou.current = true;
      toast("Acesso restrito", {
        id: "acesso-restrito",
        description: "Entre com sua conta para abrir o painel.",
      });
    }
  }, [motivo]);

  // Envia e-mail com link de troca de senha (aponta para /redefinir-senha)
  async function recuperarSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = z.string().trim().email("E-mail inválido").max(255).safeParse(form.get("email"));
    if (!email.success) {
      toast.error(email.error.issues[0]?.message ?? "E-mail inválido");
      return;
    }
    setEnviando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setEnviando(false);
    if (error) {
      toast.error("Não foi possível enviar o e-mail", { description: error.message });
      return;
    }
    toast.success("E-mail enviado!", {
      description: "Abra o link recebido para definir a nova senha.",
    });
    setModo("login");
  }

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

        {modo === "login" ? (
          <form onSubmit={aoEnviar} className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha">Senha</Label>
                <button
                  type="button"
                  onClick={() => setModo("recuperar")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
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
        ) : (
          /* Sem cadastro: troca de senha apenas via e-mail */
          <form onSubmit={recuperarSenha} className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email-recuperar">E-mail</Label>
              <Input
                id="email-recuperar"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground">
                Você receberá um link para definir uma nova senha.
              </p>
            </div>
            <Button type="submit" size="lg" className="w-full rounded-full" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
            <button
              type="button"
              onClick={() => setModo("login")}
              className="w-full text-center text-sm font-medium text-primary hover:underline"
            >
              Voltar ao login
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
