// Fluxo único do formulário de contato (POST /api/public/contato), testável com dependências falsas.
// Ordem: limite por origem → corpo limitado → validação estrita → armadilha anti-robô →
// GRAVA a mensagem → só então avisa a equipe por e-mail → registra o status do aviso.
// Falha ao gravar: nenhum e-mail sai. Falha no e-mail: a mensagem continua guardada
// e o visitante recebe confirmação normal (não precisa reenviar).
import {
  LIMITE_CORPO_CONTATO,
  STATUS_HTTP_CONTATO,
  esquemaContato,
  type CodigoErroContato,
  type RespostaContato,
  type StatusNotificacao,
} from "./contrato";
import { lerCorpoLimitado } from "@/lib/traducao-ia/endpoint.server";
import type { ConfigEmail } from "./config.server";
import type { EmailMontado } from "./resend.server";
import { montarEmailContato } from "./email-html";

export type MensagemGravada = {
  id: string;
  nome: string;
  email: string;
  assunto: string | null;
  mensagem: string;
  criado_em?: string | null;
  notificacao_status?: string | null;
};

export type ResultadoInsercao =
  | { tipo: "criada"; criadoEm: Date }
  | { tipo: "duplicada" }
  | { tipo: "erro" };

export type DependenciasContato = {
  /** Chave da origem já em hash (nunca o IP em claro). */
  origem: () => Promise<string>;
  limite: { permitir: (chave: string) => boolean };
  banco: {
    inserir: (m: Omit<MensagemGravada, "criado_em" | "notificacao_status">) => Promise<ResultadoInsercao>;
    buscar: (id: string) => Promise<MensagemGravada | null>;
    /** Grava o status do aviso; ignora em silêncio se a coluna ainda não existir. */
    marcarNotificacao: (id: string, status: StatusNotificacao) => Promise<void>;
  };
  lerConfig: () => ConfigEmail | null;
  enviar: (cfg: ConfigEmail, e: EmailMontado) => Promise<void>;
  agora?: () => Date;
};

function responder(corpo: RespostaContato, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
const erro = (c: CodigoErroContato) => responder({ ok: false, codigo: c }, STATUS_HTTP_CONTATO[c]);

export async function processarContato(request: Request, deps: DependenciasContato): Promise<Response> {
  if (!deps.limite.permitir(await deps.origem())) return erro("limite");

  const texto = await lerCorpoLimitado(request, LIMITE_CORPO_CONTATO);
  if (!texto) return erro("payload_invalido");
  let json: unknown;
  try {
    json = JSON.parse(texto);
  } catch {
    return erro("payload_invalido");
  }
  const p = esquemaContato.safeParse(json);
  if (!p.success) return erro("payload_invalido");
  const { site, ...dados } = p.data;

  // robô preencheu o campo invisível: finge sucesso, não grava nem envia
  if (site && site.trim() !== "") return responder({ ok: true, protocolo: dados.id });

  let criadoEm: Date;
  let jaNotificada = false;
  let r: ResultadoInsercao;
  try {
    r = await deps.banco.inserir(dados);
  } catch {
    r = { tipo: "erro" };
  }
  if (r.tipo === "erro") {
    console.warn("[contato] falha_registro");
    return erro("falha_registro");
  }
  if (r.tipo === "duplicada") {
    // mesmo id: só confirma se o conteúdo for idêntico; nunca sobrescreve nem devolve dados
    const existente = await deps.banco.buscar(dados.id).catch(() => null);
    const igual =
      existente &&
      existente.nome === dados.nome &&
      existente.email === dados.email &&
      (existente.assunto ?? "") === dados.assunto &&
      existente.mensagem === dados.mensagem;
    if (!igual) return erro("conflito");
    criadoEm = existente.criado_em ? new Date(existente.criado_em) : (deps.agora?.() ?? new Date());
    jaNotificada = existente.notificacao_status === "enviada";
  } else {
    criadoEm = r.criadoEm;
  }

  if (!jaNotificada) await notificar(dados, criadoEm, deps);
  return responder({ ok: true, protocolo: dados.id });
}

/** Avisa a equipe; nunca lança — o resultado vira status gravado e log só com código. */
async function notificar(
  d: { id: string; nome: string; email: string; assunto: string; mensagem: string },
  recebidoEm: Date,
  deps: DependenciasContato,
) {
  let status: StatusNotificacao;
  const cfg = deps.lerConfig();
  if (!cfg) {
    status = "nao_configurado";
  } else {
    try {
      const m = montarEmailContato({ ...d, recebidoEm });
      await deps.enviar(cfg, { id: d.id, responderPara: d.email, ...m });
      status = "enviada";
    } catch (e) {
      status = "falhou";
      console.warn(`[contato] email_${(e as { codigo?: string })?.codigo ?? "falha"}`);
    }
  }
  if (status === "nao_configurado") console.warn("[contato] email_nao_configurado");
  await deps.banco.marcarNotificacao(d.id, status).catch(() => {});
}
