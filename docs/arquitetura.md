# Arquitetura atual

Atualizado em 03/10/2026. Estrutura, mecanismos e decisões vigentes; status em [Plano de ação](plano-de-acao.md), evidências em [Verificação](verificacao.md).

## Responsabilidades

| Parte                      | Responsabilidade                                             |
| -------------------------- | ------------------------------------------------------------ |
| `App.tsx`                  | Carregar fontes locais e configurar a área segura            |
| `src/Pomodog.tsx`          | Compor navegação, telas e modais                             |
| `src/timer.ts`             | Regras puras do timer, sem dependência de React              |
| `src/domain/`              | Preferências, progresso e validação/migração do estado salvo |
| `src/hooks/usePomodoro.ts` | Coordenar timer, restauração e persistência serializada      |
| `src/storage/prototype.ts` | Adaptar o armazenamento local                                |
| `src/features/`            | Telas, onboarding, escolhas opcionais e tour                 |
| `src/components/ui/`       | Primitivos de texto, botão, cartão, modal e opções           |

As telas recebem dados e callbacks. Não acessam diretamente AsyncStorage. Cartões, modais e botões usam composição por `children`; o botão também recebe um ícone opcional. Os componentes de UI não conhecem regras de Pomodoro.

`OptionalCollectionSettings` compartilha cartões, loading e mensagens de falha de consentimento. Analytics e diagnóstico fornecem seus próprios stores, textos e ícones; escolhas continuam independentes. Operações duplicadas são bloqueadas imediatamente e respostas tardias não atualizam um cartão desmontado.

O histórico anterior é preservado com a mesma chave `pomodog.prototype.v1`. A ausência de `onboardingComplete` é tratada como um registro antigo, mantendo timer, sessões e preferências. O onboarding automático espera uma sessão ociosa para não interromper um foco restaurado.

`src/firebase` coordena conta/sincronização/exclusão; `src/notifications` agenda avisos locais; `src/monitoring` e `src/analytics` mantêm consentimentos separados. `App` também coordena identidade e confirmação transitória de exclusão fora do componente remontado por UID.

## Automação e integração nativa

