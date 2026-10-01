# Plano de ação — experiência, organização e autonomia

Implementação gradual, com Conventional Commits em inglês. Preservar Android/web, os dados já salvos e o uso sem conta.

| Etapa | Entrega e critério de conclusão                                                                                                                            | Estado    |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1     | Imports ordenados automaticamente pelo Prettier, preservando imports com efeitos colaterais, e verificação reproduzível                                    | Concluída |
| 2     | Ajustes como terceira aba; preferências e introdução acessíveis ali; área de perfil recebe identidade real quando disponível e mostra modo local sem conta | Concluída |
| 3     | Mascote com nome centralizado, entrada animada, movimento do corpo/cauda e caixas de diálogo; navegação manual e movimento reduzido                        | Concluída |
| 4     | Exportar/apagar dados locais, confirmação de exclusão, validação e recuperação segura de armazenamento corrompido; sem telemetria                          | Concluída |
| 5     | Testes de regressão, navegador, exportações web/Android, atualização das decisões e envio dos commits                                                      | Concluída |

## Limites e dependências da entrega inicial

- Ainda não existe autenticação. Preparar a apresentação de identidade sem inventar um cliente, coletar credenciais ou escolher um serviço de contas implicitamente. Integrar login/sincronização em uma etapa própria quando definidos.
- Nome do cão: Nino como proposta provisória, sujeito à preferência do usuário. Centralizar para facilitar mudanças.
- Defesa em profundidade nesta entrega: limites e validação de registros, exportação apenas por ação explícita, exclusão restrita aos dados do aplicativo e prevenção de sobrescrita silenciosa de dados ilegíveis. Não prometer criptografia que não existe.
- Permanecem no planejamento: notificações e teste em Android físico, licenças de LoFi, autenticação opcional e testes de monetização. Essas decisões não bloqueiam as melhorias atuais.

## Evidência esperada

Imports verificados; timer e persistência sem regressão; três abas funcionais; guia acessível com/sem animação; exportação JSON legível; exclusão confirmada e durável; dados antigos preservados; nenhuma identidade fictícia na interface.

## Entrega de 26/09/2026

Nino permanece provisório. Os controles locais, as três abas, os diálogos animados e a ordenação automática foram implementados. Evidências e limitações em [Verificação](verificacao.md). A integração de autenticação permanece uma etapa futura; somente o contrato de identidade e sua apresentação estão preparados.

## Próximo ciclo — sequência proposta

Backlog registrado após a discussão das 15 sugestões. A ordem abaixo é uma proposta de execução, não uma indicação de funcionalidades implementadas. A primeira implementação, migração de imports relativos para aliases, foi concluída. A frente visual foi reordenada por preferência do usuário: ícone/splash, animação corporal e, por último, Pencil.

| Ordem | Frente                 | Entregas e próximos passos                                                                                                   | Estado       |
| ----- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1     | Organização técnica    | Aliases e imports ordenados; manter verificações                                                                             | Concluída    |
| 2     | Identidade visual      | Ícone, splash e animação corporal implementados; validar release; Pencil em standby                                          | Em andamento |
| 3     | Progresso e incentivo  | Dashboard, sequência, alimentação e frases implementados; avaliar experiência                                                | Implementada |
| 4     | Aviso de conclusão     | Aviso de conclusão validado no aparelho, inclusive com tela bloqueada; rotina/alimentação/inatividade e push remoto futuros  | Concluída    |
| 5     | Contas e sincronização | Google OAuth e gravação validados no aparelho; exclusão validada no aparelho; tela OAuth, produção e diagramas pendentes     | Em validação |
| 6     | Monetização e social   | Mascotes e backgrounds pagos, atividades de descanso, compartilhamento; depois pontuação e amigos; avaliar RevenueCat        | Planejada    |
| 7     | Publicação             | Título, descrição, screenshots e validação do build para Google Play Console                                                 | Planejada    |
| 8     | Experiência e conteúdo | Companhia além de produtividade, sonoplastia, sneak peeks e neurociência com fontes; esclarecer hipótese de semelhança       | Planejada    |
| 9     | Feedback               | Formulário de comentários, envio explícito e destino dos relatos                                                             | Planejada    |
| 10    | Insights e medição     | IA, PostHog, testes A/B e heatmaps condicionados à decisão de dados e consentimento                                          | Planejada    |
| 11    | Erros em produção      | Sentry JavaScript integrado com consentimento local e filtragem; evento confirmado no dashboard; validar runtime no aparelho | Em validação |

