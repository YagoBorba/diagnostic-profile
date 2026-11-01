# Diagnostic Profile — roteiro de evolução

Data: 31/10/2026. Base técnica: análise da branch develop, commit 605ef7d.
Este documento é uma proposta de trabalho. As caixas representam tarefas futuras; não significam que os recursos já existem. Não foram abertas issues nem feitas alterações no GitHub.

## Objetivo do produto

Permitir que alguém monte um perfil com identidade própria, entenda os dados apresentados e instale a atualização automática com pouca dificuldade.

Jornada desejada: escolher um modelo → personalizar → montar os blocos → conferir o preview → exportar → instalar → acompanhar a atualização.

O configurador deve compartilhar o mesmo motor de renderização da CLI e da Action. A edição interativa fica no site; o README recebe os SVGs, links e HTML compatível com GitHub. O GitHub sanitiza HTML e remove scripts: https://github.com/github/markup. Uma opção de hospedagem do configurador é GitHub Pages, que serve HTML, CSS e JavaScript: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages.

## Como priorizar

- P0: correções e condições para uma primeira versão pública confiável.
- P1: experiência principal de instalação e personalização.
- P2: expansão de estilos, widgets e colaboração.
- P3: recursos avançados ou dependentes de serviços externos.

As prioridades indicam ordem sugerida. Não é necessário implementar todos os itens P2/P3 para publicar uma boa versão.

Tipos: C = problema confirmado na análise; E = evolução proposta; V = comportamento que exige validação adicional.

## 1. Correções de comportamento

- [ ] FIX-01 · P0 · C — Paginar repositórios e calcular estrelas e linguagens sobre o conjunto completo declarado.
- [ ] FIX-02 · P0 · C — Paginar linguagens quando o objetivo for contabilizar todas; hoje são buscadas até 20 por repositório.
- [ ] FIX-03 · P0 · C — Buscar URL e identidade owner/repo dos projetos fixados e usá-las nos links.
- [ ] FIX-04 · P0 · E — Indexar métricas por owner/repo para evitar confundir projetos homônimos e consultar projetos selecionados fora da lista inicial.
- [ ] FIX-05 · P0 · C — Validar objeto raiz, objetos aninhados, listas, tipos, strings e faixas numéricas antes de renderizar.
- [ ] FIX-06 · P0 · C — Rejeitar IDs repetidos ou vazios em contatos, indicando os campos em conflito.
- [ ] FIX-07 · P0 · E — Detectar colisões de nomes de arquivos de projetos após normalização, como a.b e a-b.
- [ ] FIX-08 · P0 · C — Escapar assetsBaseUrl nos atributos do snippet e validar seu formato.
- [ ] FIX-09 · P0 · C — Mostrar pico zero em calendário zerado; separar o valor estatístico do mínimo matemático da escala.
- [ ] FIX-10 · P0 · C — Criar a referência de versão anunciada no README, que atualmente usa uma tag v0 ausente na análise.
- [ ] FIX-11 · P1 · V — Revisar se campos esperados por projetos personalizados, como primaryLanguage, estão presentes na consulta.
- [ ] FIX-12 · P1 · E — Distinguir dado indisponível de zero real em estrelas, datas, linguagens e status dos projetos.

Concluído quando: os problemas reproduzidos têm testes de regressão e nenhum caso produz links inventados, sobrescrita silenciosa ou métricas apresentadas como completas quando são parciais.

## 2. Precisão e significado dos dados

- [ ] DATA-01 · P0 · E — Diferenciar métricas dos últimos 12 meses de totais atuais, como seguidores e estrelas.
- [ ] DATA-02 · P0 · E — Documentar o que entra e o que fica fora de cada métrica, incluindo forks, arquivos de marcação e repositórios privados.
- [ ] DATA-03 · P0 · V — Verificar contribuição pública/privada com tokens e permissões reais; ajustar as instruções do README com base nos resultados.
- [ ] DATA-04 · P1 · E — Expor filtros para incluir/excluir repositórios, forks, arquivados e linguagens, mantendo padrões documentados.
- [ ] DATA-05 · P1 · E — Definir comportamento para semanas incompletas, virada de ano, ano bissexto e timezone do calendário.
- [ ] DATA-06 · P1 · E — Informar que a maior sequência é limitada ao período consultado.
- [ ] DATA-07 · P1 · E — Tornar a janela de atividade de projetos configurável e evitar inferir estabilidade somente da ausência de pushes.
- [ ] DATA-08 · P1 · E — Informar data de atualização, fonte e eventual uso de cache em metadados de saída.
- [ ] DATA-09 · P1 · E — Rotular linguagem por tamanho de código; não apresentar como tempo de programação ou nível de habilidade.
- [ ] DATA-10 · P2 · E — Permitir escolher períodos compatíveis com a API e explicitar limites e custo de consulta.

