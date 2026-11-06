# Crie seu primeiro README

Abra o [Studio público gratuito](https://yagoborba.github.io/diagnostic-profile/), sem login. Escolha o formato no início; o preview acompanha o que será exportado.

## Kit visual estático: estilo sem instalação

1. Escolha um mundo e clique em **Limpar textos de exemplo**.
2. Preencha login, nome, apresentação, projetos e contatos. Projetos são informados manualmente; não há consulta ao GitHub neste formato.
3. Confira o preview em claro/escuro. Use a composição Compacta para telas menores e revise os avisos de contraste.
4. Baixe o ZIP, extraia e envie **README.md e a pasta assets/ inteira** para a raiz do seu repositório público login/login. Preserve os caminhos relativos; mescle o README existente antes de salvar.
5. Visite seu perfil. Para mudar o conteúdo depois, importe diagnostic-profile.json no Studio e envie o kit atualizado.

Não precisa de token, Node.js, Action ou servidor de imagens. Métricas, calendários e projetos fixados da API são omitidos. Revise todo conteúdo de exemplo antes de publicar. Os créditos a Yago Borba e ao projeto acompanham o README.

## Markdown: textos e links

Escolha README em Markdown para copiar ou baixar somente textos e links. Esse formato segue a aparência do GitHub, sem as formas/cores dos SVGs. O ZIP inclui README.md e INSTALL.txt. Blocos de dados automáticos não entram nesse modo; a atualização é manual.

## Action: dados públicos atualizados

Escolha SVGs e métricas com Action. Exporte JSON, workflow e snippet, confira permissões e execute o workflow no seu repositório. A referência pública é YagoBorba/diagnostic-profile@v0.2.0; use o SHA completo da tag se precisar de imutabilidade. Siga a [instalação completa](../README.md).

O preview da Action usa dados **fictícios**. Os SVGs fictícios ficam separados em preview/ no ZIP; não publique esses arquivos como suas estatísticas. O workflow gera dados reais. Para outra conta/repositório de destino, configure PROFILE_PUBLISH_TOKEN com escrita naquele destino. Nunca coloque token no JSON, README, URL ou navegador.

O destino de imagens precisa ser público para visitantes sem autenticação. Uma branch output em repositório privado continua privada. Não copie URLs temporárias autenticadas de imagens privadas.

[Exemplo público de instalação](https://github.com/YagoBorba/diagnostic-profile-example) · [Workflows do projeto](https://github.com/YagoBorba/diagnostic-profile/actions).

## Repositório do perfil e execução local

No GitHub, o repositório deve ser público, ter o mesmo nome do seu login e conter README.md não vazio na raiz. Consulte as [condições oficiais](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme), incluindo a restrição a contas gerenciadas.

Para executar o Studio localmente:

    npm ci
    npm run studio

Abra o endereço Local exibido. Não há pacote npm público para npx.

## Problemas comuns

| Sintoma | O que verificar |
| --- | --- |
| O perfil não mostra README | Nome do repositório igual ao login, repositório público e README.md na raiz. |
| Continua aparecendo Ada | Limpe os exemplos e revise também projetos, contatos, campos e textos exportados. |
| Imagem estática aparece quebrada | Envie assets/ junto com README.md e mantenha os caminhos relativos. |
| Não vejo cores no Markdown | Esse formato usa texto e links; selecione kit visual estático ou Action para SVGs. |
| Tecnologias/traços sumiram | Preencha Conteúdo pessoal e habilite os blocos correspondentes. |
| Não consigo baixar | Corrija os campos destacados e habilite um bloco compatível com o formato escolhido. |
| Métricas não aparecem no kit estático | Esse modo usa conteúdo manual; escolha Action para estatísticas reais. |
| Action não encontrada | Confira v0.2.0, permissões de Actions e acesso à referência; não invente tags. |
| Dados da Action não mudaram | Confira execução, logs, branch padrão e cache de imagens. Geração idêntica preserva arquivos/timestamp; --force força novo build na CLI. |
| Falha de token ou publicação | Separe leitura dos dados da escrita no destino; confira secrets sem copiá-los em issues. |
| Meu rascunho sumiu | O armazenamento é local ao navegador/domínio. Baixe JSON como backup portátil. |

Mais detalhes: [Studio](STUDIO.md), [mundos e receitas](WORLDS.md), [galeria](GALLERY.md), [release e migração](RELEASE.md), [roadmap](ROADMAP.md).
