# Arquitetura e escolhas do protótipo

## Responsabilidades

| Parte                      | Responsabilidade                                             |
| -------------------------- | ------------------------------------------------------------ |
| `App.tsx`                  | Carregar fontes locais e configurar a área segura            |
| `src/Pomodog.tsx`          | Compor navegação, telas e modais                             |
| `src/timer.ts`             | Regras puras do timer, sem dependência de React              |
| `src/domain/`              | Preferências, progresso e validação/migração do estado salvo |
| `src/hooks/usePomodoro.ts` | Coordenar timer, hidratação e persistência serializada       |
| `src/storage/prototype.ts` | Adaptar o armazenamento local                                |
| `src/features/`            | Foco, progresso, ajustes e onboarding                        |
| `src/components/ui/`       | Primitivos de texto, botão, cartão, modal e opções           |

As telas recebem dados e callbacks. Não acessam diretamente AsyncStorage. Cartões, modais e botões usam composição por `children`; o botão também recebe um ícone opcional. Os componentes de UI não conhecem regras de Pomodoro.

O histórico anterior é preservado com a mesma chave `pomodog.prototype.v1`. A ausência de `onboardingComplete` é tratada como um registro antigo, mantendo timer, sessões e preferências. O onboarding automático espera uma sessão ociosa para não interromper um foco restaurado.

## Estilos e componentes

- **NativeWind 4 + Tailwind CSS 3**: classes junto ao JSX, compatíveis com componentes React Native. Usamos `View`, `Text` e `Pressable`, preservando Android e web.
- **tailwind-merge 2.6**: resolve conflitos entre classes padrão e classes de quem compõe um componente. Versão compatível com Tailwind 3.
- **Poppins**: três pesos locais, regular, médio e seminegrito. Importação por arquivo; nenhuma requisição ao Google Fonts durante o uso do aplicativo.
- **Lucide React Native**: importação direta dos ícones utilizados. `lucide-react` é destinado à renderização web; a variante nativa usa o `react-native-svg` já presente no projeto.
- **Componentes locais pequenos**: não adotamos um kit completo nesta fase. Há poucas telas; duplicar dependências de tema, navegação e animação não oferece benefício suficiente agora. Reavaliar quando surgirem necessidades concretas como formulários complexos ou navegação nativa adicional.
- **Animação**: onboarding reutiliza `Animated` e o cachorro existente, sem uma nova dependência de animação específica para a introdução. Reanimated e Worklets entram como dependências da solução NativeWind.

Estilos estáticos ficam nas classes. Valores dinâmicos, como a cor escolhida, o progresso do timer e valores animados, permanecem em `style`.

## Tamanho exportado

Valores aproximados, não comprimidos, medidos pelo Expo. Não equivalem ao tamanho de download ou instalação de um APK/AAB.

| Artefato                | Primeiro protótipo | Após refatoração e onboarding |
| ----------------------- | ------------------ | ----------------------------- |
| JavaScript web          | 609 KB             | 746 KB                        |
| CSS web                 | —                  | 12 KB                         |
| Fontes locais           | —                  | 470 KB                        |
| Bytecode Hermes Android | 1,7 MB             | 2,9 MB                        |

A composição melhora manutenção, mas a adoção de NativeWind e suas dependências aumenta o runtime nativo; Poppins adiciona arquivos de fonte. Não tratamos a mudança como uma redução de bundle. Para limitar crescimento, importamos ícones e pesos individualmente e evitamos um kit de componentes completo. Antes da distribuição, medir um APK/AAB real e avaliar subsetting de fontes ou redução de pesos se necessário.

## Fontes técnicas consultadas