Concluído quando: cada número tem definição clara, período correto e comportamento definido para ausência de dados.

## 3. Robustez da API e dos arquivos

- [ ] REL-01 · P0 · E — Adicionar timeout às chamadas de rede com mensagem de erro útil.
- [ ] REL-02 · P0 · E — Adicionar tentativas limitadas para falhas transitórias, com espera progressiva e respeito às orientações de rate limit.
- [ ] REL-03 · P0 · E — Diferenciar token inválido, permissão insuficiente, limite atingido, usuário inexistente e falha do GitHub.
- [ ] REL-04 · P0 · E — Gerar em diretório temporário e publicar o conjunto somente após validação, preservando o resultado anterior em caso de erro.
- [ ] REL-05 · P1 · E — Remover somente arquivos antigos pertencentes ao gerador, usando um manifesto; proteger arquivos alheios no diretório de saída.
- [ ] REL-06 · P1 · E — Gerar manifest.json com versão, arquivos, origem dos dados e data de atualização, sem tokens.
- [ ] REL-07 · P1 · E — Definir política para dados parciais: avisar quais widgets foram afetados e não fabricar valores.
- [ ] REL-08 · P2 · E — Oferecer cache local opcional com expiração; indicar quando o resultado usa dados antigos.
- [ ] REL-09 · P2 · E — Evitar regenerar conteúdo idêntico; tratar o timestamp para não causar commits a cada execução sem alteração relevante.

## 4. Configuração extensível

- [ ] CFG-01 · P0 · E — Publicar JSON Schema com descrições, exemplos, limites e autocomplete nos editores.
- [ ] CFG-02 · P1 · E — Adicionar schemaVersion e política de migração para configurações antigas.
- [ ] CFG-03 · P1 · E — Definir precedência entre defaults, preset, arquivo, variáveis e flags.
- [ ] CFG-04 · P1 · E — Criar um registro de widgets com ID único, tipo, opções e posições permitidas.
- [ ] CFG-05 · P1 · E — Separar visual, layout, seleção de conteúdo e origem de dados.
- [ ] CFG-06 · P1 · E — Separar o perfil consultado do repositório/branch onde os assets serão publicados.
- [ ] CFG-07 · P1 · E — Permitir habilitar, ocultar e ordenar cada seção.
- [ ] CFG-08 · P1 · E — Avisar sobre chaves desconhecidas para ajudar a detectar erros de digitação.
- [ ] CFG-09 · P2 · E — Criar presets versionados e permitir sobrescrever opções específicas.
- [ ] CFG-10 · P3 · E — Avaliar YAML depois de estabilizar o formato JSON; manter a mesma validação nos dois formatos.

## 5. Temas e identidade visual

