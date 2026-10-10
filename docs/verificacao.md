# Verificação — evidências vigentes

Consolidado em 10/10/2026. Registra o que foi verificado e seus limites; status de funcionalidades fica no [Plano de ação](plano-de-acao.md).

## Última verificação de código

Na entrega da contagem nas notificações Android de 10/10/2026, TypeScript, os **108 testes**, exports web/Android e formatação passaram. Seis testes novos cobrem foco/descanso, pausa/retomada/reinício/recusa, restauração sem duplicar o aviso de conclusão, término vencido, permissão revogada, operação nativa atrasada e falha parcial de cancelamento. A contagem passa pela fila existente, sem sincronização a cada tick.

Prebuild e APKs debug arm64-v8a/x86_64 compilaram; manifesto release e **três testes Kotlin** de privacidade passaram. Os manifestos confirmam receiver de expiração privado e ausência de novos acessos a alarmes exatos/foreground services. Assinatura arm64 corresponde à configuração OAuth. O APK arm64 mediu **86,66 MB**; release/download pela loja não foram medidos. Nenhum APK foi instalado no celular pessoal e nenhum consentimento/debug Analytics desse aparelho foi alterado.

No emulador temporário Android 15 (API 35), sessões locais de teste com durações reduzidas comprovaram foco/descanso, notificação silenciosa, pausa e retomada com novo prazo. As capturas mostram foco passando de 01:56 a 01:52 em segundo plano. Com o processo inteiro do aplicativo suspenso temporariamente, o descanso passou de 00:28 a 00:23 e o Android retirou a contagem no término, sem execução JavaScript. O teste inicial aguardou o aviso de conclusão por 20 segundos e excedeu esse limite; inspeção posterior confirmou “Sua pausa terminou”, com criação aproximadamente 22 segundos após o prazo. Isso preserva a entrega do aviso e confirma a limitação já documentada do alarme não exato. Não foi validada pontualidade do aviso, Android 7, iOS ou apresentação na tela bloqueada do aparelho físico.

Na revisão do aceno de entrada de 10/10/2026, TypeScript, os **102 testes**, exports web/Android e formatação passaram. Chrome isolado verificou 390 × 844 e 320 × 740, descrição acessível e ausência de overflow horizontal. A extremidade da pata completa movimento curto nos dois sentidos, enquanto a base não gira, e retorna ao neutro durante a pausa. O ciclo foi interrompido ao simular segundo plano e ao ativar movimento reduzido durante o aceno; retomou ao voltar ao primeiro plano. Continuar sem conta abriu o onboarding existente, sem exceções não tratadas. As capturas das posições extremas foram inspecionadas. Não foi instalado APK nem realizada validação física; `Dog` e o hook compartilhado permanecem iguais.

Na entrega de consentimento/privacidade de 05/10/2026: TypeScript e **102 testes** passaram. Regras Firestore passaram pelo emulador, incluindo **19 verificações novas** de evidência, imutabilidade, proprietário, campos e horário do servidor (**92 no total**). Publicação pela CLI em `pomodog-dev-2026` passou; leitura remota foi comparada e corresponde ao arquivo local.

Dez testes novos cobrem ausência/versão antiga de consentimento, decisão/data/origem, isolamento de proprietários, persistência concorrente, armazenamento ilegível, recusa durante ativação, reversão, exclusão local explícita, fila offline e espera de operações em andamento. Exclusão paginada agora percorre sessões e consentimentos antes do perfil; o cenário exercita 451 sessões e 251 comprovantes. Isso não comprova ainda gravação/sincronização pela interface no dispositivo físico.

Prebuild, **APK debug arm64-v8a**, manifesto release e **três testes Kotlin** de filtragem/versão passaram com JDK 17. Os manifests de debug/release confirmam provider de consentimento privado (`exported=false`) e ordem 1000, anterior à do FirebaseInitProvider, além de backup desabilitado. Assinatura do APK corresponde ao certificado de OAuth cadastrado. APK não instalado nesta entrega; nenhum estado do aparelho/debug Analytics foi alterado. Não foi gerado APK/AAB completo de release nem enviada telemetria real/sintética nesta validação.

Export web, formatação e links locais passaram. O backlog preserva os 75 itens anteriores e acrescenta a contagem nas notificações: **76 itens** (22 concluídos, 10 em andamento, 44 pendentes). A revisão anterior de tokens/dependências/backup e seus riscos permanece em [Segurança](seguranca.md); controles de privacidade e pendências operacionais em [Privacidade](privacidade.md).

## Confirmações e limites

| Área                             | Evidência disponível                                                                                                    | Limite da confirmação                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Mascote, progresso e alimentação | Usuário confirmou entregas funcionando no aparelho durante a sequência de desenvolvimento.                              | Não equivale a teste de desempenho em release ou todos os aparelhos.                                      |
| Notificações de conclusão        | Usuário confirmou foco/descanso no aparelho físico, inclusive com tela bloqueada.                                       | Não comprova iOS, push remoto ou todos os cenários de revogação/cancelamento.                             |
| Timer nas notificações Android   | API 35: contagem de foco/descanso em segundo plano, pausa/retomada e expiração mesmo com processo suspenso verificadas. | Novo build/tela bloqueada no aparelho e fallback Android 7 ainda precisam de validação; iOS não incluído. |
| Google OAuth e Firestore         | Usuário confirmou login e registro no banco no aparelho.                                                                | Conflitos entre dispositivos, produção e cenários de falha requerem verificação específica.               |
| Exclusão de conta                | Usuário confirmou operação no aparelho; testes automatizados cobrem falha parcial/retomada e paginação.                 | Relato não detalha cada registro remoto; coordenação entre dispositivos ainda não existe.                 |
| Regras Firestore                 | 92 verificações: acesso por UID, esquemas de estado e consentimentos, recusa de atualizações e timestamps arbitrários.  | Não equivale a testar todo fluxo em dois dispositivos reais.                                              |
| Armazenamento de autenticação    | Adapter seguro com migração e fila: cinco testes passaram; módulo incluído no bundle Android.                           | Criptografia real/migração no aparelho, disponibilidade e iOS ainda requerem validação.                   |
| Sentry/source maps de exports    | Eventos sintéticos confirmados em POMODOG-1/POMODOG-2; web/Android resolveram App.tsx:20:1.                             | Não são crashes reais de aparelho nem mapas do APK release.                                               |
| Crashes Java/Kotlin              | Compilação Kotlin e três testes nativos de filtragem/versão passaram.                                                   | Crash real, reabertura, revogação e cache offline ainda não confirmados no dashboard.                     |
| Firebase Analytics               | Usuário confirmou eventos no DebugView; teste usa validador do SDK com ponte substituída.                               | Não comprova retenção, revogação ou processamento em relatórios normais.                                  |
| Privacidade inicial              | Primeira versão validada pelo usuário no aparelho; navegador verificou recusa, tour, reabertura e retorno.              | Revisão com dois botões ainda sem confirmação física específica.                                          |
| Evidências de consentimento      | 102 testes de lógica e regras validadas/publicadas; versões antigas nativas recusadas; aviso incluído no app.           | UI/sincronização/offline/exclusão no aparelho ainda pendentes; canal público e retenção não configurados. |
| Oferta de notificações           | TypeScript, testes de ações e export Android passaram.                                                                  | Interface/permissão no aparelho ainda sem confirmação; aviso existente já estava validado.                |
| Ícone e splash                   | Assets/configuração/exports verificados.                                                                                | Aparência final e abertura a frio de release ainda não verificadas.                                       |

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
