# Próximas etapas — decisões ainda abertas

Atualizadas em 02/10/2026, incluindo agenda, vínculo familiar, atividade de foco, animação de entrada e prioridade de Analytics. Sequência proposta em [Plano de ação](plano-de-acao.md).

## Nome do mascote

**Nino** foi implementado como nome provisório, centralizado em `src/domain/mascot.ts`. Pode ser alterado após a avaliação do usuário. Não houve pesquisa de marcas.

## Autonomia e privacidade

Uso local para quem não se autenticar, sem login obrigatório e sem telemetria de uso por padrão. Analytics Android exige consentimento opcional explícito na tela após onboarding ou em Ajustes. Google OAuth e sincronização Firebase foram implementados no ambiente de desenvolvimento, com login e registro validados pelo usuário no aparelho. Ao entrar, perfil, histórico e estado são enviados à conta. Analytics requer decisão explícita de privacidade antes da ativação.

Exclusão com confirmação e proteção de registros ilegíveis estão disponíveis. A exportação JSON foi retirada da interface para simplificar o MVP; pode ser reavaliada junto a integrações futuras. Próximas decisões:

1. Definir quais dados existem e explicitar o que sai do dispositivo em cada integração futura.
2. Validar a migração implementada dos dados locais para Firebase, incluindo falhas, troca de conta e conflitos entre dispositivos.
3. Manter o uso sem conta como fluxo completo. Uma eventual sincronização deve ser opcional e ter regras claras de migração e exclusão.
4. Verificar dependências, crash reporting, música e distribuição para evitar coleta automática introduzida por integrações. Hospedagem e ferramentas de desenvolvimento devem ser avaliadas separadamente do código do app.

## Defesa em profundidade

Planejar a partir de ameaças concretas: dados locais corrompidos, permissões excessivas, dependências comprometidas e, caso existam contas no futuro, acesso indevido e mistura de dados entre pessoas.

- Formato, tamanho e versão já são validados; registros ilegíveis não são sobrescritos. Planejar migrações futuras sem perda silenciosa.
- Solicitar apenas permissões necessárias a recursos explícitos.
- Não embutir segredos no cliente. Usar armazenamento apropriado para credenciais se autenticação vier a existir; AsyncStorage não é um cofre.
- Revisar dependências e artefatos de produção. Não confundir exportação JavaScript com validação da segurança de um aplicativo Android instalado.
- Definir proteção adicional de dados conforme sua sensibilidade e o modelo de ameaças. A versão atual não oferece criptografia própria do histórico.

## Antes de testar retenção por vários dias

Notificações ao terminar validadas em aparelho físico, inclusive com tela bloqueada. A avaliação funcional não comprova retenção; observar uso por vários dias.

## Organização e identidade visual

- Migração para aliases concluída: `#src/*`, `#tests/*`, `#app` e `#styles`. Mantidos imports com efeitos colaterais e compatibilidade entre app, testes e exportações. Detalhes em [Arquitetura](arquitetura.md).
- Ordem acordada: ícone/splash → animação corporal → Pencil.
- Pencil em standby por decisão do usuário; retomar posteriormente para para acompanhar layouts e registrar templates, paleta, tipografia e componentes reutilizáveis. A integração ainda não foi configurada/verificada.
- Animação articulada implementada: respiração do tronco, inclinação da cabeça, patas alternadas e cauda. Movimento reduzido verificado na web. Validar aparência e desempenho em dispositivo Android, incluindo retorno do segundo plano.
- Ícone e splash implementados com o desenho atual do Nino, fonte vetorial editável e PNGs regeneráveis. Validar recortes do launcher, ícone temático e abertura a frio em build Android de release; Expo Go não comprova a aparência final.

## Progresso, cuidado e notificações

- Dashboard ampliado com totais, dias com foco e média por sessão nos últimos sete dias. Alimentação opcional e frases gentis agora implementadas na tela de Foco; próxima etapa desta frente é validar a experiência.
- Introduzir alimentação dos pets e frases gentis como convites opcionais. Proposta de experiência: sem punições, perda de progresso ou culpa por ausência.
- Planejar lembretes de rotina e inatividade com consentimento, horários, frequência controlável e desativação simples.
- Aviso local de conclusão implementado com expo-notifications. Sincronização idempotente: mesmo prazo/modo não cancela nem reagenda. Instrumentação `__DEV__` disponível para diagnóstico. Concluído: usuário confirmou entrega no aparelho físico, inclusive com tela bloqueada.
- Push remoto permanece uma possibilidade solicitada, com infraestrutura e tratamento de tokens ainda por definir.
- Aviso de conclusão concluído e validado no aparelho físico, inclusive com tela bloqueada. Lembretes adicionais e push remoto são entregas futuras.