- [ ] STYLE-01 · P1 · E — Expandir paletas com identidade própria: terminal verde, azul técnico, monocromático, violeta e tons suaves.
- [ ] STYLE-02 · P1 · E — Separar paleta de estilo visual: a mesma cor deve funcionar em mais de uma família.
- [ ] STYLE-03 · P1 · E — Oferecer famílias: diagnóstico atual, terminal, minimalista, blueprint e cartões limpos.
- [ ] STYLE-04 · P1 · E — Permitir cores personalizadas de fundo, texto, destaque e sinal, com verificação de legibilidade.
- [ ] STYLE-05 · P1 · E — Oferecer densidade compacta, padrão e espaçosa.
- [ ] STYLE-06 · P1 · E — Oferecer bordas retas/arredondadas, com opções controladas de espessura e divisórias.
- [ ] STYLE-07 · P1 · E — Criar modos sem animação, suave e completo, sempre respeitando movimento reduzido.
- [ ] STYLE-08 · P1 · E — Permitir ocultar detalhes decorativos como osciloscópio, cursor, PID e brilho.
- [ ] STYLE-09 · P1 · E — Manter variantes claras/escuras e um tema de alto contraste.
- [ ] STYLE-10 · P2 · E — Oferecer grupos de fontes com fallbacks previsíveis, sem depender de fontes remotas nos SVGs.
- [ ] STYLE-11 · P2 · E — Oferecer texturas discretas de grade, pontos ou nenhuma.
- [ ] STYLE-12 · P2 · E — Permitir sobrescrita visual por widget, com opção de restaurar a consistência global.
- [ ] STYLE-13 · P2 · E — Incluir exemplos com nomes, bios e alfabetos diversos para avaliar composição real.
- [ ] STYLE-14 · P2 · E — Criar uma galeria comparável: mesmos dados em todos os temas.

Direção sugerida: começar com 3 famílias, 6 paletas e 3 layouts bem testados. Expandir a biblioteca depois de validar legibilidade e consistência. Quantidade de opções não substitui qualidade de composição.

## 6. Layouts e formas de incorporar

- [ ] LAY-01 · P1 · E — Criar layouts prontos: largura inteira, compacto e grade de cartões.
- [ ] LAY-02 · P1 · E — Permitir montar um README completo ou exportar somente um widget.
- [ ] LAY-03 · P1 · E — Permitir escolher sequência, alinhamento e seções opcionais.
- [ ] LAY-04 · P1 · E — Criar variantes estreitas dos widgets para evitar simplesmente reduzir textos grandes em telas pequenas.
- [ ] LAY-05 · P1 · E — Permitir cartões de projeto em uma ou duas colunas, com exemplos validados no GitHub.
- [ ] LAY-06 · P1 · E — Oferecer snippets com picture para tema automático e alternativas fixas clara/escura.
- [ ] LAY-07 · P1 · E — Disponibilizar Markdown simples para combinações que não exigem HTML.
- [ ] LAY-08 · P1 · E — Permitir trocar títulos de seções e ocultá-los.
- [ ] LAY-09 · P2 · E — Criar modelos por intenção: apresentação profissional, open source, estudante e portfólio de projetos.
- [ ] LAY-10 · P2 · E — Oferecer presets neutros que não usem metáforas automotivas em todos os rótulos.
- [ ] LAY-11 · P2 · E — Oferecer divisórias, cabeçalhos de seção e espaçamentos consistentes.
- [ ] LAY-12 · P2 · E — Documentar uso em README de perfil, README de projeto e sites estáticos, com limitações de cada contexto.

## 7. Configurador visual interativo

- [ ] UI-01 · P1 · E — Criar uma página de montagem com preview e controles usando o mesmo renderizador da CLI.
- [ ] UI-02 · P1 · E — Permitir experimentar dados fictícios sem conta, token ou instalação.
- [ ] UI-03 · P1 · E — Abrir com uma seleção de modelos visuais e exemplos do resultado.
- [ ] UI-04 · P1 · E — Atualizar o preview ao editar cores, textos, widgets e layout.
- [ ] UI-05 · P1 · E — Oferecer adicionar, remover e reordenar blocos por arrastar e por botões acessíveis ao teclado.
- [ ] UI-06 · P1 · E — Oferecer inspeção em largura de desktop e celular e em tema claro/escuro.
- [ ] UI-07 · P1 · E — Mostrar erros junto ao campo e explicar como corrigi-los.
- [ ] UI-08 · P1 · E — Exportar configuração JSON, snippet e workflow como arquivos individuais e pacote.
- [ ] UI-09 · P1 · E — Importar uma configuração e reconstruir exatamente o estado visual.
- [ ] UI-10 · P1 · E — Oferecer copiar código, restaurar padrões, desfazer e refazer.
- [ ] UI-11 · P1 · E — Salvar rascunho local sem incluir credenciais.
- [ ] UI-12 · P1 · E — Gerar um resumo de instalação com caminhos e permissões necessários.
- [ ] UI-13 · P2 · E — Compartilhar configurações por URL ou arquivo, validando tamanho e conteúdo; excluir tokens e avisar sobre dados pessoais.
- [ ] UI-14 · P2 · E — Criar botão de combinação aleatória que preserve contraste, consistência e movimento escolhido.
- [ ] UI-15 · P2 · E — Comparar dois estilos com os mesmos dados.
- [ ] UI-16 · P2 · E — Oferecer galeria com remix de modelos aprovados da comunidade.
- [ ] UI-17 · P2 · E — Permitir favoritar presets localmente e exportá-los.
- [ ] UI-18 · P3 · E — Buscar dados reais de um login opcionalmente, após definir autenticação, limites e privacidade; o preview fictício deve continuar disponível.

