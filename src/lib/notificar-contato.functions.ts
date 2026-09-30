import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EMAIL_CONTATO } from "./email-contato";

// Dados da mensagem que serão repassados por e-mail à equipe
const esquema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  assunto: z.string().trim().min(2).max(150),
  mensagem: z.string().trim().min(5).max(2000),
});

/**
 * Avisa a equipe por e-mail quando chega mensagem nova no formulário.
 * Hoje fica inativo: sem remetente definido, apenas retorna "pendente".
 * A mensagem continua sendo gravada no banco normalmente.
 */
export const notificarContato = createServerFn({ method: "POST" })
  .inputValidator((dados: unknown) => esquema.parse(dados))
  .handler(async ({ data }) => {
    if (!EMAIL_CONTATO.remetente) {
      return { enviado: false, motivo: "pendente" as const };
    }
    // Ponto de ativação: aqui entra o envio real para EMAIL_CONTATO.principal
    // (com cópia para EMAIL_CONTATO.copia) assim que o remetente for configurado.
    void data;
    return { enviado: false, motivo: "pendente" as const };
  });