## Contas, Firebase e modelo de dados

- Google OAuth, Firestore e autorização por proprietário implementados em `pomodog-dev-2026`. Validar login, gravação, saída/troca de conta e isolamento entre dois usuários. Configurar produção separadamente; detalhes técnicos em [Arquitetura](arquitetura.md).
- Tela dedicada de entrada implementada antes do onboarding, com Google e continuar sem conta. Botão também permanece em Perfil; novos provedores dependem de definição de plataformas e configuração própria.
- Elaborar UML de classes e casos de uso e modelo lógico do banco ao definir contas/sincronização. Registrar depois em arquitetura as decisões efetivamente adotadas, inclusive separação entre ambientes e controle de acesso por usuário.
- Definir quais dados sincronizar, migração do histórico local, conflitos e comportamento ao sair/trocar de conta. Preservar uso completo sem autenticação.
- Sem conta, manter “Apagar dados deste dispositivo”. Com conta, exclusão de conta e dados remotos implementada com confirmação e reautenticação; remoção validada pelo usuário em aparelho físico.
- Informar armazenamento exclusivamente local apenas quando isso corresponder ao fluxo real. Após integrações, explicar os dados enviados; não afirmar genericamente que nenhum dado é coletado se houver autenticação, sincronização ou analytics.

## Analytics — implementação Android e pendências

Firebase escolhido para eventos de uso. SDK Android integrado, controle independente em Ajustes, desligado por padrão; catálogo mínimo definido e payloads sem identidade de conta/textos pessoais. A implementação preserva uso sem consentimento e não envia eventos anteriores à autorização.

Vinculação GA4 confirmada pelo usuário e API (propriedade 557163675). Recepção de eventos no DebugView confirmada pelo usuário no aparelho. Ainda concluir: configuração de retenção/relatórios e testes específicos de recusa, revogação e exclusão. O JSON adicional é idêntico ao atual; configuração nativa já gerenciada pelo Expo e módulos Firebase. Documentação em [Analytics](analytics.md). A/B, heatmaps, replay e PostHog continuam fora desta entrega.

## Personalização paga e recursos sociais

- Planos pagos: escolher outros animais, personalizar mascotes e nomeá-los. Definir limites gratuitos/pagos e validar valor antes de implementar cobrança.
- Compartilhamento em redes sociais: definir o conteúdo compartilhável e permitir ação explícita do usuário.
- Pontuação e amigos: definir regras do score, descoberta de pessoas, privacidade e significado de completar ciclos juntos. Dependem das decisões de identidade e dados; propor progresso sem comparações punitivas.

## Novas propostas — escopo e critérios antes de implementar

Todas as propostas abaixo estão planejadas, sem implementação ou ativação de serviços nesta atualização. Compartilhamento e analytics consolidam itens anteriores; não criam tarefas duplicadas. A numeração preserva a lista do usuário, não estabelece prioridade.

