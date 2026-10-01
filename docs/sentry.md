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

### Source maps de exportações web e Android

```sh
npm run sentry:export:web
npm run sentry:export:android
npm run sentry:check
npm run sentry:upload
```

Os exports usam `--source-maps` e ficam em `dist-sentry/web` e `dist-sentry/android`, ignorados pelo Git. Para verificar/enviar somente uma plataforma, use `npm run sentry:check -- web` ou `npm run sentry:upload -- android`.

O script verifica mapas não vazios, IDs válidos e consistentes e o marcador `sentry-dbid-<id>` no bundle JavaScript/Hermes. IDs incompatíveis impedem upload. O script normaliza `debugId`/`debug_id` e chama o Sentry CLI instalado com o SDK, que valida e aguarda processamento dos artefatos. Não há dependência nova. Organização, projeto e URL vêm do plugin em `app.json`; a associação usa debug IDs, sem exigir criação manual de release.

Não publique os arquivos `.map` nem a pasta `dist-sentry` diretamente na web: mapas incluem código-fonte. Distribua os mesmos bundles correspondentes aos mapas enviados, sem arquivos `.map`. Não recompile o JavaScript entre upload e distribuição. Upload e processamento concluídos com a credencial local; eventos sintéticos das duas plataformas foram resolvidos no dashboard.

### Credencial de build

Crie um **Organization Auth Token** para `personal-dashboard` em Settings → Auth Tokens, destinado a CI/source maps (`org:ci`). [Escopos oficiais](https://docs.sentry.io/api/permissions/).

Copie `.env.sentry-build-plugin.example` para `.env.sentry-build-plugin` e preencha `SENTRY_AUTH_TOKEN` somente nesse arquivo local, ignorado pelo Git. Nunca envie token pelo chat, inclua-o no bundle ou use prefixo `EXPO_PUBLIC_*`. O script de upload lê esse arquivo apenas no processo de build; variável `SENTRY_AUTH_TOKEN` já definida no ambiente tem precedência. No futuro CI/EAS, configure o mesmo valor como segredo do ambiente. O MCP não expõe operação de upload ou emissão desse token. Nesta entrega, a credencial foi disponibilizada localmente e usada pelo CLI, sem impressão ou inclusão no repositório.

Sem credencial, `sentry:upload` termina com erro antes de acessar o serviço; a coleta de erros do aplicativo permanece independente e funciona com o DSN público.

### APK Android de release

O plugin foi aplicado ao projeto Android gerado via `npx expo prebuild --platform android --no-install`; `android/app/build.gradle` aplica `sentry.gradle`, e `android/sentry.properties` identifica organização/projeto, sem token. Os diretórios nativos continuam gerados e ignorados pelo Git.

Em um futuro build de release, use o token local ou segredo do ambiente e retire `SENTRY_DISABLE_AUTO_UPLOAD=true`. O Gradle/Sentry fará upload dos mapas do próprio APK. Para executar esse fluxo local e instalar no aparelho, use `npm run android -- --variant release` após configurar a credencial. **Não use mapas de `expo export` para substituir os do APK:** compilação Hermes/posições podem ser diferentes; o export Android serve ao bundle exportado/OTA. Não foi compilado nem instalado APK nesta entrega.

Crashes nativos e seus símbolos continuam uma etapa separada, desativada. Atualize `release` em `src/monitoring/sentry.ts` e no script de verificação junto à versão do aplicativo até automatizarmos releases.

## Verificação

- `npm test`: consentimento, revogação concorrente, restauração, falha de armazenamento e filtragem de dados.
- `node --experimental-strip-types scripts/verify-sentry.mts --send`: envia um erro sintético explícito no ambiente `integration-test`, sem usar conta ou histórico. Requer rede e não altera consentimento do app. O script usa o transporte do SDK browser, separado do runtime React Native.
- [POMODOG-1](https://personal-dashboard.sentry.io/issues/POMODOG-1): dois eventos sintéticos confirmados por MCP. O último usa IP substituto, sem localização ou identidade real no evento.
- `node --experimental-strip-types scripts/verify-sentry.mts --send --source-maps web` (ou `android`): localiza coordenadas de `App.tsx` no mapa exportado e envia um evento sintético com debug ID. Requer mapas previamente enviados e não altera consentimento do app.
- Validar no development build: opção desligada não envia, opção ligada envia um erro de teste controlado, desativação bloqueia próximos envios e reabrir preserva a escolha. Nenhum crash foi provocado no aparelho do usuário.

Documentação consultada via Context7: [Expo](https://docs.sentry.io/platforms/react-native/guides/expo/), [dados coletados](https://docs.sentry.io/platforms/react-native/data-management/data-collected/), [filtragem de dados](https://docs.sentry.io/platforms/react-native/data-management/sensitive-data/).

## Evidência de configuração dos source maps — 01/10/2026

Web e Android/Hermes exportados com mapas; debug IDs conferidos. Resolução local de coordenadas compiladas retornou `/App.tsx`, linha 20, em ambas as plataformas. Mapas com ID trocado foram rejeitados antes de upload. Credencial e artefatos privados estão ignorados pelo Git. Upload sem token falhou explicitamente. Upload real concluído nas duas plataformas. Eventos web `14e7d3fbb2db4346b91bdaed6966c1b3` e Android `d7694cae989a40b292dfa2418e55ab62` foram confirmados via MCP em [POMODOG-2](https://personal-dashboard.sentry.io/issues/POMODOG-2), ambos resolvendo para `/App.tsx:20:1`, com contexto de código. São eventos sintéticos associados aos exports, não crashes reais de dispositivo.
