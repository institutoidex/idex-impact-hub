// Detecção pura (sem dependências) do erro "coluna traducoes inexistente".

export function erroColunaTraducoesAusente(erro: unknown) {
  // Só reconhece "coluna inexistente": Postgres 42703 (undefined_column) ou
  // PostgREST PGRST204 (coluna fora do cache de schema). Erros de constraint,
  // permissão (RLS) etc. NÃO disparam a nova tentativa sem traduções.
  const e = erro as { code?: string; message?: string } | null;
  if (!e || (e.code !== "42703" && e.code !== "PGRST204")) return false;
  return /traducoes/i.test(e.message ?? "");
}
