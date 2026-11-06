# Lançamento 0.1.0

Data: 05/11/2026. Autor: [Yago Borba](https://github.com/YagoBorba). Código e suporte: [diagnostic-profile](https://github.com/YagoBorba/diagnostic-profile).

Página pública gratuita: **https://yagoborba.github.io/diagnostic-profile/**. Abra no navegador, escolha um dos dez modelos e preencha seu perfil. README pronto é o caminho mais simples: não exige login, token ou instalação. Revise todos os exemplos antes de publicar.

## O que esta versão entrega

- Dez composições, seis paletas, três famílias e blocos ordenáveis.
- README em Markdown para copiar/baixar e kit SVG separado com JSON, snippet e workflow.
- Action pública YagoBorba/diagnostic-profile@v0.1.0; para máxima reprodutibilidade, use o SHA completo da tag.
- Créditos pequenos e com links para o autor e o projeto no rodapé do site e nos dois formatos de README. Ocultar o bloco de rodapé pessoal não remove os créditos.
- Configuração schemaVersion 1 e compatibilidade com configurações antigas sem versão.

O pacote npm continua privado para impedir publicação acidental; isso não afeta o site, o código público ou a Action. Não use npx para um pacote ainda não publicado. Esta entrega não inclui Marketplace, OAuth, gravação direta na conta do visitante, tradução completa nem garantia de dados privados. O preview SVG continua usando dados fictícios.

## Publicação e verificação

O Gitflow é feature -> develop -> release/0.1.0 -> main, com PRs, CI e merge commits. A tag anotada v0.1.0 aponta para a integração em main, que retorna para develop por merge.

O workflow Publish Studio to GitHub Pages é acionado manualmente em main. Ele executa as verificações, gera dist/site e publica no ambiente github-pages. O workflow Verify released profile Action executa a Action v0.1.0 com dados públicos de YagoBorba e publica o resultado em demo-assets, sem editar o perfil pessoal do autor. O resultado real das execuções fica na [página de Actions](https://github.com/YagoBorba/diagnostic-profile/actions).

Verificar a Action no próprio projeto não equivale a comprovar instalação em outro repositório. Esse teste externo e testes com leitor de tela e usuários independentes continuam separados no roadmap. A página já permite exportação sem automação.

## Atualização e rollback

1. Guarde seu diagnostic-profile.json e revise o CHANGELOG da versão desejada.
2. Troque apenas a referência da Action no workflow, preferindo SHA completo se precisar de imutabilidade; mantenha os secrets fora da configuração.
3. Execute manualmente, confira as imagens e compare o resultado antes de mudar seu README.
4. Se houver regressão, restaure a referência anterior e a configuração salva. Não apague a branch de assets para atualizar.

Tags de versão completa não serão movidas. Correções recebem nova versão patch pelo fluxo hotfix, com retorno a develop. Para reverter o site, publique novamente o build de um commit revisado de main; mantenha os dados do usuário em exports JSON, pois rascunhos são locais ao navegador e ao domínio.
