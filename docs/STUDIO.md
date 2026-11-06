# Profile Studio 0.2.1

[Studio público](https://yagoborba.github.io/diagnostic-profile/) · por [Yago Borba](https://github.com/YagoBorba) · [código](https://github.com/YagoBorba/diagnostic-profile).

O Studio tem 16 modelos, seis paletas e nove famílias. As seis novas famílias são Oficina Zero, Arquivo de Campo, Cartografia Orbital, Estação de Rádio, Inventário de Exploração e Herbário Digital. Diagnóstico, Terminal e Minimalista continuam disponíveis.

## Criar e exportar

Escolha primeiro o formato: kit visual estático, Markdown ou Action. O preview usa o mesmo renderizador/modelo de conteúdo da exportação correspondente. A galeria usa dados de demonstração e miniaturas compostas de apresentação, projeto e contato; não precisa construir todos os assets de cada modelo.

No kit estático, os SVGs usam apenas conteúdo preenchido, com caminhos relativos em README.md. Métricas/calendários são omitidos e projetos fixados precisam ser adicionados manualmente. Envie a pasta assets/ inteira junto com o README. A configuração JSON permite editar e gerar outra versão.

No Markdown, o preview é construído pelo mesmo modelo semântico que gera o texto. O conteúdo do usuário vira texto no DOM, nunca HTML arbitrário. Esse formato não reproduz paletas e molduras SVG.

Na Action, o preview é explicitamente fictício; o workflow consulta os dados reais. A referência é v0.2.1. Main, master, develop e a branch padrão não podem ser destinos de assets. Outra conta/repositório exige PROFILE_PUBLISH_TOKEN apropriado. Os arquivos fictícios do kit ficam separados em preview/.

Siga o [guia de iniciante](GETTING_STARTED.md) e a [referência de instalação](../README.md).

## Mundos e movimento

As famílias têm renderizadores para cada widget e autoria/licença declaradas em src/families.mjs. A saída SVG usa o mesmo motor na CLI, Action e navegador. Cores são independentes da família e têm feedback de contraste; há bordas, densidade, alinhamento e variantes estreitas.

Escolha Compacta para legibilidade em telas pequenas. Reduzir um painel de 1200 px não equivale a uma composição estreita. O Studio avisa quando o preview está estreito e o layout amplo continua selecionado. Picture suporta modo claro/escuro automático; Markdown com imagem fixa usa um modo escolhido. Agrupamento/alinhamento de cartões depende do HTML aceito pelo GitHub.

Movimento reduzido é respeitado e os novos mundos abrem sem animação. Figuras e ondas decorativas não representam estatísticas. Habilidades e trajetória são fornecidas manualmente; não há XP ou classificação de competência.

## Misturas e receitas

A semente determina a escolha de preset/paleta. Travas preservam mundo, cores, layout/blocos e movimento; conteúdo pessoal é mantido. Desafios opcionais mudam somente os blocos e não são requisito para exportar.

Receitas compartilham apenas campos visuais, sem nomes, contatos, títulos pessoais de seções ou IDs personalizados. O compartilhamento de perfil completo é separado e inclui textos e contatos. Os links são validados e limitados em tamanho; use JSON para configurações grandes. Links localhost só funcionam onde o mesmo servidor estiver acessível.

Favoritos ficam no navegador, com nome editável e miniatura. Rascunhos não são sincronizados. Digitação no mesmo campo é agrupada para desfazer; o histórico mantém até 40 transações. Baixe JSON para backup. Recomeçar substitui o rascunho, e favoritos são removidos individualmente.

## Idioma e acessibilidade

Locale en/pt-BR controla rótulos gerados, resumos, descrições acessíveis e instruções dos kits. Textos pessoais e nomes de tecnologias são preservados. A interface do Studio é em português e traduz as dicas comuns de validação. Diagnósticos de CLI mantêm o formato documentado em inglês.

Há rótulos, foco visível e setas para reordenação por teclado. O resumo textual complementa as imagens. Não anunciar suporte validado por leitor de tela sem uma sessão real no GitHub; title/desc de SVG não garantem por si só leitura dos dados incorporados.

## Desenvolvimento e qualidade

    npm ci
    npm run studio
    npm run proof -- --serve

Build estático: npm run build:studio -> dist/site. Folha de revisão visual: npm run proof -> dist/proof, separada do site distribuído. A CI disponibiliza a folha como artefato por três dias. Ela permite inspeção humana; não equivale a comparação automática de pixels.

Arquitetura: src/families.mjs declara o contrato; src/families/ contém implementações; src/build.mjs compõe; src/manual.mjs exclui dados automáticos no kit estático; src/readme-model.mjs compartilha semântica entre preview e Markdown. src/version.mjs centraliza referências de release/schema.

A CLI preserva os arquivos e a data de geração quando configuração/dados/versão são idênticos e os arquivos continuam íntegros. --force regenera. Arquivos próprios editados são detectados; arquivos alheios continuam preservados. O timestamp descreve geração, não cada consulta de rede.

Créditos discretos para Yago Borba e o repositório acompanham todos os READMEs não vazios, independentemente do bloco de rodapé pessoal. Veja a licença MIT.
