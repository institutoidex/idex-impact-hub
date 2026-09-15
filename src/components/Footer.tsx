import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MapPin } from "lucide-react";
import { NAV, CONTATO } from "@/data/idex";
import logoAsset from "@/assets/logo-idex-horizontal-v2.png.asset.json";

/** Rodapé escuro com filete amarelo no topo (elemento da identidade atual). */
export function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="rule-yellow" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="inline-flex items-center rounded-md bg-background px-3 py-2">
            {/* Logo oficial no rodapé */}
            <img
              src={logoAsset.url}
              alt="Instituto IDEX"
              width={1626}
              height={905}
              loading="lazy"
              decoding="async"
              className="h-20 w-auto max-w-[9rem] object-contain sm:max-w-[10rem]"
            />
          </div>
          <p className="mt-4 text-sm text-ink-foreground/70">
            ONG brasileira de desenvolvimento social, fundada em 2007.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href={CONTATO.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram do Instituto IDEX"
              className="grid size-10 place-items-center rounded-full bg-ink-card transition-colors hover:bg-primary"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href={CONTATO.facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook do Instituto IDEX"
              className="grid size-10 place-items-center rounded-full bg-ink-card transition-colors hover:bg-primary"
            >
              <Facebook className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-base">Navegação</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-ink-foreground/70 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/como-ajudar"
                className="text-ink-foreground/70 transition-colors hover:text-primary"
              >
                Como Ajudar
              </Link>
            </li>
          </ul>
        </div>


        <div>
          <h3 className="font-display text-base">Contato</h3>
          <div className="mt-4 rounded-2xl bg-ink-card p-5 text-sm">
            <p className="flex gap-2 text-ink-foreground/80">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              {CONTATO.endereco}
            </p>
            <p className="mt-3 text-ink-foreground/60">Telefone: {CONTATO.telefone}</p>
            <p className="text-ink-foreground/60">E-mail: {CONTATO.email}</p>
            <p className="mt-3 text-ink-foreground/60">Instagram: {CONTATO.instagram}</p>
            <p className="text-ink-foreground/60">Facebook: {CONTATO.facebook}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        {/* Rodapé final: direitos + acesso discreto à área da equipe */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-ink-foreground/50 sm:px-6">
          <p>© {ano} Instituto IDEX. Todos os direitos reservados.</p>
          <Link
            to="/auth"
            className="rounded-full px-3 py-1 text-ink-foreground/50 transition hover:bg-ink-foreground/10 hover:text-ink-foreground"
          >
            Área da equipe
          </Link>
        </div>
      </div>

    </footer>
  );
}
