# Verificação — evidências vigentes

Consolidado em 11/10/2026. Registra o que foi verificado e seus limites; status de funcionalidades fica no [Plano de ação](plano-de-acao.md).

## Última verificação de código

Na unificação dos cards de conta de 11/10/2026, Perfil passou a compor dados pessoais, botão **Sair da conta** e avisos em **Sua conta** para usuários autenticados. O texto redundante de sincronização foi retirado; suspensão de sincronização e alertas continuam disponíveis. Visitantes mantêm o card de login separado e exclusão permanece por último. Os **123 testes passaram antes e depois**, assim como TypeScript. Comparação dos componentes confirmou o botão de saída e seu bloqueio durante operações. A apresentação ainda requer conferência no aparelho.

Na reorganização de Perfil de 11/10/2026, `AccountDeletionCard` foi separado das opções de login/saída e colocado após Privacidade, como último card para contas autenticadas. Os **123 testes passaram antes e depois**; TypeScript passou. Comparação sintática dos componentes confirmou preservação do card destrutivo, sheet e callback de confirmação e a nova ordem no Perfil. A revisão dos componentes manteve estado local, tipos autenticados, imports por alias e bloqueios durante a operação. A ordem visual e o fluxo extraído ainda precisam de conferência no aparelho; não houve nova exclusão real de conta nesta verificação.

Na simplificação de Ajustes de 11/10/2026, o atalho duplicado **Informações de privacidade** foi removido dessa aba. Conferência dos componentes confirmou sua presença no Perfil e na escolha inicial de privacidade; os controles de uso/diagnóstico continuam em Ajustes. TypeScript, formatação dos arquivos alterados e verificação do diff passaram. Esta alteração não foi validada novamente no aparelho.

Na entrega do widget Android de 11/10/2026, **123 testes de lógica**, TypeScript, export web, APK debug x86_64 e **cinco testes Kotlin de progresso** passaram. A regressão cobre projeção sem identidade de sessões, limites do histórico, foco pendente, pausa/retomada/reinício, limpeza atrasada entre conexões, sequência além de sete dias, viradas de calendário, horário de verão, fusos, registros futuros e arredondamento agregado. O manifesto mantém provider privado, backup desabilitado e ausência de permissões de alarme exato/foreground service.

No launcher Pixel do emulador temporário Android 15 (API 35), **Seu ritmo** apareceu no seletor e uma instância real mostrou três dias consecutivos, zero sessões hoje e 50 minutos na semana, correspondendo ao Progresso. Toque abriu o app. Pausa removeu o foco pendente da projeção; retomada substituiu seu prazo. Após `am kill`, o alarme nativo atualizou o widget para quatro dias, uma sessão/minuto hoje e 51 minutos semanais sem remontar a interface React. O histórico persistido ainda tinha três sessões; reabrir o app reconciliou o foco uma única vez e ambos passaram a mostrar os mesmos totais.

Fontes do sistema em escala 1,5 permaneceram legíveis. Atualizar o APK por cima conservou histórico, cache e widget; a prévia inicial apareceu brevemente antes da atualização do provider. **Apagar dados deste dispositivo** limpou histórico/projeção e o widget real exibiu zero. [Captura da versão testada](screenshots/widget-progresso-android-2026-10-11.png).

