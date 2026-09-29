# 001 — Tornar verificável e corrigir a entrega dos avisos de conclusão

> Executor: leia o plano inteiro antes de editar. Execute apenas a entrega atribuída, com verificações e evidências. Não transforme uma hipótese em correção. Ao concluir, atualize o índice, salvo se o revisor assumir essa responsabilidade.

## Status e objetivo

- Prioridade P1; esforço M; risco médio; categoria bug/diagnóstico/testes.
- Planejado em 2026-09-28, commit `0abb154`; sem dependências externas de implementação.
- A: diagnóstico DONE (instrumentação `__DEV__` + template de evidências). B: correção DONE (idempotência + 13 novos testes). C: aceitação/documentação PENDENTE (requer dispositivo físico).

O usuário habilitou “Avisar ao terminar” em Ajustes e não recebeu avisos ao concluir foco ou descanso no aparelho pessoal. Precisamos identificar onde o fluxo falha, corrigir o defeito demonstrável e validar a entrega nativa. Neste plano, “notificação” significa aviso local agendado no sistema operacional, não mensagem enviada por servidor.

## Contrato de produto

- Local-first, sem login obrigatório, coleta de dados ou telemetria anônima.
- Avisos opcionais, desabilitados por padrão. Pedir permissão somente por ação explícita do usuário.
- Preservar interface enxuta: sem painel técnico, explicações sobre Expo Go ou botão “testar 10 segundos” em Ajustes.
- Manter mensagens curtas de erro em Ajustes; detalhes técnicos somente no desenvolvimento.
- Pausar, reiniciar, desabilitar avisos e apagar dados cancelam o aviso pendente da sessão.
- Retomar agenda o novo término; reconciliar timer após background não deve repetir aviso já entregue.
- Não prometer precisão de alarme exato. O guia atual diz: “esta versão não pede acesso especial a alarmes exatos”.
- Foco e descanso recebem avisos, mas só foco incrementa o histórico. Não mudar essa regra.

## Estado atual e pontos de entrada

Stack: Expo `~57.0.25`, React Native `0.86.3`, React `19.2.3`, TypeScript `~6.0.3`, `expo-notifications` `57.0.21`, `expo-dev-client` `~57.0.19`, npm e package-lock. Confirme versões instaladas antes de seguir documentação de outro SDK.

| Arquivo | Papel |
| --- | --- |
| `src/notifications/sessionScheduler.ts` | Fila serial e decisão de cancelar/agendar |
| `src/notifications/sessionNotifications.ts` | APIs públicas Expo, canal, permissão, handler e trigger DATE |
| `src/notifications/sessionNotifications.web.ts` | Adaptador web sem suporte |
| `src/notifications/diagnostics.ts` | Erros por estágio e causas nativas limitadas |
| `src/hooks/usePomodoro.ts` | Sincronização por mudanças de timer e AppState, opt-in e exclusão |
| `src/features/settings/SettingsScreen.tsx` | Switch e mensagem inline |
| `src/timer.ts` | Timer por deadline absoluto; não usar ticks como origem da entrega |
| `tests/notifications.test.ts` | Testes com adaptador injetado, relógio e promises controláveis |
| `tests/run.mts` | Importa explicitamente os arquivos de testes |

Trechos lidos na investigação, para verificar drift:

```ts
// src/notifications/sessionScheduler.ts:3
export const SESSION_NOTIFICATION_ID = "pomodog-session-end";
export type NotificationAdapter = {
  permitted: () => Promise<boolean>;
  cancel: () => Promise<void>;
  schedule: (deadline: number, mode: Mode) => Promise<void>;
};
// :35 — depois da checagem inicial de completed/deadline expirado
await adapter.cancel();
if (
  timer.status === "running" &&
  timer.deadline !== null &&
  timer.deadline > now()
) {
  await adapter.schedule(timer.deadline, timer.mode);
}
```

`usePomodoro.ts:100` sincroniza após mudanças de status/deadline/mode/preferência e ao voltar a `AppState === "active"`. A fila evita que um agendamento lento sobreviva ao cancelamento seguinte, mas a mesma sessão ainda é cancelada e reagendada a cada sincronização.

```ts
// src/notifications/sessionNotifications.ts:21
const channelId = "pomodog-sessions";
// :82 e :91 — pedido atual
identifier: SESSION_NOTIFICATION_ID,
trigger: {
  type: SchedulableTriggerInputTypes.DATE,
  date: new Date(deadline),
  channelId,
},
```

