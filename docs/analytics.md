# Firebase Analytics — uso opcional no Android

Implementação de 02/10/2026 com `@react-native-firebase/app` e `@react-native-firebase/analytics` 26.4.0. Usa o app Android já cadastrado em `pomodog-dev-2026`; autenticação e Firestore continuam no SDK existente. Não cria coleções/tabelas de Analytics no Firestore.

## Consentimento e dados

Em Ajustes, **Compartilhar como uso o app** é independente do diagnóstico de erros e fica desligado por padrão. O consentimento permanece neste dispositivo, não no perfil sincronizado. Sem aceitar, o app funciona normalmente com ou sem conta. Não interpretar login ou consentimento de Sentry como autorização de medição.

`firebase.json` nega coleta e armazenamento de Analytics por padrão antes do JavaScript. Ads, personalização, AD_ID e SSAID desabilitados; AD_ID removido das permissões Android. Telas são medidas explicitamente, evitando registrar Activities do development client. Após a autorização, o SDK também pode produzir seus eventos técnicos automáticos de sessão/engajamento; não é uma coleta limitada aos eventos customizados abaixo.

O SDK usa identificador da instalação e informações técnicas do app/dispositivo; não prometer anonimato absoluto. Não definimos `user_id` com UID Firebase, nem enviamos nome, e-mail, textos livres, histórico completo, títulos de agenda ou dados familiares. Payloads customizados são reconstruídos por uma lista permitida. Não há captura de toques, heatmaps, replay, anúncios, IA ou testes A/B nesta entrega.

Ao desativar, o bloqueio JavaScript ocorre imediatamente e eventos ainda na fila local da aplicação são descartados. SDK nega consentimento e coleta, limpa seus dados locais e reinicia o identificador da instalação. Apagar dados locais e concluir exclusão de conta também revogam Analytics. Dados já enviados não são apagados no servidor por `resetAnalyticsData`; retenção/solicitações de remoção no GA4 são medidas distintas. Falhas de persistência são exibidas em Ajustes, sem bloquear o timer.

## Eventos e perguntas

| Evento                | Propriedades customizadas                                                         | Pergunta de uso                                        |
| --------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `screen_view`         | `screen_name`, `screen_class`: welcome/onboarding/focus/progress/settings/profile | Quais telas são acessadas?                             |
| `onboarding_complete` | Nenhuma                                                                           | Quantas conclusões ocorrem depois de autorizar coleta? |
| `pomodoro_start`      | `session_mode`: focus/break; `duration_seconds`                                   | Quais ciclos/durações as pessoas iniciam?              |
| `pomodoro_pause`      | Modo e duração configurada                                                        | Com que frequência interrompem ciclos?                 |
| `pomodoro_resume`     | Modo e duração configurada                                                        | Retomam os ciclos pausados?                            |
| `pomodoro_complete`   | Modo e duração do ciclo que terminou                                              | Quantos ciclos chegam ao fim?                          |
| `pomodoro_reset`      | Modo e duração configurada                                                        | Quantos ciclos ativos/pausados são reiniciados?        |

Só transições efetivas produzem eventos; ticks não são medidos. Na conclusão, o modo enviado é o do ciclo anterior, apesar da troca automática de foco/descanso. Retorno ao app e restauração de um timer vencido podem reconhecer conclusão; restaurar histórico concluído não o reenvia. Eventos anteriores ao consentimento não são armazenados para envio posterior.

A escolha é oferecida em Ajustes, depois da introdução: o primeiro onboarding normalmente não é medido. A futura tela de privacidade é uma entrega separada. Os dados representam somente instalações que aceitaram a coleta; contagens não representam todos os usuários, nem provam causalidade ou produtividade.

## Vinculação no console — confirmada

Após habilitação pelo usuário em 02/10/2026, consulta da API retornou 200: propriedade GA4 `557163675` (`pomodog-dev-2026`), conta `227570824`, stream Android `15949717951`. Firebase também vinculou o app web a um stream; isso não ativa coleta no adaptador web atual.

O arquivo google-services-analytics.json baixado pelo usuário é idêntico ao google-services.json vigente, incluindo projeto, app Android e clientes OAuth. Manter o arquivo atual; não é necessário substituir ou adicionar uma segunda configuração. A cópia extra não faz parte do build.

O projeto Expo gera Gradle Groovy (.gradle), não Kotlin DSL (.gradle.kts). Plugin Firebase App já adiciona Google Services (4.4.4 no build validado); módulos React Native Firebase 26.4.0 já incluem Firebase Analytics e BoM 34.18.0. Não duplicar os trechos do assistente de instalação nativa nem forçar versões diferentes apenas por aparecerem no console. Mudanças necessárias de versões devem ser feitas pela configuração/dependências do projeto, preservando prebuild reproduzível.

