# Revisão visual do Instituto IDEX

## Objetivo
Retirar a aparência repetitiva de template sem alterar a paleta oficial, a tipografia ou o conteúdo validado.

## Implementação
1. **Limpeza pública** — despublicar os registros de teste de Projetos e Notícias e confirmar que não aparecem no `sitemap.xml`.
2. **Heróis internos** — transformar `PageHero` em três composições:
   - editorial com filete amarelo e texto à esquerda;
   - assimétrica com texto à direita;
   - fotográfica, usando imagens reais do Talento Brasil com contraste legível.
3. **Distribuição entre páginas** — alternar as composições em Quem Somos, Projetos, Notícias, Transparência, Como Ajudar e Contato, sem o antigo círculo desfocado.
4. **Ritmo da Home** — tornar a seção do Talento Brasil uma faixa fotográfica de largura total e deixar os números soltos no fundo, sem caixa externa e sem cards aninhados; diferenciar também o CTA final.
5. **Botão IDEX** — adicionar a variante `idex` ao componente de botão, centralizando raio, peso, hover, foco e estado ativo; substituir os `rounded-full` manuais nos CTAs públicos.
6. **Validação** — conferir build, erros de execução e as rotas públicas em desktop e celular, incluindo legibilidade, contraste e ausência de sobreposição.

## Detalhes técnicos
- As fotos continuarão usando `Imagem`, `srcSet`, lazy loading e prioridade apenas quando acima da dobra.
- A nova API de `PageHero` manterá compatibilidade tipada com conteúdo opcional e variante explícita.
- Nenhuma alteração será feita na paleta, nas famílias Newsreader/Public Sans ou na estrutura do banco.