- [NativeWind: instalação](https://www.nativewind.dev/docs/getting-started/installation)
- [Lucide para React Native](https://lucide.dev/guide/packages/lucide-react-native)
- [Fontes no Expo](https://docs.expo.dev/develop/user-interface/fonts/)
- [tailwind-merge e compatibilidade](https://github.com/dcastil/tailwind-merge)

Documentação consultada via Context7; versões instaladas registradas no lockfile.

## Evolução de 26/09/2026

A fila de persistência foi isolada em `src/storage/prototypeStore.ts`, com adaptador injetável para testes. Leituras, gravações e exclusão são serializadas. Registros inválidos bloqueiam novas gravações até exclusão explícita. A validação remove campos desconhecidos, limita o histórico e rejeita versões futuras.

A exportação usa Blob/download na web e cache local com folha de compartilhamento no nativo (`expo-file-system` e `expo-sharing`). A exclusão também remove o arquivo temporário nativo; cópias já exportadas permanecem sob controle do usuário. Não há criptografia própria nem sincronização.

Bundle atual: JavaScript web 758 KB, CSS 13 KB, fontes 470 KB e Hermes Android 2,9 MB, sem compressão. O fluxo nativo de compartilhamento ainda precisa de teste em dispositivo. Imports são ordenados pelo plugin Prettier, preservando imports de efeitos colaterais.

## Aliases de imports

Imports internos usam `#src/*` para código em `src/`, `#tests/*` para testes, `#app` para `App.tsx` e `#styles` para `global.css`. Exemplo: `import { Button } from "#src/components/ui/Button"`.

Os mapeamentos em `tsconfig.json` atendem TypeScript e Metro; os equivalentes em `package.json#imports` permitem executar os testes diretamente no Node, que não interpreta `tsconfig.paths`. Manter ambos sincronizados ao adicionar aliases. Não foi adicionada dependência de resolução nem plugin Babel.

Imports executados diretamente pelo Node mantêm a extensão `.ts`. Imports específicos de plataforma, como `#src/storage/exportFile`, permanecem sem extensão para selecionar `.web.ts` na web e `.ts` no Android. O Prettier separa aliases internos de dependências externas e preserva a posição de imports com efeitos colaterais. O CSS tem declaração explícita em `global.d.ts`. Reiniciar Expo CLI após modificar os mapeamentos.

Referências consultadas via Context7: [aliases no Expo](https://docs.expo.dev/guides/typescript/) e [TypeScript no Node](https://nodejs.org/docs/latest-v24.x/api/typescript.html).

## Ícone e splash screen

`assets/brand/mascot-mark.svg` deriva do rosto vetorial original de `src/Dog.tsx`, preservando traços e cores. `npm run assets:generate` usa Sharp, somente como dependência de desenvolvimento, para produzir PNGs determinísticos: ícone opaco 1024 × 1024, foreground e máscara monocromática adaptativos 1024 × 1024, splash transparente 512 × 512 e favicon 64 × 64. Alterações futuras no rosto devem considerar também esta marca derivada.

O foreground mantém o desenho dentro do círculo seguro central de 66/108 da área do ícone. O fundo do ícone é sálvia (`#4E6B55`); a splash usa verde pastel suave (`#EEF0E6`, cor soft das telas), apenas com o mascote, sem texto, e imagem central de largura 200. `app.json` referencia os assets e o config plugin `expo-splash-screen`. No nativo, `App.tsx` impede ocultação automática e libera a splash após carregamento das fontes (ou erro) e layout da raiz. Não há atraso artificial. Na web permanece o carregamento atual e é adicionado favicon.

`assets/brand/preview.png` é uma prancha de revisão, não uma captura de dispositivo. Mudanças de splash/ícone exigem novo build nativo; exportar JavaScript não aplica nem comprova esses recursos no Android instalado.

Referência consultada via Context7: [splash e ícone no Expo](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/).

## Gestos no onboarding

No Android/iOS, um `ScrollView` horizontal com `pagingEnabled` controla as três páginas; cada página possui rolagem vertical independente com `nestedScrollEnabled`. A largura vem do layout real e é reaplicada em mudanças de viewport. Ao terminar o movimento, o índice sincroniza indicadores e botão final. Os pontos também navegam pelo pager; com movimento reduzido, essa navegação programática não anima. Mascotes fora da página ativa ficam sem animação e seu conteúdo não entra na navegação do leitor de tela.

Na web, PanResponder mantém o arraste por mouse/toque, com limiar de 55 px e rejeição de movimentos predominantemente verticais. O conteúdo das etapas é compartilhado. A separação evita a disputa entre o detector JavaScript e o ScrollView nativo que impedia o swipe no Android. Não foram adicionadas dependências.

## Separação de Perfil e Ajustes

A navegação inferior possui quatro abas: Foco, Progresso, Ajustes e Perfil. Ajustes concentra durações, tema, movimento reduzido e acesso à introdução. `src/features/profile/` contém a tela de perfil, identidade/modo local, controles de dados e confirmação de exclusão. A tela usa composição por `children`; a ação de exclusão permanece coordenada pela raiz e pelo hook de persistência. A mudança não cria autenticação nem altera armazenamento.

## Simplificação da tela de Foco

`FocusScreen` compõe somente `TimerCard`; o resumo diário é calculado apenas em Progresso, sem duplicação. Mensagens de estado curtas ficam no balão do mascote. O componente `ScreenIntro`, sem consumidores após remover cabeçalhos introdutórios, foi removido. A opção demo saiu do domínio e da configuração de sessões; `parseTimer` aceita o campo antigo somente para migrar uma demonstração para o estado inicial, preservando sessões concluídas e sem contabilizar a demonstração.

## Botões destrutivos

`Button` oferece a propriedade `destructive`, com vermelho centralizado em `destructiveColor` (`#B42318`). Com `secondary`, colore o texto e preserva fundo discreto; sem `secondary`, aplica fundo vermelho e texto branco. A ação de apagar dados e sua confirmação usam a variante, independentemente do tema escolhido.

## Exportação retirada da interface

Perfil não oferece mais exportação nem explica formatos de arquivo. A ação e o estado de exportação foram removidos da raiz, assim como o snapshot do hook. Utilitários anteriores permanecem internos; a exclusão ainda limpa o arquivo temporário legado quando existir. Firebase/sincronização não foram habilitados nesta alteração.

## Tour guiado

`src/features/tour/GuidedTour.tsx` recebe referências estáveis para controles e container. `measureInWindow` posiciona uma máscara em quatro partes, borda de destaque e explicação acima ou abaixo do alvo. Medições são atualizadas apenas enquanto o tour está montado e liberadas no fechamento; a raiz ajusta o scroll conforme etapa e viewport. O painel possui rolagem em telas pequenas/fontes ampliadas. Não há biblioteca adicional.

A camada de fundo bloqueia interação e fica fora da navegação assistiva. Web mantém foco nos controles do guia, permite Escape e tenta devolver o foco anterior; Android usa o botão Voltar. Não há animações do tour e o mascote fica estático durante a explicação. O tour não executa ações do timer. Aceitar Mostrar como funciona conclui o onboarding usando a persistência existente; etapas do tour são temporárias e ele só reabre por escolha explícita. Validação de acessibilidade nativa ainda necessária.

## Mascote articulado

`src/Dog.tsx` compõe as camadas; `src/features/mascot/Artwork.tsx` guarda a ilustração e `useDogMotion.ts` controla o ciclo de vida das animações. Um palco de 360 × 230 é escalado uniformemente dentro do espaço disponível, mantendo os pivôs de cabeça, patas, tronco e cauda alinhados em telas menores.

Animated transforma Views que contêm SVGs estáticos, usando driver nativo em Android/iOS e sem atualizar estado React a cada frame. Respiração e gestos têm ciclos separados; gestos incluem pausas e amplitudes menores fora da introdução/comemoração. Movimento reduzido zera todas as transformações. AppState interrompe os ciclos em segundo plano e reinicia ao retornar; cleanup remove listener e encerra animações. Mascotes fora da página ativa e atrás do onboarding/tour ficam imóveis.

Referência consultada via Context7: [Animated no React Native](https://reactnative.dev/docs/animated).

## Estatísticas de Progresso

summarizeProgress considera hoje e os seis dias anteriores no calendário local, exclui registros futuros e calcula minutos totais, sessões, dias distintos e duração média. Totais são arredondados após somar segundos. Sem sessões, a interface usa travessão para a média. O gráfico ajusta a escala ao maior valor do período; lista recente ordena por conclusão. Os cálculos usam o histórico local existente, sem adicionar coleta ou armazenamento.

## Sequência de foco

summarizeStreak deriva a sequência do histórico local disponível (limitado a 1.000 sessões), sem novo estado persistido. Deduplica dias, exclui registros futuros e percorre datas com setDate, sem subtrair intervalos fixos de 24 horas. A contagem não é limitada aos sete marcadores. StreakCard apresenta estado inicial, singular/plural, ícone e descrições acessíveis por data; marcadores completos usam check além da cor.

## Petisco e mensagens

petCare é campo opcional do registro local existente: lastFedAt e lastMessageId. parsePetCare valida timestamp e identificador conhecido, descartando metadados opcionais inválidos sem perder timer/histórico. Dados antigos continuam válidos. usePomodoro salva a interação pela mesma fila de persistência e limpa o campo ao apagar dados. Nenhum serviço remoto participa.

choosePetResponse escolhe frases predefinidas por estado do timer/histórico e alterna a última frase do grupo. TimerCard mantém apenas a reação temporária, com bloqueio imediato via ref, timeout de seis segundos e cleanup ao desmontar. O petisco não despacha ações no timer; Dog reutiliza a comemoração, enquanto o balão usa anúncio acessível polite. Movimento reduzido preserva pose estática e a resposta textual.

## Notificações locais de conclusão

expo-notifications ~57.0.21 e config plugin adicionados. Preferência sessionNotifications usa false como padrão, inclusive em dados antigos; somente a ativação explícita solicita permissão. Android cria canal pomodog-sessions com som padrão antes da solicitação. iOS solicita alerta e som, sem badge. Nenhum token remoto é solicitado.

sessionScheduler serializa cancelamento/agendamento do identificador estável pomodog-session-end, evitando que operação atrasada deixe aviso após pausa/reinício. Agenda uma data absoluta, acompanha mudanças de status/deadline e reconcilia ao retornar ao app. Conclusão/restauração vencida não cancela nem repete aviso já devido, permitindo entrega pelo sistema. Apagar dados aguarda cancelamento e invalida solicitação de permissão pendente. Falhas aparecem em Ajustes e, nas outras telas, como aviso discreto.

A implementação .web não importa o módulo nativo e desabilita o controle. No nativo, handler permite banner/lista/som em primeiro plano; entrega em segundo plano fica a cargo do sistema. Não adicionamos SCHEDULE_EXACT_ALARM: a versão instalada do Expo usa setAndAllowWhileIdle quando não há acesso a alarmes exatos, sujeito a atraso. Nenhuma garantia de pontualidade, som ou entrega após encerramento forçado é assumida. Configuração do plugin requer rebuild para binários próprios; notificações locais são suportadas em Expo Go, ao contrário de push remoto Android.

Referência consultada via Context7: [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/).

## Compatibilidade de notificações com Expo Go

O entrypoint de expo-notifications reexporta DevicePushTokenAutoRegistration.fx, que inicializa o listener de tokens e dispara o erro de push remoto no Expo Go Android. O adaptador importa diretamente os módulos locais em build/, sem carregar esse entrypoint. Não suprimimos LogBox nem modificamos node_modules. expo-notifications foi fixado em 57.0.21: esses caminhos internos precisam ser revisados em upgrades. Os scripts start/android usam --go explicitamente; a tecla s muda o destino para development build, que requer preparação separada.

## Diagnóstico local de notificações

notificationOperation envolve criação do canal, consulta/solicitação de permissão, cancelamento e agendamento. NotificationFailure preserva cause e etapa; em **DEV** registra código/mensagem/stack com prefixo [Pomodog notifications], sem conteúdo de notificações ou histórico. Interface apresenta mensagem por etapa, sem stack. Ajustes rola ao topo quando surge aviso. A configuração de permissão inclui android: {} para não passar undefined ao módulo Android; isso é correção preventiva, não evidência da causa específica relatada.
