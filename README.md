# IDEX Social Connect

Crie o site institucional do Instituto IDEX (ONG brasileira de desenvolvimento social, fundada em 2007), em React + Tailwind + shadcn/ui, com roteamento entre páginas reais (não single-page).

## Paleta oficial (extraída do site atual, não inventar outras cores)
- Verde `#00A859` — cor primária, CTAs, botões
- Azul `#2E4A93` — secundária, apoio
- Preto `#242323` — seções de contraste, texto
- Cinza `#A0A09F` — neutro, fundos de seção
- Amarelo `#FCD307` — uso sutil e pontual apenas (nunca área grande)

## Tipografia
Serifada de exibição 'Newsreader' (Google Fonts) para títulos + sans 'Public Sans' para corpo de texto. Evite fontes clichê de IA (Inter, Roboto, Fraunces).

## Tom e direção visual
NADA formal/corporativo demais — o instituto trabalha com crianças, comunidade, esporte e cultura. Queremos: fotografia real em vez de placeholders cinza, cards com leve assimetria/inclinação em vez de grade rígida perfeita, títulos diretos e humanos (não institucionais engessados), microinterações e animações discretas (hover, scroll reveal, transições suaves) — esta é a etapa certa para isso, já que vem de um mockup estático. Evite blocos pretos sólidos grandes; quando usar preto, prefira cards internos com cantos arredondados sobre o fundo escuro.

## Estrutura do site (9 seções de menu + 2 templates)
1. **Início**: hero com foto real de ação social (tema esporte/comunidade), frase direta de propósito, as 6 áreas de atuação como cartões redondos com ícone colorido cada, projeto em destaque (Talento Brasil), números de impacto (19 anos de atuação desde 2007, 200 crianças no Talento Brasil), notícias recentes, feed do Instagram (@idexbrasil), CTA de doação/parceria.
2. **Quem Somos**: história (fundado em 2007, começou em projetos de comércio exterior/competitividade, hoje atua em 6 frentes sociais), missão/visão/valores (ainda não formalizados — usar placeholder textual claro, não inventar), equipe (placeholder), organograma simples.
3. **Áreas de Atuação**: grade das 6 áreas — Educação (apoio e desenvolvimento), Cultura (artes e oficinas), Esportes (projetos e ações sociais), Meio Ambiente (sustentabilidade), Negócios (indústria e comércio), Saúde (qualidade de vida). Cada uma linka para uma página de detalhe (mesmo template).
4. **Página de detalhe de área** (template): banner leve com ícone da área, descrição (placeholder onde não houver texto real), projetos relacionados — se não houver projeto real na área, mostrar estado vazio honesto ("ainda não há projetos publicados nesta área").
5. **Projetos**: catálogo filtrável por área e ano. Único projeto real hoje: **Talento Brasil** (treinamento de futebol gratuito para 200 crianças e jovens nas categorias de base, em parceria com o Clube Esportivo Penha, lançado em 26/06/2017 na Câmara dos Vereadores de Santa Cruz do Rio Pardo, endereço Rua Armando Cardoso Alves, 106 — Penha). Outros cards como "novo projeto em breve" (não inventar projetos).
6. **Página de detalhe de projeto** (template, usando Talento Brasil como caso real): objetivo, público, parceria, local, data de lançamento, galeria de fotos.
7. **Parceiros**: logos de parceiros (placeholder — nenhum parceiro real informado ainda) + seção "seja um parceiro" com benefícios e CTA.
8. **Transparência** (com submenu/abas): Estatuto, Relatórios/Prestação de Contas, Documentos (atas, declarações), Perguntas Frequentes, LGPD — todos como placeholders de documento (ainda não temos os arquivos reais).
9. **Notícias**: grade de notícias. Real: "Lançamento do projeto Talento Brasil" (26/06/2017). Resto como "notícia em breve".
10. **Como Ajudar**: três formas — Doação (Pix/dados bancários placeholder), Voluntariado, Parceria empresarial (cruza com página de Parceiros).
11. **Contato**: formulário (Nome, Email, Assunto, Mensagem — como no site atual), endereço real (Rua Armando Cardoso Alves, 106 — Penha), Instagram @idexbrasil, Facebook /idexsocial, campos de telefone/email como placeholder.

Header fixo com toda a navegação + CTA "Como Ajudar" destacado; rodapé escuro replicando a navegação, redes sociais, endereço e copyright, com um filete fino amarelo no topo do rodapé (elemento real da marca atual).

## Regra de conteúdo
Não invente fatos específicos (nomes, números, documentos) que não foram informados aqui. Onde não houver conteúdo real, use placeholders visualmente claros (ex: "[missão a definir]") em vez de texto genérico fingindo ser real.

## Sobre imagens
Ainda não anexei os arquivos reais (logo, foto do Talento Brasil, ícones das 6 áreas) porque o upload daqui falhou por rede — vou enviar esses arquivos diretamente nesta conversa do Lovable em seguida. Por enquanto, comece com placeholders de imagem coerentes com a paleta, para eu poder trocar pelos arquivos reais eu mesmo eu depois.

Comece pela Home e pelo Header/Footer compartilhados; depois siga para as demais páginas.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://idex-impact-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d8567a4b-4cfc-442d-b2bf-0d51b21de805).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