| Item | Proposta                                      | Primeira entrega e critérios                                                                                                                                                                                                                                                                                                          |
| ---- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Atividades durante o descanso em planos pagos | Prototipar desenho livre, formas geométricas e sugestões opcionais. Permitir pular, encerrar e voltar ao foco; avaliar prazer e distração. Não prometer hiperfoco ou eficiência sem evidência.                                                                                                                                        |
| 2    | Compartilhamento em redes sociais             | Criar prévia de cartão com progresso ou Nino e compartilhamento por ação explícita. Evitar publicar identidade/histórico sem escolha do usuário. Consolidar com a frente social existente.                                                                                                                                            |
| 3    | Sneak peek e evolução do produto              | Mostrar novidades e prévias opcionais em espaço discreto, fora da sessão de foco. Separar recurso entregue de intenção futura, sem datas ou benefícios não confirmados. Avaliar interesse e retorno.                                                                                                                                  |
| 4    | Curiosidades e notícias de neurociência       | Definir curadoria, fontes, datas e revisão editorial. Registrar o ciclo proposto “estímulo → feeder → preparação → repetição definitiva”, referido como “série real”, como hipótese conceitual. Esclarecer os termos e verificar a origem antes de exibir como conteúdo científico.                                                   |
| 5    | Insights com inteligência artificial          | Definir perguntas úteis e prototipar com dados sintéticos. Antes de enviar dados reais, definir consentimento, minimização, fornecedor, custo e retenção. Apresentar sugestões opcionais, sem diagnóstico ou inferência de saúde.                                                                                                     |
| 6    | Tela de login OAuth                           | Criar entrada dedicada com Google e opções futuras a definir; manter modo local acessível. Validar retorno OAuth, cancelamento, erros e troca de conta.                                                                                                                                                                               |
| 7    | Feedback e comentários                        | Criar formulário curto com mensagem, envio explícito e confirmação. Permitir modo local; contato é opcional. Definir destino, proteção contra abuso e retenção, sem anexar logs automaticamente.                                                                                                                                      |
| 8    | Backgrounds pagos                             | Definir catálogo, prévia e acesso por assinatura. Preservar legibilidade, contraste e desempenho; incluir restauração ao padrão e alternativa gratuita.                                                                                                                                                                               |
| 9    | Experiência além da produtividade             | Avaliar companhia, descanso, prazer e autonomia como objetivos. Não reduzir sucesso a minutos ou sessões; validar textos e mecânicas sem pressão por desempenho.                                                                                                                                                                      |
| 10   | Sonoplastia                                   | Prototipar sons de interação e transição, com controle de volume e opção de silenciar. Verificar licenças e respeitar ambiente de uso; não duplicar som de notificação.                                                                                                                                                               |
| 11   | Analytics/PostHog, A/B e heatmaps             | Avaliar PostHog como candidato. Definir consentimento, eventos mínimos, hipótese e critérios de cada experimento. Verificar suporte nas plataformas escolhidas; heatmaps e gravação de sessões exigem avaliação própria de privacidade e utilidade.                                                                                   |
| 12   | Semelhança e identificação                    | Esclarecer “sistemas parecidos”: pode significar padrões familiares de navegação, afinidade com mascotes ou grupos com objetivos semelhantes. Validar interpretação com o usuário antes de escolher uma funcionalidade ou mecanismo social.                                                                                           |
| 13   | RevenueCat e Sentry                           | Avaliar RevenueCat para gerenciamento de compras/assinaturas e direitos de acesso; definir checkout conforme loja/plataforma. Avaliar Sentry para erros em produção, com sanitização de dados, política de coleta e separação entre ambientes. Validar restauração de compras, eventos repetidos e proteção de dados antes de lançar. |

Dependências: validar contas e isolamento antes de recursos vinculados ao UID; definir oferta paga antes de assinatura e backgrounds; decidir política de dados antes de IA, PostHog e Sentry. Feedback pode começar por uma entrega pequena após estabilizar autenticação. Nenhum fornecedor foi integrado por constar nesta lista.

## Publicação e pendências preservadas

Preparar título, descrição e screenshots para Google Play Console com base no aplicativo realmente entregue, sem anunciar capacidades futuras como disponíveis. A preparação dos materiais não equivale a publicar na loja.

Continuam pendentes a seleção/licenciamento de LoFi, validação do build de release, lembretes adicionais/push remoto e experimentos de monetização. O novo backlog não descarta essas decisões anteriores.

## Sequência de hábitos entregue

Card Seu ritmo implementado antes da alimentação, conforme nova prioridade. Alimentação opcional e frases contextuais foram implementadas na entrega subsequente. Pencil permanece em standby.

## Alimentação com incentivo entregue

Dar petisco implementado na tela principal, reutilizando Nino e seu balão. Alimentação e frases contextuais foram unidas nesta entrega, substituindo a proposta de card em Progresso. Validar frequência de uso, clareza e tempo de leitura antes de ampliar frases ou introduzir lembretes. Não há fome, penalidades ou notificações de alimentação.

## Aviso de conclusão implementado

