# Próximas etapas — decisões ainda abertas

Atualizadas com as sugestões discutidas após a entrega de 26/09/2026. Sequência proposta em [Plano de ação](plano-de-acao.md).

## Nome do mascote

**Nino** foi implementado como nome provisório, centralizado em `src/domain/mascot.ts`. Pode ser alterado após a avaliação do usuário. Não houve pesquisa de marcas.

## Autonomia e privacidade

Direção original e comportamento atual: uso local para quem não se autenticar, sem login obrigatório, sem coleta remota de dados de uso e sem telemetria, inclusive anônima. A nova sugestão de analytics requer uma decisão explícita sobre essa mudança, detalhada abaixo. A versão atual já não integra autenticação ou analytics; timer, preferências e histórico ficam no dispositivo.

Exclusão com confirmação e proteção de registros ilegíveis estão disponíveis. A exportação JSON foi retirada da interface para simplificar o MVP; pode ser reavaliada junto a integrações futuras. Próximas decisões:

1. Definir quais dados existem e explicitar o que sai do dispositivo em cada integração futura.
2. Definir migração dos dados locais para Firebase quando a pessoa optar por autenticação/sincronização.
3. Manter o uso sem conta como fluxo completo. Uma eventual sincronização deve ser opcional e ter regras claras de migração e exclusão.
4. Verificar dependências, crash reporting, música e distribuição para evitar coleta automática introduzida por integrações. Hospedagem e ferramentas de desenvolvimento devem ser avaliadas separadamente do código do app.

## Defesa em profundidade

Planejar a partir de ameaças concretas: dados locais corrompidos, permissões excessivas, dependências comprometidas e, caso existam contas no futuro, acesso indevido e mistura de dados entre pessoas.

- Formato, tamanho e versão já são validados; registros ilegíveis não são sobrescritos. Planejar migrações futuras sem perda silenciosa.
- Solicitar apenas permissões necessárias a recursos explícitos.
- Não embutir segredos no cliente. Usar armazenamento apropriado para credenciais se autenticação vier a existir; AsyncStorage não é um cofre.
- Revisar dependências e artefatos de produção. Não confundir exportação JavaScript com validação da segurança de um aplicativo Android instalado.
- Definir proteção adicional de dados conforme sua sensibilidade e o modelo de ameaças. A versão atual não oferece criptografia própria do histórico.

## Antes de testar retenção por vários dias

Validar Android físico, notificações ao terminar e comportamento com tela bloqueada. A avaliação atual cobre entendimento, visual e fluxo básico; não comprova retenção.

## Organização e identidade visual

- Migração para aliases concluída: `#src/*`, `#tests/*`, `#app` e `#styles`. Mantidos imports com efeitos colaterais e compatibilidade entre app, testes e exportações. Detalhes em [Arquitetura](arquitetura.md).
- Ordem acordada: ícone/splash → animação corporal → Pencil.
- Após as animações, usar Pencil para acompanhar layouts e registrar templates, paleta, tipografia e componentes reutilizáveis. A integração ainda não foi configurada/verificada.
- Melhorar a animação articulada da estrutura do corpo do mascote. O movimento atual de entrada, corpo e cauda é uma base, não a animação corporal completa desejada. Preservar movimento reduzido e avaliar desempenho.
- Ícone e splash implementados com o desenho atual do Nino, fonte vetorial editável e PNGs regeneráveis. Validar recortes do launcher, ícone temático e abertura a frio em build Android de release; Expo Go não comprova a aparência final.

## Progresso, cuidado e notificações

- Definir quais estatísticas tornam o dashboard mais útil para compreender a rotina, antes de adicionar gráficos por quantidade.
- Introduzir alimentação dos pets e frases gentis como convites opcionais. Proposta de experiência: sem punições, perda de progresso ou culpa por ausência.
- Planejar lembretes de rotina e inatividade com consentimento, horários, frequência controlável e desativação simples.
- Avaliar notificações locais para os casos que não exigem servidor. Push remoto permanece uma possibilidade solicitada, com infraestrutura e tratamento de tokens ainda por definir.
- Validar notificações e retorno ao app em Android físico, inclusive com tela bloqueada, antes de considerar a frente concluída.

## Contas, Firebase e modelo de dados

- Direção solicitada: autenticação Google OAuth com apoio do MCP Firebase e Firestore em ambientes separados de homologação e produção. Disponibilidade do MCP, projetos e configurações ainda precisam ser verificados na execução.
- Elaborar UML de classes e casos de uso e modelo lógico do banco ao definir contas/sincronização. Registrar depois em arquitetura as decisões efetivamente adotadas, inclusive separação entre ambientes e controle de acesso por usuário.
- Definir quais dados sincronizar, migração do histórico local, conflitos e comportamento ao sair/trocar de conta. Preservar uso completo sem autenticação.
- Sem conta, manter “Apagar dados deste dispositivo”. Com conta, oferecer também exclusão de conta e dados remotos, com escopo e confirmação claros.
- Informar armazenamento exclusivamente local apenas quando isso corresponder ao fluxo real. Após integrações, explicar os dados enviados; não afirmar genericamente que nenhum dado é coletado se houver autenticação, sincronização ou analytics.

## Analytics, eventos e heatmaps — decisão pendente

A sugestão de capturar eventos para insights e heatmaps altera a diretriz anterior de ausência de telemetria. Nenhum analytics foi habilitado por este planejamento.

Antes de implementar, decidir finalidade, consentimento, eventos mínimos, retenção, exclusão e comportamento para quem recusa, inclusive no modo sem conta. A proposta discutida é começar com eventos mínimos e opcionais, deixando heatmaps para uma necessidade demonstrada. Fornecedor e solução de heatmap ainda não foram escolhidos; captura de eventos não implica automaticamente gravação de sessões ou heatmaps.

Revisar mensagens de privacidade e documentação de produto antes de qualquer coleta. A avaliação atual continua baseada em observação e entrevistas.

## Personalização paga e recursos sociais

- Planos pagos: escolher outros animais, personalizar mascotes e nomeá-los. Definir limites gratuitos/pagos e validar valor antes de implementar cobrança.
- Compartilhamento em redes sociais: definir o conteúdo compartilhável e permitir ação explícita do usuário.
- Pontuação e amigos: definir regras do score, descoberta de pessoas, privacidade e significado de completar ciclos juntos. Dependem das decisões de identidade e dados; propor progresso sem comparações punitivas.

## Publicação e pendências preservadas

Preparar título, descrição e screenshots para Google Play Console com base no aplicativo realmente entregue, sem anunciar capacidades futuras como disponíveis. A preparação dos materiais não equivale a publicar na loja.

Continuam pendentes a seleção/licenciamento de LoFi, validação em Android físico, notificações e experimentos de monetização. O novo backlog não descarta essas decisões anteriores.
