# Plano de ação — experiência, organização e autonomia

Implementação gradual, com Conventional Commits em inglês. Preservar Android/web, os dados já salvos e o uso sem conta.

| Etapa | Entrega e critério de conclusão                                                                                                                            | Estado           |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1     | Imports ordenados automaticamente pelo Prettier, preservando imports com efeitos colaterais, e verificação reproduzível                                    | Em implementação |
| 2     | Ajustes como terceira aba; preferências e introdução acessíveis ali; área de perfil recebe identidade real quando disponível e mostra modo local sem conta | Planejada        |
| 3     | Mascote com nome centralizado, entrada animada, movimento do corpo/cauda e caixas de diálogo; navegação manual e movimento reduzido                        | Planejada        |
| 4     | Exportar/apagar dados locais, confirmação de exclusão, validação e recuperação segura de armazenamento corrompido; sem telemetria                          | Planejada        |
| 5     | Testes de regressão, navegador, exportações web/Android, atualização das decisões e envio dos commits                                                      | Planejada        |

## Limites e dependências explícitas

- Ainda não existe autenticação. Preparar a apresentação de identidade sem inventar um cliente, coletar credenciais ou escolher um serviço de contas implicitamente. Integrar login/sincronização em uma etapa própria quando definidos.
- Nome do cão: Nino como proposta provisória, sujeito à preferência do usuário. Centralizar para facilitar mudanças.
- Defesa em profundidade nesta entrega: limites e validação de registros, exportação apenas por ação explícita, exclusão restrita aos dados do aplicativo e prevenção de sobrescrita silenciosa de dados ilegíveis. Não prometer criptografia que não existe.
- Permanecem no planejamento: notificações e teste em Android físico, licenças de LoFi, autenticação opcional e testes de monetização. Essas decisões não bloqueiam as melhorias atuais.

## Evidência esperada

Imports verificados; timer e persistência sem regressão; três abas funcionais; guia acessível com/sem animação; exportação JSON legível; exclusão confirmada e durável; dados antigos preservados; nenhuma identidade fictícia na interface.