Concluído quando: uma pessoa consegue escolher um preset, alterá-lo, importar/exportar a configuração e obter a mesma composição no workflow.

## 8. Widgets e conteúdo

- [ ] WID-01 · P1 · E — Tornar os widgets existentes independentes e configuráveis, com contrato de dados documentado.
- [ ] WID-02 · P1 · E — Criar apresentação curta com nome, bio, localização opcional e foco profissional.
- [ ] WID-03 · P1 · E — Permitir escolher métricas individuais em vez de exigir o painel completo.
- [ ] WID-04 · P1 · E — Melhorar projetos com URL real, descrição automática/opcional, tags e métricas selecionáveis.
- [ ] WID-05 · P1 · E — Expandir contatos com ícones locais, rótulos editáveis e escolha de formato.
- [ ] WID-06 · P2 · E — Criar mapa de contribuições com variante diagnóstica e variante simples.
- [ ] WID-07 · P2 · E — Criar log de atividades: PRs, reviews e releases, com filtros e limites.
- [ ] WID-08 · P2 · E — Criar bloco de habilidades declaradas manualmente, sem inferir domínio por bytes de código.
- [ ] WID-09 · P2 · E — Criar bloco “estudando agora” e “construindo agora” com edição manual.
- [ ] WID-10 · P2 · E — Criar timeline de projetos ou marcos fornecidos pelo usuário.
- [ ] WID-11 · P2 · E — Criar cartão de última release dos projetos escolhidos.
- [ ] WID-12 · P2 · E — Criar metas opcionais com origem e período explícitos, evitando rankings artificiais.
- [ ] WID-13 · P2 · E — Criar lista de interesses, tecnologias favoritas e disponibilidade profissional opcional.
- [ ] WID-14 · P3 · E — Criar feed de posts via RSS/Atom com limite de tamanho, timeout e sanitização.
- [ ] WID-15 · P3 · E — Criar integração opcional de tempo de código, com consentimento e segredos no workflow.
- [ ] WID-16 · P3 · E — Avaliar conquistas/readiness monitors somente com critérios transparentes e verificáveis.
- [ ] WID-17 · P3 · E — Oferecer exportação PNG apenas se houver demanda e infraestrutura de renderização adequada.
- [ ] WID-18 · P3 · E — Definir interface para novos provedores de dados, preservando funcionamento quando uma integração opcional falha.

## 9. Acessibilidade e localização

- [ ] A11Y-01 · P0 · V — Testar leitura do snippet no GitHub com leitor de tela; title/desc nos arquivos não garantem acesso aos dados quando incorporados como imagem.
- [ ] A11Y-02 · P1 · E — Gerar resumo textual opcional das métricas no README.
- [ ] A11Y-03 · P1 · E — Validar contraste de todas as paletas e avisar no configurador sobre cores personalizadas ilegíveis.
- [ ] A11Y-04 · P1 · E — Diferenciar estados com texto/forma, além de cor.
- [ ] A11Y-05 · P1 · V — Verificar movimento reduzido na incorporação real e garantir estado final legível ao desligar animações.
- [ ] A11Y-06 · P1 · E — Garantir navegação por teclado, foco visível e rótulos nos controles do configurador.
- [ ] A11Y-07 · P1 · E — Localizar rótulos, datas, números, textos alternativos e erros em português e inglês.
- [ ] A11Y-08 · P1 · E — Tratar nomes longos, URLs sem espaços, emojis e alfabetos diversos sem cortar informação essencial.
- [ ] A11Y-09 · P2 · E — Estruturar traduções para contribuições comunitárias, com fallback documentado.
- [ ] A11Y-10 · P2 · E — Avaliar suporte a idiomas da direita para a esquerda antes de anunciá-lo.

