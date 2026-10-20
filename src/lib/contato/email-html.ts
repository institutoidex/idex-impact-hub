// Monta o e-mail de aviso "Nova mensagem pelo site" (HTML + texto puro).
// Função pura: sem rede e sem segredos. Todo dado do visitante passa por escape.
// Layout em tabelas de 600px com CSS inline (compatível com Gmail e Outlook).

/** Logotipo atual do instituto (PNG público em HTTPS, mesmo arquivo do site). */
export const LOGO_EMAIL_URL =
  "https://institutoidex.org/__l5e/assets-v1/ae4aafc8-5732-41bf-a2d9-66ae46387b25/logo-idex-horizontal-v2.png";
/** Painel onde a equipe lê as mensagens. */
export const PAINEL_URL = "https://institutoidex.org/admin";

// Verde da marca só em faixa decorativa; texto/CTA/link usam verde escuro (contraste AA).
const VERDE_MARCA = "#00A859";
const VERDE = "#007A45";
const PRETO = "#242323";
// Cinza escuro para texto auxiliar (o #A0A09F da marca não tem contraste em fundo branco).
const CINZA = "#626964";

export type DadosEmailContato = {
  id: string;
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  recebidoEm: Date;
};

/** Escapa texto para HTML (conteúdo e atributos). */
export function escaparHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Remove quebras de linha e caracteres de controle de valores usados em cabeçalhos. */
export function limparCabecalho(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\r\n\u0000-\u001f\u007f]+/g, " ").trim();
}

/** Data/hora no fuso de São Paulo, formato brasileiro. */
export function formatarRecebido(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

/** Assunto do e-mail (sem quebras de linha, tamanho contido). */
export function assuntoEmail(assunto: string): string {
  return limparCabecalho(`Nova mensagem pelo site: ${assunto}`).slice(0, 200);
}

/** Corpo da mensagem em parágrafos HTML, preservando quebras de linha. */
function paragrafos(texto: string): string {
  return texto
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:${PRETO};">${escaparHtml(p).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

function linha(rotulo: string, valorHtml: string): string {
  return `<tr><td style="padding:6px 0;width:110px;vertical-align:top;font-size:13px;color:${CINZA};font-family:Arial,Helvetica,sans-serif;">${rotulo}</td><td style="padding:6px 0;vertical-align:top;font-size:15px;color:${PRETO};font-family:Arial,Helvetica,sans-serif;word-break:break-word;">${valorHtml}</td></tr>`;
}

/** Gera assunto, HTML e texto puro equivalentes. */
export function montarEmailContato(d: DadosEmailContato) {
  const nome = escaparHtml(limparCabecalho(d.nome));
  const assunto = escaparHtml(limparCabecalho(d.assunto));
  const emailLimpo = limparCabecalho(d.email);
  const email = escaparHtml(emailLimpo);
  // mailto: codificado e depois escapado para o atributo
  const mailto = escaparHtml(`mailto:${encodeURIComponent(emailLimpo)}`);
  const quando = formatarRecebido(d.recebidoEm);
  const id = escaparHtml(d.id);
  const preheader = escaparHtml(limparCabecalho(`${d.nome} enviou: ${d.assunto}`).slice(0, 140));

  const html = `<!DOCTYPE html>
<html lang="pt-BR" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Nova mensagem pelo site</title>
</head>
<body lang="pt-BR" dir="ltr" style="margin:0;padding:0;background-color:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#ffffff;">${preheader}</div>
<table role="presentation" lang="pt-BR" dir="ltr" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border:1px solid #e6e6e6;border-radius:12px;overflow:hidden;">
<tr><td align="center" style="padding:28px 24px 20px 24px;background-color:#ffffff;">
<img src="${LOGO_EMAIL_URL}" width="200" height="111" alt="Instituto IDEX" style="display:block;width:200px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;">
</td></tr>
<tr><td style="height:4px;line-height:4px;font-size:0;background-color:${VERDE_MARCA};">&nbsp;</td></tr>
<tr><td style="padding:18px 24px;background-color:${VERDE};">
<h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;color:#ffffff;font-weight:normal;">Nova mensagem pelo site</h1>
</td></tr>
<tr><td style="padding:24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${linha("Nome", nome)}
${linha("E-mail", `<a href="${mailto}" style="color:${VERDE};text-decoration:underline;">${email}</a>`)}
${linha("Assunto", assunto)}
${linha("Recebida em", `${escaparHtml(quando)} (horário de Brasília)`)}
${linha("Protocolo", `<span style="font-family:Consolas,Menlo,monospace;font-size:13px;">${id}</span>`)}
</table>
<div style="height:1px;line-height:1px;background-color:#e6e6e6;margin:18px 0;">&nbsp;</div>
<div style="font-family:Arial,Helvetica,sans-serif;">${paragrafos(d.mensagem)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0 6px 0;">
<tr><td align="center" bgcolor="${VERDE}" style="border-radius:8px;">
<a href="${PAINEL_URL}" style="display:inline-block;padding:12px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">Abrir painel</a>
</td></tr>
</table>
<p style="margin:16px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${CINZA};">Ao clicar em responder, sua resposta vai direto para o e-mail do visitante.</p>
</td></tr>
<tr><td style="padding:16px 24px;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${CINZA};" align="center">
Instituto IDEX · Aviso automático do formulário de contato do site
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const texto = [
    "Nova mensagem pelo site",
    "",
    `Nome: ${limparCabecalho(d.nome)}`,
    `E-mail: ${emailLimpo}`,
    `Assunto: ${limparCabecalho(d.assunto)}`,
    `Recebida em: ${quando} (horário de Brasília)`,
    `Protocolo: ${d.id}`,
    "",
    d.mensagem.replace(/\r\n?/g, "\n").trim(),
    "",
    `Abrir painel: ${PAINEL_URL}`,
    "Ao clicar em responder, sua resposta vai direto para o e-mail do visitante.",
    "",
    "Instituto IDEX · Aviso automático do formulário de contato do site",
  ].join("\n");

  return { assunto: assuntoEmail(d.assunto), html, texto };
}
