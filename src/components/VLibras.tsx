import { useEffect } from "react";

/**
 * VLibras — intérprete de Libras (Língua Brasileira de Sinais) do Governo Federal.
 * Traduz o conteúdo textual do site para Libras por meio de um avatar 3D.
 * Documentação: https://vlibras.gov.br/doc/widget/installation/webpageintegration.html
 */

// Tipagem mínima do objeto global injetado pelo script oficial
declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string, opcoes?: { position?: string }) => void;
    };
  }
}

// Atributos customizados exigidos pelo widget oficial do VLibras
declare module "react" {
  interface HTMLAttributes<T> {
    vw?: string;
    "vw-access-button"?: string;
    "vw-plugin-wrapper"?: string;
  }
}

const URL_APP = "https://vlibras.gov.br/app";
const URL_SCRIPT = `${URL_APP}/vlibras-plugin.js`;

export function VLibras() {
  useEffect(() => {
    // Evita carregar o script duas vezes (StrictMode/remontagens)
    if (document.querySelector(`script[src="${URL_SCRIPT}"]`)) return;

    const script = document.createElement("script");
    script.src = URL_SCRIPT;
    script.async = true;
    script.onload = () => {
      // Posição à esquerda para não sobrepor o botão de acessibilidade (canto inferior direito)
      if (window.VLibras) {
        new window.VLibras.Widget(URL_APP, { position: "left" });
      }
    };
    document.body.appendChild(script);
  }, []);

  // Estrutura exigida pelo widget oficial: os atributos vw/vw-access-button/vw-plugin-wrapper
  // são os seletores que o script usa para montar o botão e o painel do intérprete.
  return (
    <div vw="" className="enabled print:hidden">
      <div vw-access-button="" className="active" />
      <div vw-plugin-wrapper="">
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  );
}
