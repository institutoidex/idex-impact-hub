// Mensagens de validação/envio de arquivos (imagens, documentos e pastas da mídia).
// O armazenamento devolve só um código (ErroArquivo); o texto visível sai daqui.
import { definirMensagens } from "../mensagens";

export const arquivos = definirMensagens(
  {
    formatoImagem: "Formato não aceito. Use JPG, PNG, WEBP, GIF ou AVIF.",
    imagemGrande: "Arquivo muito grande. O limite é 10 MB.",
    formatoDocumento: "Formato não aceito. Use PDF, XLSX ou CSV.",
    documentoGrande: "Arquivo muito grande. O limite é 25 MB.",
    duplicada: (nome: string) =>
      `Já existe uma imagem chamada “${nome}” nesta pasta. Renomeie o arquivo e envie de novo.`,
    nomePastaInvalido: "Informe um nome válido para a pasta.",
  },
  {
    "en-US": {
      formatoImagem: "Unsupported format. Use JPG, PNG, WEBP, GIF, or AVIF.",
      imagemGrande: "File is too large. The limit is 10 MB.",
      formatoDocumento: "Unsupported format. Use PDF, XLSX, or CSV.",
      documentoGrande: "File is too large. The limit is 25 MB.",
      duplicada: (nome: string) =>
        `An image named “${nome}” already exists in this folder. Rename the file and upload it again.`,
      nomePastaInvalido: "Enter a valid folder name.",
    },
    "es-ES": {
      formatoImagem: "Formato no admitido. Usa JPG, PNG, WEBP, GIF o AVIF.",
      imagemGrande: "El archivo es demasiado grande. El límite es de 10 MB.",
      formatoDocumento: "Formato no admitido. Usa PDF, XLSX o CSV.",
      documentoGrande: "El archivo es demasiado grande. El límite es de 25 MB.",
      duplicada: (nome: string) =>
        `Ya existe una imagen llamada «${nome}» en esta carpeta. Cambia el nombre del archivo y vuelve a subirlo.`,
      nomePastaInvalido: "Indica un nombre de carpeta válido.",
    },
  },
);
