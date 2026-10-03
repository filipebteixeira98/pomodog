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

Tabela de frentes históricas; consultar o andamento consolidado abaixo para os status atuais por funcionalidade.

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

Analytics opcional Android foi implementado em entrega posterior com Firebase; vinculação GA4 confirmada; validação de recepção ainda pendente. Heatmaps e A/B continuam propostas separadas, sem coleta ativada por constarem no backlog. Detalhes e dependências em [Próximas etapas](proximas-etapas.md).

## Andamento consolidado — 02/10/2026

Formato obrigatório para as próximas consultas de andamento: **Funcionalidade/recurso | Entrega | Status | Próximos passos**, preservando itens separados quando têm entregas ou validações distintas. Não esconder tarefas em agrupamentos genéricos nem alterar status somente para reduzir a tabela.

Concluído: entrega realizada, sem implicar implementação de expansões futuras. Em andamento: implementação ou preparação já iniciada, com trabalho/validação específica restante. Pendente: proposta ainda não entregue. Pencil permanece em standby. Testes adicionais de regressão não reabrem automaticamente funcionalidades que o usuário já validou.

Correção do resumo anterior: ícone/splash ainda exigem validação do release; sincronização requer cenários adicionais; defesa em profundidade tem medidas aplicadas e revisão restante; mapas do APK têm preparação de build, mas não validação de um release. Estes itens voltam a aparecer explicitamente em andamento. Diagramas, recursos pagos, sociais, conteúdo, medição e publicação foram desmembrados para preservar o escopo de cada proposta.

