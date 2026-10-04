# Verificação — evidências vigentes

Consolidado em 03/10/2026. Registra o que foi verificado e seus limites; status de funcionalidades fica no [Plano de ação](plano-de-acao.md).

## Última verificação de código

Na revisão de segurança/refatoração de 03/10/2026: TypeScript e **92 testes** passaram. As regras Firestore passaram por **73 verificações no emulador** e foram publicadas pela CLI em `pomodog-dev-2026`; leitura remota confirmou o novo conteúdo. O primeiro retorno de sucesso do MCP não foi aceito como prova isolada, pois a leitura ainda mostrava a versão anterior.

Os testes cobrem timer/restauração, calendário/progresso, persistência/migração, conta/exclusão, agendamento, consentimento e filtragem. A revisão acrescentou cinco testes de armazenamento seguro (migração, falhas e logout concorrente) e três de ações dos cartões compartilhados de consentimento. O teste legado de exportação agora verifica a sanitização da persistência em uso. Testes com hooks isolados não comprovam comportamento visual ou permissão nativa no aparelho.

Prebuild, APK debug arm64-v8a e processamento de recursos de release passaram (`assembleDebug` e `processReleaseResources`). Manifests finais de debug/release confirmaram backup desabilitado, regras de exclusão e ausência de permissões de armazenamento externo/AD_ID. Release também não pede sobreposição nem permite HTTP claro; debug preserva Metro e menu de desenvolvimento. A inspeção do APK confirmou SecureStore nativo e XMLs de backup empacotados. Certificado de desenvolvimento corresponde ao cadastro Google OAuth. O APK não foi instalado no aparelho nesta revisão; não foi gerado APK/AAB completo de release.

Bundle Android de release foi gerado pelo Gradle; inspeção do mapa não encontrou `braces`, `node-forge`, `@grpc/grpc-js`, `uuid` ou `expo-sharing` entre suas fontes. Consulta online de dependências: 39 pacotes sinalizados antes, 26 após, derivados de dois avisos sem patch publicado. Export web, TypeScript, formatação, links locais e preservação dos 70 itens do backlog passaram. Alcance e limites em [Segurança](seguranca.md).

## Confirmações e limites

| Área                             | Evidência disponível                                                                                                                     | Limite da confirmação                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Mascote, progresso e alimentação | Usuário confirmou entregas funcionando no aparelho durante a sequência de desenvolvimento.                                               | Não equivale a teste de desempenho em release ou todos os aparelhos.                        |
| Notificações de conclusão        | Usuário confirmou foco/descanso no aparelho físico, inclusive com tela bloqueada.                                                        | Não comprova iOS, push remoto ou todos os cenários de revogação/cancelamento.               |
| Google OAuth e Firestore         | Usuário confirmou login e registro no banco no aparelho.                                                                                 | Conflitos entre dispositivos, produção e cenários de falha requerem verificação específica. |
| Exclusão de conta                | Usuário confirmou operação no aparelho; testes automatizados cobrem falha parcial/retomada e paginação.                                  | Relato não detalha cada registro remoto; coordenação entre dispositivos ainda não existe.   |
| Regras Firestore                 | 73 verificações: proprietário autorizado; outra conta/visitante bloqueados para leitura/escrita/exclusão; esquemas inválidos rejeitados. | Não equivale a testar todo fluxo em dois dispositivos reais.                                |
| Armazenamento de autenticação    | Adapter seguro com migração e fila: cinco testes passaram; módulo incluído no bundle Android.                                            | Criptografia real/migração no aparelho, disponibilidade e iOS ainda requerem validação.     |
| Sentry/source maps de exports    | Eventos sintéticos confirmados em POMODOG-1/POMODOG-2; web/Android resolveram App.tsx:20:1.                                              | Não são crashes reais de aparelho nem mapas do APK release.                                 |
| Crashes Java/Kotlin              | Compilação Kotlin/testes nativos de filtragem passaram.                                                                                  | Crash real, reabertura, revogação e cache offline ainda não confirmados no dashboard.       |
| Firebase Analytics               | Usuário confirmou eventos no DebugView; teste usa validador do SDK com ponte substituída.                                                | Não comprova retenção, revogação ou processamento em relatórios normais.                    |
| Privacidade inicial              | Primeira versão validada pelo usuário no aparelho; navegador verificou recusa, tour, reabertura e retorno.                               | Revisão com dois botões ainda sem confirmação física específica.                            |
| Oferta de notificações           | TypeScript, testes de ações e export Android passaram.                                                                                   | Interface/permissão no aparelho ainda sem confirmação; aviso existente já estava validado.  |
| Ícone e splash                   | Assets/configuração/exports verificados.                                                                                                 | Aparência final e abertura a frio de release ainda não verificadas.                         |

## Tamanhos medidos

Medidas locais de 03/10/2026, MB decimais, sem compressão de transporte para export:

| Artefato                            | Tamanho  | Referência                                                   |
| ----------------------------------- | -------- | ------------------------------------------------------------ |
| Bundle Android/Hermes               | 6,38 MB  | Export anterior à revisão de segurança, 03/10/2026.          |
| Export Android com assets/metadados | 6,88 MB  | Mesmo export anterior à revisão de segurança.                |
| APK debug                           | 86,64 MB | APK arm64-v8a da revisão de segurança, gerado em 03/10/2026. |

Release, download pela loja e espaço instalado ainda não medidos. Bundle/export já usam configuração de produção; APK debug não prevê tamanho do download final. Metas de redução/desempenho serão definidas após referência de release.

## Roteiros e capturas

- Instalação, avisos e logs: [Development build](development-build.md).
- Consentimento/DebugView/relatórios: [Analytics](analytics.md#roteiro-de-validação).
- Erros, mapas e crash controlado: [Sentry](sentry.md#verificação).
- Capturas: [catálogo](screenshots/README.md). Elas representam etapas datadas, não necessariamente a interface vigente.

## Debug de Analytics mantido

Usuário pediu manter debug no aparelho em 02/10/2026; consulta ADB confirmou a propriedade naquela sessão. Esta consolidação não consultou nem alterou o dispositivo. Ao preparar publicação ou relatórios normais, conferir valor e lembrar da remoção conforme [lembrete vigente](analytics.md#lembrete-vigente-manter-debug-durante-desenvolvimento).