O handler já solicita banner, lista e som. `requestSessionPermission` cria o canal antes da solicitação. `permitted` consulta permissão do aplicativo; não verifica se o canal foi bloqueado individualmente. O retorno de agendamento é descartado. Nenhuma dessas observações, sozinha, demonstra a causa no aparelho.

`diagnostics.ts` usa `notificationOperation(stage, operation)`, preserva `cause` e registra erros apenas em `__DEV__`. Reutilizar esse padrão; não criar uma segunda infraestrutura de logs.

Android configurado: pacote `com.filipebteixeira98.pomodog`, scheme `pomodog`, plugins `expo-notifications` e `expo-dev-client`. Existe `android/` ignorado; o manifesto fonte não representa sozinho o manifesto final mesclado das dependências. Não concluir falta de `POST_NOTIFICATIONS` apenas lendo esse arquivo.

## Limites de edição

Somente estes arquivos podem ser alterados pelo executor, quando exigidos pela etapa:

- `src/notifications/sessionScheduler.ts`
- `src/notifications/sessionNotifications.ts`
- `src/notifications/sessionNotifications.web.ts`
- `src/notifications/diagnostics.ts`
- `src/notifications/notificationProbe.ts` e `.web.ts` (criar somente se necessário para diagnóstico de desenvolvimento)
- `src/hooks/usePomodoro.ts` (somente integração do ciclo de vida do diagnóstico ou correção demonstrada do fluxo de avisos)
- `tests/notifications.test.ts`
- `README.md`, `docs/development-build.md`, `docs/plano-de-acao.md`, `docs/proximas-etapas.md` (C; confirmar nomes existentes antes de editar)
- `plans/README.md`, este plano e `plans/001-device-evidence.md` (criar para evidências sanitizadas).

Fora do escopo: timer/histórico/preferences/schema de armazenamento, UI, mascote, backend, dependências e lockfile, mudanças nativas ou em `app.json`, credenciais, permissões especiais de alarmes, bibliotecas internas do Expo. Se evidências exigirem algo fora da lista, registrar diagnóstico e devolver ao revisor para ajustar o plano. Não improvisar upgrade ou patch de node_modules.

## Convenções e ferramentas

Imports com alias `#src/*`, ordenados conforme Prettier; testes Node usam sufixo `.ts`. Seguir `tests/notifications.test.ts`: `node:test`, `node:assert/strict`, adaptador injetado e relógio controlado. Não adicionar framework de testes. Funções pequenas por responsabilidade; não criar framework genérico de notificações.

Skills disponíveis úteis ao executor: `investigate-first` em A, `surgical-patch` em B e `verify-and-stop` em C; ler as respectivas instruções se utilizá-las. Consultar Context7: primeiro resolver Expo Notifications, depois buscar a API específica. Documentação consultada nesta investigação: [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/). Conferir também os tipos públicos instalados para SDK 57.

APIs relevantes: `getAllScheduledNotificationsAsync` consulta pendentes; `getPresentedNotificationsAsync` consulta o que ainda está na bandeja; `getNotificationChannelAsync` consulta canal; `addNotificationReceivedListener` observa recebimento enquanto o processo está ativo. Nenhuma delas isoladamente prova toda a cadeia. Um aviso removido da bandeja pode ter sido entregue.

## Comandos e baseline

| Comando | Resultado esperado |
| --- | --- |
| `git status --short` | Identificar alterações prévias; não sobrescrever trabalho alheio |
| `git diff --stat 0abb154..HEAD -- src/notifications src/hooks/usePomodoro.ts tests/notifications.test.ts README.md docs plans` | Comparar alterações com trechos e entregas anteriores |
| `npm run typecheck` | Exit 0 |
| `npm test` | Exit 0; baseline de 34 testes, mais regressões novas |
| `npm run format:check` | Exit 0 |
| `npm run android` | Futuro: build nativo e instalação no aparelho selecionado, exit 0 |
| `npm start` | Futuro: Metro em modo dev-client; encerrar após validação |

Os três checks já passaram na investigação. Build/instalação físicos não foram executados pelo autor do plano. Não existe script `lint`. Não instalar dependências se já disponíveis. Para JDK/Android SDK, seguir os caminhos e verificações de `docs/development-build.md`; não pressupor que existam em outra máquina.

Drift: diferenças decorrentes da entrega anterior são esperadas, mas devem constar da passagem de contexto. Mudança não explicada nas interfaces ou no comportamento exige revisão do plano antes de editar.

## Entrega A — Localizar a falha no aparelho

### A1. Registrar ambiente e separar sintomas

