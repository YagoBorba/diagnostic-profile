# Crie seu primeiro README

## Sem instalação: README pronto

1. Abra o Studio, escolha um modelo e clique em **Limpar textos de exemplo**.
2. Preencha seu login do GitHub, nome e apresentação. Adicione projetos, tecnologias e contatos que quiser mostrar. Blocos vazios são omitidos no README simples.
3. Em **Como você quer usar?**, mantenha **README pronto, sem automação**. Confira o texto na aba README pronto e clique em **Baixar README.md** ou copie o código. O ZIP inclui também INSTALL.txt.
4. No GitHub, crie ou abra um repositório **público** com seu login como nome: por exemplo, para octocat, octocat/octocat. Coloque README.md na raiz. Se já existir um README, mescle o conteúdo para preservar o que deseja manter.
5. Salve a alteração e abra seu perfil. Não precisa de Node, token ou workflow. Atualize os textos manualmente quando necessário.

O README simples usa a aparência do Markdown do GitHub. Paletas, animações, larguras e cartões SVG pertencem ao outro modo. Métricas, calendários e timestamps de demonstração não entram no README simples. Textos de exemplo entram se você não os substituir; revise os contatos e links antes de publicar.

O Studio hospedado deste projeto ainda é privado. Para executá-lo a partir de um clone autorizado:

    npm ci
    npm run studio

Abra o endereço Local exibido pelo comando. O projeto ainda não oferece um pacote npm público para npx.

As condições do perfil README estão na [documentação oficial do GitHub](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme). Contas de usuários gerenciados não têm esse recurso.

## Com SVGs e métricas atualizadas

Escolha **SVGs e métricas com Action** para exportar JSON, snippet e workflow. Siga o INSTALL.txt e a referência de [instalação e permissões](../README.md). O motor roda no seu repositório, não no navegador. A Action ainda está em pré-lançamento e seu repositório precisa poder acessá-la; não há tag estável pública nesta revisão.

Os previews fictícios do ZIP não são suas estatísticas e ficam em preview/. Execute o workflow para gerar os assets reais. Para que visitantes vejam as imagens, o destino dos assets precisa ser acessível publicamente. Uma branch chamada output em repositório privado continua privada. Não copie URLs temporárias autenticadas de imagens privadas: elas não são uma publicação pública durável.

Use os URLs calculados no snippet para o destino escolhido. Para outra conta/repositório, configure PROFILE_PUBLISH_TOKEN no ambiente da Action com permissão de escrita nesse destino. Nenhum token deve entrar no JSON, README, URL ou navegador.

## Problemas comuns

| Sintoma | O que verificar |
| --- | --- |
| O perfil não mostra README | Repositório público com o mesmo nome do login, README.md não vazio na raiz e conta elegível. |
| Continua aparecendo Ada ou projetos do exemplo | Use Limpar textos de exemplo e confira os campos, contatos, projetos e o texto exportado. |
| O README não tem as cores do preview | O modo simples é Markdown; escolha SVGs com Action para os visuais do preview. |
| Tecnologias ou trajetória sumiram | Preencha os itens em Conteúdo pessoal e habilite os blocos correspondentes. |
| Não consigo baixar | Corrija os campos destacados; mantenha ao menos apresentação ou outro bloco com conteúdo. |
| Action não encontrada ou acesso negado | Confira a referência, acesso ao repositório privado e permissões. O projeto ainda não tem versão estável pública. |
| SVG aparece quebrado | Confira execução concluída, branch/destino, nomes e acesso público aos assets; não use URLs autenticadas temporárias. |
| Dados não mudaram | Confira a última execução e os logs, agendamento na branch padrão e cache das imagens. Schedules podem atrasar; rode manualmente para investigar. |
| Falha de token ou de publicação | Separe leitura dos dados da escrita no destino; confira permissões e secrets da Action sem colar tokens em issues. |
| Meu rascunho sumiu | O armazenamento é local ao navegador e pode ser limpo/bloqueado. Use Baixar JSON para guardar uma cópia. |

Mais detalhes: [Studio](STUDIO.md), [galeria](GALLERY.md), [avaliação e lançamento público](PRODUCT_REVIEW.md), [roadmap](ROADMAP.md).