Pendentes: confirmar retenção de eventos/usuários em dois meses e opções de compartilhamento/publicidade no GA4, reinstalar development build e validar recepção/revogação no aparelho. O SDK já nega consentimento publicitário. Não confundir a vinculação bem-sucedida com confirmação de eventos recebidos. [Integrações do projeto](https://console.firebase.google.com/project/pomodog-dev-2026/settings/integrations).

Para comparar durações/modos nos relatórios, registrar `session_mode` como dimensão customizada de evento e `duration_seconds` como métrica customizada. São opcionais para ver payloads no DebugView; o SDK não cria essas definições de relatório automaticamente.

## Recompilar e validar

Expo Go não contém os módulos. Esta entrega integra somente Android; web/iOS mantêm adaptador sem coleta e sem controle de Analytics.

```sh
npx expo prebuild --platform android --no-install
npm run android
```

APK debug arm64-v8a compilado com sucesso nesta máquina; instalação e recepção no aparelho ainda pendentes. Usar JDK 17 e SDK Android conforme [development build](development-build.md). O APK debug depende de Metro para executar JavaScript; a exportação Hermes não substitui instalação/validação.

Com aparelho autorizado por USB, habilitar debug somente para o teste:

```sh
adb shell setprop debug.firebase.analytics.app com.filipebteixeira98.pomodog
```

1. Com vínculo GA4 concluído e coleta desligada, abrir app/navegar/iniciar ciclos: nenhum evento deve ser enviado ao DebugView. Não confundir eventos já enviados com eventos novos.
2. Em Ajustes, ativar compartilhamento: deve aparecer `screen_view` da tela atual. Navegar e confirmar nomes controlados no [DebugView](https://console.firebase.google.com/project/pomodog-dev-2026/analytics/debugview).
3. Iniciar foco, pausar, retomar e concluir; verificar modo/duração. Repetir no descanso e confirmar ausência de duplicatas ao retornar perto do término. Não há alteração das durações disponíveis para testar.
4. Desativar e repetir; reabrir para conferir persistência. Apagar dados locais/excluir conta e conferir revogação. Autorizar medição não deve ativar diagnóstico, e vice-versa.
5. Negar conexão/repetir enquanto offline: timer continua funcionando. Eventos autorizados podem permanecer no cache do SDK até reconectar; conferir revogação antes da reconexão.

Ao terminar:

```sh
adb shell setprop debug.firebase.analytics.app .none.
```

DebugView é o caminho para validação imediata; relatórios agregados não são instantâneos. Usuário confirmou eventos funcionando no DebugView no aparelho. Revogação e demais cenários de consentimento ainda precisam de validação específica.

Referências: [React Native Firebase Analytics](https://rnfirebase.io/analytics/usage), [configuração Expo](https://rnfirebase.io/), [DebugView](https://firebase.google.com/docs/analytics/debugview), [vincular projeto](https://firebase.google.com/docs/projects/api/workflow_set-up-and-manage-project#link-analytics).

## Correção de nomes e diagnóstico — 02/10/2026

O catálogo inicial usava session_start para início de Pomodoro. Esse nome é reservado: o SDK instalado lança exceção antes de chamar a ponte nativa. O controlador mantinha o timer funcionando, mas descartava a falha sem diagnóstico. Corrigida a família customizada para pomodoro_start/pause/resume/complete/reset, distinguindo ciclos dos eventos automáticos de sessão do Analytics. screen_view e onboarding_complete mantidos. Nomes novos não recuperam eventos anteriores.

Testes agora executam a validação real de logEvent do SDK instalado, substituindo somente a ponte nativa; reproduzem a rejeição antiga e verificam todos os nomes/payloads atuais. Em desenvolvimento, falhas de restauração, consentimento e chamada de evento produzem [Pomodog analytics] com etapa/nome controlados. Não imprime exceção original, identidade ou payload; produção permanece sem esses logs. Aceitação pelo SDK não confirma recepção no servidor.

A investigação confirmou a falha do evento de início; ela não explica, sozinha, ausência de outros eventos. Usuários ativos podem refletir eventos automáticos. No aparelho conectado, modo debug inicialmente vazio; habilitado DebugView para Pomodog sem alterar consentimento/timer. Leitura filtrada do processo não forneceu eventos novos para comprovar upload. Ainda validar com navegação/ciclos na versão atual e tela DebugView da propriedade correta. Mudança somente JavaScript: carregar código atual via Metro, sem recompilar nativo por esta correção.

Relatórios comuns podem levar 24–48 horas para processar dados; sem debug, o SDK também pode agrupar envios por aproximadamente uma hora. Ver [diagnóstico de relatórios](https://developers.google.com/analytics/devguides/collection/ga4/troubleshoot) e [DebugView](https://firebase.google.com/docs/analytics/debugview). Registrar dimensões/métricas customizadas permite analisar propriedades como modo/duração em relatórios; não é necessário para ver eventos/payloads no DebugView. Conferir filtros de tráfego de desenvolvedor no GA4 se DebugView recebe eventos e relatórios continuam sem eles.

## Lembrete vigente: manter debug durante desenvolvimento

Decisão do usuário em 02/10/2026: manter `debug.firebase.analytics.app=com.filipebteixeira98.pomodog` no aparelho de teste para depurar. Valor confirmado por consulta ADB nesta sessão; não desativar automaticamente durante a investigação/desenvolvimento. Usuário confirmou recepção correta no DebugView.

Ao retomar preparação de publicação, validar Analytics em condições normais ou analisar relatórios de uso sem tráfego de diagnóstico, lembrar explicitamente o usuário de desativar a propriedade no aparelho de teste:

```sh
adb shell setprop debug.firebase.analytics.app .none.
```

Essa propriedade é uma configuração do dispositivo, não do APK: não é distribuída aos usuários e um build release, por si só, não comprova que ela foi desativada no aparelho de teste. Consultar o valor com `adb shell getprop debug.firebase.analytics.app` ao revisar o lembrete; não presumir que continua ativo indefinidamente. A coleta autorizada permanece funcionando ao remover o modo debug. Não confundir com o consentimento em Ajustes.
