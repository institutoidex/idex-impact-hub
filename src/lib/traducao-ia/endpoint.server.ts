// Lógica do endpoint POST /api/traducao-noticia, separada da rota para ser testável.
// Ordem: token → admin → corpo/validação → chave configurada → limite → Gemini.
// Logs só com o código do erro (nunca texto, token, chave ou corpo do provedor).
import {
  LIMITE_CORPO,
  STATUS_POR_CODIGO,
  esquemaEntrada,
  type CodigoServidor,
  type EntradaTraducao,
  type RespostaTraducao,
  type TraducoesGeradas,
} from "./contrato";
import type { ResultadoAdmin } from "./auth.server";
import { ErroTraducao } from "./gemini.server";

export type Dependencias = {
  verificar: (request: Request) => Promise<ResultadoAdmin>;
  /** Lê GEMINI_API_KEY do ambiente do servidor na hora do pedido. */
  lerChave: () => string | undefined;
  traduzir: (
    entrada: EntradaTraducao,
    opcoes: { chave: string; sinal?: AbortSignal },
  ) => Promise<TraducoesGeradas>;
  limitador: {
    reservar: (userId: string) => "em_andamento" | "limite_local" | null;
    liberar: (userId: string) => void;
  };
};

function responder(corpo: RespostaTraducao, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function erro(codigo: CodigoServidor) {
  return responder({ ok: false, codigo }, STATUS_POR_CODIGO[codigo]);
}

export async function processarTraducao(request: Request, deps: Dependencias): Promise<Response> {
  const admin = await deps.verificar(request);
  if (!admin.ok) return erro(admin.codigo);

  // corpo bruto limitado antes do parse
  const texto = await request.text().catch(() => "");
  if (!texto || texto.length > LIMITE_CORPO) return erro("payload_invalido");
  let json: unknown;
  try {
    json = JSON.parse(texto);
  } catch {
    return erro("payload_invalido");
  }
  const entrada = esquemaEntrada.safeParse(json);
  if (!entrada.success) return erro("payload_invalido");

  const chave = deps.lerChave();
  if (!chave) {
    console.warn("[traducao-ia] nao_configurado");
    return erro("nao_configurado");
  }

  const recusa = deps.limitador.reservar(admin.userId);
  if (recusa) return erro(recusa);
  try {
    const traducoes = await deps.traduzir(entrada.data, { chave, sinal: request.signal });
    return responder({ ok: true, traducoes });
  } catch (e) {
    const codigo = e instanceof ErroTraducao ? e.codigo : "falha_provedor";
    console.warn(`[traducao-ia] ${codigo}`);
    return erro(codigo);
  } finally {
    deps.limitador.liberar(admin.userId);
  }
}
