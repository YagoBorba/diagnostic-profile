# Revisão do produto e plano de lançamento

Revisão de 05/11/2026. Escopo: código, configuração, coleta de dados, geração de arquivos, Studio, documentação, CI e jornada de instalação. Trata-se de avaliação técnica com testes internos; ainda não é uma pesquisa com usuários externos.

## Veredito

O projeto é utilizável para experimentar estilos, compor blocos e exportar uma configuração. Esta entrega acrescenta um caminho utilizável para iniciantes: gerar um README em Markdown diretamente no navegador, sem instalar ferramentas. A automação de métricas continua em pré-lançamento: o repositório da Action é privado, falta uma versão estável publicada e falta validar a instalação em outro repositório.

O Studio hospedado atualmente tem acesso privado. Seu endereço não equivale a um serviço público disponível para qualquer visitante. Não foi alterada a visibilidade do site nem do repositório.

## Dois caminhos de uso

| Caminho | O que a pessoa recebe | O que precisa fazer | Limitação |
| --- | --- | --- | --- |
| README pronto | README.md e instruções; também é possível copiar o texto | Revisar os exemplos e salvar o arquivo no repositório público login/login | Aparência do Markdown do GitHub; sem métricas ou atualização automática |
| SVGs com Action | JSON, workflow, snippet e previews fictícios separados | Instalar os arquivos, configurar permissões e executar a Action | Depende de acesso à Action e de assets acessíveis aos visitantes |

Nos dois casos, é a pessoa que publica o conteúdo no GitHub. Gerar um arquivo automaticamente no site é diferente de autorizar o site a escrever na conta. O segundo caso deve ser um projeto futuro com OAuth/GitHub App, consentimento e permissões mínimas.

## Avaliação por área

| Área | Evidência e diagnóstico | Próxima melhoria |
| --- | --- | --- |
| Primeiro uso | O caminho antigo exigia compreender JSON, workflow e branch antes de publicar. Agora o modo simples é o padrão, há limpeza do exemplo e README direto. | Testar com cinco pessoas que não conhecem o código; medir conclusão e pontos de dúvida, sem coleta oculta. |
| Modelos | Dez composições, seis paletas e três famílias; busca por texto sem acentos e filtro por objetivo. Cada modelo informa a sequência de blocos. | Mostrar miniaturas de composições completas e exemplos vazios, com nomes longos e alfabetos variados. |
| Identidade visual | Paleta, família e layout são independentes. Os dez modelos não são dez renderizadores ou dez famílias diferentes. | Expandir famílias blueprint e cartões limpos somente com exemplos claros/escuros e legibilidade verificada. |
| Conteúdo | Textos, contatos, projetos, tecnologias, estudos e trajetória são declarados pela pessoa. No modo simples, blocos de métricas são omitidos. | Facilitar a substituição de cada exemplo e importar dados públicos mediante ação explícita, com fallback manual. |
| Precisão | Coleta paginada e testes de identidade dos repositórios; dados indisponíveis não são apresentados como zero em cartões. | Corrigir o rótulo geral de período do painel diagnóstico: estrelas/seguidores atuais não são métricas de 12 meses (DATA-01). |
| Instalação | Exportações são geradas da configuração atual; ZIP de SVG distingue previews fictícios. README simples independe da Action. | Antes de anunciar automação pública, testar Action e publicação em repositório descartável, imagens públicas e schedule. |
| Acessibilidade | Rótulos, foco, ordenação por teclado, aviso de contraste, movimento reduzido e resumo textual disponíveis. | Teste real com leitor de tela e README renderizado pelo GitHub. SVG title/desc não garantem leitura dos dados ao incorporar imagem. |
| Idioma | Galeria e orientação do Studio em português; vários rótulos dos SVGs e erros permanecem em inglês. | Dicionários pt-BR/en compartilhados, datas/números localizados e política de sincronização das traduções. |
| Segurança | Validação de links, limites, escape de SVG/Markdown, exportação por campos permitidos e escrita transacional de arquivos. | Continuar revisão de dependências e testar configurações hostis. Publicação automática na conta só com projeto de autorização próprio. |
| Privacidade | Sem token no Studio, sem API de perfil no navegador e sem telemetria própria nesta implementação. | Explicar sempre a diferença entre rascunho local, link compartilhado, repositório público e logs do provedor. |
| Manutenção | Motor compartilhado, schema e testes em Node 22/24, Windows/Linux; commits e PRs seguem Gitflow. | Release com changelog, referência fixa da Action, rollback documentado e proteção das branches. |
| Desempenho | Renderização e ZIP são locais; não há servidor de imagens nem dependências em execução no navegador. | Medir configurações máximas em aparelho real de entrada antes de anunciar metas de desempenho. |

## Modelos e escolhas claras

| Modelo | Para quem | Ordem principal |
| --- | --- | --- |
| Console diagnóstico | Quem quer o painel técnico original | Apresentação → contatos → projetos → métricas → contribuições |
| Terminal | Quem prefere composição técnica compacta | Apresentação → agora → projetos → métricas |
| Essencial | Apresentação profissional direta | Apresentação → projetos → tecnologias → contatos |
| Open source | Quem quer destacar atividade pública | Apresentação → projetos → calendário → métricas |
| Jornada de aprendizado | Estudantes e pessoas em transição | Apresentação → agora → tecnologias → projetos |
| Portfólio | Quem quer mostrar entregas | Apresentação → projetos → trajetória |
| Currículo | Quem prioriza experiência e competências declaradas | Apresentação → tecnologias → trajetória → projetos |
| Caderno de pesquisa | Pesquisa e estudo contínuo | Apresentação → agora → trajetória → projetos |
| Bancada maker | Experimentos e projetos técnicos | Apresentação → tecnologias → agora → projetos |
| Comunidade | Colaboração e projetos em andamento | Apresentação → agora → projetos → calendário |

