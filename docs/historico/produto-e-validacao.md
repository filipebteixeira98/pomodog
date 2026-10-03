> Arquivo histórico: versão preservada antes da consolidação de 03/10/2026. Pode conter decisões superadas; consulte a [documentação vigente](../README.md).

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

- A experiência deve acolher companhia, descanso e prazer, mesmo quando produtividade não é a prioridade. Avaliar autonomia e bem-estar percebido sem exigir mais minutos de foco como único sinal de sucesso.
- Atividades opcionais de desenho durante o descanso, sonoplastia e ambientes personalizáveis podem aumentar o prazer de uso. Comparar distração e retorno ao foco; não pressupor eficiência ou hiperfoco.
- Prévias de novidades podem comunicar evolução sem interromper sessões. Interesse declarado não comprova retenção.
- Feedback explícito e insights opcionais podem ajudar a adaptar a experiência. Validar utilidade antes de ampliar coleta ou enviar dados para serviços de IA.
- Semelhança e identificação são hipóteses a esclarecer: padrões familiares, afinidade com mascotes e grupos semelhantes não são a mesma funcionalidade.
- Conteúdo de neurociência exige fontes e revisão. O ciclo proposto “estímulo → feeder → preparação → repetição definitiva” ainda precisa de definição e evidência; não apresentar como método comprovado.

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

Não interpretar elogios como retenção ou intenção de compra como receita. No protótipo original, usar observação e entrevistas; na entrega posterior de Analytics, somente instalações que consentirem poderão enviar eventos mínimos. Antes de adicionar monetização, testar ofertas concretas e identificar claramente qualquer simulação.

## Registro de decisões

- A primeira entrega será um protótipo funcional, não apenas telas estáticas.
- Primeiro protótipo implementado com React Native, Expo e TypeScript, com abertura web para avaliação imediata. Android físico e distribuição ainda precisam de validação.
- Sem compromissos de publicação ou de cobrança nesta etapa.

## O que avaliar agora

Pedir para iniciar, pausar e retomar uma sessão normal para verificar entendimento e impressão inicial. A demonstração de 10 segundos foi removida. O mascote tem três cores de coleira gratuitas para explorar preferências; isso não é um teste de disposição para pagar.

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

Firebase Analytics opcional Android foi implementado em entrega posterior; vínculo GA4 confirmado e recepção física ainda precisa ser validada. Heatmaps continuam pendentes. Eventos mínimos dependem de consentimento separado, e observação/entrevistas complementam os dados de uso. Login e sincronização devem ser opcionais, preservando a experiência sem conta.

A tela de Foco concentra timer, controles e uma fala curta do mascote. O resumo diário fica apenas em Progresso; os cabeçalhos promocionais foram removidos das telas. Avaliar se essa simplificação facilita iniciar uma sessão, sem assumir melhoria de usabilidade antes dos testes com pessoas.

O tour guiado é opcional, oferecido na última etapa da introdução e em Ajustes. Avaliar se seus três destaques ajudam a localizar os controles sem tornar o primeiro uso demorado. Não considerar a conclusão do tour como prova de compreensão.

## Entrada com escolha de conta

Antes da introdução, visitante no primeiro acesso vê “Seu foco começa com um pequeno passo”, arte do Nino e relógio Pomodoro, Google ou continuar sem conta. A frase enfatiza início simples e companhia, sem prometer produtividade ou criar urgência. Avaliar se as pessoas entendem os ciclos de foco/pausa e percebem que login é opcional. Clareza da entrada e interesse declarado não comprovam retenção.

## Hipóteses adicionais — agenda, família e atividade

- Sugestões baseadas em disponibilidade podem ajudar a abrir espaço para lazer e responsabilidades, sem pressupor que todo compromisso exige antecipar trabalho. Validar preferência por foco hoje versus amanhã e tolerância à frequência dos convites.
- Um campo opcional de atividade pode facilitar começar com intenção clara; avaliar se ajuda sem atrasar o início ou expor texto pessoal.
- Apoio de responsáveis pode ajudar na rotina de filhos; definir público e limites de participação antes de transformar a hipótese em supervisão ou comparação de desempenho.
- Nova animação na entrada pode aumentar afinidade com Nino; avaliar distração, clareza e desempenho, sem tratar apelo visual como prova de retenção.

Firebase Analytics Android é a frente atual por decisão do usuário; código e consentimento em Ajustes implementados, vinculação confirmada e validação ainda pendente. Eventos mínimos complementam observação e entrevistas; não comprovam causalidade nem justificam coleta de texto livre, conteúdo de agenda ou dados familiares. Coleta desativada por padrão; medir somente eventos posteriores ao consentimento e tratar a amostra como usuários optantes, sem supor representatividade.