## 10. CLI e experiência local

- [ ] CLI-01 · P1 · E — Criar init para gerar configuração e workflow de exemplo.
- [ ] CLI-02 · P1 · E — Criar validate com erros por caminho de campo e código de saída previsível.
- [ ] CLI-03 · P1 · E — Criar preview local com dados fictícios e observação das alterações.
- [ ] CLI-04 · P1 · E — Criar doctor para diagnosticar configuração, ambiente, token e destino sem revelar credenciais.
- [ ] CLI-05 · P1 · E — Criar list-themes, list-presets e list-widgets.
- [ ] CLI-06 · P1 · E — Criar dry-run que descreva os arquivos a alterar.
- [ ] CLI-07 · P1 · E — Permitir renderizar somente widgets selecionados.
- [ ] CLI-08 · P1 · E — Melhorar help, version, mensagens de erro e precedência de DP_LOGIN; atualmente a ajuda fala em sobrescrita, mas o código usa fallback.
- [ ] CLI-09 · P2 · E — Oferecer saída JSON para ferramentas e resumo legível para humanos.
- [ ] CLI-10 · P2 · E — Avaliar distribuição npm; só documentar npx quando o pacote estiver publicado e testado.

## 11. GitHub Action e instalação

- [ ] ACT-01 · P0 · E — Disponibilizar a Action para o público pretendido e testar consumo a partir de outro repositório.
- [ ] ACT-02 · P0 · E — Publicar versão fixa, política de tags e notas de release consistentes com o README.
- [ ] ACT-03 · P0 · E — Testar ponta a ponta em repositório descartável: checkout, geração, publicação e imagens acessíveis.
- [ ] ACT-04 · P0 · E — Documentar permissões mínimas separando leitura de dados e publicação dos arquivos.
- [ ] ACT-05 · P1 · E — Gerar outputs com diretório, snippet, manifesto e versão da configuração.
- [ ] ACT-06 · P1 · E — Produzir resumo da execução com widgets gerados, avisos e acesso aos artefatos.
- [ ] ACT-07 · P1 · E — Adicionar controle de concorrência nos exemplos para evitar publicações simultâneas conflitantes.
- [ ] ACT-08 · P1 · E — Explicar branch padrão, execução manual, cache de imagens e acesso público aos assets.
- [ ] ACT-09 · P1 · E — Documentar atrasos e desativação de schedules por inatividade em repositórios públicos.
- [ ] ACT-10 · P1 · E — Oferecer workflows prontos para somente gerar, publicar em branch e atualizar trecho do README.
- [ ] ACT-11 · P2 · E — Atualizar trecho entre marcadores somente por opção explícita; preservar o restante do README e permitir revisão por PR.
- [ ] ACT-12 · P2 · E — Preparar publicação no Marketplace com documentação, exemplos e informações de suporte.
- [ ] ACT-13 · P2 · E — Documentar rollback e atualização entre versões sem perder personalização.

Referência de agendamento: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows. Schedules podem atrasar, executam na branch padrão e podem ser desativados após 60 dias sem atividade em repositórios públicos.

## 12. Segurança e privacidade

- [ ] SEC-01 · P0 · E — Manter tokens fora de arquivos exportados, URLs, logs, preview e armazenamento do navegador.
- [ ] SEC-02 · P0 · E — Definir quais campos privados podem sair nos assets; exibir resumo antes de habilitar exportação de informações privadas.
- [ ] SEC-03 · P0 · E — Validar protocolos de links e impedir atributos, scripts ou eventos fornecidos como conteúdo.
- [ ] SEC-04 · P0 · E — Limitar quantidade e tamanho dos textos, widgets e arquivos importados para evitar travamentos.
- [ ] SEC-05 · P0 · E — Garantir que nomes gerados permaneçam no diretório de saída e não contenham traversal.
- [ ] SEC-06 · P1 · E — Fixar Actions externas por SHA revisado e manter atualização automatizada.
- [ ] SEC-07 · P1 · E — Criar SECURITY.md com canal privado de reporte e versões suportadas.
- [ ] SEC-08 · P1 · E — Proteger branch de release e exigir as verificações definidas antes de publicar.
- [ ] SEC-09 · P1 · E — Documentar dados locais, dados públicos e serviços externos usados pelo configurador.
- [ ] SEC-10 · P2 · E — Exigir sanitização de SVG e licenças de ícones/temas aceitos da comunidade; não executar temas como código remoto.
- [ ] SEC-11 · P3 · E — Avaliar OAuth ou backend somente se recursos de dados reais exigirem; projetar expiração, revogação e privilégio mínimo antes de implementar.