Todos permitem editar e reordenar blocos. Os modelos não atribuem notas de habilidade nem inventam experiência. O modo Markdown preserva conteúdo e ordem, mas não reproduz cores, colunas ou animações de SVG.

## Página gratuita: viável sem backend

O build atual já produz HTML, CSS, módulos JavaScript e dados de demonstração em dist/site. A geração do README, a validação, o compartilhamento e o ZIP funcionam no navegador. Portanto, o configurador básico não precisa de banco, assinatura, servidor de imagens ou segredo de API.

A opção inicial recomendada é GitHub Pages, usando o endereço github.io sem domínio comprado. GitHub Free oferece Pages para repositórios públicos. Se o código principal precisar continuar privado, uma alternativa é um repositório público dedicado ao código distribuível do Studio, após revisar licença, conteúdo e política de atualizações. Um domínio personalizado é opcional. Serviços gratuitos têm limites e condições que podem mudar; esta proposta não promete hospedagem ilimitada.

Fontes oficiais: [disponibilidade e criação do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [funcionamento estático](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [limites de uso](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

Foi preparado [.github/workflows/studio-pages.yml](../.github/workflows/studio-pages.yml), acionado somente por workflow_dispatch e restrito à branch main. Ele verifica o projeto, gera dist/site, envia o artefato e publica no ambiente github-pages. Não foi executado nem configurado Pages. A primeira publicação depende de uma release que leve esse workflow para main e da configuração de Pages com GitHub Actions no repositório escolhido.

Para sites de projeto em /diagnostic-profile/, os arquivos usam caminhos relativos; a verificação local inclui servir o build sob um subdiretório. O configurador não pode executar JavaScript dentro do README: o resultado incorporado segue os recursos aceitos pelo GitHub.

## Privacidade e dados

- Textos digitados são processados localmente. O navegador carrega arquivos estáticos e a fixture pública de demonstração; não consulta o perfil digitado nem escreve na conta.
- Rascunhos e favoritos usam localStorage, persistem neste navegador e não são sincronizados com outro aparelho. Recomeçar substitui o rascunho; favoritos são removidos individualmente. Baixar JSON permite guardar uma cópia.
- Links de estilo incluem a configuração no fragmento da URL, incluindo textos e contatos. O fragmento não acompanha a requisição HTTP normal, mas quem receber o link poderá ler a configuração. Histórico e extensões do navegador também merecem consideração.
- O README e os SVGs publicados no perfil são conteúdo público. Não inclua credenciais ou informações pessoais que não deseja divulgar. Campos desconhecidos de credenciais são descartados da exportação, mas segredos digitados dentro de uma bio continuam sendo texto: o sistema não os reconhece automaticamente.
- O provedor de hospedagem pode registrar acessos. Não há ferramenta de analytics, cookies de rastreamento ou coleta de feedback no código do Studio nesta revisão. Isso não é garantia de ausência de logs da infraestrutura.
- O modo SVG busca dados reais somente na CLI/Action, usando o segredo no ambiente de execução. Não coloque tokens em configurações, URLs de imagem ou exports.

## Plano de entrega com critérios de aceitação

1. **Concluir a base para o público.** Corrigir períodos das métricas e revisão das permissões; criar release/X.Y.Z de develop, PR para main com CI, tag anotada vX.Y.Z e merge de main para develop. Validar Action em outro repositório. Aceite: guia seguido sem ajustes ocultos, imagens acessíveis e nenhuma informação fictícia publicada como estatística real.
2. **Abrir o configurador gratuito.** Revisar quais arquivos ficarão públicos, escolher o repositório de hospedagem, habilitar Pages e executar o workflow em main. Aceite: visitante sem autenticação escolhe modelo, preenche perfil, baixa README e publica pelo guia. Não mudar privacidade como efeito colateral de uma alteração de código.
3. **Melhorar qualidade visual e idioma.** Traduzir interface, erros e saída; expandir famílias e galeria de composições completas; testar teclado, leitor de tela e aparelhos menores. Aceite: nenhum campo essencial cortado, erros compreensíveis e modelos claros/escuros legíveis.
4. **Avaliar integração com GitHub.** Primeiro importar dados públicos mediante botão, tratando rate limit e erro sem perder edição. Depois avaliar instalação autorizada com GitHub App. Aceite: consentimento explícito, escopo mínimo, revogação e ausência de segredos no armazenamento/exports.

## Como verificar usabilidade antes de anunciar

Peça a cinco pessoas de perfis diferentes para, sem orientação verbal, escolher um modelo, remover Ada, preencher nome/projeto/contato, baixar e publicar o README. Registre erros e dúvidas com consentimento. Para automação, use um repositório de teste e confira primeira execução, segunda execução sem perda de arquivos, falha de token e rollback. Só anunciar essas validações após realizá-las.

Nesta entrega foram executados testes automatizados e QA interno do navegador. Não foram realizados pesquisa com participantes externos, teste com leitor de tela, publicação no Pages, teste novo de Action entre repositórios nem autorização OAuth.
