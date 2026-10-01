# Diagnóstico opcional com Sentry

Projeto `personal-dashboard/pomodog`, plataforma React Native, criado pelo MCP na equipe `front-end`. Dashboard: [erros do Pomodog](https://personal-dashboard.sentry.io/issues/?query=project%3Apomodog). O DSN público está em `src/monitoring/sentryConfig.ts`; ele permite ingestão, não administração da conta.

## Como ativar

Em Ajustes, habilite **Enviar erros do aplicativo** no card Diagnóstico opcional. A opção começa desativada, é salva somente neste dispositivo e não acompanha a conta no Firestore. Desativar impede novos eventos; relatórios já enviados não são removidos do Sentry. Apagar dados locais ou concluir exclusão de conta desativa o envio neste aparelho.

O SDK só é inicializado após restaurar consentimento válido ou salvar a ativação. Consentimento ilegível ou falha de leitura mantém envio desativado. A revogação é imediata em memória; gravações são serializadas para que uma ativação atrasada não reverta a revogação.

## O que é enviado

Erros JavaScript não tratados, falhas de renderização e falhas tratadas em login/saída/exclusão, sincronização, armazenamento e notificações. Eventos contêm operação técnica conhecida, versão, ambiente e posições da stack. Mensagens arbitrárias são substituídas por descrições fixas para reduzir risco de enviar dados pessoais. Isso limita o detalhe disponível para diagnóstico; contexto adicional deve ser incluído somente mediante revisão de privacidade.

O filtro permite apenas campos técnicos: remove identidade Firebase, nome, e-mail, histórico, dados extras, requisições, logs, breadcrumbs e conteúdo de linhas de código. IP é substituído por `0.0.0.0` para impedir enriquecimento automático de localização no evento. Sentry continua sendo o destinatário da conexão de rede; não se promete anonimato absoluto. Não há analytics de uso, replay, heatmaps, perfilamento ou tracing de performance.

Crashes nativos Java/Kotlin/Swift/NDK e armazenamento offline nativo estão desativados (`enableNative: false`), para manter o mesmo filtro JavaScript antes do envio. Essa entrega cobre diagnóstico JavaScript no Android e web. Ativação de crashes nativos exige consentimento e filtragem próprios, além de validação do binário.

## Build e mapas de código

SDK `@sentry/react-native` instalado na versão compatível indicada pelo Expo SDK 57. Plugin Expo e configuração Metro do Sentry integrados com NativeWind. Como existe dependência nativa nova, regenere e reinstale o development build para validar no aparelho:

```sh
npx expo prebuild --platform android --no-install
SENTRY_DISABLE_AUTO_UPLOAD=true npm run android
npm start
```

O primeiro comando atualiza arquivos nativos gerados. A variável desativa apenas upload de source maps durante o build local, não envio de erros em runtime.

Para release, configure **SENTRY_AUTH_TOKEN** como segredo do ambiente de build, com acesso de upload de artefatos ao projeto. Não coloque token em `app.json`, no bundle ou em variável `EXPO_PUBLIC_*`. Retire `SENTRY_DISABLE_AUTO_UPLOAD=true` no build de release. O MCP não forneceu esse token; mapas e símbolos não foram enviados nesta entrega. Upload de source maps web precisa ser executado separadamente no pipeline. Atualize `release` em `src/monitoring/sentry.ts` e no script de verificação junto à versão do aplicativo até automatizarmos releases.

## Verificação

- `npm test`: consentimento, revogação concorrente, restauração, falha de armazenamento e filtragem de dados.
- `node --experimental-strip-types scripts/verify-sentry.mts --send`: envia um erro sintético explícito no ambiente `integration-test`, sem usar conta ou histórico. Requer rede e não altera consentimento do app. O script usa o transporte do SDK browser, separado do runtime React Native.
- [POMODOG-1](https://personal-dashboard.sentry.io/issues/POMODOG-1): dois eventos sintéticos confirmados por MCP. O último usa IP substituto, sem localização ou identidade real no evento.
- Validar no development build: opção desligada não envia, opção ligada envia um erro de teste controlado, desativação bloqueia próximos envios e reabrir preserva a escolha. Nenhum crash foi provocado no aparelho do usuário.

Documentação consultada via Context7: [Expo](https://docs.sentry.io/platforms/react-native/guides/expo/), [dados coletados](https://docs.sentry.io/platforms/react-native/data-management/data-collected/), [filtragem de dados](https://docs.sentry.io/platforms/react-native/data-management/sensitive-data/).