| Funcionalidade/recurso                  | Entrega                                                                                         | Status       | Próximos passos                                                                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pomodoro e modo local                   | Foco, descanso, pausa, retomada e histórico local.                                              | Concluído    | Manter regressão ao alterar o timer.                                                                                                               |
| Organização da codebase                 | Aliases, imports ordenados e componentes reutilizáveis.                                         | Concluído    | Manter o padrão nas próximas entregas.                                                                                                             |
| Navegação e telas                       | Foco, Progresso, Ajustes e Perfil; interface simplificada.                                      | Concluído    | Avaliar clareza com participantes.                                                                                                                 |
| Onboarding e tour guiado                | Swipe, diálogos curtos e orientação opcional.                                                   | Concluído    | Avaliar compreensão e acessibilidade.                                                                                                              |
| Animação corporal do Nino               | Corpo articulado e movimento reduzido.                                                          | Concluído    | Observar desempenho nas futuras versões.                                                                                                           |
| Dashboard de progresso                  | Resumos diário/semanal, sessões, minutos e média.                                               | Concluído    | Avaliar utilidade das estatísticas.                                                                                                                |
| Sequência de dias com foco              | Card Seu ritmo com dias consecutivos e sete marcadores.                                         | Concluído    | Observar incentivo sem pressão.                                                                                                                    |
| Alimentação opcional                    | Dar petisco na tela de Foco, sem penalidades.                                                   | Concluído    | Avaliar frequência e clareza da interação.                                                                                                         |
| Frases gentis                           | Mensagens contextuais integradas ao cuidado do Nino.                                            | Concluído    | Ampliar somente conforme avaliação de uso.                                                                                                         |
| Notificações de conclusão               | Foco/descanso validados no aparelho, inclusive bloqueado.                                       | Concluído    | Manter regressão de permissões e cancelamento.                                                                                                     |
| Google OAuth                            | Login Google no Perfil validado no aparelho.                                                    | Concluído    | Tela dedicada e outros provedores são itens separados.                                                                                             |
| Firestore de desenvolvimento            | Perfil, sessões e estado vinculados à conta; gravação validada.                                 | Concluído    | Produção é uma entrega separada.                                                                                                                   |
| Autorização por proprietário            | Regras limitam acesso ao próprio UID; testes de isolamento.                                     | Concluído    | Manter testes ao mudar regras/modelo.                                                                                                              |
| Exclusão local e de conta               | Confirmação, reautenticação e exclusão própria; conta validada no aparelho.                     | Concluído    | Coordenação entre dispositivos é uma entrega separada.                                                                                             |
| Consentimento em Ajustes                | Diagnóstico opcional e texto sem detalhes de desenvolvimento.                                   | Concluído    | Preservar recusa e possibilidade de revogação.                                                                                                     |
| Source maps de exports                  | Mapas web/Android enviados e eventos sintéticos resolvidos.                                     | Concluído    | Usar os artefatos correspondentes ao código distribuído.                                                                                           |
| Ícone e splash                          | Assets e configuração implementados.                                                            | Em andamento | Validar recortes, ícone temático e abertura a frio no release.                                                                                     |
| Sincronização e migração de dados       | Importação local/remota e fila de sincronização implementadas.                                  | Em andamento | Validar falhas de rede, troca de conta e conflitos entre dispositivos.                                                                             |
| Defesa em profundidade                  | Validação de armazenamento, isolamento por UID e filtros de diagnóstico aplicados.              | Em andamento | Revisar ameaças, permissões, dependências e artefatos antes de produção.                                                                           |
| Diagnóstico JavaScript                  | Integração com Sentry e eventos sintéticos confirmados.                                         | Em andamento | Validar captura real e revogação no development build.                                                                                             |
| Crashes Java/Kotlin Android             | Cliente nativo, consentimento e testes implementados.                                           | Em andamento | Confirmar crash real, reabertura, revogação e cache offline no dashboard.                                                                          |
| Source maps do APK                      | Upload pelo Gradle preparado.                                                                   | Em andamento | Executar release e confirmar mapas do próprio APK; exports não substituem esse teste.                                                              |
| Integração com agenda                   | Sugestões de foco conforme horários ocupados de amanhã; Google Agenda como primeira opção.      | Pendente     | Conexão opcional, consulta ao abrir/retomar com intervalo mínimo de 30 minutos e até uma sugestão diária; definir antecipação para hoje ou amanhã. |
| Vínculo entre pais e filhos             | Gestão compartilhada de rotina por responsável ou solução semelhante proposta.                  | Pendente     | Definir público, quem autoriza o vínculo, permissões por relação, desvinculação e dados acessíveis.                                                |
| Atividade da sessão de foco             | Campo opcional para descrever a atividade que o usuário deseja realizar.                        | Pendente     | Definir criação/edição e vínculo com sessão; manter início rápido e texto fora de analytics/diagnóstico.                                           |
| Animação do Nino na entrada             | Alteração específica da animação na interface de login proposta.                                | Pendente     | Definir gesto e transição; preservar movimento reduzido e desempenho sem alterar o mascote das demais telas.                                       |
| Incentivo à hidratação                  | Mensagem/toast planejado.                                                                       | Pendente     | Definir convite opcional, frequência e momento de descanso.                                                                                        |
| Selo Beta                               | Selo discreto ao lado do logotipo Pomodog no cabeçalho compartilhado.                           | Concluído    | Retirar quando encerrar a fase beta; avaliar aparência no aparelho.                                                                                |
| Silenciamento de redes sociais          | Redução de distrações durante foco proposta.                                                    | Pendente     | Investigar viabilidade/permissões e restauração das preferências do sistema.                                                                       |
| Escolha de notificações após onboarding | Tela com “Sim, ativar” e “Agora não”, ligada a Avisar ao terminar.                              | Concluído    | Validar no aparelho autorização, recusa e fluxo até o tour.                                                                                        |
| Privacidade após onboarding             | Tela entre onboarding e tour, com botões “Sim, autorizo” e “Agora não”.                         | Concluído    | Funcionamento confirmado pelo usuário no aparelho; preservar escolhas e acesso ao tour nas próximas alterações.                                    |
| Feedback e comentários                  | Formulário de avaliação planejado.                                                              | Pendente     | Definir destino, envio explícito e confirmação.                                                                                                    |
| Tela dedicada de login                  | Entrada antes do onboarding com Google e opção de continuar sem conta; Nino e relógio Pomodoro. | Concluído    | Validar o novo ponto de entrada no aparelho; outros provedores continuam pendentes.                                                                |
| Firebase de produção                    | Ambiente separado de desenvolvimento planejado.                                                 | Pendente     | Configurar projeto, credenciais públicas, regras e verificação de produção.                                                                        |
| UML de classes                          | Diagrama solicitado.                                                                            | Pendente     | Documentar entidades e responsabilidades atuais.                                                                                                   |
| UML de casos de uso                     | Diagrama solicitado.                                                                            | Pendente     | Documentar atores, fluxos e permissões.                                                                                                            |
| Modelo lógico do banco                  | Modelo visual solicitado.                                                                       | Pendente     | Representar users, sessões, estado e vínculos por UID.                                                                                             |
| Exclusão coordenada entre dispositivos  | Ampliação da exclusão atual planejada.                                                          | Pendente     | Evitar gravações concorrentes e concluir limpeza mesmo após encerramento do cliente.                                                               |
| Lembretes de rotina                     | Convites opcionais planejados.                                                                  | Pendente     | Definir horários, frequência e desativação.                                                                                                        |
| Lembretes de alimentação                | Convites de cuidado planejados.                                                                 | Pendente     | Evitar culpa, punição e excesso de avisos.                                                                                                         |
| Lembretes de inatividade / push remoto  | Retorno ao app e infraestrutura remota propostos.                                               | Pendente     | Definir consentimento, frequência, tokens e backend.                                                                                               |
| Pencil                                  | Layouts e sistema visual planejados; em standby.                                                | Pendente     | Retomar templates, paleta, tipografia e componentes quando solicitado.                                                                             |
| Playlists LoFi                          | Ambientação musical proposta.                                                                   | Pendente     | Verificar licenças, reprodução e controles.                                                                                                        |
| Sonoplastia                             | Sons de interação e transição propostos.                                                        | Pendente     | Prototipar, verificar licenças e permitir silenciar.                                                                                               |
| Mascotes e nomes em planos pagos        | Outros animais e personalizações propostos.                                                     | Pendente     | Definir catálogo, limites gratuitos/pagos e valor percebido.                                                                                       |
| Backgrounds pagos                       | Ambientes personalizáveis propostos.                                                            | Pendente     | Definir catálogo, prévia, contraste e acesso.                                                                                                      |
| Atividades durante o descanso           | Desenho livre, formas e sugestões em planos pagos propostos.                                    | Pendente     | Prototipar com opção de pular; avaliar prazer e distração.                                                                                         |
| RevenueCat e assinaturas                | Gestão de compras e acesso proposta.                                                            | Pendente     | Definir oferta, integração, restauração e direitos de acesso.                                                                                      |
| Compartilhamento social                 | Cartão de progresso/mascote proposto.                                                           | Pendente     | Criar prévia e compartilhamento por ação explícita.                                                                                                |
| Pontuação                               | Score proposto.                                                                                 | Pendente     | Definir regras sem comparação punitiva.                                                                                                            |
| Amigos e ciclos em conjunto             | Experiência social proposta.                                                                    | Pendente     | Definir descoberta, privacidade e funcionamento das sessões.                                                                                       |
| Sneak peeks e novidades                 | Prévias de evolução propostas.                                                                  | Pendente     | Definir espaço discreto fora da sessão de foco.                                                                                                    |
| Curiosidades e neurociência             | Conteúdo editorial proposto.                                                                    | Pendente     | Definir fontes e revisar o ciclo conceitual sugerido antes de divulgá-lo.                                                                          |
| Semelhança e identificação              | Hipótese de sistemas/pessoas semelhantes registrada.                                            | Pendente     | Esclarecer significado antes de escolher funcionalidade.                                                                                           |
| Experiência além da produtividade       | Direção de companhia, descanso e autonomia registrada.                                          | Pendente     | Traduzir objetivos em critérios e avaliar com usuários.                                                                                            |
| Insights com IA                         | Sugestões personalizadas propostas.                                                             | Pendente     | Definir utilidade, consentimento, dados mínimos, custo e fornecedor.                                                                               |
| Firebase Analytics                      | SDK Android, consentimento separado e eventos recebidos no DebugView, confirmados pelo usuário. | Em andamento | Definir retenção, validar revogação e relatórios normais; lembrar de desativar debug no aparelho antes dessas validações/publicação.               |
| Testes A/B                              | Experimentos comparativos propostos.                                                            | Pendente     | Definir hipóteses, métricas e critérios antes de instrumentar.                                                                                     |
| Heatmaps                                | Mapas de interação propostos; não ativados.                                                     | Pendente     | Avaliar utilidade, suporte e privacidade separadamente.                                                                                            |
| Crashes C/C++ — NDK                     | Captura adicional ainda desativada.                                                             | Pendente     | Definir filtragem, consentimento e símbolos do binário.                                                                                            |
| ANRs                                    | Diagnóstico de travamentos ainda desativado.                                                    | Pendente     | Definir captura e validação específica.                                                                                                            |
| Crashes nativos iOS                     | Integração nativa não implementada.                                                             | Pendente     | Preparar cliente, consentimento, símbolos e testes iOS.                                                                                            |
| Mapping/símbolos nativos de release     | Upload separado dos mapas JavaScript planejado.                                                 | Pendente     | Configurar mapping se habilitar R8 e símbolos correspondentes ao binário.                                                                          |
| Retenção de diagnósticos                | Política antes de distribuição ainda por definir.                                               | Pendente     | Definir prazo e revisão dos dados enviados.                                                                                                        |
| Materiais da Google Play Console        | Título, descrição e screenshots solicitados.                                                    | Pendente     | Preparar materiais conforme recursos efetivamente disponíveis.                                                                                     |
| Release e distribuição                  | Publicação do app planejada.                                                                    | Pendente     | Validar binário, assinatura, assets e requisitos; lembrar de remover modo debug de Analytics do aparelho usado para validação normal.              |
| Branches e pull requests                | Fluxo de contribuição proposto.                                                                 | Pendente     | Definir política e adotar por entrega; commits atuais continuam na main.                                                                           |
| Versionamento e releases                | Minor, patch e número de versão discutidos.                                                     | Pendente     | Definir convenção e alinhar versão do app/build/changelog.                                                                                         |
| Validação de produto e monetização      | Roteiro qualitativo e hipóteses registrados.                                                    | Pendente     | Testar com pessoas próximas por vários dias; validar retenção e disposição a pagar.                                                                |

