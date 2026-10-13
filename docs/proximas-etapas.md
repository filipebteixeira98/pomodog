# Próximas etapas — escopo e critérios

Atualizado em 12/10/2026. Este documento detalha decisões abertas e critérios de futuras entregas. Status e prioridades estão somente no [Plano de ação](plano-de-acao.md); confirmação de testes em [Verificação](verificacao.md).

## Dados, contas e segurança

- Preservar experiência completa sem login e explicar o que sai do dispositivo em cada integração. Consentimentos opcionais não são inferidos de autenticação.
- Validar importação local/remota, falhas de rede, saída/troca de conta e conflitos entre dispositivos. A implementação vigente está em [Arquitetura](arquitetura.md#contas-e-armazenamento).
- Planejar exclusão coordenada no servidor para bloquear gravações de outros dispositivos e concluir limpeza após encerramento do cliente; o fluxo atual coordena somente este dispositivo.
- Criar projeto Firebase de produção separado, revisar credenciais públicas/regras e comprovar isolamento. Produzir UML de classes, casos de uso e modelo lógico por UID.
- Retomar os riscos/roteiros de [Segurança](seguranca.md), incluindo duas dependências sem correção publicada, migração da autenticação no aparelho, backup real e artefato release. Histórico permanece em AsyncStorage; tokens móveis usam SecureStore. Revisão contínua não equivale à conclusão integral do MASTG.
- Outros provedores OAuth precisam de escolha de plataformas/configuração própria; Google e entrada sem conta já existem.
- Adequação LGPD: finalizar responsável/contato e política pública, confirmar retenção dos fornecedores, contratos e destinos internacionais, implementar atendimento de acesso/correção/exclusão que funcione também sem conta e sem vincular UID à medição. Critérios e limites em [Privacidade](privacidade.md); eventos e diagnóstico continuam em seus guias. Validar decisões versionadas, fila offline, troca de conta e limpeza de evidências no aparelho. A configuração em `notice.json` aguarda informações do responsável.

## Identidade e organização

Nino permanece nome provisório, centralizado em `src/domain/mascot.ts`; pesquisa de marcas ainda não realizada. Validar ícone/splash em release, recortes do launcher, ícone temático e abertura a frio. Pencil permanece em standby: retomar templates, paleta, tipografia e componentes quando solicitado. Retirar selo Beta ao encerrar essa fase.

Adotar branches/PRs após definir política; alinhar versões do app/build/changelog e critérios para minor/patch. Commits incrementais atuais continuam no fluxo registrado no plano.

## Incentivo, lembretes e distrações

- Alimentação/frases existentes devem permanecer opcionais, sem fome, penalidades ou culpa. Avaliar frequência, clareza e leitura antes de ampliar.
- Hidratação: mensagem dispensável, preferencialmente no descanso, sem interromper foco ou impor metas de consumo.
- Lembretes de rotina/alimentação: escolher horários, frequência, consentimento e desativação; evitar excesso de avisos.
- Inatividade/push remoto: definir tokens, frequência e infraestrutura. Não confundir com o aviso local de conclusão existente.
- Silenciamento de redes sociais: investigar limites/permissões por plataforma. Não assumir controle seletivo de outros apps; considerar orientação ao sistema. Se houver automação, restaurar preferências em pausa, cancelamento, conclusão e falha.

## Monetização, social e conteúdo

Catálogo futuro, sem ativação de serviços por constar nesta lista. Validar valor antes da cobrança; hipóteses e roteiro de entrevistas em [Produto e validação](produto-e-validacao.md).

| Proposta                                      | Critérios da primeira entrega                                                                                                                                                                                                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Atividades durante o descanso em planos pagos | Prototipar desenho livre, formas geométricas e sugestões opcionais. Permitir pular, encerrar e voltar ao foco; avaliar prazer e distração. Não prometer hiperfoco ou eficiência sem evidência.                                                                                      |
| Compartilhamento em redes sociais             | Criar prévia de cartão com progresso ou Nino e compartilhamento por ação explícita. Evitar publicar identidade/histórico sem escolha do usuário. Consolidar com a frente social existente.                                                                                          |
| Sneak peek e evolução do produto              | Manter o card acima dos ciclos em Foco, entre sessões, com mensagem genérica e opção de fechar. Não antecipar funcionalidades específicas nem datas. Avaliar clareza, fechamento, interesse e retorno dos usuários.                                                                 |
| Curiosidades e notícias de neurociência       | Definir curadoria, fontes, datas e revisão editorial. Registrar o ciclo proposto “estímulo → feeder → preparação → repetição definitiva”, referido como “série real”, como hipótese conceitual. Esclarecer os termos e verificar a origem antes de exibir como conteúdo científico. |
| Insights com inteligência artificial          | Definir perguntas úteis e prototipar com dados sintéticos. Antes de enviar dados reais, definir consentimento, minimização, fornecedor, custo e retenção. Apresentar sugestões opcionais, sem diagnóstico ou inferência de saúde.                                                   |
| Feedback e comentários                        | Validar formulário de Ajustes com e sem login, teclado, falha de rede e recusa de telemetria. PostHog recebe categoria, mensagem e contato opcional, sem UID. Definir retenção, atendimento e proteção contra abuso além dos limites de envio no cliente.                           |
| Backgrounds pagos                             | Definir catálogo, prévia e acesso por assinatura. Preservar legibilidade, contraste e desempenho; incluir restauração ao padrão e alternativa gratuita.                                                                                                                             |
| Experiência além da produtividade             | Avaliar companhia, descanso, prazer e autonomia como objetivos. Não reduzir sucesso a minutos ou sessões; validar textos e mecânicas sem pressão por desempenho.                                                                                                                    |
| Sonoplastia                                   | Prototipar sons de interação e transição, com controle de volume e opção de silenciar. Verificar licenças e respeitar ambiente de uso; não duplicar som de notificação.                                                                                                             |
| PostHog, testes A/B e heatmaps                | Firebase Analytics mede uso opcional. PostHog Surveys recebe feedback explícito; demais produtos permanecem separados. Definir hipótese, consentimento, eventos mínimos, suporte e critérios; replay/heatmaps exigem avaliação própria e não estão habilitados.                     |
| Semelhança e identificação                    | Esclarecer “sistemas parecidos”: pode significar padrões familiares de navegação, afinidade com mascotes ou grupos com objetivos semelhantes. Validar interpretação com o usuário antes de escolher uma funcionalidade ou mecanismo social.                                         |
| RevenueCat e assinaturas                      | Definir oferta e acesso por loja/plataforma antes de integrar compras. Validar restauração, eventos repetidos e direitos de acesso. Sentry já está integrado; procedimentos e limites ficam no guia técnico.                                                                        |

Mascotes pagos: definir outros animais, acessórios, nomes e limites gratuitos/pagos. LoFi: verificar licenças, reprodução e controles. Pontuação/amigos: definir score, descoberta e sessões conjuntas sem comparação punitiva, com privacidade explícita. Não tratar grupos semelhantes como uma funcionalidade definida antes de esclarecer a intenção.

## Agenda e sugestões de foco — primeira versão proposta

Conexão opcional com Google Agenda, separada do login Google. Começar pela agenda principal e horários ocupados de amanhã, sem necessidade de ler títulos, descrições ou participantes. Consultar disponibilidade com acesso mínimo adequado; não criar/alterar eventos. Referência da proposta: [consulta de disponibilidade](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query).

Fluxo proposto:

1. Usuário conecta agenda e escolhe faixa habitual de foco, dias permitidos, horário do lembrete e preferência de antecipação.
2. App consulta ao abrir ou voltar ao primeiro plano, apenas se a última consulta bem-sucedida ocorreu há pelo menos 30 minutos. Esse intervalo é um limite de frequência, não uma execução periódica garantida. Falhas não devem provocar tentativas contínuas em cada evento de retomada.
3. Analisa horários ocupados de amanhã que coincidam com a rotina; procura janela livre para foco/descanso e margem antes do compromisso. Antecipação para hoje é uma escolha explícita, não inferência automática.
4. Agenda notificação local para o horário escolhido, com no máximo uma sugestão diária e sem duplicatas. Não iniciar ciclos automaticamente; permitir ignorar, adiar ou desativar.
5. Na próxima consulta, atualizar/cancelar lembrete pendente se a agenda mudar. Desconexão/revogação remove acesso, cache de disponibilidade e avisos pendentes dessa integração.

Não há consulta periódica enquanto o app permanece fechado. O aviso já agendado poderá aparecer, mas mudanças posteriores na agenda só serão consideradas ao retornar. Respeitar fuso local, horários silenciosos, sobreposição de períodos e eventos que realmente bloqueiam disponibilidade. Antes de implementar, decidir quando sugerir foco hoje versus amanhã e se as ações da notificação entram no primeiro escopo.

Manter apenas dados mínimos necessários; não enviar conteúdo de agenda ao Firestore, Sentry ou analytics nesta primeira proposta. Atualização sem abrir o app por vários dias será outra entrega, com autorização de acesso persistente, processamento no servidor e push remoto a definir. Esses componentes ainda não estão implementados.

## Vínculo de responsáveis e rotina de filhos

Proposta pendente: conta de pai/mãe/responsável vinculada à de filho para apoiar planejamento da rotina, ou alternativa familiar semelhante. Definir faixa etária/público, quem autoriza cada vínculo, se há múltiplos responsáveis e o que cada pessoa pode consultar ou editar. Decidir entre rotina compartilhada e visualização de progresso antes de criar mecanismos de supervisão.

A autorização atual por proprietário não concede acesso entre contas. A futura entrega exige permissões explícitas por vínculo, testes de isolamento, remoção do vínculo e regras de exclusão das contas/dados. Não inferir parentesco a partir do Google, permitir acesso irrestrito ou enviar dados de filhos a analytics. Avaliar privacidade e participação de responsáveis/filhos conforme o público definido antes de implementar. Evitar comparação punitiva e pressão por desempenho.

## Atividade para a sessão de foco

Campo opcional e curto para informar o que o usuário deseja fazer (exemplo: “Ler um capítulo”). Preservar início rápido sem preenchimento obrigatório. Definir se o texto pertence à sessão atual ou a uma lista reutilizável, quando pode ser editado e se aparece no histórico.

Planejar limite de tamanho, limpeza e persistência local; sincronização deve seguir a escolha de conta e modelo de dados definidos para esta entrega. Não incluir texto livre em eventos de analytics, diagnósticos, compartilhamento ou notificações de tela bloqueada automaticamente. Esse campo não existe ainda.

## Nova animação do Nino na interface de entrada

Alterar o gesto/entrada do mascote especificamente em WelcomeScreen. A animação atual já existe; esta proposta é uma revisão visual separada da animação corporal concluída. Definir pose e transição antes de implementar, sem alterar as demais telas por consequência. Preservar movimento reduzido, pausa em segundo plano, proporções responsivas e legibilidade dos botões/headline.

## Tamanho distribuído e desempenho: prioridade antes do lançamento

Decisão de 03/10/2026: minimizar o tamanho distribuído nas lojas e garantir experiência fluida e eficiente, inclusive em dispositivos com menos recursos. Esta frente é prioridade da preparação do lançamento; não foi iniciada nesta atualização.

Referência inicial em [Verificação](verificacao.md#tamanhos-medidos).

Plano de execução:

1. Gerar release e medir separadamente bundle, assets, pacote de publicação, download por dispositivo e espaço instalado. Registrar versão, arquitetura e configuração de cada medida para comparações reproduzíveis.
2. Identificar os maiores componentes: código, dependências nativas, fontes, imagens e recursos. Revisar itens não utilizados e avaliar otimizações de assets, código/recursos nativos e distribuição por arquitetura conforme suporte do projeto. Consultar documentação vigente antes de alterar build.
3. Definir metas de tamanho e desempenho após obter a referência de release, sem prometer redução percentual antecipada. Medir abertura a frio, navegação, timer, animações, memória e comportamento em aparelhos com menos recursos, sem influência de Metro.
4. Comparar antes/depois; repetir verificações afetadas de OAuth, sincronização, notificações, consentimento, diagnóstico e animações. Preservar mapas/símbolos correspondentes ao binário otimizado.
5. Registrar resultados e critérios de aceitação antes de publicar. Se metas não forem atendidas, documentar causa e decidir o ajuste necessário. Menor download e maior fluidez são critérios distintos.

Ao iniciar esta frente, retomar também o lembrete de Analytics: modo debug permanece ativo no aparelho por decisão do usuário; desativar para validação normal/publicação, conferindo o valor vigente. Não alterar essa propriedade durante o registro do planejamento.

## Publicação

Preparar título, descrição e screenshots da Google Play com recursos realmente disponíveis. Antes de publicar, validar assinatura/binário, ambientes, ícone/splash, mapas/símbolos, diagnóstico, consentimento e requisitos da loja. Materiais preparados não equivalem à publicação. Não anunciar capacidades futuras como entregues.
