# Plano de ação — experiência, organização e autonomia

Implementação gradual, com Conventional Commits em inglês. Preservar Android/web, os dados já salvos e o uso sem conta.

| Etapa | Entrega e critério de conclusão                                                                                                                            | Estado    |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1     | Imports ordenados automaticamente pelo Prettier, preservando imports com efeitos colaterais, e verificação reproduzível                                    | Concluída |
| 2     | Ajustes como terceira aba; preferências e introdução acessíveis ali; área de perfil recebe identidade real quando disponível e mostra modo local sem conta | Concluída |
| 3     | Mascote com nome centralizado, entrada animada, movimento do corpo/cauda e caixas de diálogo; navegação manual e movimento reduzido                        | Concluída |
| 4     | Exportar/apagar dados locais, confirmação de exclusão, validação e recuperação segura de armazenamento corrompido; sem telemetria                          | Concluída |
| 5     | Testes de regressão, navegador, exportações web/Android, atualização das decisões e envio dos commits                                                      | Concluída |

## Limites e dependências da entrega inicial

- Ainda não existe autenticação. Preparar a apresentação de identidade sem inventar um cliente, coletar credenciais ou escolher um serviço de contas implicitamente. Integrar login/sincronização em uma etapa própria quando definidos.
- Nome do cão: Nino como proposta provisória, sujeito à preferência do usuário. Centralizar para facilitar mudanças.
- Defesa em profundidade nesta entrega: limites e validação de registros, exportação apenas por ação explícita, exclusão restrita aos dados do aplicativo e prevenção de sobrescrita silenciosa de dados ilegíveis. Não prometer criptografia que não existe.
- Permanecem no planejamento: notificações e teste em Android físico, licenças de LoFi, autenticação opcional e testes de monetização. Essas decisões não bloqueiam as melhorias atuais.

## Evidência esperada

Imports verificados; timer e persistência sem regressão; três abas funcionais; guia acessível com/sem animação; exportação JSON legível; exclusão confirmada e durável; dados antigos preservados; nenhuma identidade fictícia na interface.

## Entrega de 26/09/2026

Nino permanece provisório. Os controles locais, as três abas, os diálogos animados e a ordenação automática foram implementados. Evidências e limitações em [Verificação](verificacao.md). A integração de autenticação permanece uma etapa futura; somente o contrato de identidade e sua apresentação estão preparados.

## Próximo ciclo — sequência proposta

Backlog registrado após a discussão das 15 sugestões. A ordem abaixo é uma proposta de execução, não uma indicação de funcionalidades implementadas. A primeira implementação, migração de imports relativos para aliases, foi concluída. A frente visual foi reordenada por preferência do usuário: ícone/splash, animação corporal e, por último, Pencil.

| Ordem | Frente                 | Entregas planejadas                                                                                                                                                               | Estado       |
| ----- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1     | Organização técnica    | Substituir imports relativos por aliases, manter ordenação automática e validar resolução em testes e exports web/Android                                                         | Concluída    |
| 2     | Identidade visual      | Ícone e splash implementados; depois melhorar animação corporal; por último registrar layouts, templates, paleta, tipografia e componentes no Pencil                              | Em andamento |
| 3     | Progresso e incentivo  | Ampliar dashboard e estatísticas; interação de alimentar pets e frases gentis de incentivo                                                                                        | Planejada    |
| 4     | Lembretes opcionais    | Lembretes de rotina, alimentação e inatividade; definir notificações locais versus push, frequência e controles do usuário                                                        | Planejada    |
| 5     | Contas e sincronização | Diagramas UML de classes/casos de uso e modelo lógico; Firebase/Firestore separados para homologação e produção; Google OAuth via MCP Firebase; exclusão de conta e dados remotos | Planejada    |
| 6     | Monetização e social   | Personalização paga de mascotes, outros animais e nomes; compartilhamento em redes sociais; depois, pontuação, descoberta de amigos e ciclos em conjunto                          | Planejada    |
| 7     | Publicação             | Título, descrição e screenshots para Google Play Console, coerentes com a versão entregue                                                                                         | Planejada    |

Analytics, eventos e heatmaps são uma frente transversal com decisão pendente de privacidade; não habilitar coleta apenas por constarem no backlog. Definir escopo antes de posicionar sua implementação na sequência. Detalhes e dependências em [Próximas etapas](proximas-etapas.md).

## Regra de execução por funcionalidade

1. Delimitar uma funcionalidade e seus critérios de conclusão; decompor cada frente da tabela em entregas pequenas.
2. Implementar e validar com verificações adequadas à mudança.
3. Atualizar os documentos pertinentes no mesmo commit, distinguindo planejado, implementado e verificado.
4. Criar o commit correspondente em inglês, seguindo Conventional Commits, e enviá-lo ao repositório remoto antes de iniciar a próxima funcionalidade.

Manter o plano para andamento; próximas etapas para pendências e decisões; arquitetura para mudanças técnicas/modelo de dados; verificação para evidências e limitações; produto e validação para hipóteses e decisões de experiência. As entregas realizadas estão identificadas pelo estado e pelas evidências registradas.

## Entregas da identidade visual

1. **Ícone e splash:** assets derivados do Nino, ícone adaptativo/monocromático Android, favicon e configuração nativa implementados. Verificações de arquivos, tipos, testes e exports registradas; inspeção em build de release ainda pendente.
2. **Animação corporal:** próxima implementação, em commit próprio.
3. **Pencil:** depois das animações, registrar layouts atuais, paleta, tipografia, componentes reutilizáveis e templates.

## Ajuste pontual do onboarding

Removido o controle local de pausar/ativar movimentos e seu estado duplicado. A preferência permanece em Ajustes e respeita movimento reduzido do sistema. Esta entrega não altera a sequência de animação corporal e Pencil.

## Navegação do onboarding por gestos

Implementada navegação horizontal para avançar/voltar, removendo Continuar e Voltar. Mantidos Pular e o botão final Ir para meu foco. Indicativo curto com ícone e pontos acionáveis oferecem orientação e alternativa acessível. Sem avanço automático. A próxima entrega planejada continua sendo animação corporal.
