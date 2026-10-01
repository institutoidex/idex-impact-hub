import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MapPin } from "lucide-react";
import { NAV, CONTATO } from "@/data/idex";
import logoAsset from "@/assets/logo-idex-horizontal-v2.png.asset.json";
import { useMensagens } from "@/i18n/mensagens";
import { layout } from "@/i18n/catalogos/layout";
import { comum } from "@/i18n/catalogos/comum";

/** Rodapé escuro com filete amarelo no topo (elemento da identidade atual). */
export function Footer() {
  const ano = new Date().getFullYear();
  const t = useMensagens(layout);
  const c = useMensagens(comum);

  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="rule-green" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="inline-flex min-h-20 items-center justify-center rounded-md bg-background px-3 py-2 sm:min-h-24 sm:px-4">
            {/* Logo oficial no rodapé */}
            <img
              src={logoAsset.url}
              alt={c.altLogo}
              width={1626}
              height={905}
              loading="lazy"
              decoding="async"
              className="h-auto w-36 object-contain sm:w-40"
            />
          </div>
          <p className="mt-4 text-sm text-ink-foreground/70">
            {t.rodape.descricao}
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href={CONTATO.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t.rodape.instagramDoInstituto}
              className="grid size-10 place-items-center rounded-full bg-ink-card transition-colors hover:bg-primary"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href={CONTATO.facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t.rodape.facebookDoInstituto}
              className="grid size-10 place-items-center rounded-full bg-ink-card transition-colors hover:bg-primary"
            >
              <Facebook className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-base">{t.rodape.navegacao}</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-ink-foreground/70 transition-colors hover:text-primary"
                >
                  {t.nav[item.chave]}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/como-ajudar"
                className="text-ink-foreground/70 transition-colors hover:text-primary"
              >
                {t.comoAjudar}
              </Link>
            </li>
          </ul>
        </div>


        <div>
          <h3 className="font-display text-base">{t.rodape.contato}</h3>
          <div className="mt-4 rounded-2xl bg-ink-card p-5 text-sm">
            <p className="flex gap-2 text-ink-foreground/80">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              {CONTATO.endereco}
            </p>
            {/* E-mail fica de fora por decisão do instituto (anti-spam) */}
            {CONTATO.telefone && (
              <p className="mt-3 text-ink-foreground/60">{t.rodape.telefone}: {CONTATO.telefone}</p>
            )}
            {CONTATO.cnpj && <p className="text-ink-foreground/60">CNPJ: {CONTATO.cnpj}</p>}
            <p className="mt-3 text-ink-foreground/60">Instagram: {CONTATO.instagram}</p>
            <p className="text-ink-foreground/60">Facebook: {CONTATO.facebook}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        {/* Rodapé final: direitos + acesso discreto à área da equipe */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-ink-foreground/50 sm:px-6">
          <p>{t.rodape.direitos(ano)}</p>
          <Link
            to="/auth"
            className="rounded-full px-3 py-1 text-ink-foreground/50 transition hover:bg-ink-foreground/10 hover:text-ink-foreground"
          >
            {t.areaDaEquipe}
          </Link>
        </div>
      </div>

    </footer>
  );
}
