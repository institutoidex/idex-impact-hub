import { useEffect, useState } from "react";
import {
  Accessibility,
  Contrast,
  Droplet,
  Link2,
  Minus,
  Plus,
  RotateCcw,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Preferências de acessibilidade guardadas no navegador do visitante. */
type Preferencias = {
  escala: number; // multiplicador do tamanho da fonte (1 = padrão)
  contraste: boolean; // alto contraste
  cinza: boolean; // escala de cinza
  links: boolean; // sublinhar links
  semAnimacao: boolean; // reduzir movimento
};

const PADRAO: Preferencias = {
  escala: 1,
  contraste: false,
  cinza: false,
  links: false,
  semAnimacao: false,
};

const CHAVE = "idex:acessibilidade";

/** Aplica as preferências no elemento <html>. */
function aplicar(p: Preferencias) {
  const raiz = document.documentElement;
  raiz.style.fontSize = `${p.escala * 100}%`;
  raiz.classList.toggle("acess-contraste", p.contraste);
  raiz.classList.toggle("acess-cinza", p.cinza);
  raiz.classList.toggle("acess-links", p.links);
  raiz.classList.toggle("acess-sem-animacao", p.semAnimacao);
}

export function BotaoAcessibilidade() {
  const [aberto, setAberto] = useState(false);
  const [prefs, setPrefs] = useState<Preferencias>(PADRAO);

  // Carrega o que já estava salvo (só no cliente, evita mismatch de hidratação)
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo) {
        const p = { ...PADRAO, ...(JSON.parse(salvo) as Partial<Preferencias>) };
        setPrefs(p);
        aplicar(p);
      }
    } catch {
      /* preferências corrompidas: segue com o padrão */
    }
  }, []);

  // Salva e aplica sempre que muda
  function atualizar(parcial: Partial<Preferencias>) {
    setPrefs((atual) => {
      const novo = { ...atual, ...parcial };
      aplicar(novo);
      try {
        localStorage.setItem(CHAVE, JSON.stringify(novo));
      } catch {
        /* modo privado: ignora */
      }
      return novo;
    });
  }

  // Fecha o painel com Esc
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  const opcoes = [
    { chave: "contraste" as const, rotulo: "Alto contraste", Icone: Contrast },
    { chave: "cinza" as const, rotulo: "Escala de cinza", Icone: Droplet },
    { chave: "links" as const, rotulo: "Sublinhar links", Icone: Link2 },
    { chave: "semAnimacao" as const, rotulo: "Reduzir animações", Icone: Zap },
  ];

  return (
    <div className="fixed right-4 bottom-4 z-[60] print:hidden">
      {aberto && (
        <div
          role="dialog"
          aria-label="Opções de acessibilidade"
          className="mb-3 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 shadow-2xl"
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <h2 className="truncate text-base font-semibold text-foreground">Acessibilidade</h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar opções de acessibilidade"
              className="min-h-11 min-w-11 shrink-0"
              onClick={() => setAberto(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Tamanho do texto */}
          <div className="mt-3">
            <p className="text-sm font-medium text-foreground">Tamanho do texto</p>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Diminuir tamanho do texto"
                className="min-h-11 min-w-11"
                onClick={() => atualizar({ escala: Math.max(0.9, +(prefs.escala - 0.1).toFixed(2)) })}
              >
                <Minus className="size-4" />
              </Button>
              <span
                aria-live="polite"
                className="flex-1 text-center text-sm font-semibold text-foreground"
              >
                {Math.round(prefs.escala * 100)}%
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Aumentar tamanho do texto"
                className="min-h-11 min-w-11"
                onClick={() => atualizar({ escala: Math.min(1.4, +(prefs.escala + 0.1).toFixed(2)) })}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Alternâncias */}
          <ul className="mt-4 space-y-2">
            {opcoes.map(({ chave, rotulo, Icone }) => (
              <li key={chave}>
                <button
                  type="button"
                  aria-pressed={prefs[chave]}
                  onClick={() => atualizar({ [chave]: !prefs[chave] } as Partial<Preferencias>)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                    prefs[chave]
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-accent",
                  )}
                >
                  <Icone className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{rotulo}</span>
                  <span className="shrink-0 text-xs font-semibold opacity-80">
                    {prefs[chave] ? "ativo" : "off"}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <Button
            variant="ghost"
            className="mt-3 min-h-11 w-full justify-center text-sm"
            onClick={() => {
              aplicar(PADRAO);
              setPrefs(PADRAO);
              try {
                localStorage.removeItem(CHAVE);
              } catch {
                /* ignora */
              }
            }}
          >
            <RotateCcw className="size-4" /> Restaurar padrão
          </Button>
        </div>
      )}

      <Button
        size="icon"
        aria-label="Abrir opções de acessibilidade"
        aria-expanded={aberto}
        className="ml-auto flex size-14 rounded-full shadow-xl"
        onClick={() => setAberto((v) => !v)}
      >
        <Accessibility className="size-6" />
      </Button>
    </div>
  );
}