Este quadro é o resumo vigente; tabelas anteriores registram etapas e frentes históricas. Novas propostas detalhadas em [Próximas etapas](proximas-etapas.md).

## Próxima entrega prioritária — Analytics

Decisão de 02/10/2026: implementar primeiro a integração para eventos de uso do app, antes de agenda, vínculo familiar, atividade de foco e alteração da animação de entrada. Feedback deixa de ser a próxima entrega sugerida; continua pendente. Pencil permanece em standby.

Fornecedor escolhido pelo usuário: Firebase Analytics. Entrega Android implementada com coleta desligada por padrão, controle separado de Sentry em Ajustes e payload permitido para telas/ciclos. Não associa UID da conta ao identificador de Analytics. Autorização agora é oferecida após a introdução e antes de concluir onboarding/iniciar tour; nenhum histórico anterior é reenviado. Ajustes mantém os controles independentes.

Eventos: screen_view, onboarding_complete, pomodoro_start/pause/resume/complete/reset. Modos e durações são os do ciclo efetivo; conclusão trata troca automática e retorno ao app sem repetir ticks. Web/iOS sem coleta nesta entrega. A tela de privacidade pós-onboarding foi implementada; replay, heatmaps e A/B não foram habilitados.

Status em andamento: vínculo GA4 confirmado após habilitação pelo usuário (propriedade 557163675). Recepção no DebugView confirmada pelo usuário. Restam retenção, revogação e relatórios normais. Guia e catálogo em [Analytics](analytics.md).

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