Não foram testados login/troca/exclusão autenticada no widget, dois widgets simultâneos, virada real de dia/fuso, reinício do Android, outros launchers ou aparelho físico. Os gestos de teste não confirmaram mudança efetiva do tamanho; flags e callback de redimensionamento compilaram, mas a interação ainda requer conferência no aparelho. Testes de propriedade/conexão não substituem essa validação autenticada. Não foi instalado APK no celular pessoal nem alterado seu debug de Analytics; o Metro existente do projeto foi reutilizado e preservado. Instruções em [Development build](development-build.md#widget-de-progresso-android).

Na entrega dos controles da notificação Android de 11/10/2026, TypeScript e os **118 testes** passaram. Dez testes novos cobrem pausa/retomada com segundos fracionários em ambos os modos, ações duplicadas/vencidas, payload inválido, preferência desativada, proprietário, revogação durante operações assíncronas, reinício concorrente, bloqueios de exclusão/hidratação e recuperação após falha de escrita. O scheduler cancela o aviso de término ao pausar e mantém a notificação com Retomar.

Prebuild, APK debug arm64-v8a/x86_64, bundle Android/Hermes de release gerado pelo Gradle, export web e **três testes Kotlin de privacidade** passaram. Manifestos debug/release confirmam receiver e serviço de controles privados, permissão normal de wake lock já existente, backup desabilitado e ausência de acessos a alarmes exatos/foreground services. A assinatura do APK continua correspondendo ao certificado OAuth configurado.

No emulador temporário Android 15 (API 35), ações reais na notificação pausaram e retomaram foco e descanso sem abrir o app. O tempo ficou congelado durante a pausa; o botão mudou para Retomar, a tela do app refletiu o estado pausado e a retomada usou um novo prazo. Após encerramento normal do processo com `am kill`, outra retomada criou um processo novo, preservou exatamente **294,299 segundos** e manteve o launcher em primeiro plano. O serviço terminou e não restou wake lock ativo de Headless JS; o histórico de energia registra sua liberação. O retorno ao app conservou o prazo salvo.

O cenário a frio exigiu Metro acessível na porta padrão 8081: o teste inicial na porta 19088 não carregou JavaScript porque o host novo procurava `10.0.2.2:8081`. Não foi usada Forçar parada nesse cenário. Validação física autenticada, tela bloqueada, Android 7 e APK completo de release continuam fora desta confirmação. Nenhum APK foi instalado no celular pessoal, nenhum login de teste foi criado e a configuração de Analytics desse aparelho foi preservada.

Na entrega da contagem nas notificações Android de 10/10/2026, TypeScript, os **108 testes**, exports web/Android e formatação passaram. Seis testes novos cobrem foco/descanso, pausa/retomada/reinício/recusa, restauração sem duplicar o aviso de conclusão, término vencido, permissão revogada, operação nativa atrasada e falha parcial de cancelamento. A contagem passa pela fila existente, sem sincronização a cada tick.

Prebuild e APKs debug arm64-v8a/x86_64 compilaram; manifesto release e **três testes Kotlin** de privacidade passaram. Os manifestos confirmam receiver de expiração privado e ausência de novos acessos a alarmes exatos/foreground services. Assinatura arm64 corresponde à configuração OAuth. O APK arm64 mediu **86,66 MB**; release/download pela loja não foram medidos. Nenhum APK foi instalado no celular pessoal e nenhum consentimento/debug Analytics desse aparelho foi alterado.

No emulador temporário Android 15 (API 35), sessões locais de teste com durações reduzidas comprovaram foco/descanso, notificação silenciosa, pausa e retomada com novo prazo. As capturas mostram foco passando de 01:56 a 01:52 em segundo plano. Com o processo inteiro do aplicativo suspenso temporariamente, o descanso passou de 00:28 a 00:23 e o Android retirou a contagem no término, sem execução JavaScript. O teste inicial aguardou o aviso de conclusão por 20 segundos e excedeu esse limite; inspeção posterior confirmou “Sua pausa terminou”, com criação aproximadamente 22 segundos após o prazo. Isso preserva a entrega do aviso e confirma a limitação já documentada do alarme não exato. Não foi validada pontualidade do aviso, Android 7, iOS ou apresentação na tela bloqueada do aparelho físico.

Na revisão do aceno de entrada de 10/10/2026, TypeScript, os **102 testes**, exports web/Android e formatação passaram. Chrome isolado verificou 390 × 844 e 320 × 740, descrição acessível e ausência de overflow horizontal. A extremidade da pata completa movimento curto nos dois sentidos, enquanto a base não gira, e retorna ao neutro durante a pausa. O ciclo foi interrompido ao simular segundo plano e ao ativar movimento reduzido durante o aceno; retomou ao voltar ao primeiro plano. Continuar sem conta abriu o onboarding existente, sem exceções não tratadas. As capturas das posições extremas foram inspecionadas. Não foi instalado APK nem realizada validação física; `Dog` e o hook compartilhado permanecem iguais.

Na entrega de consentimento/privacidade de 05/10/2026: TypeScript e **102 testes** passaram. Regras Firestore passaram pelo emulador, incluindo **19 verificações novas** de evidência, imutabilidade, proprietário, campos e horário do servidor (**92 no total**). Publicação pela CLI em `pomodog-dev-2026` passou; leitura remota foi comparada e corresponde ao arquivo local.

Dez testes novos cobrem ausência/versão antiga de consentimento, decisão/data/origem, isolamento de proprietários, persistência concorrente, armazenamento ilegível, recusa durante ativação, reversão, exclusão local explícita, fila offline e espera de operações em andamento. Exclusão paginada agora percorre sessões e consentimentos antes do perfil; o cenário exercita 451 sessões e 251 comprovantes. Isso não comprova ainda gravação/sincronização pela interface no dispositivo físico.

Prebuild, **APK debug arm64-v8a**, manifesto release e **três testes Kotlin** de filtragem/versão passaram com JDK 17. Os manifests de debug/release confirmam provider de consentimento privado (`exported=false`) e ordem 1000, anterior à do FirebaseInitProvider, além de backup desabilitado. Assinatura do APK corresponde ao certificado de OAuth cadastrado. APK não instalado nesta entrega; nenhum estado do aparelho/debug Analytics foi alterado. Não foi gerado APK/AAB completo de release nem enviada telemetria real/sintética nesta validação.

Export web, formatação e links locais passaram. O backlog preserva os 76 itens anteriores e acrescenta os controles na notificação: **77 itens** (23 concluídos, 10 em andamento, 44 pendentes). A revisão anterior de tokens/dependências/backup e seus riscos permanece em [Segurança](seguranca.md); controles de privacidade e pendências operacionais em [Privacidade](privacidade.md).

## Confirmações e limites

| Área                             | Evidência disponível                                                                                                                                  | Limite da confirmação                                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Mascote, progresso e alimentação | Usuário confirmou entregas funcionando no aparelho durante a sequência de desenvolvimento.                                                            | Não equivale a teste de desempenho em release ou todos os aparelhos.                                              |
| Notificações de conclusão        | Usuário confirmou foco/descanso no aparelho físico, inclusive com tela bloqueada.                                                                     | Não comprova iOS, push remoto ou todos os cenários de revogação/cancelamento.                                     |
| Timer nas notificações Android   | API 35: contagem de foco/descanso em segundo plano, pausa/retomada e expiração mesmo com processo suspenso verificadas.                               | Novo build/tela bloqueada no aparelho e fallback Android 7 ainda precisam de validação; iOS não incluído.         |
| Controles na notificação Android | API 35: ações reais de pausa/retomada em foco/descanso, estado no app e retomada após encerramento normal do processo; serviço e wake lock liberados. | Validar no aparelho com conta e tela bloqueada; não comprova Forçar parada, Android 7 ou APK completo de release. |
| Google OAuth e Firestore         | Usuário confirmou login e registro no banco no aparelho.                                                                                              | Conflitos entre dispositivos, produção e cenários de falha requerem verificação específica.                       |
| Exclusão de conta                | Usuário confirmou operação no aparelho; testes automatizados cobrem falha parcial/retomada e paginação.                                               | Relato não detalha cada registro remoto; coordenação entre dispositivos ainda não existe.                         |
| Regras Firestore                 | 92 verificações: acesso por UID, esquemas de estado e consentimentos, recusa de atualizações e timestamps arbitrários.                                | Não equivale a testar todo fluxo em dois dispositivos reais.                                                      |
| Armazenamento de autenticação    | Adapter seguro com migração e fila: cinco testes passaram; módulo incluído no bundle Android.                                                         | Criptografia real/migração no aparelho, disponibilidade e iOS ainda requerem validação.                           |
| Sentry/source maps de exports    | Eventos sintéticos confirmados em POMODOG-1/POMODOG-2; web/Android resolveram App.tsx:20:1.                                                           | Não são crashes reais de aparelho nem mapas do APK release.                                                       |
| Crashes Java/Kotlin              | Compilação Kotlin e três testes nativos de filtragem/versão passaram.                                                                                 | Crash real, reabertura, revogação e cache offline ainda não confirmados no dashboard.                             |
| Firebase Analytics               | Usuário confirmou eventos no DebugView; teste usa validador do SDK com ponte substituída.                                                             | Não comprova retenção, revogação ou processamento em relatórios normais.                                          |
| Privacidade inicial              | Primeira versão validada pelo usuário no aparelho; navegador verificou recusa, tour, reabertura e retorno.                                            | Revisão com dois botões ainda sem confirmação física específica.                                                  |
| Evidências de consentimento      | 102 testes de lógica e regras validadas/publicadas; versões antigas nativas recusadas; aviso incluído no app.                                         | UI/sincronização/offline/exclusão no aparelho ainda pendentes; canal público e retenção não configurados.         |
| Oferta de notificações           | TypeScript, testes de ações e export Android passaram.                                                                                                | Interface/permissão no aparelho ainda sem confirmação; aviso existente já estava validado.                        |
| Ícone e splash                   | Assets/configuração/exports verificados.                                                                                                              | Aparência final e abertura a frio de release ainda não verificadas.                                               |

## Tamanhos medidos

Medidas locais de 03/10/2026 (exports) e 10/10/2026 (APK), MB decimais, sem compressão de transporte para export:

| Artefato                            | Tamanho  | Referência                                                         |
| ----------------------------------- | -------- | ------------------------------------------------------------------ |
| Bundle Android/Hermes               | 6,38 MB  | Export anterior à revisão de segurança, 03/10/2026.                |
| Export Android com assets/metadados | 6,88 MB  | Mesmo export anterior à revisão de segurança.                      |
| APK debug                           | 86,66 MB | APK arm64-v8a com contagem nas notificações, gerado em 10/10/2026. |

Release, download pela loja e espaço instalado ainda não medidos. Bundle/export já usam configuração de produção; APK debug não prevê tamanho do download final. Metas de redução/desempenho serão definidas após referência de release.

## Roteiros e capturas

- Instalação, avisos e logs: [Development build](development-build.md).
- Consentimento/DebugView/relatórios: [Analytics](analytics.md#roteiro-de-validação).
- Erros, mapas e crash controlado: [Sentry](sentry.md#verificação).
- Capturas: [catálogo](screenshots/README.md). Elas representam etapas datadas, não necessariamente a interface vigente.

## Debug de Analytics mantido

Usuário pediu manter debug no aparelho em 02/10/2026; consulta ADB confirmou a propriedade naquela sessão. Esta consolidação não consultou nem alterou o dispositivo. Ao preparar publicação ou relatórios normais, conferir valor e lembrar da remoção conforme [lembrete vigente](analytics.md#lembrete-vigente-manter-debug-durante-desenvolvimento).
