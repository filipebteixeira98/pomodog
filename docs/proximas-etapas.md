# Próximas etapas — escopo e critérios

Atualizado em 15/10/2026. Este documento detalha decisões abertas e critérios de futuras entregas. Status e prioridades estão somente no [Plano de ação](plano-de-acao.md); confirmação de testes em [Verificação](verificacao.md).

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

Decisão de 13/10/2026: postergar NPS e priorizar comentários/quantidade de respostas do feedback existente e tendências agregadas de uso autorizado. Essas fontes já estão disponíveis; sua análise conjunta é manual, sem cruzamento automático entre respostas, conta e telemetria. NPS acrescentaria uma medida de disposição para recomendar, ainda não coletada pelo formulário atual.

| Proposta                                      | Critérios da primeira entrega                                                                                                                                                                                                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Atividades durante o descanso em planos pagos | Prototipar desenho livre, formas geométricas e sugestões opcionais. Permitir pular, encerrar e voltar ao foco; avaliar prazer e distração. Não prometer hiperfoco ou eficiência sem evidência.                                                                                      |
| Compartilhamento em redes sociais             | No novo development build, abrir Progresso → Compartilhe seu progresso e conferir sequência/totais com e sem histórico/login. Validar prévia, cancelamento, destinos instalados e leitura acessível. O PNG não inclui identidade; o sistema escolhe destinos compatíveis. Sem publicação automática ou OAuth social. |
| Sneak peek e evolução do produto              | Manter o card acima dos ciclos em Foco, entre sessões, com mensagem genérica e opção de fechar. Não antecipar funcionalidades específicas nem datas. Avaliar clareza, fechamento, interesse e retorno dos usuários.                                                                 |
| Curiosidades e notícias de neurociência       | Definir curadoria, fontes, datas e revisão editorial. Registrar o ciclo proposto “estímulo → feeder → preparação → repetição definitiva”, referido como “série real”, como hipótese conceitual. Esclarecer os termos e verificar a origem antes de exibir como conteúdo científico. |
| Insights com inteligência artificial          | Definir perguntas úteis e prototipar com dados sintéticos. Antes de enviar dados reais, definir consentimento, minimização, fornecedor, custo e retenção. Apresentar sugestões opcionais, sem diagnóstico ou inferência de saúde.                                                   |
| Feedback e comentários                        | Validar formulário de Ajustes com e sem login, teclado, falha de rede e recusa de telemetria. PostHog recebe categoria, mensagem e contato opcional, sem UID. Definir retenção, atendimento e proteção contra abuso além dos limites de envio no cliente.                           |
| Pesquisa NPS                                  | Avaliar nota de 0 a 10 e motivo opcional, sem exigir login/e-mail. Convite dispensável fora do foco/onboarding; momento e intervalo de 60 dias são hipóteses a validar. Analisar indicador com quantidade de respostas e comentários, sem vínculo automático com telemetria.        |
| Backgrounds pagos                             | Definir catálogo, prévia e acesso por assinatura. Preservar legibilidade, contraste e desempenho; incluir restauração ao padrão e alternativa gratuita.                                                                                                                             |
| Experiência além da produtividade             | Avaliar companhia, descanso, prazer e autonomia como objetivos. Não reduzir sucesso a minutos ou sessões; validar textos e mecânicas sem pressão por desempenho.                                                                                                                    |
| Sonoplastia                                   | Prototipar sons de interação e transição, com controle de volume e opção de silenciar. Verificar licenças e respeitar ambiente de uso; não duplicar som de notificação.                                                                                                             |
| PostHog, testes A/B e heatmaps                | Firebase Analytics mede uso opcional. PostHog Surveys recebe feedback explícito; demais produtos permanecem separados. Definir hipótese, consentimento, eventos mínimos, suporte e critérios; replay/heatmaps exigem avaliação própria e não estão habilitados.                     |
| Semelhança e identificação                    | Esclarecer “sistemas parecidos”: pode significar padrões familiares de navegação, afinidade com mascotes ou grupos com objetivos semelhantes. Validar interpretação com o usuário antes de escolher uma funcionalidade ou mecanismo social.                                         |
| RevenueCat e assinaturas                      | Definir oferta e acesso por loja/plataforma antes de integrar compras. Validar restauração, eventos repetidos e direitos de acesso. Sentry já está integrado; procedimentos e limites ficam no guia técnico.                                                                        |

Mascotes pagos: definir outros animais, acessórios, nomes e limites gratuitos/pagos. LoFi: verificar licenças, reprodução e controles. Pontuação/amigos: definir score, descoberta e sessões conjuntas sem comparação punitiva, com privacidade explícita. Não tratar grupos semelhantes como uma funcionalidade definida antes de esclarecer a intenção.

## Agenda e sugestões de foco — primeira versão Android

Conexão opcional separada do login Firebase, inclusive para visitantes. Implementação consulta a agenda principal com `calendar.freebusy`, sem títulos, descrições, participantes ou escrita de eventos. Google Calendar API habilitada em `pomodog-dev-2026`. Referência: [consulta de disponibilidade](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query).

Fluxo implementado, com autorização real ainda a validar:

1. Em Ajustes, conectar a agenda e escolher faixa habitual, dias e antecipação; lembretes começam desligados. O padrão procura espaço amanhã, e antecipar para hoje exige escolha explícita.
2. Ao abrir/retomar, consultar se a última tentativa ocorreu há pelo menos 30 minutos, inclusive após falhas. Salvar a rotina ou mudar os tempos de foco/descanso solicita nova consulta imediata. Não há execução periódica garantida.
3. Detectar conflito na faixa de amanhã e procurar janela para foco e descanso completos, com dez minutos de margem antes do primeiro compromisso. Sem conflito ou janela, não sugerir foco extra.
4. Mostrar sugestão em Foco entre sessões. Preparar foco não inicia o timer; Agora não dispensa o dia sugerido. Lembretes opcionais usam horário do próprio dia de foco, entre 07:00 e 21:00, antes da faixa escolhida. Horário passado mantém apenas a sugestão no app; limite de um aviso diário.
5. Nova consulta substitui ou cancela o aviso. Desconexão, revogação detectada, troca/saída de conta e exclusão limpam projeção e avisos; a revogação completa do OAuth é feita na Conta Google. Dados de agenda não vão para Firestore, Sentry ou Analytics.

Próximo passo: validar no aparelho o escopo incremental com conta permitida pelo projeto, compromisso real que bloqueie a faixa e casos sem janela/dia livre, antecipação, alteração do evento, recusa/revogação e limpeza. Conferir aviso agendado com tela bloqueada e a separação dos avisos de conclusão. Procedimento em [Development build](development-build.md#google-agenda). Essa validação não foi substituída por testes com respostas sintéticas.

O aviso agendado funciona com o app fechado, mas mudanças posteriores na agenda só entram ao retornar. Adiar por ação na notificação, atualização sem abrir por vários dias, servidor, push remoto, múltiplas agendas, iOS e web ficam para entregas separadas. Acompanhar demanda antes de ampliar escopos e infraestrutura.

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
