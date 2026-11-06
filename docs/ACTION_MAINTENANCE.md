# Manutenção das Actions

As atualizações propostas pelos PRs #25–29 são validadas em conjunto. Todos os usos continuam fixados pelo SHA completo, inclusive os workflows exportados pelo Studio/CLI.

| Dependência | Versão revisada | Uso |
| --- | --- | --- |
| [checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) | 7.0.1 | CI, Pages, smoke e workflow exportado |
| [setup-node](https://github.com/actions/setup-node/releases/tag/v7.1.0) | 7.1.0 | CI, Pages e Action composta |
| [upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | 5.0.0 | Pages e empacotamento real na CI do PR |
| [deploy-pages](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | 5.0.1 | Publicação do Studio |
| [ghaction-github-pages](https://github.com/crazy-max/ghaction-github-pages/releases/tag/v5.0.0) | 5.0.0 | Publicação dos SVGs e workflow exportado |
| [upload-artifact](https://github.com/actions/upload-artifact/releases/tag/v7.0.2) | 7.0.2 | Folhas de revisão visual na CI |

## Compatibilidade

Os runtimes das Actions atualizadas usam Node 24; o código do projeto continua testado em Node 22 e 24. Runners próprios precisam suportar esse runtime (Actions Runner 2.327.1 ou posterior). Comandos Git autenticados dentro de uma Docker container action com checkout moderno exigem runner 2.329.0 ou posterior; este projeto não usa esse caminho. GitHub.com com ubuntu-latest/windows-latest é o ambiente verificado. Não presumir compatibilidade com instalações antigas do GitHub Enterprise Server.

Setup-node 7 mudou a organização interna para ESM e removeu o fallback fictício NODE_AUTH_TOKEN. Este projeto não configura registry-url nem publica em npm. O cache automático está explicitamente desativado, inclusive na Action composta executada no repositório do usuário. Consulte as [notas oficiais](https://github.com/actions/setup-node#whats-new-in-v7).

Checkout usa persist-credentials: false. A publicação dos assets recebe GITHUB_TOKEN explicitamente no passo de publicação; não depende de credenciais deixadas pelo checkout. A política de permissões e a restrição de Pages a main permanecem.

## Aceite e atualização

1. Revisar os changelogs e os manifests oficiais, mantendo pins SHA.
2. Atualizar tanto YAMLs quanto src/workflow.mjs e o exemplo no README. Dependabot não reescreve strings JavaScript.
3. Executar testes e os quatro checks exigidos. A CI envia um artefato studio-validation com a mesma Action de upload usada no Pages, sem deploy em PR.
4. Integrar em develop por PR/merge commit, preparar release corretiva, integrar em main e criar nova tag anotada. Não mover tags anteriores.
5. Executar Pages e o smoke test da versão publicada. Conferir sucesso, manifesto, créditos e URLs públicas. A CI do PR não comprova sozinha o deploy.

Para rollback, restaure a referência de versão anterior e o workflow compatível. Não exclua a branch de assets nem mova uma tag já publicada. O código em v0.2.0 preserva as dependências anteriores para instalações que precisem delas.
