// Seletor de idioma acessível (Português · English · Español).
// Troca só o ?lang da URL atual: mantém página, filtros, hash e o que já foi
// digitado em formulários (o componente da página não é remontado).
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Check, Languages } from "lucide-react";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LOCALES,
  NOMES_NATIVOS,
  SIGLAS,
  ehLocale,
  langParaUrl,
  lerPreferencia,
  salvarPreferencia,
  type Locale,
} from "@/i18n/locales";
import { useLocale, useMensagens } from "@/i18n/mensagens";
import { comum } from "@/i18n/catalogos/comum";

/** Hook que troca o idioma preservando rota, busca e hash. */
export function useTrocarIdioma() {
  const navigate = useNavigate();
  const hash = useRouterState({ select: (s) => s.location.hash });
  return (locale: Locale) => {
    salvarPreferencia(locale);
    void navigate({
      to: ".",
      search: ((prev: Record<string, unknown>) => ({
        ...prev,
        lang: langParaUrl(locale),
      })) as never,
      ...(hash ? { hash } : {}),
      replace: true,
      resetScroll: false,
    });
  };
}

/** Aplica a preferência salva quando o visitante chega sem ?lang na URL. */
export function SincronizarIdioma() {
  const temLang = useRouterState({
    select: (s) => ehLocale((s.location.search as Record<string, unknown>)["lang"]),
  });
  const atual = useLocale();
  useEffect(() => {
    if (temLang) {
      salvarPreferencia(atual);
      return;
    }
    const salvo = lerPreferencia();
    if (salvo && salvo !== atual) {
      // Recarrega já com ?lang: o servidor renderiza no idioma certo e evitamos
      // trocar o texto no meio da hidratação (o que causaria divergência).
      const url = new URL(window.location.href);
      url.searchParams.set("lang", salvo);
      if (salvo === "pt-BR") url.searchParams.delete("lang");
      window.location.replace(url.toString());
    }
    // roda só na chegada / quando o lang da URL muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temLang, atual]);
  return null;
}

/** Botão compacto (cabeçalho) com menu dos 3 idiomas em nome nativo. */
export function SeletorIdioma({ className }: { className?: string }) {
  const locale = useLocale();
  const m = useMensagens(comum);
  const trocar = useTrocarIdioma();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn("h-10 gap-1.5 px-2.5", className)}
          aria-label={`${m.idioma.escolher} — ${m.idioma.atual}: ${NOMES_NATIVOS[locale]}`}
        >
          <Languages className="size-4" aria-hidden />
          <span className="text-sm font-semibold">{SIGLAS[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{m.idioma.rotulo}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(v) => ehLocale(v) && trocar(v)}
        >
          {LOCALES.map((l) => (
            <DropdownMenuRadioItem key={l} value={l} lang={l}>
              {NOMES_NATIVOS[l]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Versão em lista (menu do celular): três botões grandes, sempre visíveis. */
export function SeletorIdiomaLista() {
  const locale = useLocale();
  const m = useMensagens(comum);
  const trocar = useTrocarIdioma();
  return (
    <div role="group" aria-label={m.idioma.rotulo} className="grid grid-cols-3 gap-2">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === locale}
          onClick={() => trocar(l)}
          className={cn(
            "flex h-11 items-center justify-center gap-1 rounded-md border text-sm font-medium transition-colors",
            l === locale
              ? "border-primary bg-accent text-primary"
              : "border-border text-foreground hover:bg-muted",
          )}
        >
          {l === locale && <Check className="size-4" aria-hidden />}
          {NOMES_NATIVOS[l]}
        </button>
      ))}
    </div>
  );
}