Referência para SHA de Actions: https://docs.github.com/en/actions/reference/security/secure-use.

## 13. Qualidade, testes e desempenho

- [ ] QA-01 · P0 · E — Adicionar regressões para os bugs de paginação, links, IDs, URL base e pico zero.
- [ ] QA-02 · P0 · E — Testar falhas HTTP/GraphQL, timeout, rate limit, token inválido e páginas adicionais usando respostas simuladas.
- [ ] QA-03 · P0 · E — Validar SVG com parser XML real, além da verificação atual de equilíbrio de tags.
- [ ] QA-04 · P1 · E — Comparar renderizações visuais dos widgets em claro/escuro e animação desativada.
- [ ] QA-05 · P1 · E — Testar dados vazios, números grandes, descrições longas, Unicode e colisões de IDs.
- [ ] QA-06 · P1 · E — Garantir paridade do resultado entre configurador, CLI e Action.
- [ ] QA-07 · P1 · E — Testar sistemas suportados e versões de Node declaradas, com matriz proporcional ao compromisso de suporte.
- [ ] QA-08 · P1 · E — Validar snippets em README real e diferentes larguras; um navegador local não reproduz todos os filtros do GitHub.
- [ ] QA-09 · P1 · E — Testar atualização de configuração e compatibilidade de presets existentes.
- [ ] QA-10 · P1 · E — Testar o fluxo do configurador: escolher, personalizar, importar, exportar e restaurar.
- [ ] QA-11 · P1 · E — Adicionar checagem de sintaxe, estilo, links e schemas no CI sem depender de cobertura percentual isoladamente.
- [ ] QA-12 · P2 · E — Medir tamanho dos SVGs, tempo de geração e resposta do preview; definir limites com base em perfis pequenos e grandes.
- [ ] QA-13 · P2 · E — Reduzir atualização desnecessária do preview e evitar consultas repetidas à API.
- [ ] QA-14 · P2 · E — Executar combinações representativas e casos extremos; testar regras compartilhadas sem tentar manter uma captura para toda combinação possível.

## 14. Documentação e suporte

- [ ] DOC-01 · P0 · E — Reescrever Quick Start com um caminho mínimo testado, arquivos completos e resultado esperado.
- [ ] DOC-02 · P1 · E — Documentar cada opção, tipo, limite, padrão e exemplo de configuração.
- [ ] DOC-03 · P1 · E — Separar guias de iniciante, personalização e referência avançada.
- [ ] DOC-04 · P1 · E — Criar galeria com imagens e acesso direto à configuração de cada exemplo.
- [ ] DOC-05 · P1 · E — Explicar como publicar assets e incorporá-los sem copiar tokens temporários de imagens privadas.
- [ ] DOC-06 · P1 · E — Criar troubleshooting por sintoma: imagem quebrada, dados antigos, token, schedule e permissões.
- [ ] DOC-07 · P1 · E — Explicar as definições e limitações das métricas e das animações.
- [ ] DOC-08 · P1 · E — Incluir exemplos com usuário sem contribuições, sem projetos e sem contatos.
- [ ] DOC-09 · P1 · E — Documentar acessibilidade, idioma e uso em dispositivos menores.
- [ ] DOC-10 · P2 · E — Criar tutorial curto em vídeo/GIF com alternativa textual completa.
- [ ] DOC-11 · P2 · E — Manter documentação em português e inglês com política de sincronização.
- [ ] DOC-12 · P2 · E — Publicar guia de migração, changelog e matriz de versões suportadas.