Aviso local opcional implementado com expo-notifications. Testar permissão concedida/negada, conclusão com tela bloqueada, pausa/retomada, reinício e desativação em Android/iOS. Usuário confirmou sucesso da entrega de conclusão no aparelho físico, inclusive com tela bloqueada. Os demais cenários do roteiro e iOS não foram detalhados no relato. Lembretes recorrentes e push remoto seguem futuros. O Android pode agendar de forma inexata quando não há acesso a alarmes exatos; esta versão não solicita acesso especial para isso.

## Cliente próprio Android

Seguir development-build.md para compilar e instalar o Pomodog no aparelho via USB. Expo Go deixa de ser o ambiente suportado para validar notificações nesta configuração. Entrega com tela bloqueada e exclusão de conta já validadas pelo usuário. Preservar roteiro de regressão de permissões e cancelamento/retomada para futuras alterações. Diagnóstico técnico foi retirado da interface conforme solicitado.

## Atualização: contas

Login Google e gravação no Firestore validados pelo usuário no aparelho. Exclusão autenticada implementada no Perfil, com confirmação, reautenticação e retomada após falha parcial. Usuário confirmou funcionamento da exclusão em aparelho físico pessoal. Cancelamento e interrupção de rede/retomada após reiniciar permanecem como cenários adicionais sem confirmação física. O fluxo completo no emulador não foi testado. Coordenação entre dispositivos exige fluxo futuro no servidor; a marca de exclusão atual é local. Tela dedicada de login, ambiente de produção e diagramas permanecem pendentes.

## Sentry implementado

Diagnóstico JavaScript opcional integrado ao projeto `personal-dashboard/pomodog`. Consentimento local separado do Firestore, desativado por padrão; evento sintético confirmado no dashboard. Pendentes: reinstalar development build e validar captura real no aparelho, usar upload de source maps já configurado/validado nos próximos builds e definir retenção dos eventos antes da distribuição pública. Captura Java/Kotlin Android implementada na entrega seguinte, ainda sem validação de crash real no aparelho. Essa entrega não ativa PostHog, analytics, replay ou heatmaps. Ver [guia Sentry](sentry.md).

## Source maps concluídos — exports web e Android

Exports com mapas e verificação de debug IDs implementados para web/Android; Gradle preparado pelo plugin para mapas do APK. Validada resolução local para arquivo/linha original. Token disponibilizado localmente; upload/processamento concluídos e dois eventos sintéticos confirmados no dashboard com stack resolvida para App.tsx, linha 20. Preservar segredo no ambiente de futuros builds e usar os artefatos exatos distribuídos. Mapas do APK serão gerados/enviados pelo Gradle no próprio release, ainda não compilado.

## Validar crashes nativos Android

Reinstalar development build, habilitar novamente diagnóstico em Ajustes e executar roteiro de crash controlado/reabertura, revogação e cache offline em [Sentry](sentry.md). Implementação Java/Kotlin pronta; confirmação no dashboard de evento nativo real pendente. NDK, ANR e iOS não habilitados. Antes de habilitar R8, planejar upload do mapping do binário correspondente.

## Novas propostas — hidratação, beta, foco e consentimento

Itens registrados por solicitação do usuário; selo Beta entregue posteriormente, conforme registro abaixo. Os demais permanecem pendentes. A ordem abaixo não altera a prioridade das entregas existentes e não representa implementação.

| Funcionalidade                                     | Escopo inicial                                                                                      | Critérios e decisões antes da implementação                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Incentivo à hidratação                             | Mensagem gentil ou toast para lembrar de beber água, preferencialmente durante o descanso.          | Opcional, dispensável e com frequência controlada; não interromper foco, exigir interação ou definir metas de consumo. Não confundir com notificação push. Validar clareza e se o convite ajuda na rotina sem incomodar.                                                                                                                                                                                                                                                   |
| Identificação beta                                 | Exibir um selo “Beta” junto ao nome do aplicativo em um local visível e discreto.                   | Definir localização sem recolocar cabeçalhos removidos da tela de Foco. A indicação deve explicar estágio do produto sem prometer estabilidade ou novidades; definir quando será retirada.                                                                                                                                                                                                                                                                                 |
| Reduzir notificações de redes sociais durante foco | Avaliar modo de foco/silenciamento durante sessões, com ação explícita do usuário.                  | Investigar viabilidade, permissões e limitações por plataforma antes de escolher implementação. Não assumir controle seletivo de aplicativos terceiros; considerar orientação para configurações do sistema. Se houver automação, preservar preferência anterior e restaurá-la em conclusão, pausa, cancelamento e falha. Usuário deve poder recusar.                                                                                                                      |
| Tela de escolhas de privacidade após onboarding    | Implementada: apresenta diagnóstico/uso opcional e oferece permitir ambos ou recusar antes do tour. | Diagnóstico opcional continua desligado por padrão; recusa não bloqueia uso local. Separar diagnóstico, sincronização mediante login e futuros analytics; não apresentar recursos futuros como coleta ativa. Tela inicial usa dois botões de decisão direta, sem radio buttons; controles independentes permanecem em Ajustes. Persistir escolhas antes de iniciar coleta e permitir revogação em Ajustes. Textos sem nomes de ferramentas ou detalhes de desenvolvimento. |

