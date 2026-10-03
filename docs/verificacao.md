# Verificação — evidências vigentes

Consolidado em 03/10/2026. Registra o que foi verificado e seus limites; status de funcionalidades fica no [Plano de ação](plano-de-acao.md). Resultados datados anteriores, comandos já executados, IDs de eventos e capturas estão no [histórico de verificação](historico/verificacao.md).

## Última verificação de código

Na entrega da tela de notificações (commit `9b1d9a5`, 03/10/2026): TypeScript, 84 testes e export Android/Hermes passaram. Não foram executados novamente para a consolidação documental.

Os testes cobrem timer/restauração, calendário/progresso, persistência/migração, conta/exclusão, agendamento, consentimento e filtragem. Três testes novos exercitam ações da tela com hooks isolados: recusa, negação seguida de recusa, bloqueio de duplicação e ausência de navegação após desmontagem. Não comprovam permissão nativa nem entrega de aviso.

## Confirmações e limites

| Área                             | Evidência disponível                                                                                       | Limite da confirmação                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Mascote, progresso e alimentação | Usuário confirmou entregas funcionando no aparelho durante a sequência de desenvolvimento.                 | Não equivale a teste de desempenho em release ou todos os aparelhos.                        |
| Notificações de conclusão        | Usuário confirmou foco/descanso no aparelho físico, inclusive com tela bloqueada.                          | Não comprova iOS, push remoto ou todos os cenários de revogação/cancelamento.               |
| Google OAuth e Firestore         | Usuário confirmou login e registro no banco no aparelho.                                                   | Conflitos entre dispositivos, produção e cenários de falha requerem verificação específica. |
| Exclusão de conta                | Usuário confirmou operação no aparelho; testes automatizados cobrem falha parcial/retomada e paginação.    | Relato não detalha cada registro remoto; coordenação entre dispositivos ainda não existe.   |
| Regras Firestore                 | Testes no emulador `demo-pomodog`: proprietário autorizado; outra conta/visitante bloqueados.              | Não equivale a testar todo fluxo em dois dispositivos reais.                                |
| Sentry/source maps de exports    | Eventos sintéticos confirmados em POMODOG-1/POMODOG-2; web/Android resolveram App.tsx:20:1.                | Não são crashes reais de aparelho nem mapas do APK release.                                 |
| Crashes Java/Kotlin              | Compilação Kotlin/testes nativos de filtragem passaram.                                                    | Crash real, reabertura, revogação e cache offline ainda não confirmados no dashboard.       |
| Firebase Analytics               | Usuário confirmou eventos no DebugView; teste usa validador do SDK com ponte substituída.                  | Não comprova retenção, revogação ou processamento em relatórios normais.                    |
| Privacidade inicial              | Primeira versão validada pelo usuário no aparelho; navegador verificou recusa, tour, reabertura e retorno. | Revisão com dois botões ainda sem confirmação física específica.                            |
| Oferta de notificações           | TypeScript, testes de ações e export Android passaram.                                                     | Interface/permissão no aparelho ainda sem confirmação; aviso existente já estava validado.  |
| Ícone e splash                   | Assets/configuração/exports verificados.                                                                   | Aparência final e abertura a frio de release ainda não verificadas.                         |

## Tamanhos medidos

Medidas locais de 03/10/2026, MB decimais, sem compressão de transporte para export:

| Artefato                            | Tamanho  | Referência                          |
| ----------------------------------- | -------- | ----------------------------------- |
| Bundle Android/Hermes               | 6,38 MB  | Export Android de 03/10/2026.       |
| Export Android com assets/metadados | 6,88 MB  | Mesmo export.                       |
| APK debug                           | 86,50 MB | APK arm64-v8a gerado em 02/10/2026. |

Release, download pela loja e espaço instalado ainda não medidos. Bundle/export já usam configuração de produção; APK debug não prevê tamanho do download final. Metas de redução/desempenho serão definidas após referência de release.

## Roteiros e capturas

- Instalação, avisos e logs: [Development build](development-build.md).
- Consentimento/DebugView/relatórios: [Analytics](analytics.md#roteiro-de-validação).
- Erros, mapas e crash controlado: [Sentry](sentry.md#verificação).
- Capturas: [catálogo](screenshots/README.md). Elas representam etapas datadas, não necessariamente a interface vigente.

## Debug de Analytics mantido

Usuário pediu manter debug no aparelho em 02/10/2026; consulta ADB confirmou a propriedade naquela sessão. Esta consolidação não consultou nem alterou o dispositivo. Ao preparar publicação ou relatórios normais, conferir valor e lembrar da remoção conforme [lembrete vigente](analytics.md#lembrete-vigente-manter-debug-durante-desenvolvimento).
