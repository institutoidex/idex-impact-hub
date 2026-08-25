import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Placeholder, PlaceholderBox } from "@/components/Placeholder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/transparencia")({
  head: () => ({
    meta: [
      { title: "Transparência — Instituto IDEX" },
      {
        name: "description",
        content:
          "Estatuto, relatórios, documentos, perguntas frequentes e LGPD do Instituto IDEX.",
      },
      { property: "og:title", content: "Transparência — Instituto IDEX" },
      { property: "og:description", content: "Documentos e prestação de contas do instituto." },
    ],
  }),
  component: Transparencia,
});

// Cada aba lista documentos que ainda não foram fornecidos.
const DOCS: Record<string, string[]> = {
  estatuto: ["[estatuto social — arquivo a enviar]"],
  relatorios: [
    "[relatório de atividades — ano a definir]",
    "[prestação de contas — ano a definir]",
  ],
  documentos: ["[ata de assembleia — a enviar]", "[declarações — a enviar]"],
  lgpd: ["[política de privacidade — a redigir]", "[termo de uso — a redigir]"],
};

const FAQ = [
  "Como faço para inscrever uma criança nos projetos?",
  "Como o instituto usa as doações?",
  "Como me tornar voluntário?",
  "Como minha empresa pode ser parceira?",
];

function Transparencia() {
  return (
    <>
      <PageHero
        titulo="Conta aberta com quem apoia"
        descricao="Esta área reúne os documentos do instituto. Os arquivos oficiais ainda serão publicados."
      >
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Transparência
        </span>
      </PageHero>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal>
          <Tabs defaultValue="estatuto">
            <TabsList className="flex h-auto flex-wrap justify-start gap-1 rounded-full bg-muted p-1">
              <TabsTrigger value="estatuto" className="rounded-full">Estatuto</TabsTrigger>
              <TabsTrigger value="relatorios" className="rounded-full">Relatórios</TabsTrigger>
              <TabsTrigger value="documentos" className="rounded-full">Documentos</TabsTrigger>
              <TabsTrigger value="faq" className="rounded-full">Perguntas Frequentes</TabsTrigger>
              <TabsTrigger value="lgpd" className="rounded-full">LGPD</TabsTrigger>
            </TabsList>

            {(["estatuto", "relatorios", "documentos", "lgpd"] as const).map((chave) => (
              <TabsContent key={chave} value={chave} className="mt-8 space-y-4">
                {(DOCS[chave] ?? []).map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center gap-4 rounded-2xl border border-dashed border-border bg-card p-5"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-muted">
                      <FileText className="size-5 text-secondary" aria-hidden />
                    </span>
                    <div>
                      <p className="font-display">{doc}</p>
                      <p className="text-sm text-muted-foreground">Documento ainda não publicado.</p>
                    </div>
                  </div>
                ))}
                <PlaceholderBox
                  titulo="Espaço para novos arquivos"
                  nota="Os PDFs oficiais entram aqui quando enviados."
                />
              </TabsContent>
            ))}

            <TabsContent value="faq" className="mt-8">
              <Accordion type="single" collapsible className="w-full">
                {FAQ.map((p, i) => (
                  <AccordionItem key={p} value={`item-${i}`}>
                    <AccordionTrigger className="text-left font-display text-base">
                      {p}
                    </AccordionTrigger>
                    <AccordionContent>
                      <Placeholder>[resposta oficial a definir]</Placeholder>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </Reveal>
      </section>
    </>
  );
}