Criar `plans/001-device-evidence.md` com commit, data, versões Expo/notifications/dev-client, Android/API, fabricante/modelo, runtime aberto, versão do app, estado do app no teste, permissão global e canal. Não registrar serial, token, histórico ou dados pessoais. Marcar valores desconhecidos como PENDENTE, nunca deduzir a partir do computador.

Verificar no aparelho se abriu Pomodog instalado ou Expo Go. Separar “não apareceu na bandeja” de “sem som/banner”. Registrar DND e economia de bateria sem exigir que usuário os desabilite permanentemente. Não usar force-stop como equivalente a bloquear tela.

**Verificar:** `adb devices` deve listar aparelho autorizado; não copiar serial para o relatório. `adb shell getprop ro.build.version.sdk` retorna API; `adb shell pm path com.filipebteixeira98.pomodog` retorna caminho do pacote instalado. Esses comandos não provam que o binário é atual: registrar também origem/data da última compilação e runtime visto no aparelho. Se houver vários dispositivos, selecionar explicitamente com `-s`, sem persistir serial.

### A2. Instrumentar somente o necessário

Adicionar observação de desenvolvimento ao fluxo real usando `__DEV__`: estágio, status/mode/deadline, horário, retorno do agendamento, identificador, pendentes próprios e canal/permissão efetivos. Não imprimir payload completo, títulos/corpos, tokens ou todo o estado do aplicativo. Falha da consulta diagnóstica não pode transformar sucesso do agendamento em erro funcional.

Se necessário, criar `notificationProbe.ts` com função explícita para um aviso imediato e outro DATE para 30 segundos, ambos no canal real, com identificadores exclusivos `pomodog-probe-*`. Executar via debugger de desenvolvimento, nunca automaticamente na abertura ou via UI de produção. Documentar exatamente como invocar no runtime escolhido; se isso exigir integração temporária, removê-la antes do commit. Cancelar somente probes próprios ao terminar. Não cancelar a sessão real para testar. Não encurtar durações persistidas do timer.

Listeners adicionados devem ser removidos no cleanup, inclusive no Fast Refresh. Manter implementação web segura. Se usar arquivo adicional, respeitar a lista de escopo; não introduzir dependência nova.

**Verificar:** `npm run typecheck` e `npm test` saem 0. Rodar probes no development build: registrar identificador retornado, pedido pendente antes do prazo e observação após prazo. Nunca escrever “entregue” apenas porque a Promise resolveu. Se não houver aparelho, concluir apenas instrumentação e marcar diagnóstico físico PENDENTE.

### A3. Classificar antes de corrigir

| Evidência | Próxima ação |
| --- | --- |
| Exceção de módulo/provider nativo | Confirmar runtime e sincronização do build; não corrigir com catch silencioso |
| Permissão global negada ou canal bloqueado | Confirmar decisão do sistema/usuário; não recriar canal nem repetir prompt |
| Probe imediato não aparece | Investigar apresentação, handler, canal e permissão antes do scheduler |
| Imediato funciona, DATE fica pendente após prazo | Investigar agendamento/restrições nativas; registrar atraso; não assumir precisão exata |
| Probes funcionam, sessão não entra nos pendentes | Inspecionar chamada do hook, opt-in e storageBlocked, sem desabilitar proteção de dados |
| Pedido correto desaparece depois de voltar ao app | Correlacionar cancelamentos, horários e corrida da Entrega B |
| Chega à bandeja sem som/banner | Classificar como apresentação; não como ausência de entrega |

**Verificar:** `rg -n 'Ambiente|Permissão|Canal|Probe|Sessão|Conclusão|PENDENTE' plans/001-device-evidence.md` deve mostrar seções com resultados e conclusão explícita: causa confirmada, hipótese ou ainda inconclusivo. Não marcar A como diagnóstico completo sem evidências reais. Uma correção nativa fora do escopo bloqueia a resolução do relato, mas não invalida a regressão unitária independente de B.

## Entrega B — Impedir cancelamento redundante e perda do aviso

### B1. Fixar a regressão em teste

Reprodução confirmada no código original: adaptador começa com um pedido existente; `now=1000`, deadline `1500`; `cancel()` remove o pedido e avança relógio para `2000`. `sync(running,true)` retorna com chamadas `[cancel]`, nenhum pedido pendente e nenhum novo agendamento. O prazo venceu durante o await do cancelamento. Voltar ao foreground perto do término pode atingir essa janela.

Adicionar teste com esse cenário em `tests/notifications.test.ts` antes de mudar implementação. Não usar sleeps reais. O cenário deve expressar o resultado desejado: uma sincronização da mesma sessão não cancela seu aviso existente.

