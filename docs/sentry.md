# Diagnóstico opcional com Sentry

Configuração vigente em 05/10/2026. Evidências de eventos/mapas em [Verificação](verificacao.md); status no [Plano de ação](plano-de-acao.md).

Projeto `personal-dashboard/pomodog`, plataforma React Native, criado pelo MCP na equipe `front-end`. Dashboard: [erros do Pomodog](https://personal-dashboard.sentry.io/issues/?query=project%3Apomodog). O DSN público está em `src/monitoring/sentryConfig.ts`; ele permite ingestão, não administração da conta.

Retenção, limites de exclusão de eventos/issues e pedidos de titulares estão em [Privacidade](privacidade.md); não confundir revogação local com remoção no fornecedor.

## Como ativar

Em Ajustes, habilite **Compartilhar falhas** no card Diagnóstico opcional. A opção começa desativada e não sincroniza permissões entre dispositivos. Evidências versionadas de decisões feitas com login são registradas separadamente no Firestore, conforme [Privacidade](privacidade.md). Desativar impede novos eventos; relatórios já enviados não são removidos do Sentry. Apagar dados locais ou concluir exclusão de conta desativa o envio neste aparelho.

Os SDKs só são inicializados após restaurar consentimento válido ou salvar a ativação. Consentimento ilegível ou falha de leitura mantém envio desativado. JavaScript bloqueia novos eventos imediatamente em memória; a revogação nativa é concluída pela gravação na ponte Android. Gravações são serializadas e ativações já superadas são descartadas. Desativar fecha o cliente nativo e remove seu cache; eventos já enviados ou em trânsito não podem ser recuperados.

## O que é enviado

Erros JavaScript não tratados, falhas de renderização e falhas tratadas em login/saída/exclusão, sincronização, armazenamento e notificações. Eventos contêm operação técnica conhecida, versão, ambiente e posições da stack. Mensagens arbitrárias são substituídas por descrições fixas para reduzir risco de enviar dados pessoais. Isso limita o detalhe disponível para diagnóstico; contexto adicional deve ser incluído somente mediante revisão de privacidade.

O filtro permite apenas campos técnicos: remove identidade Firebase, nome, e-mail, histórico, dados extras, requisições, logs, breadcrumbs e conteúdo de linhas de código. IP é substituído por `0.0.0.0` para impedir enriquecimento automático de localização no evento. Sentry continua sendo o destinatário da conexão de rede; não se promete anonimato absoluto. Não há analytics de uso, replay, heatmaps, perfilamento ou tracing de performance.

Crashes não tratados Java/Kotlin no Android agora possuem cliente nativo independente, com filtro próprio. Envia classe da exceção, arquivo, método, linha, versão e ambiente; remove mensagem original, identidade, contexto, extras, breadcrumbs, variáveis e caminhos completos. C/C++ (NDK), ANRs e iOS continuam desativados/não implementados. Não há screenshots, hierarquia de telas ou threads adicionais.

`enableNative: false` no cliente JavaScript é intencional: mantém seu transporte e filtro independentes. A captura Android é inicializada manualmente pelo plugin local, sem encaminhar eventos JavaScript ao cliente nativo. `io.sentry.auto-init=false` impede inicialização automática fora do controle de consentimento.

## Build e mapas de código

SDK `@sentry/react-native` instalado na versão compatível indicada pelo Expo SDK 57. Plugin Expo e configuração Metro do Sentry integrados com NativeWind. Mudanças nativas exigem regenerar/reinstalar conforme [Development build](development-build.md). Para build local sem upload de mapas, use `SENTRY_DISABLE_AUTO_UPLOAD=true npm run android`; isso não desativa coleta autorizada em runtime.

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

Em um futuro build de release, use o token local ou segredo do ambiente e retire `SENTRY_DISABLE_AUTO_UPLOAD=true`. O Gradle/Sentry fará upload dos mapas do próprio APK. Para executar esse fluxo local e instalar no aparelho, use `npm run android -- --variant release` após configurar a credencial. **Não use mapas de `expo export` para substituir os do APK:** compilação Hermes/posições podem ser diferentes; o export Android serve ao bundle exportado/OTA. Mapas do próprio APK de release ainda não foram validados; exports não substituem esse teste.

Crashes Java/Kotlin foram configurados separadamente. O build atual não usa minificação R8; caso seja habilitada, será necessário configurar upload do mapping do próprio release. Símbolos C/C++ não foram configurados. Atualize `release` em `src/monitoring/sentry.ts` e no script de verificação junto à versão do aplicativo até automatizarmos releases.

## Verificação

- `npm test`: consentimento, revogação concorrente, restauração, falha de armazenamento e filtragem de dados.
- `node --experimental-strip-types scripts/verify-sentry.mts --send`: envia um erro sintético explícito no ambiente `integration-test`, sem usar conta ou histórico. Requer rede e não altera consentimento do app. O script usa o transporte do SDK browser, separado do runtime React Native.
- [POMODOG-1](https://personal-dashboard.sentry.io/issues/POMODOG-1): dois eventos sintéticos confirmados por MCP. O último usa IP substituto, sem localização ou identidade real no evento.
- `node --experimental-strip-types scripts/verify-sentry.mts --send --source-maps web` (ou `android`): localiza coordenadas de `App.tsx` no mapa exportado e envia um evento sintético com debug ID. Requer mapas previamente enviados e não altera consentimento do app.
- Validar no development build: opção desligada não envia, opção ligada envia um erro de teste controlado, desativação bloqueia próximos envios e reabrir preserva a escolha. Nenhum crash foi provocado no aparelho do usuário.

Documentação consultada via Context7: [Expo](https://docs.sentry.io/platforms/react-native/guides/expo/), [dados coletados](https://docs.sentry.io/platforms/react-native/data-management/data-collected/), [filtragem de dados](https://docs.sentry.io/platforms/react-native/data-management/sensitive-data/).

## Crashes nativos Android — 01/10/2026

`plugins/withNativeReporting.js` registra a ponte e restauração em `MainApplication`, desativa auto-init e copia fontes/testes Kotlin versionados ao projeto gerado. Evite editar somente `android/`, pois prebuild recria esse diretório. O SDK Android já vem da dependência Sentry existente; não foi criado outro projeto remoto.

No Android com a ponte nativa, o controle de Ajustes lê/escreve consentimento nativo. A escolha anterior em AsyncStorage **não ativa automaticamente a nova coleta**: habilite novamente após reinstalar o build. A preferência nativa versionada e o cache ficam em `noBackupFilesDir`, fora do backup Android. A preferência não é sincronizada; evidências autenticadas ficam no Firestore separadamente. Web e builds antigos sem a ponte continuam com consentimento JavaScript. Atualizar um APK preserva a escolha quando a versão do aviso continua válida. Booleans antigos ou versões incompatíveis não autorizam coleta; habilitar novamente em Ajustes após o rebuild. Desinstalar remove a preferência.

Se autorizado anteriormente, a captura começa em `Application.onCreate`, antes da inicialização React Native/JavaScript. Não cobre falhas anteriores a esse ponto. Eventos filtrados podem ficar no cache privado offline (máximo de dez envelopes) e ser reenviados quando houver rede. Inicialização sem consentimento e revogação removem esse cache. A captura fica desligada em caso de erro de inicialização.

### Validar no aparelho

1. Regenere e instale o development build usando os comandos acima. Expo Go não valida esta integração.
2. Habilite **Compartilhar falhas** em Ajustes e reabra o app; confirme que a escolha foi preservada.
3. Com o app aberto, execute o comando abaixo somente quando desejar encerrar o app intencionalmente para o teste; não faça o teste durante um ciclo que deseja preservar.

```sh
adb shell am crash com.filipebteixeira98.pomodog
```

4. Reabra o app com internet e procure no Sentry por `operation:native.crash`, ambiente `development`. Confira stack Java/Kotlin, mensagem substituída e ausência de identidade/histórico. Se não chegar, leia `adb logcat` para confirmar que o Android realmente gerou exceção não tratada.
5. Desative o envio, reabra, repita o crash controlado e confirme que nenhum novo evento aparece. Repita com rede desligada para avaliar reenvio e com revogação antes de reconectar para avaliar descarte do cache.

Até a última evidência registrada, nenhum crash nativo real foi confirmado no dashboard. Testes automatizados de filtragem não substituem essa validação.

Documentação consultada via Context7: [inicialização nativa manual](https://docs.sentry.io/platforms/react-native/manual-setup/native-init/) e [Sentry Android](https://docs.sentry.io/platforms/android/).
