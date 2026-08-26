import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/redefinir-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Redefinir senha — Instituto IDEX" },
      { name: "description", content: "Defina uma nova senha para a área da equipe do Instituto IDEX." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Redefinir senha — Instituto IDEX" },
      { property: "og:description", content: "Defina uma nova senha de acesso." },
    ],
  }),
  component: RedefinirSenha,
});

// Validação da nova senha (mínimo 6 caracteres, confirmação igual)
const esquema = z
  .object({
    senha: z.string().min(6, "A senha precisa de ao menos 6 caracteres").max(128),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, {
    message: "As senhas não conferem",
    path: ["confirmar"],
  });

function RedefinirSenha() {
  const navigate = useNavigate();
  const [pronto, setPronto] = useState(false);
  const [enviando, setEnviando] = useState(false);

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
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.senha });
    setEnviando(false);

    if (error) {
      toast.error("Não foi possível trocar a senha", { description: error.message });
      return;
    }
    toast.success("Senha atualizada!", { description: "Use a nova senha no próximo login." });
    navigate({ to: "/admin", replace: true });
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-24">
      <div className="rounded-3xl border border-border bg-card p-8">
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Área da equipe
        </span>
        <h1 className="mt-2 text-3xl">Definir nova senha</h1>

        {pronto ? (
          <form onSubmit={aoEnviar} className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="senha">Nova senha</Label>
              <Input id="senha" name="senha" type="password" required autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmar">Confirmar nova senha</Label>
              <Input
                id="confirmar"
                name="confirmar"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" size="lg" className="w-full rounded-full" disabled={enviando}>
              <KeyRound className="size-4" />
              {enviando ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        ) : (
          <div className="mt-7 space-y-4">
            <p className="text-sm text-muted-foreground">
              Validando seu link de redefinição… Se a página não avançar, o link pode ter
              expirado — peça um novo na tela de login.
            </p>
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link to="/auth">Voltar ao login</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
