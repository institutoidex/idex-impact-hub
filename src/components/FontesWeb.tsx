import { useEffect } from "react";

/**
 * Carrega as fontes do Google (Newsreader + Public Sans) de forma NÃO bloqueante.
 *
 * Por quê: navegadores com bloqueador embutido (ex.: Opera GX) podem segurar a
 * requisição para fonts.googleapis.com. Como um <link rel="stylesheet"> no <head>
 * bloqueia a renderização, a página ficava em "carregamento infinito".
 * Injetando o CSS depois da hidratação, o site aparece na hora com as fontes
 * de sistema e troca para as fontes da marca assim que elas chegarem.
 */
const URL_FONTES =
  "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&family=Public+Sans:wght@400;500;600;700&display=swap";

export function FontesWeb() {
  useEffect(() => {
    if (document.querySelector(`link[data-fontes-idex]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = URL_FONTES;
    link.setAttribute("data-fontes-idex", "");
    document.head.appendChild(link);
  }, []);

  return null;
}