Analytics, eventos e heatmaps são uma frente transversal com decisão pendente de privacidade; não habilitar coleta apenas por constarem no backlog. Definir escopo antes de posicionar sua implementação na sequência. Detalhes e dependências em [Próximas etapas](proximas-etapas.md).

## Andamento consolidado — 01/10/2026

Esta tabela é o resumo atual; registros de entregas abaixo preservam o histórico. “Concluído” indica entrega realizada, sem implicar que recursos futuros da mesma frente também existem. “Em andamento” identifica implementação com validação específica pendente. “Pendente” identifica trabalho ainda não entregue; Pencil permanece em standby.

| Estado       | Funcionalidade/recurso                            | Situação e próximo passo                                                                                                            |
| ------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Concluído    | Timer, foco/descanso e armazenamento local        | Fluxo principal entregue; manter regressão ao alterar timer/persistência.                                                           |
| Concluído    | Organização e interface                           | Aliases, imports ordenados, componentes reutilizáveis, abas e simplificação das telas entregues.                                    |
| Concluído    | Onboarding e tour guiado                          | Introdução por swipe, diálogos curtos e tour opcional implementados.                                                                |
| Concluído    | Ícone, splash e animação corporal                 | Assets e Nino articulado implementados; inspeção final do binário de release integra a frente de publicação.                        |
| Concluído    | Dashboard e sequência de foco                     | Resumos diário/semanal e card Seu ritmo entregues.                                                                                  |
| Concluído    | Alimentação e frases gentis                       | Dar petisco e respostas contextuais entregues na tela de Foco, sem punição.                                                         |
| Concluído    | Notificações de conclusão                         | Entrega de foco/descanso confirmada em aparelho físico, inclusive bloqueado.                                                        |
| Concluído    | Google OAuth, Firestore e acesso por proprietário | Login e gravação confirmados no aparelho; regras de isolamento verificadas no emulador.                                             |
| Concluído    | Exclusão local e de conta                         | Exclusão autenticada confirmada no aparelho; sinalização destrutiva e ícones entregues.                                             |
| Concluído    | Controle e texto de diagnóstico                   | Consentimento opcional e descrição sem ferramentas/detalhes de desenvolvimento entregues em Ajustes.                                |
| Concluído    | Source maps de exports web/Android                | Upload e resolução de eventos sintéticos confirmados; não equivale a mapas de APK de release.                                       |
| Em andamento | Diagnóstico JavaScript no aparelho                | Integração e evento sintético confirmados; validar captura no runtime e revogação no development build.                             |
| Em andamento | Crashes Java/Kotlin Android                       | Implementados e testes nativos aprovados; validar crash real, reabertura, revogação e cache offline no aparelho/dashboard.          |
| Pendente     | Incentivo à hidratação                            | Definir mensagem/toast opcional, momento e frequência sem interromper foco.                                                         |
| Pendente     | Selo Beta                                         | Definir localização discreta junto ao nome do app e critério de retirada.                                                           |
| Pendente     | Silenciamento de redes sociais                    | Investigar viabilidade/permissões por plataforma e restauração das preferências do sistema.                                         |
| Pendente     | Escolhas de privacidade após onboarding           | Desenhar escolhas por categoria, recusa e revogação; preservar coleta opcional desligada por padrão.                                |
| Pendente     | Feedback e comentários                            | Formulário curto, envio explícito, destino e confirmação; próxima entrega de produto sugerida anteriormente.                        |
| Pendente     | Tela dedicada de login OAuth                      | Manter entrada Google já existente e modo local; definir outros provedores.                                                         |
| Pendente     | Produção Firebase e diagramas                     | Separar ambientes, preparar configuração e documentar UML/modelo lógico.                                                            |
| Pendente     | Sincronização e exclusão entre dispositivos       | Definir conflitos e coordenação remota da exclusão; cenários adicionais de falha/rede.                                              |
| Pendente     | Lembretes adicionais e push remoto                | Rotina, alimentação e inatividade com consentimento/frequência; infraestrutura remota a definir.                                    |
| Pendente     | Pencil — standby                                  | Registrar layouts, paleta, tipografia, componentes e templates quando retomado.                                                     |
| Pendente     | LoFi e sonoplastia                                | Licenças, controles de som e experiência de descanso.                                                                               |
| Pendente     | Personalizações e atividades pagas                | Outros pets/nomes, backgrounds, desenho livre/formas; validar valor e limites de acesso.                                            |
| Pendente     | RevenueCat e assinaturas                          | Definir oferta, compras, restauração e direitos de acesso.                                                                          |
| Pendente     | Compartilhamento, score e amigos                  | Compartilhamento explícito; definir pontuação, descoberta e ciclos em conjunto.                                                     |
| Pendente     | Sneak peeks, conteúdo e identificação             | Novidades discretas; curadoria de neurociência; esclarecer hipótese de semelhança e reforçar experiência além da produtividade.     |
| Pendente     | Insights com IA                                   | Definir utilidade, custo e política de dados antes de enviar dados reais.                                                           |
| Pendente     | Analytics/PostHog, A/B e heatmaps                 | Definir hipóteses, eventos mínimos e consentimento; nenhuma coleta de uso ativa.                                                    |
| Pendente     | Ampliação de crashes e símbolos                   | NDK/C++, ANR, iOS e mapping/símbolos de release exigem entregas próprias.                                                           |
| Pendente     | Publicação e versão de release                    | Validar binário/assets, mapas do APK, retenção de diagnósticos, título/descrição/screenshots e fluxo de branches/PRs/versionamento. |

