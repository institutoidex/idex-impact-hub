// Acesso ao banco para o formulário de contato — SOMENTE servidor.
// Usa o cliente service_role (já existente) apenas na tabela `mensagens`, para:
// inserir com o id enviado, reler a linha em caso de id repetido (conferir idempotência)
// e gravar o status do aviso. Nada disso é exposto ao navegador.
import { criarSupabaseAdmin } from "@/lib/supabase.server";
import type { DependenciasContato, MensagemGravada } from "./endpoint.server";

type ErroPg = { code?: string; message?: string } | null;
const colunaAusente = (e: ErroPg) => e?.code === "42703" || e?.code === "PGRST204";

export function criarBancoContato(): DependenciasContato["banco"] {
  const db = criarSupabaseAdmin();
  // cliente tipado (Database.mensagens inclui id e as colunas opcionais de status)
  const tabela = () => db.from("mensagens");
  return {
    async inserir(m) {
      const { data, error } = await tabela().insert([{ ...m, assunto: m.assunto ?? null }]).select("criado_em").single();
      if (error) return (error as ErroPg)?.code === "23505" ? { tipo: "duplicada" } : { tipo: "erro" };
      return { tipo: "criada", criadoEm: new Date(data.criado_em) };
    },
    async buscar(id) {
      const r = await tabela()
        .select("id,nome,email,assunto,mensagem,criado_em,notificacao_status")
        .eq("id", id)
        .maybeSingle();
      if (!r.error) return r.data satisfies MensagemGravada | null;
      // antes da migração a coluna de status não existe: relê sem ela
      if (!colunaAusente(r.error)) return null;
      const r2 = await tabela().select("id,nome,email,assunto,mensagem,criado_em").eq("id", id).maybeSingle();
      return r2.error ? null : (r2.data satisfies MensagemGravada | null);
    },
    async marcarNotificacao(id, status) {
      const { error } = await tabela()
        .update({ notificacao_status: status, notificacao_em: new Date().toISOString() })
        .eq("id", id);
      if (error && !colunaAusente(error)) console.warn("[contato] falha_status");
    },
  };
}
