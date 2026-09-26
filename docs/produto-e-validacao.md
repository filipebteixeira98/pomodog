# Pomodog — primeiro protótipo

## Intenção

Um companheiro de foco que ajuda a começar, torna as sessões agradáveis e celebra a constância sem cobrar perfeição. Nome e cachorro são provisórios. Público inicial definido pelo comportamento: pessoas com dificuldade para começar e manter uma rotina, independentemente de profissão.

## Escopo inicial

- Iniciar uma sessão rapidamente, pausar, retomar e reiniciar.
- Alternar entre foco e descanso, com durações configuráveis.
- Cachorro com reações discretas; respeitar preferência por movimento reduzido.
- Registrar sessões concluídas no dispositivo e mostrar progresso sem punições.
- Interface em português, acolhedora e legível.

## Hipóteses ainda abertas

- O cachorro incentiva o retorno depois da novidade inicial.
- A personalização de ambientes e acessórios tem valor comercial.
- Ambientação LoFi melhora a experiência. Escolher faixas e integração somente após verificar a licença de uso no aplicativo.

## Teste com pessoas próximas

Convidar inicialmente 5 a 8 pessoas para uma investigação qualitativa. Explicar que estamos avaliando o produto, não a habilidade de quem testa.

1. Perguntar sobre a última tentativa de manter uma rotina de foco e o que dificultou.
2. Pedir para iniciar uma sessão sem explicar a interface. Observar hesitações.
3. Pedir para pausar, retomar e experimentar um descanso.
4. Perguntar como perceberam o cachorro: companhia, distração ou indiferença? Registrar as palavras da pessoa.
5. Oferecer o protótipo para uso por alguns dias. Depois perguntar quando voltou, quando desistiu e por quê.

Não interpretar elogios como retenção ou intenção de compra como receita. Não coletar telemetria remota nesta primeira versão; usar observação e entrevistas. Antes de adicionar monetização, testar ofertas concretas e identificar claramente qualquer simulação.

## Registro de decisões

- A primeira entrega será um protótipo funcional, não apenas telas estáticas.
- Primeiro protótipo implementado com React Native, Expo e TypeScript, com abertura web para avaliação imediata. Android físico e distribuição ainda precisam de validação.
- Sem compromissos de publicação ou de cobrança nesta etapa.

## O que avaliar agora

Usar a demonstração de 10 segundos para verificar entendimento e impressão inicial. Pedir também uma sessão normal para observar o início da atividade. O mascote tem três cores de coleira gratuitas para explorar preferências; isso não é um teste de disposição para pagar.

Registrar por participante, sem informações pessoais desnecessárias:

| Observação                                             | Registro |
| ------------------------------------------------------ | -------- |
| Situação em que tentaria usar                          |          |
| Conseguiu iniciar sozinho?                             |          |
| Onde hesitou ou pediu ajuda?                           |          |
| Mascote: companhia, distração ou indiferença? Por quê? |          |
| O que esperava ao terminar?                            |          |
| Em que situação voltaria a usar?                       |          |
| Principal melhoria sugerida                            |          |

Este teste investiga compreensão e apelo inicial. Retenção exige uso ao longo do tempo; antes disso, implementar e testar alertas com tela bloqueada. Uma apresentação elogiada não comprova retenção, receita ou adequação ao mercado.

## Hipóteses do próximo ciclo

As novas propostas estão organizadas no [Plano de ação](plano-de-acao.md), com decisões pendentes em [Próximas etapas](proximas-etapas.md). Ainda precisam de validação:

- Animação corporal mais expressiva e interação de alimentar pets aumentam a sensação de companhia sem distrair ou gerar obrigação.
- Estatísticas mais completas e lembretes gentis ajudam a retomar a rotina sem cobrança excessiva.
- Outros animais, personalização e nomes têm valor suficiente para justificar uma oferta paga.
- Compartilhamento, pontuação e ciclos com amigos incentivam uso sem comparações punitivas.

A sugestão de analytics/heatmaps está em discussão e não altera a coleta da versão atual. Antes de instrumentar, definir consentimento, finalidade e eventos; observação e entrevistas permanecem o método vigente. Login e sincronização devem ser opcionais, preservando a experiência sem conta.
