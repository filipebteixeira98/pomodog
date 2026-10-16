# Development build no Android pessoal

Guia de instalação, execução e logs. Evidências em [Verificação](verificacao.md); procedimentos de observabilidade em [Analytics](analytics.md) e [Sentry](sentry.md).

É uma instalação própria do Pomodog com as bibliotecas nativas do projeto. Abra o Pomodog instalado, não o Expo Go. Os dados locais ficam separados; o histórico do Expo Go não será migrado automaticamente.

Preparados no repositório: expo-dev-client, scheme pomodog, identificador Android com.filipebteixeira98.pomodog e plugin expo-notifications. Revise o identificador antes de publicar na Play Store.

A entrega de privacidade de 05/10/2026 exige novo development build: a ponte de consentimento de uso e o provider anterior ao Firebase são nativos. Reload do Metro não os adiciona. Atualizar por cima preserva dados; não desinstalar apenas para atualizar. Escolhas opcionais antigas, sem evidência da versão do aviso, precisam ser feitas novamente em Ajustes.

A contagem (10/10/2026) e os controles **Pausar/Retomar** (11/10/2026) nas notificações também exigem prebuild e novo APK, pois adicionam ponte e serviço nativos. Use os comandos de atualização abaixo; preserve a instalação e a assinatura existentes. A opção antiga **Avisar ao terminar** agora se chama **Notificações da sessão** e mantém a escolha salva.

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
- Com o app em segundo plano, toque **Pausar** na notificação: o aplicativo não deve abrir; o tempo fica congelado, o aviso agendado é cancelado e o botão muda para **Retomar**.
- Aguarde alguns segundos e toque **Retomar**: a contagem deve continuar do tempo preservado, com novo prazo e aviso de término. Repita durante o descanso.
- Volte ao aplicativo após cada ação: timer e botão principal devem refletir a notificação. A pausa feita dentro do aplicativo também mantém a notificação com **Retomar**.
- Verifique os controles após o sistema encerrar o processo em segundo plano; isso difere de **Forçar parada**, que bloqueia a execução do aplicativo pelo sistema. Não apague dados nem desinstale para simular esse cenário.
- Para esse teste no development build, mantenha o Metro na porta padrão **8081** e a conexão acessível. Sem a interface já carregada, o React Native inicia pelo endereço padrão do bundler; selecionar outra porta apenas no launcher não configura esse início. O build de release usa o JavaScript incluído no APK.
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

## Widget de progresso Android

Após incluir o widget ou alterar seu layout, execute novamente o prebuild e instale um development build pelos comandos deste guia. A revisão visual de 11/10/2026 separa sessões/minutos de hoje em cards e o resumo semanal em uma faixa; Fast Refresh não atualiza esses recursos nativos. Expo Go não inclui o provider.

1. Abra o Pomodog uma vez para carregar o histórico local ou da conta.
2. Na tela inicial do Android, mantenha uma área vazia pressionada → **Widgets** → **Pomodog / Seu ritmo**. Arraste o widget para a tela inicial; o caminho pode variar conforme o launcher.
3. Compare dias consecutivos, sessões/minutos de hoje e minutos dos últimos sete dias com Progresso. Nenhum login é necessário; o widget acompanha a conta ou modo local atualmente em uso.
4. Conclua um foco, pause/retome outro pela notificação e reinicie uma sessão. Confira atualização e ausência de crédito antecipado ou de sessões abandonadas; descanso não adiciona foco.
5. Toque no widget: o aplicativo deve abrir. Teste redimensionamento, fontes maiores e duas instâncias na tela inicial.
6. Saia/troque de conta, apague dados e exclua a conta: não devem permanecer estatísticas do proprietário anterior. O estado sem histórico mostra zero e um convite discreto para abrir o app.
7. Confira depois da meia-noite e de mudanças de fuso. Os cálculos são locais e não precisam de Metro, mas o Android pode adiar atualizações não exatas. Forçar parada suspende o aplicativo até nova abertura; não use esse procedimento para simular encerramento normal do processo.

Esta entrega é Android; não adiciona widget iOS nem depende da autorização de notificações ou coleta opcional. O progresso fica visível na tela inicial para quem puder vê-la.

## Integrações nativas

Mudanças em módulos/plugins de Firebase ou Sentry exigem sincronizar/reinstalar pelos comandos gerais acima. Expo Go não valida essas integrações. Roteiros de consentimento, DebugView, mapas e crashes ficam nos guias específicos, sem duplicar instalação aqui.

O compartilhamento de progresso de 15/10/2026 adiciona `expo-sharing` e também exige novo development build com `npm run android`. Reload do Metro não inclui esse módulo; a prévia pode abrir no APK antigo, mas o envio não estará disponível. Atualize por cima com a mesma assinatura para preservar os dados.

