import { useEffect } from "react";

/**
 * VLibras — intérprete de Libras (Língua Brasileira de Sinais) do Governo Federal.
 * Traduz o conteúdo textual do site para Libras por meio de um avatar 3D.
 * Documentação: https://vlibras.gov.br/doc/widget/installation/webpageintegration.html
 *
 * Como funciona a versão atual (v7+): o script oficial lê a configuração global
 * `window.VLibrasWidget` ANTES de carregar e monta sozinho um botão flutuante
 * (shadow DOM) na lateral da tela — não usamos mais as divs com atributos `vw`.
 */

declare global {
  interface Window {
    VLibrasWidget?: {
      path?: string;
      position?: string; // "l" = esquerda; qualquer outro valor = direita
      avatar?: string; // "icaro" | "hosana" | "guga"
    };
  }
}

const URL_APP = "https://vlibras.gov.br/app";
const URL_SCRIPT = `${URL_APP}/vlibras-plugin.js`;

export function VLibras() {
  useEffect(() => {
    // Evita carregar o script duas vezes (StrictMode/remontagens)
    if (document.querySelector(`script[src="${URL_SCRIPT}"]`)) return;

    // Configuração lida pelo script no carregamento: botão na lateral ESQUERDA,
    // para não brigar com nosso botão de acessibilidade (canto inferior direito)
    window.VLibrasWidget = { path: URL_APP, position: "l" };

    const script = document.createElement("script");
    script.src = URL_SCRIPT;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // O botão e o painel do intérprete são montados pelo script oficial
  return null;
}