## 15. Comunidade e manutenção

- [ ] OSS-01 · P1 · E — Criar CONTRIBUTING.md com ambiente local, comandos e critérios de revisão.
- [ ] OSS-02 · P1 · E — Criar templates de bug, sugestão de widget, tema e solicitação de integração.
- [ ] OSS-03 · P1 · E — Criar template de PR com exemplo visual e validação quando a mudança afeta layout.
- [ ] OSS-04 · P1 · E — Publicar roadmap com estados e critérios de aceitação, distinguindo ideias de compromissos.
- [ ] OSS-05 · P2 · E — Abrir Discussions para mostrar perfis, tirar dúvidas e votar em propostas.
- [ ] OSS-06 · P2 · E — Criar tarefas pequenas para novos contribuidores e registrar responsáveis quando existirem.
- [ ] OSS-07 · P2 · E — Definir formato, licenciamento e revisão dos temas/presets comunitários.
- [ ] OSS-08 · P2 · E — Criar guia para adicionar widget com contrato, dados fictícios, acessibilidade e testes necessários.
- [ ] OSS-09 · P2 · E — Definir política de suporte compatível com o tempo disponível do mantenedor.
- [ ] OSS-10 · P2 · E — Coletar feedback opcional sobre instalação e usabilidade, sem rastreamento oculto.

## Etapas de entrega sugeridas

| Etapa | Entrega | Critério para avançar |
| --- | --- | --- |
| 1 — Base confiável | Correções confirmadas, dados corretos, publicação inicial e instalação testada | Outro repositório gera e publica o exemplo sem ajustes não documentados |
| 2 — Personalização | Schema, widgets ordenáveis, 3 famílias, 6 paletas e 3 layouts | Configuração inválida recebe orientação útil e presets geram resultados legíveis |
| 3 — Configurador | Preview fictício, controles, importação e exportação | Uma pessoa monta um perfil sem editar JSON e reproduz o resultado na Action |
| 4 — Biblioteca | Novos widgets, idiomas, galeria e documentação ampla | Todo novo componente segue contrato, acessibilidade e testes compartilhados |
| 5 — Ecossistema | Presets da comunidade e integrações opcionais selecionadas | Contribuir e atualizar não quebra perfis existentes nem exige serviços extras no uso básico |

## Primeiras 12 tarefas recomendadas

1. FIX-01: paginação dos repositórios.
2. FIX-03 e FIX-04: identidade e links de projetos.
3. FIX-05, FIX-06 e FIX-07: validação e unicidade.
4. FIX-08 e FIX-09: URL base e pico zero.
5. DATA-01 e DATA-02: períodos e significado das métricas.
6. REL-01 a REL-04: falhas de rede e preservação dos arquivos.
7. QA-01 a QA-03: regressões e validação real de SVG.
8. CFG-01 e CFG-02: schema e versão da configuração.
9. ACT-01 a ACT-04 e DOC-01: instalação pública comprovada.
10. CFG-07, LAY-01 e STYLE-02: composição, layouts e estilos separados de cores.
11. UI-01 a UI-09: primeiro configurador funcional com dados fictícios.
12. STYLE-14 e DOC-04: galeria com exemplos reproduzíveis.

## O que deve definir a qualidade

- Um iniciante conclui a instalação usando somente o guia; validar com pessoas que não conhecem o código.
- O preset visto no configurador corresponde ao resultado publicado.
- Os dados têm período, escopo e atualização claros.
- Falhas não apagam o último perfil válido nem são disfarçadas de zeros.
- Textos são legíveis em telas menores e em claro/escuro.
- A experiência principal funciona com dados fictícios sem cadastro.
- Credenciais não acompanham configurações compartilhadas.
- Atualizações preservam configurações compatíveis e têm guia quando exigem migração.

## Decisões que podem esperar

OAuth, backend permanente, rastreamento de visitas, rankings, marketplace de temas com código, muitas integrações externas e instalação automática com acesso de escrita à conta. Só avançar quando houver demanda comprovada e manutenção viável.

O diferencial inicial recomendado é: montar visualmente, escolher estilos consistentes, entender os dados e instalar com confiança.