A nova tela deve explicar coleta real e opcional, sem transformar ausência de resposta em consentimento. Não altera a decisão anterior de manter analytics, heatmaps e replay desativados. A escolha de componentes é parte do desenho da entrega, não uma funcionalidade já implementada.

## Selo Beta implementado

Selo Beta adicionado ao lado do logotipo Pomodog no cabeçalho das telas, com descrição acessível de desenvolvimento e testes. Decisão futura: remover ao encerrar a fase beta. Hidratação e silenciamento de redes sociais permanecem pendentes; escolhas de privacidade foram implementadas na entrega de 02/10/2026.

## Tela de entrada entregue

Google e continuar sem conta disponíveis antes da introdução no primeiro acesso. Headline curta, Nino e elementos Pomodoro reutilizam a identidade atual. Validar o novo ponto de entrada no aparelho; a autenticação Google existente já foi validada anteriormente. Outros provedores continuam pendentes. Tela de escolhas de privacidade após onboarding implementada em 02/10/2026, antes do tour guiado.

## Agenda e sugestões de foco — primeira versão proposta

Conexão opcional com Google Agenda, separada do login Google. Começar pela agenda principal e horários ocupados de amanhã, sem necessidade de ler títulos, descrições ou participantes. Consultar disponibilidade com acesso mínimo adequado; não criar/alterar eventos. Referência da proposta: [consulta de disponibilidade](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query).

Fluxo proposto:

1. Usuário conecta agenda e escolhe faixa habitual de foco, dias permitidos, horário do lembrete e preferência de antecipação.
2. App consulta ao abrir ou voltar ao primeiro plano, apenas se a última consulta bem-sucedida ocorreu há pelo menos 30 minutos. Esse intervalo é um limite de frequência, não uma execução periódica garantida. Falhas não devem provocar tentativas contínuas em cada evento de retomada.
3. Analisa horários ocupados de amanhã que coincidam com a rotina; procura janela livre para foco/descanso e margem antes do compromisso. Antecipação para hoje é uma escolha explícita, não inferência automática.
4. Agenda notificação local para o horário escolhido, com no máximo uma sugestão diária e sem duplicatas. Não iniciar ciclos automaticamente; permitir ignorar, adiar ou desativar.
5. Na próxima consulta, atualizar/cancelar lembrete pendente se a agenda mudar. Desconexão/revogação remove acesso, cache de disponibilidade e avisos pendentes dessa integração.

Não há consulta periódica enquanto o app permanece fechado. O aviso já agendado poderá aparecer, mas mudanças posteriores na agenda só serão consideradas ao retornar. Respeitar fuso local, horários silenciosos, sobreposição de períodos e eventos que realmente bloqueiam disponibilidade. Antes de implementar, decidir quando sugerir foco hoje versus amanhã e se as ações da notificação entram no primeiro escopo.

Manter apenas dados mínimos necessários; não enviar conteúdo de agenda ao Firestore, Sentry ou analytics nesta primeira proposta. Atualização sem abrir o app por vários dias será outra entrega, com autorização de acesso persistente, processamento no servidor e push remoto a definir. Esses componentes ainda não estão implementados.

## Vínculo de responsáveis e rotina de filhos

Proposta pendente: conta de pai/mãe/responsável vinculada à de filho para apoiar planejamento da rotina, ou alternativa familiar semelhante. Definir faixa etária/público, quem autoriza cada vínculo, se há múltiplos responsáveis e o que cada pessoa pode consultar ou editar. Decidir entre rotina compartilhada e visualização de progresso antes de criar mecanismos de supervisão.