As quatro novas propostas estão detalhadas em [Próximas etapas](proximas-etapas.md#novas-propostas--hidratação-beta-foco-e-consentimento). Planejamento apenas: nenhuma delas foi implementada nesta atualização.

## Regra de execução por funcionalidade

1. Delimitar uma funcionalidade e seus critérios de conclusão; decompor cada frente da tabela em entregas pequenas.
2. Implementar e validar com verificações adequadas à mudança.
3. Atualizar os documentos pertinentes no mesmo commit, distinguindo planejado, implementado e verificado.
4. Criar o commit correspondente em inglês, seguindo Conventional Commits, e enviá-lo ao repositório remoto antes de iniciar a próxima funcionalidade.

Manter o plano para andamento; próximas etapas para pendências e decisões; arquitetura para mudanças técnicas/modelo de dados; verificação para evidências e limitações; produto e validação para hipóteses e decisões de experiência. As entregas realizadas estão identificadas pelo estado e pelas evidências registradas.

## Entregas da identidade visual

1. **Ícone e splash:** assets derivados do Nino, ícone adaptativo/monocromático Android, favicon e configuração nativa implementados. Verificações de arquivos, tipos, testes e exports registradas; inspeção em build de release ainda pendente.
2. **Animação corporal:** implementada com tronco, cabeça, patas e cauda articulados. Validada na web; inspeção e desempenho em dispositivo nativo pendentes.
3. **Pencil:** em standby por preferência do usuário; retomar posteriormente para registrar layouts atuais, paleta, tipografia, componentes reutilizáveis e templates.

## Ajuste pontual do onboarding

Removido o controle local de pausar/ativar movimentos e seu estado duplicado. A preferência permanece em Ajustes e respeita movimento reduzido do sistema. Esta entrega não altera a sequência de animação corporal e Pencil.

## Navegação do onboarding por gestos

Implementada navegação horizontal para avançar/voltar, removendo Continuar e Voltar. Mantidos Pular e o botão final Ir para meu foco. Indicativo curto com ícone e pontos acionáveis oferecem orientação e alternativa acessível. Sem avanço automático. A próxima entrega planejada continua sendo animação corporal.

## Correção do swipe nativo

Substituído o detector manual por paginação nativa no Android/iOS. Avanço até a última etapa e retorno com indicador sincronizado verificados no emulador Android conectado via Expo Go. Web preserva seu detector. Confirmação em aparelho físico e iOS permanece pendente.

## Diálogos mais curtos

Reduzidas as três falas do mascote para cerca de 12 palavras cada: iniciar uma tarefa, pausar/retomar e descansar, encontrar progresso e personalização. Mantidos títulos, dicas e navegação.

## Separação de Perfil e Ajustes

Criada a aba Perfil, reunindo Modo Local/Sua Conta e Seus dados, suas escolhas. Ajustes mantém somente preferências e introdução. Atualizados nomes curtos da navegação (Foco, Progresso, Ajustes, Perfil), orientação do onboarding e aviso de recuperação de dados. Entrega independente; animação corporal continua como próxima frente planejada.

## Interface centrada no Pomodoro

Removida a demonstração de 10 segundos e consolidados minutos/sessões do dia em Progresso, sob Seu dia, até aqui. Foco exibe apenas timer, controles e fala curta do mascote. Removidos cabeçalhos introdutórios de Foco, Progresso, Ajustes e Perfil, além da mensagem de rodapé do Foco. Demonstrações antigas salvas são convertidas em foco ocioso de 25 minutos, preservando histórico e preferências.

## Sinalização de exclusão

A ação Apagar dados deste dispositivo usa texto/ícone vermelho sobre fundo discreto. A confirmação Sim, apagar meus dados usa fundo vermelho; Manter meus dados permanece neutro. Sem alteração na lógica de exclusão.

## Ajustes de espaçamento e sinalização

Aumentado o padding inferior do card de Foco de 8 para 24 px. Aviso de histórico local em Progresso agora aparece em card discreto com ícone de exclamação. Tempo de foco em Ajustes recebeu ícone de timer em círculo, seguindo o padrão visual de Perfil. Sem mudanças de comportamento.

## Hierarquia dos cartões

Padronizados os cabeçalhos conforme Modo Local: ícone em círculo e rótulo em caixa alta, seguidos de subtítulo. Dados usa PRIVACIDADE / Seus dados, suas escolhas; Ajustes usa PREFERÊNCIAS / No seu ritmo. Tempo de foco permanece como rótulo imediatamente acima das durações.

## Simplificação dos controles de dados

Removidos Exportar meus dados, explicação sobre JSON e estado/ação de exportação da interface. Perfil mantém exclusão local. Direção futura: autenticação opcional com sincronização em Firebase; escopo, migração e exclusão remota ainda por implementar. Exportação pode ser reavaliada para integrações. A ausência atual de telemetria permanece.

## Botão de revisão da introdução

Removido de Ajustes o texto sobre atualização do timer, alertas e música. Adicionado ícone de retorno ao botão Rever introdução. Limitações continuam documentadas no README; comportamento do botão preservado.

## Tour guiado opcional

Implementadas três etapas sobre componentes reais: Foco/Descanso, botão da sessão e navegação inferior. Última tela do onboarding oferece Mostrar como funciona sem retirar Ir para meu foco; Ajustes oferece Rever tour guiado. Inclui avanço, retorno, conclusão e opção de pular. Não inicia sessões, não adiciona coleta de dados e não altera a próxima frente de animação corporal.

## Simplificação de controles e splash — 27/09/2026

Reiniciar sessão passou a aparecer sem sublinhado. Removido Rever introdução de Ajustes e seu estado de reabertura; após exclusão dos dados locais a introdução continua aparecendo automaticamente. Rever tour guiado permanece disponível. Splash com fundo verde pastel soft (#EEF0E6), mantendo somente o mascote, sem texto. A imagem já não continha o nome do aplicativo; a tela de carregamento do Expo Go não representa a splash final. Validação em novo build nativo permanece pendente.

## Animação corporal do Nino — 27/09/2026

Desenho separado em camadas articuladas sobre coordenadas compartilhadas: tronco com respiração, cabeça inclinada e patas alternadas, além da cauda. Introdução e comemoração usam gestos mais expressivos; sessões em andamento mantêm respiração lenta. Menos movimento mantém pose neutra. Animações param em segundo plano, ao desmontar e no mascote encoberto pelo onboarding. Sem dependências novas. Próxima frente: Pencil, com validação visual nativa desta entrega ainda pendente.

## Correção nativa do mascote — 27/09/2026

Removidos espaços JSX explícitos das camadas de cenário e cabeça que provocavam erro de texto fora de Text no Expo Go. Correção pontual antes de Pencil, preservando desenho e animações.

## Progresso e incentivo — prioridade atual

Pencil colocado em standby por decisão do usuário. A frente Progresso e incentivo passa a ser a prioridade, em entregas separadas:

1. Dashboard: implementados minutos, sessões, dias com foco e média por sessão nos últimos sete dias; gráfico com escala proporcional ao maior valor. Validação registrada em Verificação.
2. Alimentação opcional do Nino: próxima funcionalidade; definir interação e persistência local, sem punição por ausência.
3. Frases gentis de incentivo: ampliar mensagens contextuais após a interação de cuidado.

Cada funcionalidade mantém documentação, validação e commit próprio.

## Sequência de dias com foco

Adicionado card Seu ritmo antes do resumo diário, com fundo pêssego pastel, chama e sete marcadores. A sequência conta dias locais consecutivos com ao menos uma sessão concluída, incluindo hoje quando houver sessão ou partindo de ontem enquanto hoje ainda está aberto. Dias sem foco encerram a sequência sem apagar conquistas. Entrega priorizada antes da alimentação do Nino; Pencil permanece em standby.

## Simplificação do resumo semanal

Removido o indicador Dias com foco do card Últimos 7 dias por preferência do usuário. Mantidos minutos, sessões concluídas e média por sessão; Seu ritmo continua mostrando a sequência de dias consecutivos. Minutos e sessões ficam em duas colunas, com média em uma linha abaixo.

## Alimentação e incentivo na tela de Foco

Implementado Dar petisco junto ao Nino existente, usando o mesmo balão para respostas contextuais. A reação dura seis segundos, bloqueia toques repetidos e respeita movimento reduzido. Não exige pontos, sessões ou pagamento e não modifica o timer. Última interação/frase guardadas localmente e removidas na exclusão dos dados. Frases variam entre primeiro passo, foco em andamento, descanso, conclusão, sequência e retorno. Essa entrega une alimentação e a primeira ampliação de incentivos. Pencil segue em standby; validar uso real antes de ampliar a mecânica.

## Aviso local de conclusão

Primeira entrega da frente Lembretes opcionais: opção Avisar ao terminar, desativada por padrão, com permissão solicitada ao ativar. Agenda foco/descanso no sistema, cancela ao pausar/reiniciar/desativar/apagar dados e reagenda ao retomar. Notificações locais, sem tokens de push ou backend. Web informa indisponibilidade. Aviso validado pelo usuário no aparelho, inclusive com tela bloqueada. Próximas entregas: definir lembretes de rotina/alimentação/inatividade. Pencil permanece em standby.

## Correção de inicialização no Expo Go

Isolados imports locais de notificações para evitar inicialização de push remoto no Android Expo Go. Versão da dependência fixada e scripts direcionados a Expo Go. Mantidos avisos locais e a necessidade de validar entrega em dispositivo; development build não foi introduzido.

## Diagnóstico de ativação dos avisos

Solicitação de permissão passou a enviar android: {} explicitamente. Falhas nativas agora preservam causa e etapa, com logs apenas em desenvolvimento. Ajustes mostra o erro em card no topo e rola até ele. Ainda não há confirmação da causa da falha observada no aparelho: a mensagem anterior descartava o erro original.

## Canal Android: som padrão e diagnóstico legível

Removido sound explícito da criação do canal para herdar o padrão Android, evitando resolução de recurso/atributos de áudio pelo módulo nativo. Em desenvolvimento, erro nativo aparece como texto selecionável em Ajustes e string multilinha no console, incluindo causas encadeadas. A efetividade no aparelho ainda precisa de confirmação.

## Preparação para development build

Reorganizada integração de notificações para API pública e cliente próprio de desenvolvimento. Removidos contornos de Expo Go e detalhes técnicos da interface, preservando agendamento serializado, consentimento, cancelamento e logs úteis. Guia local de instalação por USB preparado. Próximo passo: compilar, instalar e validar avisos no aparelho; ainda não realizado nesta entrega.

## Ampliação do planejamento — 29/09/2026

Registradas as 13 sugestões em [Próximas etapas](proximas-etapas.md#novas-propostas--escopo-e-critérios-antes-de-implementar), com escopo inicial, critérios e dependências. Compartilhamento e analytics foram consolidados com o backlog anterior. Estas propostas não alteram a decisão de manter Pencil em standby nem autorizam coleta automática.

Login Google e gravação foram validados pelo usuário; isolamento foi verificado no emulador. Exclusão de conta validada pelo usuário em aparelho físico. Depois, priorizar uma entrega pequena de feedback; a ordem dos novos recursos será acordada antes da implementação. RevenueCat, PostHog e IA permanecem em avaliação. Sentry JavaScript integrado em entrega posterior, descrita abaixo.

## Entrega: exclusão de conta autenticada

Google OAuth e registro no Firestore foram confirmados pelo usuário em dispositivo físico. Implementada exclusão no Perfil com confirmação destrutiva, reautenticação Google da mesma conta, remoção paginada de sessões, estado, perfil, armazenamento local da conta e identidade Auth. Regras de proprietário já existentes continuam aplicadas. Falhas parciais suspendem sincronização neste dispositivo e permitem retomar. Usuário confirmou funcionamento da exclusão em aparelho físico pessoal. O fluxo completo não foi testado no emulador; nele foram verificadas as regras de acesso.

Exclusão concluída e validada no aparelho. Cenários adicionais de cancelamento e retomada após falha de rede ainda não foram confirmados em dispositivo. Produção, tela dedicada de login e coordenação de exclusão entre dispositivos continuam pendentes. Feedback é a próxima entrega de produto sugerida.

## Card de exclusão de conta

A ação Excluir minha conta foi separada do card de sincronização e saída. Perfil autenticado exibe um card próprio com fundo vermelho suave, borda, ícone e aviso curto de irreversibilidade. Confirmação, reautenticação e retomada de exclusão pendente preservadas.

## Ícones das ações de conta

Card de exclusão usa triângulo de alerta, enquanto o botão mantém a lixeira. Sair da conta recebeu ícone de saída. Ajuste visual sem mudança nos fluxos de autenticação ou exclusão.

## Validação das notificações de conclusão

Usuário confirmou sucesso das notificações de conclusão em aparelho físico pessoal, inclusive com tela bloqueada. Essa funcionalidade está concluída. A frente de lembretes permanece aberta somente para recursos futuros: rotina, alimentação, inatividade e push remoto. O relato não confirma testes específicos de iOS ou todos os cenários de permissões.

## Diagnóstico opcional com Sentry — 01/10/2026

Projeto `personal-dashboard/pomodog` criado via MCP. SDK, plugin Expo e Metro integrados; captura JavaScript global e falhas tratadas de conta, persistência e notificações. Controle em Ajustes desativado por padrão e salvo somente neste dispositivo; payload filtrado, sem identificação da conta ou histórico. Dois erros sintéticos chegaram ao dashboard; último com IP substituto. Crashes nativos desativados nesta entrega. Validação de runtime no aparelho permanece pendente. Source maps enviados e validados na entrega seguinte, registrada abaixo. Instruções em [Sentry](sentry.md).

## Source maps — configuração de build

Adicionados exports privados de web/Android com mapas e comandos de verificação/upload. Validada associação local ao código original e rejeição de IDs incompatíveis; plugin aplicado ao projeto Android gerado. Upload real concluído com token local; eventos sintéticos web/Android resolvidos no dashboard para App.tsx, linha 20. Mapas de exportação concluídos e validados; mapas do APK serão enviados no futuro build de release. Mapas do APK devem vir do próprio Gradle, não de export separado. Crashes nativos continuam pendentes. Detalhes em [Sentry](sentry.md).

## Crashes nativos Android — 01/10/2026

Captura Java/Kotlin implementada com inicialização manual, consentimento próprio na camada nativa associado ao mesmo controle em Ajustes, filtragem técnica e descarte do cache ao revogar. Plugin local preserva configuração no prebuild. A escolha JavaScript anterior não habilita automaticamente a nova coleta. **Em validação**: reinstalar build e confirmar crash real/revogação/reenvio no aparelho e dashboard. C/C++ (NDK), ANRs, iOS e símbolos/mapping de release permanecem fora desta entrega. Roteiro em [Sentry](sentry.md).

## Texto do consentimento em Ajustes

Controle renomeado para “Ajudar a melhorar o aplicativo”. Descrição e rótulo de acessibilidade explicam envio opcional de informações sobre falhas, proteção de nome/e-mail/histórico e possibilidade de desativar, sem mencionar ferramentas ou ambiente de desenvolvimento.

## Ampliação do planejamento — hábitos e privacidade

Registrados incentivo à hidratação, selo Beta, avaliação de silenciamento de redes sociais e tela de escolhas de privacidade após onboarding. Todos pendentes, com critérios e decisões em Próximas etapas. A tela futura preserva consentimento opcional desligado por padrão e uso local completo; silenciamento depende de investigação de viabilidade por plataforma. Não houve mudança de código ou ativação de coleta nesta entrega.
