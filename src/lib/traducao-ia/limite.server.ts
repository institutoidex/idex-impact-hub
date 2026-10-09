// Controle de gasto/cota por usuário no servidor: 1 tradução por vez e
// no máximo MAX_POR_JANELA pedidos por janela de tempo.
// LIMITAÇÃO: o estado fica na memória da instância do servidor. Em várias
// instâncias (workers) cada uma conta separado, e um reinício zera a contagem —
// é uma proteção de melhor esforço; a cota real é a do próprio Gemini (429).

export const MAX_POR_JANELA = 6;
export const JANELA_MS = 10 * 60 * 1000;

type Estado = { emAndamento: boolean; pedidos: number[] };

/** Cria um limitador independente (os testes usam um novo a cada caso). */
export function criarLimitador(max = MAX_POR_JANELA, janela = JANELA_MS) {
  const porUsuario = new Map<string, Estado>();
  return {
    /** Reserva uma vaga; devolve o código de recusa ou null se liberado. */
    reservar(userId: string, agora = Date.now()): "em_andamento" | "limite_local" | null {
      const e = porUsuario.get(userId) ?? { emAndamento: false, pedidos: [] };
      e.pedidos = e.pedidos.filter((t) => agora - t < janela);
      if (e.emAndamento) return "em_andamento";
      if (e.pedidos.length >= max) return "limite_local";
      e.emAndamento = true;
      e.pedidos.push(agora);
      porUsuario.set(userId, e);
      return null;
    },
    /** Libera a vaga (sempre chamado no finally do endpoint). */
    liberar(userId: string) {
      const e = porUsuario.get(userId);
      if (e) e.emAndamento = false;
    },
  };
}

/** Limitador compartilhado da instância do servidor. */
export const limitadorGlobal = criarLimitador();
