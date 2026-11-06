# Identidade, diversão e qualidade — revisão da próxima versão

Revisão em 05/11/2026 sobre develop, commit 7f1d452. Autor do projeto: [Yago Borba](https://github.com/YagoBorba). [Studio público](https://yagoborba.github.io/diagnostic-profile/). Este documento registra achados e propostas; os temas abaixo ainda não foram implementados nem anunciados como disponíveis.

## Diagnóstico

A base já serve para criação e exportação: configuração validada, motor compartilhado, dados públicos paginados, escrita transacional, créditos, release versionada e publicação gratuita. Nesta revisão, os 62 testes passaram e npm audit informou zero vulnerabilidades conhecidas. Esses resultados não substituem avaliação visual, pesquisa com usuários ou auditoria de segurança especializada.

O principal limite de identidade é estrutural: os dez presets mudam paleta, seleção/ordem de blocos e alguns parâmetros, mas projetos e contatos compartilham os mesmos renderizadores. Terminal e Minimal usam extensamente o mesmo renderizador simplificado. Aumentar o catálogo sem ampliar essas estruturas repetiria a mesma aparência.

Branches verificadas: main contém v0.1.0; develop integra a próxima versão e acrescenta evidências de lançamento; demo-assets contém arquivos gerados, não uma feature pendente. Não havia PR aberto antes desta revisão. Não integrar demo-assets ao código-fonte.

## Achados confirmados e prioridades

| Prioridade | Achado | Evidência | Melhoria e aceite |
| --- | --- | --- | --- |
| P1 | Famílias pouco independentes | Em src/build.mjs, projetos dependem de compact, contatos usam sempre renderContact e o rodapé pode usar renderFooter independentemente da família. | Toda nova família deve mudar apresentação, projetos, contatos e rodapé de modo coerente; fallback deve ser explícito. |
| P1 | Semelhança mensurável entre famílias | Com os mesmos dados, paleta, layout e movimento desativado, mudar diagnostic para minimal deixou 16 dos 22 SVGs exatamente iguais: oito projetos, seis contatos e dois rodapés. | Comparar o perfil completo com os mesmos dados; distinguir geometria, hierarquia e composição, inclusive sem cor. Não interpretar esta comparação isolada como uma nota geral de qualidade. |
| P1 | Preview não representa o export padrão | Studio mostra composição SVG; README pronto exporta Markdown sem as paletas/animações. Há aviso, mas a diferença continua exigindo atenção. | Escolher o formato antes de personalizar e mostrar preview correspondente; sinalizar quais escolhas afetam somente SVG. |
| P1 | Miniaturas mostram pouco da proposta | drawGallery usa somente o header escuro, apesar de a diferença entre presets estar também nos blocos seguintes. | Miniatura com apresentação, projeto e outro bloco real; mesmas informações nos exemplos; indicação clara de tema claro/escuro e composição. |
| P1 | Texto pequeno ao reduzir painéis largos | Painéis diagnósticos de 1200 px carregam textos de 11–13 px; a incorporação pode reduzi-los proporcionalmente. Existem variantes compactas, mas não são escolhidas por todos os usuários. | Modelos com variante estreita própria, sugestão contextual e verificação a 320/390 px; não apenas diminuir o SVG inteiro. |
| P1 | Qualidade visual não está coberta por XML | CI verifica testes, schema, XML e drift dos arquivos, mas não legibilidade ou sobreposição em imagens renderizadas. | Verificar capturas representativas por família, claro/escuro, largura estreita e conteúdo extremo; incluir avaliação real do README no GitHub. |
| P1 | Idioma fragmentado | Interface e instruções em português; rótulos SVG, mensagens e formatação numérica incluem inglês. | Locale compartilhado entre Studio, SVG, alt text, resumo e erros; pt-BR/en com fallback e testes. |
| P2 | Trabalho descartado ao abrir a galeria | O fluxo atual gera 210 SVGs para dez presets e mostra dez headers. Uma execução local desse trecho levou 54 ms, sem medir rede, DOM ou dispositivo de entrada. | Renderizar somente os previews necessários ou usar miniaturas determinísticas; carregar modelos adicionais sob demanda. Medir antes/depois no mesmo aparelho. |
| P2 | Desfazer perde ações úteis durante digitação | mutate salva um estado por evento e mantém no máximo 40. | Agrupar digitação por campo/sessão e manter troca de tema, preset e ordem como ações independentes. |
| P2 | Atualizações sem mudança de conteúdo podem gerar commits | buildAssets inclui timestamp e output.mjs cria generatedAt novo. | Separar horário da consulta de conteúdo visual e publicar somente mudanças relevantes, preservando informação de atualização verdadeira. |
| P2 | Filtros de dados pouco acessíveis no Studio | Excluir linguagens é configurável no JSON, mas não há o mesmo controle visual. HTML/CSS estão excluídos por padrão. | Explicar e permitir editar filtros sem JSON; não confundir tamanho de código com habilidade ou tempo de programação. |
| P2 | Crescimento da família exige mexer em condicionais centrais | normalizeDesign enumera famílias; buildAssets escolhe renderizadores por condições; applyAppearance altera texto SVG para fonte de terminal. | Criar contrato de família com renderizadores e recursos declarados, sem carregar código remoto ou duplicar coleta/estatística. |
| P2 | Atualização automática de dependências não está declarada no repo | Actions estão fixadas por SHA, mas não há configuração Dependabot/Renovate no checkout. Não foi verificado o estado de alertas nativos da conta. | Configurar revisão periódica de Actions/npm e validar PRs por CI; tratar SEC-06 como parcialmente comprovado até verificar a parte automatizada. |

P1 significa próximo ciclo de qualidade/identidade, não falha crítica de segurança. Não foi reproduzido um novo bloqueador de geração nesta revisão.

## Direção artística: uma coleção de mundos

O núcleo da marca pode continuar sendo uma bancada de criação feita por Yago Borba. Cada mundo precisa de vocabulário, estrutura, ornamentação e comportamento próprios. A paleta fica independente, como já acontece na configuração atual.

| Mundo proposto | Composição característica | Projetos e conteúdo | Interação possível no Studio |
| --- | --- | --- | --- |
| Oficina Zero | Instrumentos de bancada, etiquetas de módulo, conectores e papel de ordem de serviço; evolução da assinatura original. | Projetos como módulos de uma bancada; trajetória como registros de manutenção; tecnologias como conexões nomeadas. | Montar a bancada e alternar apresentação técnica/limpa; detalhes decorativos opcionais. |
| Arquivo de Campo | Documento editorial, abas, margens anotadas, números de ficha e linhas de caderno. | Projetos como fichas de pesquisa; estudos e marcos como anotações declaradas; tipografia e espaço têm papel central. | Escolher papel, índice e ordem das fichas; comparação com uma versão somente texto. |
| Cartografia Orbital | Coordenadas simbólicas, trajetórias e mapas de missões, com áreas de texto protegidas. | Projetos como missões; tecnologias como constelações com nomes; trajetória como diário de bordo. | Organizar missões e variar a composição do mapa; posições decorativas não representam importância ou competência. |
| Estação de Rádio | Faixas, etiquetas de fita, escala de sintonia e canais; aparência distinta do console de terminal. | Projetos como programas/faixas; atividade real pode virar um espectro, com legenda e escala. | Misturar a composição de canais; nenhum áudio automático. Ondas decorativas precisam ser identificadas como decoração. |
| Inventário de Exploração | Inventário em pixel art vetorial, etiquetas de item e mapa de etapas; sem personagens ou marcas de terceiros. | Projetos como itens/criações; marcos como missões preenchidas manualmente; tecnologias como ferramentas. | Organizar inventário, escolher molduras e montar uma ficha; sem XP, ranking ou nível de habilidade inventado a partir de estrelas. |
| Herbário Digital | Pranchas de espécimes, desenhos botânicos discretos e classificação editorial. | Projetos como espécimes catalogados; estudos e tecnologias agrupados pela pessoa; trajetória como registros de campo. | Combinar prancha, etiquetas e composição; crescimento visual nunca apresentado como medição real do GitHub. |

São direções de criação próprias para o projeto, sem alegação de exclusividade mundial. Os nomes de produto ainda devem ser revisados antes de campanha ou marca registrada. A implementação deve usar arte original ou recursos com licença documentada.

### Primeiro lote recomendado

1. **Oficina Zero:** aprofunda o diferencial que já existe em vez de abandonar a identidade original.
2. **Arquivo de Campo:** introduz uma composição editorial que muda claramente a estrutura e atende bem pesquisa, currículo e portfólio.
3. **Cartografia Orbital:** oferece uma experiência mais exploratória, mantendo texto e dados legíveis.

Rádio, Inventário e Herbário ficam como expansão após validar o contrato dos três primeiros. Não anunciar seis novos temas antes de existirem exemplos completos e exportáveis.

## Como deixar a experiência divertida

| Proposta | Comportamento esperado | Base que já existe |
| --- | --- | --- |
| Escolha de mundo | Entrada mostra o perfil completo e o tipo de exportação, com uma explicação curta de cada mundo. | Presets, filtros e galeria. |
| Mistura com travas | Surpreenda-me pode variar cores, composição e detalhes mantendo conteúdo, movimento e escolhas travadas. | Aleatoriedade, normalização, histórico e preferência de movimento. |
| Receita reproduzível | Uma combinação pode receber nome local, miniatura e identificador reproduzível para compartilhamento. | Export JSON, fragmento de configuração e favoritos; não precisa de backend para o primeiro formato. |
| Antes e depois | Comparação com a mesma informação em dois mundos, deixando claro qual é o original. | Comparação de referência já disponível. |
| Pequenos desafios opcionais | Sugestões como montar um perfil só com projetos e contatos ou criar um diário de estudos; nenhuma exigência para exportar. | Blocos ordenáveis e conteúdo manual. |
| Coleção pessoal | Favoritos com miniatura, nome editável e possibilidade de reabrir; rascunho preservado ao experimentar. | Favoritos locais, import/export e desfazer/refazer. |
| Créditos com assinatura | O autor e o repositório continuam presentes discretamente, em posição consistente em qualquer mundo/export. | src/credits.mjs e rodapé do Studio. |

Não priorizar conta obrigatória, placar de popularidade, som automático, integração com muitas APIs ou conteúdo escondido atrás de conquistas. A diversão deve vir da criação e da descoberta de composições.

## O que vai para o README

O Studio pode ter interações locais. O README no GitHub recebe imagens, links e o HTML permitido pela plataforma; não prometer um minijogo JavaScript embutido. A documentação do [GitHub Markup](https://github.com/github/markup) descreve a sanitização que remove scripts, estilos inline e atributos de classes/IDs do HTML. SVGs e incorporações precisam ser verificados no GitHub real, além do navegador local.

Cada mundo deve oferecer resultado SVG coerente e alternativa textual compreensível. Movimentos e efeitos nunca devem ser necessários para ler o conteúdo. O resumo textual e os créditos continuam disponíveis.

## Contrato técnico sugerido

- Um registro de famílias declara nome, versão, formatos suportados, widgets suportados, tokens e funções de renderização. A coleta da API e os cálculos continuam compartilhados.
- Cada família define header, projetos, contatos, métricas, blocos pessoais e footer. Quando usar um componente neutro, isso é declarado e revisado como decisão visual.
- Tokens incluem tipografia, espaçamento, formas, bordas, ornamentos e cores. Fontes com fallback previsível; sem dependência obrigatória de fonte remota.
- Variantes estreita e ampla são composições próprias. Evitar pós-processar SVG por substituição de strings como estratégia principal de estilização.
- Novos campos opcionais mantêm compatibilidade; mudanças incompatíveis exigem migração e versão de schema apropriada. Export antigo deve continuar reproduzível.
- Tema é dado validado e código revisado no repositório. Não executar JavaScript fornecido em arquivos de tema da comunidade.

## Qualidade para a comunidade

Para aceitar um mundo novo, exigir exemplo completo com os mesmos dados de referência, claro/escuro, sem movimento, textos longos, perfil vazio e caracteres diversos. A família precisa funcionar com os widgets prometidos, não apenas com um header bonito.

Incluir manifesto de autoria/licença de cada contribuição visual, configuração mínima reproduzível, legenda dos dados e checklist de exportação. Propostas da comunidade podem começar por JSON/arte estática revisada; instalação arbitrária de plugins não é necessária.

Completar a validação em outro repositório público, documentar atualização/rollback com a referência fixa, revisar a automação de dependências e testar com usuários externos. São itens de qualidade que continuam relevantes depois do lançamento público.

## Sequência de implementação pelo Gitflow

| Ordem | Branch proposta a partir de develop | Entrega e aceite |
| --- | --- | --- |
| 1 | feature/family-renderer-contract | Contrato de família e migração das atuais sem mudar a saída v0.1.0 inadvertidamente; regressões e exemplos. |
| 2 | feature/matching-export-preview | Modo de saída escolhido no início e preview fiel do README/kit selecionado. |
| 3 | feature/workshop-world | Oficina Zero completa, com projetos/contatos próprios e variante estreita. |
| 4 | feature/field-notebook-world | Arquivo de Campo completo, reutilizando dados e validações. |
| 5 | feature/orbital-world | Cartografia Orbital completa, com distinção entre decoração e métrica. |
| 6 | feature/playground-recipes | Travas de mistura, receitas e favoritos com miniaturas, sem perder rascunho. |
| 7 | chore/visual-quality-and-updates | Verificação visual representativa, contribuições/atualizações e medições no aparelho de referência. |
| 8 | release/0.2.0 | Após aceite: CI, exemplos e changelog, PR para main, tag anotada, Pages e merge de main para develop. |

São propostas de branches futuras, não branches criadas nem um compromisso de prazo. Não alterar a tag v0.1.0. Cada PR precisa explicar o comportamento visível, evidência de qualidade e compatibilidade. Não é necessário criar dezenas de issues duplicadas do roadmap antes de fechar o escopo do próximo lote.

## Critério para dizer que deixou de ser genérico

Com os mesmos textos e sem depender da cor, uma pessoa deve distinguir os mundos pela composição inteira; conseguir criar, comparar, desfazer e exportar sem perder conteúdo; e receber um README correspondente ao formato escolhido. Recolher feedback consentido de pessoas externas antes de afirmar que a experiência é intuitiva ou divertida para todos.
