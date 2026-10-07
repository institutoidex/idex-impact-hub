/**
 * Decisão pura da GuardaAdmin (testável sem React).
 *
 * Regra importante: depois que o servidor JÁ confirmou o papel admin nesta
 * visita, uma falha passageira de revalidação (ex.: rede suspensa enquanto o
 * seletor de arquivos do sistema estava aberto) NÃO expulsa do painel — antes
 * isso mandava para /auth, que devolvia para /admin e recriava a tela,
 * apagando o formulário aberto. A proteção real continua no banco (RLS):
 * qualquer gravação sem permissão é recusada lá.
 */
export type EstadoGuarda = "verificando" | "liberado" | "semSessao" | "semPermissao" | "erro";

export function estadoGuarda(e: {
  carregandoSessao: boolean;
  temSessao: boolean;
  papel: boolean | undefined;
  papelSucesso: boolean;
  papelErro: boolean;
  /** true se uma consulta real ao servidor já confirmou admin nesta visita */
  confirmadoNoServidor: boolean;
}): EstadoGuarda {
  if (!e.carregandoSessao && !e.temSessao) return "semSessao";
  if (!e.temSessao) return "verificando";
  if (e.papelSucesso && e.papel === false) return "semPermissao";
  if (e.papelErro && !e.confirmadoNoServidor) return "erro";
  return e.papel === true ? "liberado" : "verificando";
}
