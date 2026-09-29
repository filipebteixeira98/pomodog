# Planos de execução

Preparados com a skill `improve` em 2026-09-28, sobre `0abb154`. Esta entrega é somente planejamento: código, configurações nativas e documentos de produto não foram alterados.

| Plano | Prioridade | Esforço | Risco | Dependência | Status |
| --- | --- | --- | --- | --- | --- |
| [001 — Entrega dos avisos de conclusão](001-session-notifications.md) | P1 | M | Médio | Nenhuma | A/B DONE, C PENDENTE |

O plano contém três entregas sequenciais, cada uma com seu próprio commit futuro: diagnóstico nativo, correção com testes e validação/documentação. Entregue uma etapa por vez a um executor; revise o resultado antes de avançar. Testes unitários aprovados não substituem a validação no aparelho.

## Evidências e prioridades

| Achado | Evidência | Confiança | Impacto |
| --- | --- | --- | --- |
| Ressincronizar perto do término pode cancelar o aviso existente sem substituí-lo | `src/notifications/sessionScheduler.ts:35`; reprodução determinística no plano | Alta para o defeito; causa do relato ainda desconhecida | Perda de aviso |
| Não há evidência que separe agendamento, entrega e apresentação no dispositivo | `src/notifications/sessionNotifications.ts:78`; testes usam adaptador simulado | Alta | Diagnóstico inconclusivo |
| Guia inicial do README menciona Expo Go, enquanto o fluxo atual usa development build | `README.md`; `docs/development-build.md` | Alta | Teste em runtime inadequado |

Baseline verificada nesta sessão: `npm run typecheck`, `npm test` (34 testes) e `npm run format:check`, todos com sucesso. Não foi executado teste nativo no aparelho nesta investigação.

## Decisões e hipóteses rejeitadas

- O escopo assumido é aviso **local** ao terminar foco/descanso. Push remoto via servidor não é necessário para esse comportamento; depende de uma solicitação explícita de escopo adicional.
- Ausência de permissão de alarme exato não é uma causa confirmada. O produto atualmente aceita entrega sujeita às restrições do Android; não adicionar acesso especial por tentativa.
- Habilitar o switch ou resolver `scheduleNotificationAsync` não comprova entrega.
- Não atribuir o problema atual automaticamente ao antigo erro do Expo Go.
- Não apagar dados, recriar canais ou pedir permissões repetidamente para contornar escolhas do usuário.
- Não introduzir Firebase, analytics, token de push, novas telas ou botão de teste na interface final.

## Uso e atualização

Prompt sugerido: “Execute somente a Entrega A de `plans/001-session-notifications.md`. Leia o arquivo completo, siga os limites e registre evidências. Não avance para a Entrega B. Apresente o diff e os resultados para revisão.” Depois, repetir para B e C.

Estados: TODO, IN PROGRESS, DONE, BLOCKED (com motivo), REJECTED (com justificativa). Marcar DONE somente após os critérios finais, incluindo evidência física. Se faltar acesso ao aparelho, registrar precisamente a validação pendente.

Investigação restrita ao fluxo de notificações e suas dependências diretas. Autenticação, backend, monetização e auditoria geral de segurança/performance não foram avaliados.
