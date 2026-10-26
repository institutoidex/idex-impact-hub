# Instituto IDEX — Site institucional

Site oficial do **Instituto IDEX**, organização social brasileira fundada em 2007 que atua com crianças, jovens, esporte, cultura e comunidade. O principal projeto em andamento é o **Talento Brasil**: treino de futebol gratuito para 200 crianças e jovens, em parceria com o Clube Esportivo Penha.

- **Site publicado:** https://institutoidex.org
- **Instagram:** [@idexbrasil](https://instagram.com/idexbrasil) ·
- **Facebook:** [/idexsocial](https://facebook.com/idexsocial)

---

## Sumário

1. [Visão geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias](#tecnologias)
4. [Estrutura do projeto](#estrutura-do-projeto)
5. [Como rodar localmente](#como-rodar-localmente)
6. [Variáveis de ambiente e segredos](#variáveis-de-ambiente-e-segredos)
7. [Banco de dados](#banco-de-dados)
8. [Testes](#testes)
9. [Identidade visual](#identidade-visual)
10. [Regras de conteúdo](#regras-de-conteúdo)
11. [Documentação técnica](#documentação-técnica)
12. [Publicação](#publicação)

---

## Visão geral

O site apresenta o instituto, seus projetos e documentos de transparência, publica notícias e recebe mensagens de visitantes. A equipe administra todo o conteúdo por um **painel restrito a administradores**, sem precisar mexer em código.

O site está disponível em **três idiomas**: português (Brasil), inglês (EUA) e espanhol (Espanha).

## Funcionalidades

### Site público
| Página | Conteúdo |
|---|---|
| **Início** | Destaques, áreas de atuação, números de impacto, notícias recentes e chamada para apoio |
| **Quem Somos** | História, propósito e atuação do instituto |
| **Programa Esportivo** | Os projetos do IDEX, mecanismos de incentivo (leis de incentivo) e documentos |
| **Transparência** | Documentos públicos organizados em pastas e subpastas, com busca, visualização e download |
| **Notícias** | Lista com busca e paginação; página de cada notícia com galeria de fotos ampliável |
| **Contato** | Formulário com proteção anti-spam, telefone, endereço e redes sociais |

Recursos gerais:
- Seletor de idioma (PT / EN / ES) com links compartilháveis (`?lang=`)
- Acessibilidade: VLibras (Libras), ajustes de leitura, navegação por teclado e contraste
- SEO completo: metadados por página e idioma, dados estruturados (JSON-LD), `sitemap.xml` com versões por idioma e imagens de compartilhamento
- Imagens otimizadas (WebP em vários tamanhos) e animações discretas

### Painel administrativo (`/admin`)
- Login seguro e recuperação de senha por e-mail
- Cadastro de **notícias**, **documentos**, **pastas** e **projetos**
- Capa e galeria de fotos com arrastar e soltar e reordenação
- Biblioteca de mídia
- Abas de edição por idioma (PT / EN / ES)
- **Tradução automática** do português para inglês e espanhol com um clique (Google Gemini). Nada é salvo sem revisão.
- Endereço (slug) das notícias gerado automaticamente a partir do título, sem duplicatas
- Caixa de **mensagens** recebidas pelo formulário de contato
- **Histórico (auditoria)** de todas as alterações de conteúdo

### Formulário de contato
- A mensagem é sempre gravada no painel **antes** de qualquer envio de e-mail
- A equipe recebe um aviso por e-mail (Resend), enviado de `formularios@institutoidex.org`
- O visitante entra apenas como "Responder para", e o site não pode ser usado para enviar e-mails a terceiros
- Envios repetidos (duplo clique, nova tentativa) não geram duplicatas

## Tecnologias

- **[TanStack Start](https://tanstack.com/start)** (React 19, SSR, rotas por arquivo, funções de servidor)
- **Vite 7** e **TypeScript**
- **Tailwind CSS v4** e **shadcn/ui** (Radix UI)
- **TanStack Query** para dados, e **Zod** para validação
- **Supabase** (banco Postgres, autenticação, storage e RLS), em projeto próprio do instituto
- **Google Gemini API** (REST, plano gratuito) para tradução automática
- **Resend** (REST) para avisos por e-mail
- Hospedagem e edição pela **[Lovable](https://lovable.dev)**, com execução em ambiente edge (Cloudflare Workers)

## Estrutura do projeto

```text
src/
├── routes/            Páginas (rotas por arquivo) e endpoints em routes/api/
├── components/        Componentes do site; admin/ contém os editores do painel
├── i18n/              Idiomas: catálogos de textos tipados (pt-BR é a referência)
├── lib/               Regras de negócio, Supabase, storage, galeria, contato, tradução
│   ├── contato/       Fluxo do formulário (validação, banco, e-mail)
│   └── traducao-ia/   Tradução automática (contrato, autenticação, Gemini, limites)
├── hooks/             Sessão, papel de administrador, tempo real
├── data/              Conteúdo fixo confirmado (contato, navegação, projetos)
└── assets/            Logos e fotos
supabase/              Esquema SQL e migrações (aplicadas manualmente)
docs/                  Documentação técnica de cada módulo
scripts/               Scripts auxiliares (ex.: teste isolado de e-mail)
```

## Como rodar localmente

Requisitos: Node.js 20+ e [Bun](https://bun.sh) (ou npm).

```sh
git clone <url-do-repositorio>
cd <pasta-do-repositorio>
bun install
cp .env.example .env   # preencha com os dados do Supabase do instituto
bun run dev            # http://localhost:8080
```

Outros comandos:

```sh
bun run build     # build de produção
bun run lint      # análise de código
bunx vitest run   # testes
```

## Variáveis de ambiente e segredos

| Nome | Onde fica | Uso |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` | Endereço do Supabase (público) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` | Chave pública do Supabase |
| `IDEX_SUPABASE_SERVICE_ROLE_KEY` | Cofre de segredos (servidor) | Operações privilegiadas pontuais |
| `GEMINI_API_KEY` | Cofre de segredos (servidor) | Tradução automática |
| `RESEND_API_KEY` | Cofre de segredos (servidor) | Avisos por e-mail do contato |
| `RESEND_FROM_EMAIL` | Cofre de segredos (opcional) | Remetente alternativo, restrito a `@institutoidex.org` |

> **Importante:** chaves secretas nunca vão para o código, para o navegador ou para variáveis `VITE_*`.

## Banco de dados

O banco é um projeto **Supabase próprio do instituto**. As alterações de estrutura ficam em `supabase/` e são **aplicadas manualmente** pela equipe responsável no painel do Supabase.

- `supabase/schema.sql`: estrutura principal (áreas, projetos, notícias, documentos, mensagens, papéis)
- `supabase/pastas.sql` e `supabase/auditoria.sql`: pastas da transparência e histórico de alterações
- `supabase/migracoes/`: migrações aditivas datadas (traduções, galeria, status de aviso do contato)

A segurança dos dados é garantida por políticas RLS. Só administradores (`has_role(..., 'admin')`) gravam conteúdo.

## Testes

Os testes automatizados (Vitest) cobrem idiomas e datas, galeria, nomes de capas, recuperação de senha, guarda do painel, fluxo do contato e tradução automática. Todos usam serviços simulados: **nenhum teste grava dados reais, envia e-mails ou chama APIs externas**.

```sh
bunx vitest run
```

## Identidade visual

| Cor | Hex | Uso |
|---|---|---|
| Verde | `#00A859` | Cor principal, botões e destaques |
| Azul | `#2E4A93` | Apoio |
| Preto | `#242323` | Texto e seções de contraste |
| Cinza | `#A0A09F` | Neutro |
| Amarelo | `#FCD307` | Uso sutil e pontual |

Tipografia: **Newsreader** (títulos) e **Public Sans** (textos). O tom é caloroso e humano, nunca corporativo.

## Regras de conteúdo

- **Nenhum fato é inventado.** Nomes, números e documentos só entram quando confirmados pelo instituto. Onde falta informação, usamos um marcador explícito.
- O e-mail institucional **não aparece no site**, por decisão anti-spam. O contato é feito por formulário, telefone, endereço e redes.
- Nomes próprios, endereço, CNPJ, telefone, PDFs e mensagens de visitantes não são traduzidos.

## Documentação técnica

| Documento | Assunto |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Decisões técnicas e arquiteturais do projeto |
| [`docs/i18n.md`](docs/i18n.md) | Sistema de idiomas |
| [`docs/traducao-automatica.md`](docs/traducao-automatica.md) | Tradução automática com Gemini |
| [`docs/contato-email.md`](docs/contato-email.md) | Formulário de contato e e-mails |
| [`docs/galeria-noticias.md`](docs/galeria-noticias.md) | Galeria de fotos das notícias |
| [`docs/recuperacao-senha.md`](docs/recuperacao-senha.md) | Recuperação de senha do painel |

## Publicação

O projeto é editado e publicado pela Lovable, e este repositório fica sincronizado com ela nos dois sentidos. Commits enviados ao branch principal aparecem no editor. Por isso, **não reescreva o histórico** (force push, rebase de commits já enviados).

---

**Instituto IDEX** · CNPJ 08.666.490/0001-71 · Rua Cel. José Eusébio, 95, casa 13, Higienópolis, São Paulo/SP · (11) 92544-6046
