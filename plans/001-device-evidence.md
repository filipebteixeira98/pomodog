# 001 — Evidências do dispositivo

> Template para registro de evidências reais. Não deduzir valores a partir do computador. Marcar desconhecidos como PENDENTE.

## Ambiente

| Campo | Valor |
| --- | --- |
| Commit | PENDENTE |
| Data | PENDENTE |
| Expo SDK | PENDENTE |
| expo-notifications | PENDENTE |
| expo-dev-client | PENDENTE |
| Android API | PENDENTE |
| Fabricante/Modelo | PENDENTE |
| Runtime aberto | PENDENTE (Expo Go / development build) |
| Versão do app | PENDENTE |
| Origem/data da última compilação | PENDENTE |

## Estado do teste

| Campo | Valor |
| --- | --- |
| Estado do app no teste | PENDENTE (ativo / background / tela bloqueada) |
| Permissão global | PENDENTE (concedida / negada) |
| Canal `pomodog-sessions` | PENDENTE (existente / bloqueado / com som) |
| DND / economia de bateria | PENDENTE |

## Sintoma

- [ ] Não apareceu na bandeja
- [ ] Sem som/banner
- [ ] Outro: PENDENTE

## Instrumentação `__DEV__`

Logs `[Pomodog notifications]` no console de desenvolvimento:

| Momento | Log esperado |
| --- | --- |
| Permissão consultada | `permitted=true/false` |
| Cancelamento | `cancelled` |
| Agendamento | `scheduled id=... mode=... deadline=...` |
| Pendente encontrado | `pending mode=... deadline=...` |
| Pendente ausente | `pending=none` |
| Metadata inválida | `pending=invalid-metadata` |

## Matriz física

| Caso | Modo | Estado | Deadline | Pedido observado | Recebido | Cancelamentos | Resultado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Foco com app ativo | focus | active | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Descanso com app ativo | break | active | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Foco em background | focus | background | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Descanso com tela bloqueada | break | locked | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Voltar perto do término | focus | active | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Pause antes do prazo | focus | paused | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Reset antes do prazo | focus | idle | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Resume | focus | running | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Desabilitar opção | focus | running | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Excluir dados | focus | running | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Negar permissão | focus | running | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Canal bloqueado | focus | running | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |
| Reabrir após término | focus | completed | PENDENTE | PENDENTE | PENDENTE | PENDENTE | PENDENTE |

## Conclusão

- Causa confirmada: PENDENTE
- Hipótese: PENDENTE
- Inconclusivo: PENDENTE