## Selo Beta entregue

Adicionado selo Beta ao lado do logotipo no cabeçalho compartilhado entre as telas, com fundo pastel, borda discreta e descrição acessível “Versão beta, em desenvolvimento e testes”. Cabeçalho permite quebra de linha em espaços menores ou com fonte ampliada. Sem novo controle ou alteração de fluxo.

## Entrada antes do onboarding

Tela de boas-vindas implementada com a frase “Seu foco começa com um pequeno passo”, Nino animado e relógio ilustrado, indicadores de 25 minutos de foco/5 de pausa, Google e opção equivalente de continuar sem conta. Reutiliza o login existente; cancelamento/falha não avança automaticamente. Aparece antes da introdução para visitante sem onboarding concluído e sem sessão ativa; usuários autenticados ou com introdução concluída preservam seu fluxo. Escolha local vale para a introdução atual, sem marcar onboarding como concluído. Exclusão local reinicia a entrada; armazenamento ilegível mantém recuperação acessível. Sem novos provedores ou coleta adicional.

## Confirmação de exclusão em toast

Sucesso da exclusão agora é exibido em toast global, discreto, com ícone de confirmação, entrada suave e fechamento manual/automático. Fica fora do Pomodog associado ao UID e acompanha o retorno à entrada. Mensagem de sucesso removida do aviso inline; erros, cancelamento, reautenticação, exclusão e navegação preservados. Tempo padrão de cinco segundos, respeitando a recomendação de acessibilidade Android.

## Ampliação do planejamento — 02/10/2026

Registradas agenda com sugestões de antecipação de foco, vínculo entre pais/filhos, atividade textual da sessão e nova animação do Nino na entrada. Todas pendentes; escopo inicial e decisões em Próximas etapas. Analytics definido como próxima entrega prioritária, sem implementação ou ativação nesta atualização.

