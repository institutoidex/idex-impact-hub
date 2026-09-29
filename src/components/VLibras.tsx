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

    // Configuração lida pelo script no carregamento: lateral esquerda.
    // A posição final (canto inferior) é ajustada em posicionarBotao().
    window.VLibrasWidget = { path: URL_APP, position: "l" };

    // Carrega só depois que a página terminou de carregar: em navegadores com
    // bloqueador embutido (Opera GX) a requisição pode ficar pendurada e segurar
    // o indicador de carregamento da aba.
    let cancelado = false;
    const carregar = () => {
      if (cancelado) return;
      const script = document.createElement("script");
      script.src = URL_SCRIPT;
      script.async = true;
      script.onerror = () => script.remove(); // falha no widget não afeta o site
      document.body.appendChild(script);
    };

    if (document.readyState === "complete") {
      setTimeout(carregar, 1200);
    } else {
      window.addEventListener("load", () => setTimeout(carregar, 1200), { once: true });
    }

    // O widget monta o botão (#vlibras-access) num shadow DOM aberto, no meio da
    // lateral (top: calc(50vh - 20px)). Injetamos um estilo no próprio shadow DOM
    // para levá-lo ao canto inferior esquerdo, longe do nosso botão de
    // acessibilidade (canto inferior direito). O widget pode reescrever o shadow
    // DOM ao abrir/fechar o painel ou recriar o wrapper em qualquer nó, então
    // observamos a árvore inteira (subtree) e também o shadow root, reaplicando
    // o estilo sempre que ele sumir. O estilo inline também é reforçado.
    const CSS_POSICAO =
      "#vlibras-access{top:auto!important;bottom:24px!important;left:16px!important;right:auto!important;}";
    const raizesObservadas = new WeakSet<ShadowRoot>();
    let observadorShadow: MutationObserver | null = null;

    const posicionarBotao = () => {
      const raiz = document.getElementById("vlibras-access-wrapper")?.shadowRoot;
      if (!raiz) return;
      if (!raiz.getElementById("idex-posicao-vlibras")) {
        const estilo = document.createElement("style");
        estilo.id = "idex-posicao-vlibras";
        estilo.textContent = CSS_POSICAO;
        raiz.appendChild(estilo);
      }
      // Reforço inline: vence estilos reinjetados pelo widget
      const botao = raiz.getElementById("vlibras-access") as HTMLElement | null;
      if (botao && botao.style.getPropertyValue("bottom") !== "24px") {
        botao.style.setProperty("top", "auto", "important");
        botao.style.setProperty("bottom", "24px", "important");
        botao.style.setProperty("left", "16px", "important");
        botao.style.setProperty("right", "auto", "important");
      }
      // Observa mudanças internas do shadow root (reescritas do widget)
      if (!raizesObservadas.has(raiz)) {
        raizesObservadas.add(raiz);
        observadorShadow?.disconnect();
        observadorShadow = new MutationObserver(posicionarBotao);
        observadorShadow.observe(raiz, { childList: true, subtree: true });
      }
    };

    // subtree: true cobre o wrapper inserido em qualquer nó descendente
    const observador = new MutationObserver(posicionarBotao);
    observador.observe(document.body, { childList: true, subtree: true });
    posicionarBotao();

    return () => {
      cancelado = true;
      observador.disconnect();
      observadorShadow?.disconnect();
    };
  }, []);

  // O botão e o painel do intérprete são montados pelo script oficial
  return null;
}
