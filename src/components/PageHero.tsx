import type { ReactNode } from "react";
import type { Foto } from "@/data/fotos";
import { Imagem } from "@/components/Imagem";

/**
 * Banner do topo das páginas internas, em três composições distintas:
 * - "editorial": fundo claro, filete amarelo da marca e texto à esquerda;
 * - "invertida": fundo claro, texto alinhado à direita (quebra a cadência);
 * - "foto": imagem real do acervo em largura total com o texto sobre ela.
 *
 * O antigo círculo desfocado foi removido: a decoração agora é o filete
 * amarelo e as fotos reais do instituto.
 */
export function PageHero({
  titulo,
  descricao,
  variante = "editorial",
  foto,
  children,
}: {
  titulo: string;
  descricao?: string;
  variante?: "editorial" | "invertida" | "foto";
  /** Obrigatória quando a variante é "foto" */
  foto?: Foto;
  children?: ReactNode;
}) {
  const selo = children;

  if (variante === "foto" && foto) {
    return (
      <section className="relative overflow-hidden pt-28 pb-16">
        <Imagem
          foto={foto}
          prioridade
          sizes="100vw"
          className="absolute inset-0 size-full object-cover"
        />
        {/* véu escuro para o texto ficar legível sobre a foto */}
        <div className="absolute inset-0 bg-ink/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          {selo && (
            <div className="[&>span]:bg-ink-card/70 [&>span]:px-4 [&>span]:py-1.5 [&>span]:rounded-full [&>span]:text-ink-foreground">
              {selo}
            </div>
          )}
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-ink-foreground sm:text-5xl">
            {titulo}
          </h1>
          {descricao && (
            <p className="mt-4 max-w-2xl text-base text-ink-foreground/85 sm:text-lg">
              {descricao}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (variante === "invertida") {
    return (
      <section className="border-b border-border bg-sand pt-28 pb-14">
        <div className="mx-auto flex max-w-7xl flex-col items-end px-4 text-right sm:px-6">
          {selo}
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-balance sm:text-5xl">
            {titulo}
          </h1>
          {descricao && (
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {descricao}
            </p>
          )}
          <div className="mt-6 h-1 w-20 bg-brand-yellow" aria-hidden />
        </div>
      </section>
    );
  }

  // editorial (padrão): filete amarelo no topo + texto à esquerda
  return (
    <section className="bg-sand pt-28 pb-14">
      <div className="rule-yellow" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        {selo}
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">{titulo}</h1>
        {descricao && (
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{descricao}</p>
        )}
      </div>
    </section>
  );
}
