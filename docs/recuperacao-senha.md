# Recuperação de senha da equipe

## Fluxo
1. `/auth` → "Esqueci minha senha" (ou `/auth?modo=recuperar`). O pedido chama `resetPasswordForEmail` com `redirectTo = urlRedefinicao(locale)` — **sempre** `https://idex-impact-hub.lovable.app/redefinir-senha` (+ `?lang=en-US|es-ES`), mesmo pedindo pelo preview.
2. A tela mostra uma confirmação persistente e genérica ("se houver uma conta…"), que não revela se o e-mail existe. Só falhas de rede/limite (status 0, 429, 5xx) mostram aviso de erro.
3. O link do e-mail (fluxo `implicit` configurado hoje) abre `/redefinir-senha#access_token=…&type=recovery`, ou `#error_code=otp_expired` se venceu/já foi usado.
4. `src/lib/supabase.ts` classifica o link **antes** de criar o cliente (que limpa o hash) e registra o ouvinte de `PASSWORD_RECOVERY` junto da criação, evitando a corrida com a montagem da tela. Só a classificação é guardada, nunca o token.
5. `/redefinir-senha` resolve o estado (`resolverEstadoInicial`) com limite de 10 s: `pronto`, `expirado` (vencido ou usado), `invalido`, `semSessao`, `tempoEsgotado`. Uma sessão comum (ex.: admin logado) **não** libera a troca. O hash é apagado da barra de endereço.
6. O formulário tem nova senha + confirmação, mostrar/ocultar (`aria-pressed`), mínimo de 6 caracteres (o mesmo do login/Supabase atual), erros inline e trava contra envio duplicado.
7. Depois de um `updateUser` bem-sucedido: `signOut`, tela de sucesso persistente e botão para `/auth`. Não manda direto para o painel.

## Arquivos
- `src/lib/recuperacao-senha.ts`: regras puras (URL, classificação do link, estados, validação, falhas, envio único).
- `src/lib/recuperacao-senha.test.ts`: testes com mocks (token expirado, sessão ausente, corrida, tempo esgotado, senhas diferentes, rede, senha fraca/igual, submit duplicado, sucesso, URL por idioma).
- `src/lib/supabase.ts`: `linkInicial` e `foiRecuperacaoVista`.
- `src/routes/auth.tsx` e `src/routes/redefinir-senha.tsx`: as telas.
- `src/i18n/catalogos/auth.ts`: textos em pt-BR, en-US e es-ES.

## Configuração no Supabase (feita pelo Pedro no painel)
O Site URL é `https://idex-impact-hub.lovable.app`. A lista de URLs permitidas tem `/redefinir-senha` sem query e com `?lang=pt-BR`, `?lang=en-US` e `?lang=es-ES`.

## Validado em 01/10/2026
- **Testes automáticos:** 95 passando. Verificação do código sem erros.
- **No navegador local, com o servidor de autenticação simulado** (nenhum e-mail enviado, nenhuma senha real trocada):
  - link expirado mostrado em espanhol;
  - sem link, a tela em inglês pede para abrir o e-mail;
  - um token falso de recuperação abriu o formulário, sem o token aparecer na tela, no endereço ou nos logs;
  - senhas diferentes mostram o erro sem chamar o servidor;
  - mostrar/ocultar funciona;
  - senha fraca e falta de rede mostram as mensagens certas;
  - um clique duplo gera uma única chamada;
  - sucesso mostra a confirmação com o botão para o login;
  - o pedido de link enviou `redirect_to=https://idex-impact-hub.lovable.app/redefinir-senha?lang=en-US` e mostrou a confirmação genérica.
- **Não validado:** um e-mail real de ponta a ponta no site publicado, que depende de publicar.
