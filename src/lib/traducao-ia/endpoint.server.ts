// Lógica do endpoint POST /api/traducao-noticia (todas as entidades do registro),
// separada da rota para ser testável. Limite por usuário é o MESMO para todas.
// Ordem: token → admin → corpo/validação → chave configurada → limite → Gemini.
// Logs só com o código do erro + diagnóstico allowlisted (nunca texto, token, chave ou corpo do provedor).
import {
  LIMITE_CORPO,
  STATUS_POR_CODIGO,
  analisarEntrada,
  type CodigoServidor,
  type PedidoTraducao,
  type RespostaTraducao,
  type TraducoesCampos,
} from "./contrato";
import type { ResultadoAdmin } from "./auth.server";
import { ErroTraducao } from "./gemini.server";

export type Dependencias = {
  verificar: (request: Request) => Promise<ResultadoAdmin>;
  /** Lê GEMINI_API_KEY do ambiente do servidor na hora do pedido. */
  lerChave: () => string | undefined;
  traduzir: (
    pedido: PedidoTraducao,
    opcoes: { chave: string; sinal?: AbortSignal },
  ) => Promise<TraducoesCampos>;
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
  // falha inesperada na verificação (rede, Supabase fora): resposta JSON segura,
  // log só com o código — nunca o erro bruto (pode conter token/URL)
  let admin: ResultadoAdmin;
  try {
    admin = await deps.verificar(request);
  } catch {
    console.warn("[traducao-ia] falha_verificacao");
    return erro("falha_verificacao");
  }
  if (!admin.ok) return erro(admin.codigo);

  // corpo bruto lido em stream e cortado em LIMITE_CORPO bytes reais
  const texto = await lerCorpoLimitado(request, LIMITE_CORPO);
  if (!texto) return erro("payload_invalido");
  let json: unknown;
  try {
    json = JSON.parse(texto);
  } catch {
    return erro("payload_invalido");
  }
  // notícia no formato antigo ou { entidade, campos } do registro (allowlist)
  const pedido = analisarEntrada(json);
  if (!pedido) return erro("payload_invalido");

  const chave = deps.lerChave();
  if (!chave) {
    console.warn("[traducao-ia] nao_configurado");
    return erro("nao_configurado");
  }

  const recusa = deps.limitador.reservar(admin.userId);
  if (recusa) return erro(recusa);
  try {
    const traducoes = await deps.traduzir(pedido, { chave, sinal: request.signal });
    return responder({ ok: true, traducoes });
  } catch (e) {
    const codigo = e instanceof ErroTraducao ? e.codigo : "falha_provedor";
    // diagnóstico seguro permanente: só códigos allowlisted, nunca texto/chave/token.
    // Exceção fora do serviço (ex.: TypeError no runtime publicado) registra só o nome do tipo.
    const nome = e instanceof Error && /^[A-Za-z]{1,40}$/.test(e.name) ? e.name : "desconhecido";
    const diag = e instanceof ErroTraducao ? (e.diag ? ` ${e.diag}` : " origem=servico") : ` excecao=${nome}`;
    console.warn(`[traducao-ia] ${codigo}${diag}`);
    return erro(codigo);
  } finally {
    deps.limitador.liberar(admin.userId);
  }
}

/**
 * Lê o corpo em pedaços e para assim que passar de `limite` bytes, sem
 * materializar o texto inteiro. Retorna null se vazio, grande demais,
 * UTF-8 inválido ou se a leitura falhar.
 */
export async function lerCorpoLimitado(request: Request, limite: number): Promise<string | null> {
  const declarado = Number(request.headers.get("content-length"));
  if (Number.isFinite(declarado) && declarado > limite) return null;
  if (!request.body) return null;
  const leitor = request.body.getReader();
  const pedacos: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) break;
      total += value.byteLength;
      if (total > limite) {
        await leitor.cancel().catch(() => {});
        return null;
      }
      pedacos.push(value);
    }
  } catch {
    return null;
  }
  if (total === 0) return null;
  const junto = new Uint8Array(total);
  let pos = 0;
  for (const p of pedacos) {
    junto.set(p, pos);
    pos += p.byteLength;
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(junto);
  } catch {
    return null;
  }
}