## Firebase Analytics opcional — 02/10/2026

SDK nativo Android e consentimento local independente implementados. Eventos mínimos para entender navegação e ciclos, sem nome/e-mail/UID/textos livres. Recusa não bloqueia uso; apagar dados/excluir conta revoga e limpa cache local de medição, sem alegar remoção de eventos já enviados. Testes de consentimento/concorrência/payload/transições adicionados. Vinculação GA4 e recepção em aparelho permanecem pendentes; não classificar a integração inteira como concluída.

## Vinculação GA4 confirmada — 02/10/2026

Usuário habilitou Analytics no Firebase; API confirmou propriedade 557163675 e stream Android. JSON adicional idêntico ao vigente, sem mudança necessária de OAuth/configuração nativa. SDK e BoM já incluídos pelas dependências; sem duplicação manual de Gradle. Integração continua em andamento até validação real de eventos/revogação e retenção no console.

## Correção de eventos customizados — 02/10/2026

SDK rejeitava session_start (reservado), e falha era descartada pelo controlador. Família alterada para pomodoro_*, com teste contra validador real do SDK e diagnóstico de falhas em desenvolvimento sem payloads. 78 testes e export Android passaram. Integração continua em andamento: ausência de todos os eventos não foi comprovada no DebugView; recepção real ainda precisa ser validada. Ver guia Analytics.

## Recepção validada e lembrete de debug — 02/10/2026

Usuário confirmou funcionamento dos eventos no DebugView. Manter modo debug ativo no aparelho de desenvolvimento por preferência explícita. Ao planejar publicação ou teste de relatórios/Analytics em condições normais, lembrar de desativar a propriedade com `adb shell setprop debug.firebase.analytics.app .none.` e conferir valor vigente. É propriedade do aparelho, não configuração embutida no APK. Retenção e validação da revogação continuam pendentes. Ver [lembrete Analytics](analytics.md#lembrete-vigente-manter-debug-durante-desenvolvimento).

## Escolha de privacidade após onboarding — 02/10/2026

Implementada a sequência entrada → introdução → escolha de privacidade → notificações → tour guiado → Foco. Concluir ou pular introdução leva à escolha, sem autorização pré-selecionada. Permitir ativa diagnóstico e uso opcional nos controles existentes de Ajustes; recusar mantém ambos desligados. Ambas as operações precisam terminar antes do tour; falha na ativação tenta revogar ambas e mantém a tela para nova escolha. Ajustes preserva alterações independentes posteriores. Usuários com introdução já concluída mantêm o fluxo/permissões atuais. Não altera autenticação ou sincronização dos dados da conta. TypeScript e 81 testes passaram; funcionamento da nova tela confirmado pelo usuário no dispositivo físico.

## Textos objetivos de coleta em Ajustes — 02/10/2026

Diagnóstico e uso opcional receberam títulos e descrições mais curtos, preservando os dados informados e possibilidade de desativar. Sem alteração no consentimento ou nos serviços. Pendências de Analytics continuam retenção, revogação e relatórios normais; recepção no DebugView e tela de privacidade já confirmadas pelo usuário.

## Privacidade com decisão direta — 02/10/2026

Tela após onboarding simplificada: título “Compartilhar dados?”, textos curtos e dois botões, “Sim, autorizo” e “Agora não”. Removidos radio buttons e confirmação adicional. Ambos salvam as permissões existentes antes de abrir o tour; durante a gravação ficam bloqueados. Falhas continuam na tela para nova tentativa. Voltar do sistema preserva retorno à introdução. Validar visualmente esta revisão no aparelho; comportamento de consentimento permanece o mesmo.

## Notificações no primeiro acesso — 03/10/2026

Após a escolha de privacidade, a nova tela “Avisar ao terminar?” oferece “Sim, ativar” e “Agora não”. Usa a mesma preferência de Ajustes e a solicitação de permissão existente; somente ativar abre a permissão do sistema. Recusar não solicita acesso e segue ao tour; permissão negada ou erro mantém a tela, com opção de seguir sem avisos. Voltar do sistema retorna à escolha de privacidade. Plataformas sem suporte seguem diretamente ao tour. Onboarding é concluído ao terminar ambas as escolhas; usuários que já concluíram não recebem a nova tela automaticamente. Compartilhado componente visual/lifecycle de permissões, sem novo SDK, push remoto ou coleta. Validação física desta interface ainda pendente.