A autorização atual por proprietário não concede acesso entre contas. A futura entrega exige permissões explícitas por vínculo, testes de isolamento, remoção do vínculo e regras de exclusão das contas/dados. Não inferir parentesco a partir do Google, permitir acesso irrestrito ou enviar dados de filhos a analytics. Avaliar privacidade e participação de responsáveis/filhos conforme o público definido antes de implementar. Evitar comparação punitiva e pressão por desempenho.

## Atividade para a sessão de foco

Campo opcional e curto para informar o que o usuário deseja fazer (exemplo: “Ler um capítulo”). Preservar início rápido sem preenchimento obrigatório. Definir se o texto pertence à sessão atual ou a uma lista reutilizável, quando pode ser editado e se aparece no histórico.

Planejar limite de tamanho, limpeza e persistência local; sincronização deve seguir a escolha de conta e modelo de dados definidos para esta entrega. Não incluir texto livre em eventos de analytics, diagnósticos, compartilhamento ou notificações de tela bloqueada automaticamente. Esse campo não existe ainda.

## Nova animação do Nino na interface de entrada

Alterar o gesto/entrada do mascote especificamente em WelcomeScreen. A animação atual já existe; esta proposta é uma revisão visual separada da animação corporal concluída. Definir pose e transição antes de implementar, sem alterar as demais telas por consequência. Preservar movimento reduzido, pausa em segundo plano, proporções responsivas e legibilidade dos botões/headline.

## Próxima implementação: eventos de uso

Firebase Analytics Android tem código, eventos mínimos e consentimento após onboarding/em Ajustes implementados. Vinculação GA4 e recepção no DebugView confirmadas; retenção, revogação e relatórios normais pendentes antes de considerar concluída. Agenda, vínculo familiar, atividade de foco e nova animação seguem pendentes. Diagnóstico continua separado; A/B, heatmaps e replay não entram nesta entrega. Detalhes em [Analytics](analytics.md).

## Lembrete antes de publicação e validação normal de Analytics

Usuário optou por manter modo debug do Firebase Analytics no aparelho para depuração. Ao retomar release/publicação ou avaliar envio e relatórios em condições normais, lembrar de desativar `debug.firebase.analytics.app` no dispositivo de teste, conferir valor atual e depois gerar eventos novos. Comando e contexto em [Analytics](analytics.md#lembrete-vigente-manter-debug-durante-desenvolvimento). Não remover durante desenvolvimento sem nova decisão do usuário; propriedade não é incluída no APK.

## Privacidade após onboarding — implementada

A tela simples apresenta diagnóstico e, nas plataformas suportadas, uso opcional. Dois botões, sem seleção prévia: “Sim, autorizo” permite ambas as categorias e “Agora não” mantém ambas desligadas. Salva nos mesmos controles de Ajustes antes de concluir introdução e abrir tour. Recusa não limita funcionalidades; ajustes posteriores continuam independentes. Voltar retorna à introdução. Não repete automaticamente para introduções já concluídas. No navegador, somente diagnóstico está disponível; Analytics permanece limitado ao Android nativo.

Usuário confirmou funcionamento da entrega no dispositivo físico. Próximos passos: preservar escolhas, controles de Ajustes e acesso ao tour nas próximas alterações. A confirmação não equivale à validação de retenção ou revogação nos serviços; essas etapas continuam no planejamento de Analytics.

### Simplificação da escolha

Textos encurtados e radio buttons removidos. Cada botão salva a decisão e abre o tour, sem etapa de confirmação adicional. Validar a versão simplificada no aparelho; a versão anterior já foi validada pelo usuário.

## Escolha de notificações no primeiro acesso — implementada em 03/10/2026

Nova tela entre privacidade e tour, com textos curtos, ícone de sino e dois botões: “Sim, ativar” e “Agora não”. Vinculada a “Avisar ao terminar” em Ajustes; recusa não solicita permissão. Caso o sistema negue, é possível tentar novamente ou seguir sem avisos. Navegador sem suporte não exibe a tela. Não habilita lembretes de rotina/inatividade nem push remoto.

Próximos passos: validar no aparelho aceitar/recusar, permissão negada, persistência em Ajustes, voltar e abertura do tour. A confirmação anterior de avisos de conclusão continua válida; esta validação é da nova interface e do fluxo de entrada.