| Diretório/arquivo                   | Finalidade                                                                     | Uso no projeto                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `scripts/generate-brand-assets.mjs` | Gera ícone, splash, favicon e versões adaptativas a partir do SVG.             | `npm run assets:generate`.                                                       |
| `scripts/sentry-sourcemaps.mjs`     | Confere correspondência dos mapas/bundles e realiza upload autorizado.         | `npm run sentry:check` e `npm run sentry:upload`.                                |
| `scripts/verify-sentry.mts`         | Envia evento sintético explícito para verificar ingestão e resolução de mapas. | Procedimento manual descrito em [Sentry](sentry.md#verificação); exige `--send`. |
| `plugins/withNativeReporting.js`    | Configura integração nativa de diagnóstico durante prebuild.                   | Referenciado por `app.json`; recria ponte, inicialização e fontes Android.       |
| `plugins/withAndroidPrivacy.js`     | Restringe backup, transferência, permissões e HTTP no Android principal.       | Referenciado por `app.json`; gera regras XML e configura o manifest.             |
| `plugins/native-reporting/`         | Fontes Kotlin do cliente/ponte e testes de filtragem.                          | Copiados pelo plugin para o projeto Android gerado.                              |

Scripts são ferramentas de desenvolvimento/build, não telas do aplicativo. O plugin e suas fontes são necessários para reproduzir a integração de crashes Java/Kotlin e consentimento nativo; não basta preservar arquivos gerados em `android/`. Planejamento vigente fica em [Plano de ação](plano-de-acao.md) e [Próximas etapas](proximas-etapas.md).

## Contas e armazenamento

O projeto `pomodog-dev-2026` contém Firebase Authentication com Google e Cloud Firestore na região `southamerica-east1`. Apps Android e web foram registrados; o certificado Android de desenvolvimento foi cadastrado. As regras Firestore foram publicadas. O ambiente de produção ainda não foi configurado.

Após autenticação, `prepareAccount` grava o perfil em `users/{uid}`, as sessões de foco em `users/{uid}/sessions/{sessionId}` e o estado em `users/{uid}/state/main`. O estado inclui timer sem histórico duplicado, preferências, onboarding e cuidados do mascote. A identidade de login fica no Firebase Authentication; o documento `users` contém os dados de perfil usados pela aplicação.

A relação lógica usuário/sessões é 1:N, expressa pelo caminho da subcoleção. Não há chave estrangeira SQL ou exclusão em cascata automática. As regras exigem `request.auth.uid == uid` para leitura e escrita do perfil e das subcoleções; validam campos permitidos, tipos, limites e estados do timer. Trata-se de autorização por proprietário; papéis administrativos e RBAC ainda não foram implementados.

O armazenamento local usa uma chave por UID. A importação combina histórico local e remoto sem repetir IDs; os dados de visitante só são removidos depois de salvar o resultado na nuvem e na chave da conta. A sincronização posterior serializa escritas remotas e preserva o salvamento local. As preferências da cópia local da conta têm precedência na conciliação inicial; conflitos entre dispositivos ainda precisam de validação específica.

A fila local em `src/storage/prototypeStore.ts` serializa leitura, gravação e exclusão. Validação remove campos desconhecidos, limita histórico e rejeita versões futuras. Registros ilegíveis bloqueiam gravação até recuperação/exclusão explícita. Histórico/preferências continuam no sandbox em AsyncStorage, sem criptografia adicional. Persistência da autenticação móvel usa SecureStore, com migração serializada do legado; web mantém o SDK no navegador. Backup e transferência Android estão desabilitados por política explícita. Limites e critérios de validação ficam em [Segurança](seguranca.md).

Exportação e `expo-sharing` foram removidos do código e das dependências. `legacyExportCleanup` mantém somente a limpeza do arquivo temporário de versões antigas durante a exclusão de dados.

## Interface e composição

- **NativeWind 4 + Tailwind CSS 3**: classes junto ao JSX, compatíveis com componentes React Native. Usamos `View`, `Text` e `Pressable`, preservando Android e web.
- **tailwind-merge 2.6**: resolve conflitos entre classes padrão e classes de quem compõe um componente. Versão compatível com Tailwind 3.
- **Poppins**: três pesos locais, regular, médio e seminegrito. Importação por arquivo; nenhuma requisição ao Google Fonts durante o uso do aplicativo.
- **Lucide React Native**: importação direta dos ícones utilizados. `lucide-react` é destinado à renderização web; a variante nativa usa o `react-native-svg` já presente no projeto.
- **Componentes locais pequenos**: não adotamos um kit completo nesta fase. Há poucas telas; duplicar dependências de tema, navegação e animação não oferece benefício suficiente agora. Reavaliar quando surgirem necessidades concretas como formulários complexos ou navegação nativa adicional.
- **Animação**: onboarding reutiliza `Animated` e o cachorro existente, sem uma nova dependência de animação específica para a introdução. Reanimated e Worklets entram como dependências da solução NativeWind.

Estilos estáticos ficam nas classes. Valores dinâmicos, como a cor escolhida, o progresso do timer e valores animados, permanecem em `style`.

Quatro abas: Foco, Progresso, Ajustes e Perfil. Foco concentra timer/mascote; resumos ficam em Progresso. Ajustes reúne preferências, avisos, consentimentos e revisão do tour; Perfil concentra conta e dados. Ações destrutivas usam `Button.destructive`, com vermelho independente do tema.

`GoogleSignInButton` é compartilhado entre entrada/Perfil e usa símbolo local, loading e bloqueio durante login. `Toast` de exclusão só aparece após sucesso, permanece fora da remontagem por UID e respeita safe area/movimento reduzido.

## Aliases de imports

Imports internos usam `#src/*` para código em `src/`, `#tests/*` para testes, `#app` para `App.tsx` e `#styles` para `global.css`. Exemplo: `import { Button } from "#src/components/ui/Button"`.

Os mapeamentos em `tsconfig.json` atendem TypeScript e Metro; os equivalentes em `package.json#imports` permitem executar os testes diretamente no Node, que não interpreta `tsconfig.paths`. Manter ambos sincronizados ao adicionar aliases. Não foi adicionada dependência de resolução nem plugin Babel.

Imports executados diretamente pelo Node mantêm a extensão `.ts`. Imports específicos de plataforma, como `#src/storage/legacyExportCleanup`, permanecem sem extensão para selecionar `.web.ts` na web e `.ts` no Android. O Prettier separa aliases internos de dependências externas e preserva a posição de imports com efeitos colaterais. O CSS tem declaração explícita em `global.d.ts`. Reiniciar Expo CLI após modificar os mapeamentos.

Referências consultadas via Context7: [aliases no Expo](https://docs.expo.dev/guides/typescript/) e [TypeScript no Node](https://nodejs.org/docs/latest-v24.x/api/typescript.html).

## Primeiro acesso e escolhas opcionais

Fluxo: entrada Google/sem conta → introdução → privacidade → notificações, nas plataformas suportadas → tour → Foco. Usuários com introdução concluída mantêm acesso direto. A entrada espera restauração, timer ocioso e armazenamento legível; não interrompe sessão restaurada. Apagar dados reinicia o fluxo.

`OptionalPermissionScreen` compartilha layout, loading, bloqueio de duplo toque/retorno durante operação e erro acessível. `PrivacyScreen` oferece “Sim, autorizo”/“Agora não”; `NotificationsScreen`, “Sim, ativar”/“Agora não”. Resolução após desmontagem não navega; resultado false/falha não avança.

`saveCollectionChoice` salva nos dois controles existentes (`monitoring`/`analytics`), registrando a origem onboarding. `src/privacy` persiste evidência versionada antes de cada ativação; não infere consentimento de login. Falha parcial ao conceder tenta revogar ambos. Ajustes permite alterações independentes posteriores. Notificações usam `setSessionNotifications`; aceitar solicita permissão, recusar não solicita. Voltar retorna à etapa anterior. Concluir a última escolha inicia tour e marca onboarding completo; rever tour não muda permissões.

## Gestos no onboarding

No Android/iOS, um `ScrollView` horizontal com `pagingEnabled` controla as três páginas; cada página possui rolagem vertical independente com `nestedScrollEnabled`. A largura vem do layout real e é reaplicada em mudanças de viewport. Ao terminar o movimento, o índice sincroniza indicadores e botão final. Os pontos também navegam pelo pager; com movimento reduzido, essa navegação programática não anima. Mascotes fora da página ativa ficam sem animação e seu conteúdo não entra na navegação do leitor de tela.

Na web, PanResponder mantém o arraste por mouse/toque, com limiar de 55 px e rejeição de movimentos predominantemente verticais. O conteúdo das etapas é compartilhado. A separação evita a disputa entre o detector JavaScript e o ScrollView nativo que impedia o swipe no Android. Não foram adicionadas dependências.

## Tour guiado

`src/features/tour/GuidedTour.tsx` recebe referências estáveis para controles e container. `measureInWindow` posiciona uma máscara em quatro partes, borda de destaque e explicação acima ou abaixo do alvo. Medições são atualizadas apenas enquanto o tour está montado e liberadas no fechamento; a raiz ajusta o scroll conforme etapa e viewport. O painel possui rolagem em telas pequenas/fontes ampliadas. Não há biblioteca adicional.

A camada de fundo bloqueia interação e fica fora da navegação assistiva. Web mantém foco nos controles do guia, permite Escape e tenta devolver o foco anterior; Android usa o botão Voltar. Não há animações do tour e o mascote fica estático durante a explicação. O tour não executa ações do timer. Concluir as escolhas de privacidade e notificações após a introdução conclui o onboarding usando a persistência existente e inicia o tour; etapas do tour são temporárias e ele só reabre por escolha explícita. Validação de acessibilidade nativa ainda necessária.

## Mascote e progresso

`src/Dog.tsx` compõe as camadas; `src/features/mascot/Artwork.tsx` guarda a ilustração e `useDogMotion.ts` controla o ciclo de vida das animações. Um palco de 360 × 230 é escalado uniformemente dentro do espaço disponível, mantendo os pivôs de cabeça, patas, tronco e cauda alinhados em telas menores.

Animated transforma Views que contêm SVGs estáticos, usando driver nativo em Android/iOS e sem atualizar estado React a cada frame. Respiração e gestos têm ciclos separados; gestos incluem pausas e amplitudes menores fora da introdução/comemoração. Movimento reduzido zera as transformações animadas. AppState interrompe os ciclos em segundo plano e reinicia ao retornar; cleanup remove listener e encerra animações. Mascotes fora da página ativa e atrás do onboarding/tour ficam imóveis.

Na entrada, `WelcomeArtwork` compõe o cronômetro e `WelcomeDog`, com corpo sentado mais erguido e pata levantada. Reutiliza rosto, cenário e `useDogMotion`, com o ciclo calmo de gestos: uma pata acena, cabeça inclina e cauda acompanha, com pausa entre os movimentos. A pose permanece distinta mesmo sem animação. O desenho de `Dog` usado no onboarding e demais telas não recebeu alterações.

Referência consultada via Context7: [Animated no React Native](https://reactnative.dev/docs/animated).

summarizeProgress considera hoje e os seis dias anteriores no calendário local, exclui registros futuros e calcula minutos totais, sessões, dias distintos e duração média. Totais são arredondados após somar segundos. Sem sessões, a interface usa travessão para a média. O gráfico ajusta a escala ao maior valor do período; lista recente ordena por conclusão. Os cálculos usam o histórico local existente, sem adicionar coleta ou armazenamento.

summarizeStreak deriva a sequência do histórico local disponível (limitado a 1.000 sessões), sem novo estado persistido. Deduplica dias, exclui registros futuros e percorre datas com setDate, sem subtrair intervalos fixos de 24 horas. A contagem não é limitada aos sete marcadores. StreakCard apresenta estado inicial, singular/plural, ícone e descrições acessíveis por data; marcadores completos usam check além da cor.

`petCare` guarda lastFedAt/lastMessageId e é validado sem invalidar timer/histórico quando esses metadados são inválidos. Integra estado local/da conta pela persistência existente. `choosePetResponse` escolhe frases por contexto; `TimerCard` mantém resposta temporária de seis segundos, bloqueia toques repetidos e limpa timeout. Dar petisco não altera timer; movimento reduzido preserva texto/pose.

## Ícone e splash screen

`assets/brand/mascot-mark.svg` deriva do rosto vetorial original de `src/Dog.tsx`, preservando traços e cores. `npm run assets:generate` usa Sharp, somente como dependência de desenvolvimento, para produzir PNGs determinísticos: ícone opaco 1024 × 1024, foreground e máscara monocromática adaptativos 1024 × 1024, splash transparente 512 × 512 e favicon 64 × 64. Alterações futuras no rosto devem considerar também esta marca derivada.

O foreground mantém o desenho dentro do círculo seguro central de 66/108 da área do ícone. O fundo do ícone é sálvia (`#4E6B55`); a splash usa verde pastel suave (`#EEF0E6`, cor soft das telas), apenas com o mascote, sem texto, e imagem central de largura 200. `app.json` referencia os assets e o config plugin `expo-splash-screen`. No nativo, `App.tsx` impede ocultação automática e libera a splash após carregamento das fontes (ou erro) e layout da raiz. Não há atraso artificial. Na web permanece o carregamento atual e é adicionado favicon.

`assets/brand/preview.png` é uma prancha de revisão, não uma captura de dispositivo. Mudanças de splash/ícone exigem novo build nativo; exportar JavaScript não aplica nem comprova esses recursos no Android instalado.

Na entrada, `WelcomeArtwork` compõe o cronômetro e `WelcomeDog`, com corpo sentado mais erguido e pata levantada. Reutiliza rosto, cenário e `useDogMotion`, com o ciclo calmo de gestos: uma pata acena, cabeça inclina e cauda acompanha, com pausa entre os movimentos. A pose permanece distinta mesmo sem animação. O desenho de `Dog` usado no onboarding e demais telas não recebeu alterações.

Referência consultada via Context7: [splash e ícone no Expo](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/).

## Notificações locais de conclusão

expo-notifications ~57.0.21 e config plugin adicionados. Preferência sessionNotifications usa false como padrão, inclusive em dados antigos; somente a ativação explícita solicita permissão. Android cria canal pomodog-sessions com som padrão antes da solicitação. iOS solicita alerta e som, sem badge. Nenhum token remoto é solicitado.

sessionScheduler serializa cancelamento/agendamento do identificador estável pomodog-session-end, evitando que operação atrasada deixe aviso após pausa/reinício. Agenda uma data absoluta, acompanha mudanças de status/deadline e reconcilia ao retornar ao app. Sincronização é idempotente: mesmo prazo/modo preserva o pedido existente sem cancelar nem reagendar. Metadata `{ deadline, mode }` em `content.data` permite comparação sem depender de formato nativo de trigger. Conclusão/restauração vencida não cancela nem repete aviso já devido, permitindo entrega pelo sistema. Apagar dados aguarda cancelamento e invalida solicitação de permissão pendente. Falhas aparecem em Ajustes e, nas outras telas, como aviso discreto.

Ao concluir um ciclo, o timer troca automaticamente de modo (foco → descanso, descanso → foco). O botão "Preparar descanso/próximo foco" foi removido; o usuário apenas toca "Começar" quando quiser iniciar o próximo ciclo.

A implementação .web não importa o módulo nativo e desabilita o controle. No nativo, handler permite banner/lista/som em primeiro plano; entrega em segundo plano fica a cargo do sistema. Não adicionamos SCHEDULE_EXACT_ALARM: a versão instalada do Expo usa setAndAllowWhileIdle quando não há acesso a alarmes exatos, sujeito a atraso. Nenhuma garantia de pontualidade, som ou entrega após encerramento forçado é assumida. Configuração do plugin requer rebuild para binários próprios; o ambiente adotado para validação é development build, não Expo Go.

Na entrada, `WelcomeArtwork` compõe o cronômetro e `WelcomeDog`, com corpo sentado mais erguido e pata levantada. Reutiliza rosto, cenário e `useDogMotion`, com o ciclo calmo de gestos: uma pata acena, cabeça inclina e cauda acompanha, com pausa entre os movimentos. A pose permanece distinta mesmo sem animação. O desenho de `Dog` usado no onboarding e demais telas não recebeu alterações.

Referência consultada via Context7: [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/).

O projeto usa `expo-dev-client`, API pública de notificações e scheme `pomodog`. Contornos antigos com imports internos de Expo Go foram removidos. `notificationOperation` preserva etapa/causa para diagnóstico de desenvolvimento; interface mostra mensagens curtas. Logs e roteiro em [Development build](development-build.md).

## Exclusão autenticada de conta

Perfil oferece exclusão somente à conta autenticada. A operação captura o UID atual, solicita reautenticação com a mesma conta Google e verifica a identidade antes de cada etapa. As regras existentes do Firestore permitem leitura e exclusão somente quando `request.auth.uid` corresponde ao proprietário do caminho; não existe parâmetro de UID escolhido pelo usuário.

Após confirmação, a sincronização deste dispositivo é bloqueada e suas gravações pendentes são drenadas. Avisos locais são cancelados; sessões são removidas em páginas de 200 documentos, seguidas de `state/main` e `users/{uid}`. O armazenamento local dessa conta é apagado e a identidade Firebase Auth é excluída por último. O armazenamento de visitantes é independente.

Firebase Auth e Firestore não oferecem transação conjunta. Uma falha pode deixar dados parcialmente removidos: uma marca local persistente mantém a sincronização suspensa e permite retomar pelo Perfil, inclusive após reabrir o aplicativo. A operação precisa de conexão. A coordenação cobre este dispositivo; outros dispositivos ativos não são bloqueados por essa marca local. Antes de ampliar sincronização simultânea ou volume de dados, adotar exclusão coordenada no servidor para impedir gravações concorrentes e limpar dados mesmo se o cliente encerrar.

## Observabilidade e privacidade

Diagnóstico (`src/monitoring`) e uso (`src/analytics`) possuem controles independentes, locais e desligados por padrão. `src/privacy/consentJournal` conserva a última decisão por finalidade e fila de evidências autenticadas. `consentService` sincroniza somente escolhas feitas pelo UID atual em `users/{uid}/consents/{id}`; regras bloqueiam atualização e outros proprietários. `receivedAt` vem do servidor, `decidedAt` do cliente. A fila é drenada antes da exclusão da conta, que limpa também a subcoleção de consentimentos. Sentry JavaScript e cliente Android são filtrados separadamente; detalhes de dados, cache, mapas e crashes em [Sentry](sentry.md).

Analytics mede transições efetivas fora do reducer, nunca ticks; considera o modo anterior ao concluir ciclo. Fila descarta eventos pendentes após revogação e não reenvia histórico anterior ao consentimento. Android usa adaptador nativo; web/iOS não coletam. Catálogo, configuração e procedimentos em [Analytics](analytics.md). O provider privado `PomodogConsentProvider` aplica a preferência versionada antes de FirebaseInitProvider; o consentimento nativo de diagnóstico também exige a versão atual. Booleans anteriores não são convertidos em evidência. Informações de privacidade reutilizam `Sheet` no onboarding, Ajustes e Perfil. Responsável, e-mail e URL pública são entradas ainda não definidas em `src/privacy/notice.json`; links de política/pedidos só aparecem quando configurados. Regras operacionais e limites em [Privacidade](privacidade.md).

## Tamanho e dependências

Ícones/pesos de fonte são importados individualmente e não há kit completo de componentes. Composição melhora manutenção, mas dependências têm custo de runtime; não implica redução de bundle. Medidas atuais ficam em [Verificação](verificacao.md#tamanhos-medidos) e critérios de otimização em [Próximas etapas](proximas-etapas.md#tamanho-distribuído-e-desempenho-prioridade-antes-do-lançamento).

## Referências técnicas

- [NativeWind: instalação](https://www.nativewind.dev/docs/getting-started/installation)
- [Lucide para React Native](https://lucide.dev/guide/packages/lucide-react-native)
- [Fontes no Expo](https://docs.expo.dev/develop/user-interface/fonts/)
- [tailwind-merge e compatibilidade](https://github.com/dcastil/tailwind-merge)

Documentação consultada via Context7; versões instaladas registradas no lockfile.
