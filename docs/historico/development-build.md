> Arquivo histórico: versão preservada antes da consolidação de 03/10/2026. Pode conter decisões superadas; consulte a [documentação vigente](../README.md).

# Development build no Android pessoal

É uma instalação própria do Pomodog com as bibliotecas nativas do projeto. Abra o Pomodog instalado, não o Expo Go. Os dados locais ficam separados; o histórico do Expo Go não será migrado automaticamente.

Preparados no repositório: expo-dev-client, scheme pomodog, identificador Android com.filipebteixeira98.pomodog e plugin expo-notifications. Revise o identificador antes de publicar na Play Store.

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

O comando também inicia o Metro. Abra o Pomodog instalado. Esta compilação/instalação ainda não foi executada no seu aparelho; export Android verifica JavaScript e não substitui um build nativo.

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

## Validar avisos

- Ative Ajustes → Avisar ao terminar e conceda permissão.
- Conclua um descanso com tela bloqueada e confira o aviso.
- Pause: o aviso anterior deve ser cancelado. Retome: deve acompanhar o novo término.
- Verifique reinício, desativação e exclusão de dados com aviso pendente.
- Negue/revogue a permissão e confira a mensagem curta em Ajustes.
- Voltar ao app perto do término não cancela o aviso existente (idempotência).

Erros técnicos ficam apenas no console de desenvolvimento, com prefixo [Pomodog notifications]. O Android pode atrasar ou silenciar avisos; esta versão não pede acesso especiais a alarmes exatos.

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

## Analytics opcional Android

Firebase Analytics adiciona módulos nativos: sincronize com `npx expo prebuild --platform android --no-install` e reinstale com `npm run android` antes de testar. Expo Go e web não coletam nesta entrega. Habilite a escolha independente em Ajustes somente para testar após vincular projeto a GA4; [Analytics](analytics.md) descreve DebugView e verificação da revogação.
