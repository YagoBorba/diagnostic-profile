# Lançamento 0.2.1

Data: 06/11/2026. Manutenção das Actions por [Yago Borba](https://github.com/YagoBorba).

Atualiza checkout 7.0.1, setup-node 7.1.0, upload-pages-artifact 5.0.0, deploy-pages 5.0.1 e ghaction-github-pages 5.0.0 com pins SHA. O [PR #33](https://github.com/YagoBorba/diagnostic-profile/pull/33) reúne as propostas #25–29, atualiza também os workflows exportados e verifica empacotamento de Pages na CI.

A versão mantém os mundos, dados, créditos e schema 1. Agora os instaladores exportados usam YagoBorba/diagnostic-profile@v0.2.1. Atualize a referência e os pins do workflow ao migrar; não basta trocar apenas a tag se quiser atualizar checkout/publicação.

Runners próprios devem suportar Node 24 (Actions Runner 2.327.1+). O projeto continua executado/testado em Node 22/24. Cache automático de pacotes e credenciais persistentes de checkout estão explicitamente desativados. Consulte [compatibilidade e rollback](ACTION_MAINTENANCE.md).

Gitflow: chore/action-runtime-maintenance → develop → release/0.2.1 → main, tag anotada v0.2.1 e merge de main para develop. Tags anteriores permanecem intactas. A publicação do Pages e o smoke test da versão são verificados após criar a tag; os resultados ficam em [IMPLEMENTATION.md](IMPLEMENTATION.md).

Página pública: https://yagoborba.github.io/diagnostic-profile/. Npm/Marketplace não fazem parte deste lançamento.

---

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
