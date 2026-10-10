# Development build no Android pessoal

Guia de instalação, execução e logs. Evidências em [Verificação](verificacao.md); procedimentos de observabilidade em [Analytics](analytics.md) e [Sentry](sentry.md).

É uma instalação própria do Pomodog com as bibliotecas nativas do projeto. Abra o Pomodog instalado, não o Expo Go. Os dados locais ficam separados; o histórico do Expo Go não será migrado automaticamente.

Preparados no repositório: expo-dev-client, scheme pomodog, identificador Android com.filipebteixeira98.pomodog e plugin expo-notifications. Revise o identificador antes de publicar na Play Store.

A entrega de privacidade de 05/10/2026 exige novo development build: a ponte de consentimento de uso e o provider anterior ao Firebase são nativos. Reload do Metro não os adiciona. Atualizar por cima preserva dados; não desinstalar apenas para atualizar. Escolhas opcionais antigas, sem evidência da versão do aviso, precisam ser feitas novamente em Ajustes.

A contagem nas notificações de 10/10/2026 também exige prebuild e novo APK, pois adiciona `PomodogCountdown`. Use os comandos de atualização abaixo; preserve a instalação e a assinatura existentes. A opção antiga **Avisar ao terminar** agora se chama **Notificações da sessão** e mantém a escolha salva.

## Primeira instalação por USB

1. No celular, habilite Opções do desenvolvedor e Depuração USB. Normalmente, as opções são liberadas tocando sete vezes em Número da versão.
2. Conecte por cabo de dados, desbloqueie e aceite a autorização de depuração.
3. Pare o Metro anterior com Ctrl+C.
4. No terminal do projeto, configure o ambiente. Nesta máquina, os caminhos abaixo existem; o Java padrão é 25, portanto selecione explicitamente o JDK 17:

```sh
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/home/d4rks0ul/Android/Sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
java -version
adb devices
```

O aparelho deve aparecer como device. Se aparecer unauthorized, aceite a autorização no celular. Essas variáveis valem para o terminal atual; ajuste os caminhos em outra máquina.

5. Compile e instale:

```sh
npm run android
```

O script executa expo run:android --device. Selecione seu aparelho. Na primeira execução o Expo gera android/ automaticamente, baixa ferramentas, compila e instala. Se faltar uma versão do SDK, instale-a pelo SDK Manager do Android Studio conforme o erro. Esse fluxo local não exige EAS, conta Expo ou publicação na loja.

O comando também inicia o Metro. Abra o Pomodog instalado. O development build já foi usado pelo usuário no aparelho; export Android verifica JavaScript e não substitui instalação/teste nativo.

## Nas próximas execuções

```sh
npm start
```

Usa expo start --dev-client. Se a conexão USB não alcançar o servidor:

```sh
adb reverse tcp:8081 tcp:8081
```

Com múltiplos dispositivos, use adb -s SERIAL reverse tcp:8081 tcp:8081. Por Wi-Fi, mantenha celular e computador na mesma rede e abra o servidor no launcher do development build. Para limpar cache, use npm start -- --clear. Não abra o QR code no Expo Go.

Mudanças em TypeScript/JSX normalmente usam Fast Refresh. Ao adicionar dependência nativa, recompile com npm run android. Ao alterar plugins/app.json, sincronize antes:

```sh
npx expo prebuild --platform android
npm run android
```

android/ permanece ignorado pelo Git. Não use prebuild --clean sem revisar possíveis alterações nativas manuais.

A revisão de segurança de 03/10/2026 adicionou SecureStore e política de backup. Recompile e atualize a instalação anterior com a mesma assinatura para validar migração do login; não desinstale antes desse teste. Confira [roteiro de segurança](seguranca.md#verificação-necessária-no-aparelho--antes-da-loja). Fast Refresh sozinho não adiciona o módulo nativo ao binário.

## Validar avisos

- Ative Ajustes → Notificações da sessão e conceda permissão.
- Inicie foco e abra a gaveta de notificações: confira “Foco em andamento” e a contagem regressiva. Repita no descanso.
- Saia do app e bloqueie a tela; a contagem deve acompanhar o tempo restante. A visibilidade na tela bloqueada respeita os ajustes do Android.
- Toque na notificação: o Pomodog deve reabrir mantendo a sessão.
- Conclua um descanso com tela bloqueada e confira o aviso.
- No término, a contagem deve desaparecer e o aviso de conclusão continuar funcionando.
- Pause: a contagem e o aviso agendado devem ser cancelados. Retome: devem acompanhar o novo término.
- Verifique reinício, desativação, saída/troca de conta e exclusão de dados com aviso pendente; não deve restar contagem da sessão anterior.
- Negue/revogue a permissão e confira a mensagem curta em Ajustes.
- Voltar ao app perto do término não cancela o aviso existente (idempotência).

Erros técnicos ficam apenas no console de desenvolvimento, com prefixo [Pomodog notifications]. O Android pode atrasar ou silenciar avisos; esta versão não pede acesso especial a alarmes exatos.

A contagem usa um canal silencioso **Timer em andamento**, separado de **Conclusão de sessões**. Confira se ambos estão permitidos nas configurações do Android. Em Android 7, a limpeza no término usa alarme não exato e pode atrasar. iOS conserva o aviso de conclusão, sem contagem regressiva nesta versão; web não oferece notificações.

### Diagnóstico `__DEV__`

Em desenvolvimento, o console exibe logs `[Pomodog notifications]` com:

- `permitted=true/false` — resultado da consulta de permissão
- `cancelled` — cancelamento executado
- `scheduled id=... mode=... deadline=...` — agendamento com identificador retornado
- `pending mode=... deadline=...` — pedido pendente encontrado
- `pending=none` — nenhum pedido pendente
- `pending=invalid-metadata` — pedido sem metadata válida

Esses logs não aparecem em produção. Não há diagnóstico técnico na interface.

Referência: [development builds do Expo](https://docs.expo.dev/develop/development-builds/introduction/).

## Integrações nativas

Mudanças em módulos/plugins de Firebase ou Sentry exigem sincronizar/reinstalar pelos comandos gerais acima. Expo Go não valida essas integrações. Roteiros de consentimento, DebugView, mapas e crashes ficam nos guias específicos, sem duplicar instalação aqui.
