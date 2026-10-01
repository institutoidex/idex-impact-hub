import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, TriangleAlert } from "lucide-react";
import { foiRecuperacaoVista, linkInicial, supabase } from "@/lib/supabase";
import {
  SENHA_MAXIMA,
  resolverEstadoInicial,
  trocarSenha,
  validarSenhas,
  type EstadoTela,
  type FalhaTroca,
  type ErroCampo,
} from "@/lib/recuperacao-senha";
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

/** Remove do endereço qualquer hash (token ou erro), mantendo ?lang. */
function limparHashDaUrl() {
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

function RedefinirSenha() {
  const m = useMensagens(auth);
  const r = m.redefinir;
  const [estado, setEstado] = useState<EstadoTela>("validando");
  const [enviando, setEnviando] = useState(false);
  const enviandoRef = useRef(false); // trava síncrona contra clique duplo
  const [erros, setErros] = useState<{ senha?: ErroCampo; confirmar?: ErroCampo }>({});
  const [falha, setFalha] = useState<FalhaTroca | null>(null);
  const [mostrar, setMostrar] = useState(false);
  const idSenha = useId();
  const idConfirmar = useId();

  // Valida o link uma vez: usa a classificação capturada antes de o cliente
  // limpar o hash e o evento PASSWORD_RECOVERY ouvido desde a criação do cliente.
  useEffect(() => {
    let ativo = true;
    resolverEstadoInicial({
      link: linkInicial,
      recuperacaoVista: foiRecuperacaoVista,
      temSessao: async () => (await supabase.auth.getSession()).data.session !== null,
    }).then((e) => {
      if (!ativo) return;
      limparHashDaUrl(); // token/erro nunca ficam visíveis na barra de endereço
      setEstado(e);
    });
    return () => {
      ativo = false;
    };
  }, []);

  async function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviandoRef.current) return;
    const form = new FormData(e.currentTarget);
    const senha = String(form.get("senha") ?? "");
    const confirmar = String(form.get("confirmar") ?? "");
    const novosErros = validarSenhas(senha, confirmar);
    setErros(novosErros);
    setFalha(null);
    if (novosErros.senha || novosErros.confirmar) {
      document.getElementById(novosErros.senha ? idSenha : idConfirmar)?.focus();
      return;
    }

    enviandoRef.current = true;
    setEnviando(true);
    const resultado = await trocarSenha(
      (s) => supabase.auth.updateUser({ password: s }),
      senha,
    );
    enviandoRef.current = false;
    setEnviando(false);

    if (!resultado.ok) {
      // Sessão perdida no meio do caminho: mostra o estado de link expirado
      if (resultado.falha === "sessao") setEstado("expirado");
      else setFalha(resultado.falha);
      return;
    }
    // Encerra a sessão de recuperação; o login é feito de novo com a senha nova
    await supabase.auth.signOut().catch(() => undefined);
    setEstado("sucesso");
  }

  const textoErro = (k: ErroCampo) =>
    k === "senhaMinima" ? r.senhaMinima : k === "senhaMaxima" ? r.senhaMaxima : r.senhasNaoConferem;
  const textoFalha: Record<FalhaTroca, string> = {
    fraca: r.falhaFraca,
    igual: r.falhaIgual,
    rede: r.falhaRede,
    sessao: r.falhaSessao,
    generica: r.falhaGenerica,
  };

  // Estados de link que não permitem trocar a senha
  const problema: Partial<Record<EstadoTela, [string, string]>> = {
    expirado: [r.expiradoTitulo, r.expiradoTexto],
    invalido: [r.invalidoTitulo, r.invalidoTexto],
    semSessao: [r.semSessaoTitulo, r.semSessaoTexto],
    tempoEsgotado: [r.tempoTitulo, r.tempoTexto],
  };
  const aviso = problema[estado];

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
        <h1 className="mt-2 text-3xl">{r.titulo}</h1>

        {estado === "validando" && (
          <p
            className="mt-7 flex items-center gap-2 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {r.validandoCurto}
          </p>
        )}

        {aviso && (
          <div className="mt-7 space-y-4" role="alert">
            <h2 className="flex items-center gap-2 text-xl">
              <TriangleAlert className="size-5 text-destructive" aria-hidden />
              {aviso[0]}
            </h2>
            <p className="text-sm text-muted-foreground">{aviso[1]}</p>
            <Button asChild variant="idex" className="w-full">
              <Link to="/auth" search={{ modo: "recuperar" }}>
                {r.pedirNovoLink}
              </Link>
            </Button>
            <Button asChild variant="idexContorno" className="w-full">
              <Link to="/auth">{r.voltarLogin}</Link>
            </Button>
          </div>
        )}

        {estado === "sucesso" && (
          <div className="mt-7 space-y-4" role="status" aria-live="polite">
            <h2 className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="size-5 text-primary" aria-hidden />
              {r.sucessoTitulo}
            </h2>
            <p className="text-sm text-muted-foreground">{r.sucessoTexto}</p>
            <Button asChild variant="idex" className="w-full">
              <Link to="/auth">{r.irLogin}</Link>
            </Button>
          </div>
        )}

        {estado === "pronto" && (
          <form onSubmit={aoEnviar} className="mt-7 space-y-5" noValidate>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={idSenha}>{r.novaSenha}</Label>
                {/* Mostrar/ocultar vale para os dois campos */}
                <button
                  type="button"
                  onClick={() => setMostrar((v) => !v)}
                  aria-pressed={mostrar}
                  aria-controls={`${idSenha} ${idConfirmar}`}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {mostrar ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                  {mostrar ? r.ocultarSenha : r.mostrarSenha}
                </button>
              </div>
              <Input
                id={idSenha}
                name="senha"
                type={mostrar ? "text" : "password"}
                required
                maxLength={SENHA_MAXIMA}
                autoComplete="new-password"
                aria-invalid={erros.senha ? true : undefined}
                aria-describedby={`${idSenha}-req${erros.senha ? ` ${idSenha}-erro` : ""}`}
              />
              <p id={`${idSenha}-req`} className="text-xs text-muted-foreground">
                {r.requisito}
              </p>
              {erros.senha && (
                <p id={`${idSenha}-erro`} className="text-sm text-destructive">
                  {textoErro(erros.senha)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={idConfirmar}>{r.confirmarSenha}</Label>
              <Input
                id={idConfirmar}
                name="confirmar"
                type={mostrar ? "text" : "password"}
                required
                maxLength={SENHA_MAXIMA}
                autoComplete="new-password"
                aria-invalid={erros.confirmar ? true : undefined}
                aria-describedby={erros.confirmar ? `${idConfirmar}-erro` : undefined}
              />
              {erros.confirmar && (
                <p id={`${idConfirmar}-erro`} className="text-sm text-destructive">
                  {textoErro(erros.confirmar)}
                </p>
              )}
            </div>
            {falha && (
              <p role="alert" className="text-sm text-destructive">
                {textoFalha[falha]}
              </p>
            )}
            <Button type="submit" size="lg" variant="idex" className="w-full" disabled={enviando}>
              <KeyRound className="size-4" />
              {enviando ? r.salvando : r.salvar}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
