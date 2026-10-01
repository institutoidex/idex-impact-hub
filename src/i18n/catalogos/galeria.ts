// Mensagens do visor de fotos (lightbox) e galeria.
import { definirMensagens } from "../mensagens";

export const galeria = definirMensagens(
  {
    ampliarImagem: (alt: string) => `Ampliar imagem: ${alt}`,
    ampliarFoto: (alt: string) => `Ampliar foto: ${alt}`,
    visualizador: "Visualizador de fotos",
    diminuirZoom: "Diminuir zoom",
    aumentarZoom: "Aumentar zoom",
    fecharEsc: "Fechar (Esc)",
    fotoAnterior: "Foto anterior",
    proximaFoto: "Próxima foto",
    contador: (atual: number, total: number) => `${atual} / ${total}`,
    dicaComSetas: "Setas para navegar · + / − para zoom · 0 para redefinir · Esc para fechar",
    dicaSemSetas: "+ / − para zoom · 0 para redefinir · Esc para fechar",
  },
  {
    "en-US": {
      ampliarImagem: (alt: string) => `Enlarge image: ${alt}`,
      ampliarFoto: (alt: string) => `Enlarge photo: ${alt}`,
      visualizador: "Photo viewer",
      diminuirZoom: "Zoom out",
      aumentarZoom: "Zoom in",
      fecharEsc: "Close (Esc)",
      fotoAnterior: "Previous photo",
      proximaFoto: "Next photo",
      contador: (atual: number, total: number) => `${atual} / ${total}`,
      dicaComSetas: "Arrows to navigate · + / − to zoom · 0 to reset · Esc to close",
      dicaSemSetas: "+ / − to zoom · 0 to reset · Esc to close",
    },
    "es-ES": {
      ampliarImagem: (alt: string) => `Ampliar imagen: ${alt}`,
      ampliarFoto: (alt: string) => `Ampliar foto: ${alt}`,
      visualizador: "Visor de fotos",
      diminuirZoom: "Reducir zoom",
      aumentarZoom: "Aumentar zoom",
      fecharEsc: "Cerrar (Esc)",
      fotoAnterior: "Foto anterior",
      proximaFoto: "Foto siguiente",
      contador: (atual: number, total: number) => `${atual} / ${total}`,
      dicaComSetas: "Flechas para navegar · + / − para zoom · 0 para restablecer · Esc para cerrar",
      dicaSemSetas: "+ / − para zoom · 0 para restablecer · Esc para cerrar",
    },
  },
);
