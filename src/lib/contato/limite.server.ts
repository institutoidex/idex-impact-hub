// Limite de envios por origem (IP) no servidor, sem guardar o IP em claro nem em logs.
// A chave é um hash SHA-256 do IP. LIMITAÇÃO: memória da instância — com vários
// workers cada um conta separado e um reinício zera; é proteção de melhor esforço.

export const MAX_CONTATOS = 5;
export const JANELA_CONTATO_MS = 10 * 60 * 1000;

export async function hashOrigem(ip: string): Promise<string> {
  const dados = new TextEncoder().encode(`idex-contato:${ip}`);
  const h = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function criarLimiteContato(max = MAX_CONTATOS, janela = JANELA_CONTATO_MS) {
  const porOrigem = new Map<string, number[]>();
  return {
    /** true = liberado (e conta o pedido); false = passou do limite. */
    permitir(chave: string, agora = Date.now()): boolean {
      const lista = (porOrigem.get(chave) ?? []).filter((t) => agora - t < janela);
      if (lista.length >= max) {
        porOrigem.set(chave, lista);
        return false;
      }
      lista.push(agora);
      porOrigem.set(chave, lista);
      // evita crescimento sem fim da memória
      if (porOrigem.size > 5000) porOrigem.clear();
      return true;
    },
  };
}

export const limiteContatoGlobal = criarLimiteContato();