**Verificar:** `npm test` deve falhar apenas na nova regressão, pelo cancelamento indevido. Depois da correção, deve passar. Registrar falha inicial e resultado final para revisão.

### B2. Tornar sincronização da mesma sessão idempotente

Estender o adaptador com consulta normalizada do pedido próprio pendente, por exemplo `pending(): Promise<{ deadline: number; mode: Mode } | null>`. Implementar usando API pública Expo e filtrar pelo identificador próprio. Guardar metadata mínima, versionada e validada em `content.data` para comparar mode/deadline sem depender de formato nativo de trigger. Não guardar dados pessoais. Manter web com retorno `null` e mocks coerentes.

Antes de cancelar uma sessão running com prazo futuro, consultar o pedido existente e comparar deadline/mode. Se for o mesmo, preservar: zero cancelamento e zero reagendamento. Não usar somente cache em memória: o processo pode reiniciar com aviso já no SO. Reavaliar prazo após awaits, antes de operações destrutivas. Pedidos legados sem metadata devem ter tratamento documentado: para prazo futuro, substituir de forma controlada; para prazo já vencido, preservar a política atual de não replay. Não tentar adivinhar mode pelo texto traduzido.

Preservar serialização e recuperação da fila após falhas. Continuar cancelando em pause/reset/disable/exclusão; mudança real de deadline ao retomar substitui o pedido anterior. No completed ou prazo já vencido, não disparar notificação imediata de compensação: poderia duplicar a entrega do SO. Se uma substituição real atravessar o prazo e não puder ser concluída com segurança, registrar o resultado explicitamente para diagnóstico; não alegar garantia de entrega nesse limite.

Não introduzir vários IDs de sessão ou um protocolo transacional novo sem revisar o plano. Não usar polling contínuo nem agendar a cada tick. Se o SDK não permitir reconhecer pedidos próprios com os campos previstos, parar e atualizar o contrato com evidências dos tipos/retorno real.

**Verificar:** `npm run typecheck` e `npm test` saem 0. Novo teste consulta o pedido existente e comprova que a chamada redundante não toca nele. Conferir `git diff -- src/notifications src/hooks/usePomodoro.ts tests/notifications.test.ts` para garantir que alterações ficam no contrato necessário.

### B3. Cobrir bordas relevantes

Adicionar/ajustar testes no arquivo existente:

1. Opt-out não pede permissão e cancela.
2. Primeiro start agenda uma vez no prazo e modo corretos.
3. Mesmo prazo/modo, inclusive perto do término: não cancela nem reagenda.
4. Recriar scheduler com pedido existente no SO mantém idempotência.
5. Pause/reset/disable cancelam; resume substitui com novo prazo.
6. Foco e descanso com prazos iguais não são tratados como o mesmo pedido.
7. Completed/expired preservam política de não replay e não cancelam aviso devido.
8. Agendamento lento seguido de cancelamento termina sem pendente.
9. Falhas de leitura/agendamento/cancelamento não envenenam fila; próxima chamada funciona.
10. Metadata ausente/inválida e IDs alheios não são confundidos com a sessão atual.
11. Prazo vencendo durante leitura não leva a cancelar um pedido idêntico.

Manter os testes existentes de causas nativas e preferência. Ajustar expectativas antigas de sequência apenas quando contradisserem intencionalmente a nova idempotência; não removê-las para esconder regressões. Cobrir normalização com função pura exportada no módulo sem import nativo, se necessário, dentro dos arquivos de escopo.

**Verificar:** `npm run typecheck`, `npm test`, `npm run format:check`: exit 0, todos os testes prévios relevantes e novos aprovados. Relatar quantidade efetiva, sem atualizar contagem para um número presumido.

## Entrega C — Validar entrega real e atualizar documentação

### C1. Executar matriz física

Usar development build compatível com dependências atuais. `npm run android` compila/instala quando necessário; Fast Refresh não atualiza módulos nativos. Se plugins/config mudaram, seguir guia de prebuild após revisar alterações nativas manuais; nunca usar `--clean` automaticamente. Não desinstalar nem apagar dados reais como procedimento de diagnóstico.

Registrar cada caso no arquivo de evidências: data, modo, estado, deadline, pedido observado, recebimento/bandeja/som, cancelamentos, resultado PASS/FAIL/PENDENTE. Para teste controlado, observar por 60 segundos após deadline; atraso maior é FAIL desse ensaio com duração registrada, não prova automática de bug JS ou exigência de alarme exato.

