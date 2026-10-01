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
import logoAsset from "@/assets/logo-idex-horizontal-v2.png.asset.json";
import { normalizarLocale } from "@/i18n/locales";
import { urlRedefinicao } from "@/lib/recuperacao-senha";
import { seoPagina } from "@/i18n/seo";
import { useLocale, useMensagens } from "@/i18n/mensagens";
import { auth } from "@/i18n/catalogos/auth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  // Motivo (opcional) da chegada ao login: ex. redirecionado do painel sem sessão
  // motivo: chegou redirecionado do painel; modo=recuperar: abre direto o pedido de novo link
  validateSearch: (
    search: Record<string, unknown>,
  ): { motivo?: "restrito"; modo?: "recuperar" } => ({
    ...(search["motivo"] === "restrito" ? { motivo: "restrito" as const } : {}),
    ...(search["modo"] === "recuperar" ? { modo: "recuperar" as const } : {}),
  }),
  head: ({ match }) => {
    const m = auth[normalizarLocale(match.search.lang)];
    const s = seoPagina({
      lang: match.search.lang,
      caminho: "/auth",
      titulo: m.seo.login.titulo,
      descricao: m.seo.login.descricao,
      noindex: true,
    });
    return { meta: s.meta, links: s.links };
  },
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { motivo, modo: modoInicial } = Route.useSearch();
  const { sessao, carregando } = useSessao();
  const m = useMensagens(auth);
  const locale = useLocale();
  const [enviando, setEnviando] = useState(false);
  // Alterna entre login e pedido de redefinição de senha (não há cadastro)
  const [modo, setModo] = useState<"login" | "recuperar">(modoInicial ?? "login");
  // Confirmação persistente do pedido (genérica: não revela se a conta existe)
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [erroPedido, setErroPedido] = useState(false);
  const avisou = useRef(false); // dispara o aviso de acesso restrito só uma vez

  // Validação simples do formulário de acesso
  const esquema = z.object({
    email: z.string().trim().email(m.login.emailInvalido).max(255),
    senha: z.string().min(6, m.login.senhaMinima).max(128),
  });

  // Chegou redirecionado do painel sem sessão? mostra o aviso discreto
  useEffect(() => {
    if (motivo === "restrito" && !avisou.current) {
      avisou.current = true;
      toast(m.login.avisoRestritoTitulo, {
        id: "acesso-restrito",
        description: m.login.avisoRestritoDescricao,
      });
    }
  }, [motivo, m]);

  // Envia e-mail com link de troca de senha (aponta para /redefinir-senha)
  async function recuperarSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = z.string().trim().email(m.login.emailInvalido).max(255).safeParse(form.get("email"));
    if (!email.success) {
      toast.error(email.error.issues[0]?.message ?? m.login.emailInvalido);
      return;
    }
    if (enviando) return; // evita pedido duplicado
    setEnviando(true);
    setErroPedido(false);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
        // Sempre o domínio publicado + idioma atual, mesmo pedindo pelo preview
        redirectTo: urlRedefinicao(locale),
      });
      // Erro de rede/limite: avisa sem detalhar. Conta inexistente não gera erro,
      // então a confirmação abaixo nunca revela se o e-mail está cadastrado.
      if (error && (error.status === 0 || error.status === 429 || (error.status ?? 0) >= 500)) {
        setErroPedido(true);
        return;
      }
      setPedidoEnviado(true);
    } catch {
      setErroPedido(true);
    } finally {
      setEnviando(false);
    }
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
      toast.error(parsed.error.issues[0]?.message ?? m.login.dadosInvalidos);
      return;
    }

    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.senha,
    });
    setEnviando(false);

    if (error) {
      toast.error(m.login.erroEntrarTitulo, { description: m.login.erroEntrarDescricao });
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-24">
      <div className="rounded-3xl border border-border bg-card p-8">
        {/* Marca oficial identifica visualmente o acesso restrito. */}
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
        <h1 className="mt-2 text-3xl">{m.login.titulo}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{m.login.subtitulo}</p>

        {modo === "login" ? (
          <form onSubmit={aoEnviar} className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{m.login.email}</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha">{m.login.senha}</Label>
                <button
                  type="button"
                  onClick={() => setModo("recuperar")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {m.login.esqueciSenha}
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
            <Button type="submit" size="lg" variant="idex" className="w-full" disabled={enviando}>
              <LogIn className="size-4" />
              {enviando ? m.login.entrando : m.login.entrar}
            </Button>
          </form>
        ) : (
          /* Sem cadastro: troca de senha apenas via e-mail */
          pedidoEnviado ? (
            <div className="mt-7 space-y-4" role="status" aria-live="polite">
              <h2 className="text-xl">{m.recuperar.confirmacaoTitulo}</h2>
              <p className="text-sm text-muted-foreground">{m.recuperar.confirmacaoTexto}</p>
              <Button
                type="button"
                variant="idexContorno"
                className="w-full"
                onClick={() => {
                  setPedidoEnviado(false);
                  setModo("login");
                }}
              >
                {m.recuperar.voltarLogin}
              </Button>
              <button
                type="button"
                onClick={() => setPedidoEnviado(false)}
                className="w-full text-center text-sm font-medium text-primary hover:underline"
              >
                {m.recuperar.outroEmail}
              </button>
            </div>
          ) : (
          <form onSubmit={recuperarSenha} className="mt-7 space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email-recuperar">{m.recuperar.email}</Label>
              <Input
                id="email-recuperar"
                name="email"
                type="email"
                required
                autoComplete="email"
                aria-describedby="aviso-recuperar"
              />
              <p id="aviso-recuperar" className="text-xs text-muted-foreground">
                {m.recuperar.aviso}
              </p>
            </div>
            {erroPedido && (
              <p role="alert" className="text-sm text-destructive">
                {m.recuperar.erroGenerico}
              </p>
            )}
            <Button type="submit" size="lg" variant="idex" className="w-full" disabled={enviando}>
              {enviando ? m.recuperar.enviando : m.recuperar.enviar}
            </Button>
            <button
              type="button"
              onClick={() => setModo("login")}
              className="w-full text-center text-sm font-medium text-primary hover:underline"
            >
              {m.recuperar.voltarLogin}
            </button>
          </form>
          )
        )}
      </div>
    </section>
  );
}