### Validar compartilhamento

1. Em Progresso, toque **Compartilhe seu progresso**. Confira Nino, dias consecutivos, minutos e sessões dos últimos sete dias; nome/e-mail não aparecem.
2. Feche e reabra a prévia; nenhum envio deve acontecer sem tocar **Compartilhar imagem**.
3. Compartilhe para um aplicativo instalado que aceite PNG. Confira a imagem recebida e cancele antes de publicar se estiver apenas testando. Os ícones no botão são ilustrativos; a lista de destinos vem do sistema.
4. Cancele a janela do sistema e tente novamente. Confira também sem histórico, sem login e com fonte maior/TalkBack. Recusar uso/diagnóstico não deve impedir compartilhar.
5. Apagar dados locais ou excluir a conta limpa as imagens temporárias internas. Cópias que você salvou ou compartilhou em outros aplicativos precisam ser removidas nesses destinos.

A web oferece **Salvar imagem**, com download local do mesmo cartão. Não há integração direta com contas de redes sociais nesta entrega.

## Google Agenda

Primeira versão Android, com os módulos Google Sign-In e Notifications já presentes no development build. Esta entrega não adiciona dependências nativas; use o APK que já inclui esses módulos e recarregue o JavaScript. Expo Go não substitui essa instalação.

### Configuração do projeto Google

- Google Calendar API habilitada em `pomodog-dev-2026` em 15/10/2026. O cliente OAuth existente é reutilizado; não há chave secreta ou refresh token novo no aplicativo.
- Em [Google Auth Platform — Acesso a dados](https://console.cloud.google.com/auth/scopes?project=pomodog-dev-2026), revisar o escopo `https://www.googleapis.com/auth/calendar.freebusy`. Não pedir `calendar` ou `calendar.readonly`, que dão acesso além da disponibilidade necessária.
- Em Público-alvo, conferir usuários de teste quando o projeto estiver em teste. Essa configuração do consentimento não foi alterada automaticamente; o teste real deve usar uma conta autorizada. Antes da loja, concluir publicação/verificação que o Google exigir para o escopo.
- Login Google e autorização de agenda são decisões separadas. Conectar agenda no modo local não registra uma conta Firebase. Desconectar para de consultar e limpa dados locais; retirar todo o consentimento do aplicativo é uma ação na Conta Google e também pode exigir novo login.

Referências: [FreeBusy](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query) e [escopos do Calendar](https://developers.google.com/workspace/calendar/api/auth).

### Validar no aparelho

1. Abra Ajustes → Google Agenda. Escolha faixa e dias de foco; o padrão é 09:00–18:00 em dias úteis, buscando espaço amanhã. Autorize a agenda em Conectar Google Agenda. Confira o acesso de disponibilidade, sem permissão de edição.
2. Crie um compromisso **ocupado** amanhã, dentro da faixa, deixando tempo antes dele para foco, descanso e dez minutos de margem. Em Salvar rotina, confirme a consulta. Em Foco, a sugestão deve aparecer entre sessões; Preparar foco não inicia o timer.
3. Remova/mova o compromisso ou marque como livre e salve a rotina novamente. Sem conflito, a sugestão deve desaparecer. Teste compromisso de dia inteiro, períodos sobrepostos, dia excluído e ausência de janela.
4. Habilite Antecipar para hoje para buscar espaço hoje quando amanhã interferir na rotina. A sugestão deve respeitar disponibilidade de hoje e nunca começar no passado. Desabilitar volta a procurar amanhã.
5. Habilite Lembretes da agenda e conceda permissão. Escolha um horário futuro de 07:00 a 21:00, anterior à faixa de foco do próprio dia sugerido. Se já passou, não há aviso imediato, apenas sugestão no app.
6. Aguarde o aviso com app em segundo plano/tela bloqueada. Deve informar só o foco sugerido, sem dados do compromisso. Confira que as notificações de conclusão continuam funcionando e seus switches são independentes.
7. Retome repetidamente: consultas automáticas respeitam 30 minutos, inclusive após falhas. Salvar rotina ou alterar tempos de foco/descanso atualiza por ação explícita. Não há atualização contínua com app fechado.
8. Teste Agora não, desligamento dos lembretes, desconexão, recusa/revogação no Google, rede indisponível, saída/troca de conta e exclusão local/de conta. Não deve reaparecer sugestão/aviso da conexão anterior após uma resposta atrasada.

O Google decide quais eventos bloqueiam FreeBusy; múltiplas agendas não estão incluídas. O Android pode adiar avisos, e compromissos alterados após a consulta só serão considerados ao retornar/atualizar. Validação com respostas sintéticas não comprova autorização real da conta.
