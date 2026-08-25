import type { ReactNode } from "react";

/** Banner leve reutilizado no topo das páginas internas. */
export function PageHero({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-sand pt-28 pb-14">
      <div
        aria-hidden
        className="absolute -top-24 -right-16 size-72 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {children}
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">{titulo}</h1>
        {descricao && (
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{descricao}</p>
        )}
      </div>
    </section>
  );
}
