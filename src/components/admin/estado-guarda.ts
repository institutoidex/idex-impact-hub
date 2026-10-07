/**
 * Decisão pura da GuardaAdmin (testável sem React).
 *
 * Regra importante: depois que o servidor JÁ confirmou o papel admin para o
 * MESMO usuário (mesmo id), uma falha passageira de revalidação (ex.: rede
 * suspensa enquanto o seletor de arquivos estava aberto) NÃO expulsa do
 * painel — antes isso mandava para /auth, que devolvia para /admin e recriava
 * a tela, apagando o formulário aberto. A proteção real continua no banco
 * (RLS): qualquer gravação sem permissão é recusada lá.
 */
export type EstadoGuarda = "verificando" | "liberado" | "semSessao" | "semPermissao" | "erro";

export function estadoGuarda(e: {
  carregandoSessao: boolean;
  temSessao: boolean;
  papel: boolean | undefined;
  papelSucesso: boolean;
  papelErro: boolean;
  /** true se uma consulta real ao servidor já confirmou admin para o usuário ATUAL */
  confirmadoNoServidor: boolean;
}): EstadoGuarda {
  if (!e.carregandoSessao && !e.temSessao) return "semSessao";
  if (!e.temSessao) return "verificando";
  if (e.papelSucesso && e.papel === false) return "semPermissao";
  if (e.papelErro && !e.confirmadoNoServidor) return "erro";
  return e.papel === true ? "liberado" : "verificando";
}

/**
 * Atualiza "para qual usuário o servidor confirmou admin" (ou null).
 *
 * - `respostaServidor` deve vir SOMENTE de uma busca real concluída com
 *   sucesso (no React Query: `dataUpdateCount > 0 && isSuccess`). O valor
 *   otimista do sessionStorage (`initialData`) não conta: ele não incrementa
 *   `dataUpdateCount`. Atenção: `isFetched` NÃO serve, pois também fica true
 *   depois de uma busca que FALHOU, com o cache otimista ainda em `data`.
 * - Trocar ou perder o usuário zera na hora (no mesmo render), então a
 *   confirmação de A nunca vale para B.
 * - Resposta real `false` revoga imediatamente.
 */
export function confirmacaoPara(
  anterior: string | null,
  e: { userId: string | null; temSessao: boolean; respostaServidor: boolean | undefined },
): string | null {
  if (!e.temSessao || !e.userId) return null;
  const base = anterior === e.userId ? anterior : null;
  if (e.respostaServidor === true) return e.userId;
  if (e.respostaServidor === false) return null;
  return base;
}