| Caso | Esperado |
| --- | --- |
| Foco com app ativo | Um aviso ao fim; histórico incrementa uma vez |
| Descanso com app ativo | Um aviso ao fim; histórico de foco inalterado |
| Foco em background e descanso com tela bloqueada | Entrega nativa sem depender de tick JS |
| Voltar perto do término repetidas vezes | Mesmo pedido preservado; sem duplicação |
| Pause e reset antes do prazo | Pedido removido; nada no prazo antigo |
| Resume | Novo prazo; um aviso somente |
| Desabilitar opção com sessão ativa | Pedido removido |
| Excluir dados com sessão ativa, em instalação de teste sem dados valiosos | Pedido removido, preferência volta ao padrão |
| Negar/revogar permissão | Sem crash; erro curto apenas em Ajustes |
| Canal bloqueado ou som silenciado pelo usuário | Respeitar sistema; registrar distinção entre entrega e apresentação |
| Reabrir após término já entregue | Sem novo aviso da sessão encerrada |

Probes curtos ajudam o diagnóstico, mas validar pelo menos um foco e um descanso com durações reais. Force-stop, reinício do aparelho e políticas agressivas do fabricante são cenários exploratórios separados, não equivalentes ao caso “tela bloqueada”. Não prometer suporte não observado. Sem aparelho, deixar C pendente; testes unitários não autorizam DONE.

**Verificar:** `npm run android` com exit 0 quando recompilado e tabela preenchida por observação real. Todos os casos obrigatórios acima devem ter PASS ou justificativa revisada para comportamento esperado do sistema; FAIL exige diagnóstico adicional. Não automatizar preenchimento de resultados.

### C2. Documentar somente resultados comprovados

Atualizar README para remover instrução contraditória de Expo Go para validação nativa; corrigir contagem fixa de testes ou substituí-la pelo comando. Atualizar `docs/development-build.md` com procedimento confirmado, evidências/limitações e distinção entre agendamento e entrega. Atualizar plano de ação/próximas etapas se esses arquivos existirem com esses nomes; não recriar documentos equivalentes. Marcar implementação e validação física separadamente. Não apresentar push remoto como implementado.

**Verificar:** `rg -n 'Expo Go|dev-client|notifica|testes' README.md docs/development-build.md` deve exibir instruções coerentes; menções explicativas a Expo Go são aceitáveis. `npm run format:check` deve sair 0. `git diff --check` deve sair 0.

## Git, revisão e conclusão

Na execução futura, respeitar mudanças prévias do usuário e usar commits incrementais em inglês, como o histórico `refactor(notifications): ...`. Sugestões, apenas após checks da respectiva entrega:

- A: `chore(notifications): add native delivery diagnostics`
- B: `fix(notifications): preserve matching scheduled session alerts`
- C: `docs(notifications): record verified device behavior`

Adicionar arquivos explicitamente, não `git add .`. Não commitar instrumentação temporária ou evidência sensível. A solicitação atual é planejamento: o autor deste plano não faz commit/push. O executor deve seguir a autorização vigente para publicação e não inferir que este arquivo autoriza deploy.

Critérios finais:

- [ ] `npm run typecheck`, `npm test`, `npm run format:check`, `git diff --check` saem 0.
- [ ] Regressão falhou antes e passou depois; cenário idempotente não cancela pedido existente.
- [ ] Matriz física tem evidências reais, inclusive foco e descanso; pendências não marcadas como sucesso.
- [ ] Revisão de `git diff --name-only` e `git status --short` confirma apenas escopo autorizado.
- [ ] Sem coleta remota, replay imediato, permissões especiais ou mudança de UI não autorizada.
- [ ] Documentos e índice refletem resultado, commits e limitações reais.

STOP e devolva ao revisor se: interfaces mudaram sem explicação; uma verificação falha duas vezes após tentativa razoável; solução exige dependência/config/UI fora do escopo; diagnóstico aponta defeito nativo não coberto; precisão exata torna-se requisito; ou usuário pretende push remoto. Falta de aparelho bloqueia conclusão física, mas permite testes e preparação dentro do escopo. Não continuar experimentando configurações aleatórias.

Para manutenção/review: conferir listeners e cleanup, leitura do SO após restart, metadata validada, compatibilidade web e cancelamento após operações lentas. Mudanças futuras de canal, identificador ou formato de metadata precisam considerar pedidos antigos. Revisar separadamente a evidência de causa do relato e a correção da corrida: uma pode estar resolvida enquanto a outra ainda não.
