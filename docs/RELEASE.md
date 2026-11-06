# Lançamento 0.2.0

Data: 06/11/2026. Por [Yago Borba](https://github.com/YagoBorba) · [diagnostic-profile](https://github.com/YagoBorba/diagnostic-profile).

Página gratuita: **https://yagoborba.github.io/diagnostic-profile/**.

## Entrega

- Seis mundos completos, além das três famílias anteriores; 16 modelos e seis paletas.
- Kit visual estático sem token/Action, Markdown com preview semântico correspondente e Action para dados públicos atualizados.
- Misturas por semente, travas, receitas sem dados pessoais, desafios opcionais e favoritos com nome/miniatura.
- Saída en/pt-BR, quebra de nomes largos, descrições acessíveis e instruções localizadas.
- Manifestos e publicação sem commits causados somente por timestamps quando os dados não mudam.
- Atualizações semanais de dependências/Actions em develop e folha de revisão visual como artefato de CI.
- Main/develop protegidas com PR obrigatório, quatro checks CI, bloqueio de force-push/exclusão e merge commits. Não exige aprovação de outra pessoa quando o mantenedor trabalha sozinho.
- Créditos pequenos e com links para o autor/projeto em todos os formatos de README, mesmo com o rodapé pessoal desabilitado.

Integrações: [PR #22](https://github.com/YagoBorba/diagnostic-profile/pull/22), [#23](https://github.com/YagoBorba/diagnostic-profile/pull/23), [#24](https://github.com/YagoBorba/diagnostic-profile/pull/24). Release por release/0.2.0 -> main, tag anotada v0.2.0 e merge de main para develop. Não mover tags anteriores.

O [exemplo público em outro repositório](https://github.com/YagoBorba/diagnostic-profile-example) permite verificar o consumo da Action separadamente; seus resultados reais ficam na página Actions desse exemplo. O teste do próprio projeto não é apresentado como substituto desse teste externo.

## Migração de 0.1.0

SchemaVersion permanece 1, e IDs dos presets anteriores continuam aceitos. As comparações com SVGs legados verificam a saída padrão anterior; novas famílias e locale são opções adicionais. JSON sem locale usa en; perfis novos no Studio usam pt-BR. Para manter o Markdown em português, selecione explicitamente pt-BR.

O formato inicial do Studio agora é kit visual estático. Ele não consulta dados reais: envia README.md com assets/ e omite widgets de API. Escolha Action para atualização automática, usando YagoBorba/diagnostic-profile@v0.2.0. Trocar o mundo não deve apagar o conteúdo; mantenha uma cópia JSON antes de experimentar.

No workflow existente, atualize a referência da Action e revise o CHANGELOG. Para imutabilidade estrita, use o SHA completo da tag. Guarde configuração/secrets e execute manualmente antes de substituir imagens em uso.

## Rollback

Restaure a referência e a configuração anteriores e execute novamente; não apague sua branch de assets para atualizar. --force solicita reconstrução na CLI quando necessário. Para o site, publique novamente um build revisado de main; não mova tags. Rascunhos são locais ao navegador/domínio, portanto exports JSON são o backup portátil.

## Limites

Npm/Marketplace, OAuth e gravação direta na conta do visitante não fazem parte desta versão. O pacote npm continua privado para impedir publicação acidental. O site e a Action são públicos. Não há promessa de métricas privadas ou de experiência validada com leitores de tela e participantes externos; essas verificações continuam no roadmap. A interface do Studio e diagnósticos de CLI não anunciam tradução completa para todas as línguas.

## Histórico

[v0.1.0](https://github.com/YagoBorba/diagnostic-profile/releases/tag/v0.1.0) foi o primeiro lançamento público em 05/11/2026, com Studio, dez modelos e Action. Essa tag permanece inalterada. As [evidências de execução](IMPLEMENTATION.md) registram a evolução e os limites de cada lote.
