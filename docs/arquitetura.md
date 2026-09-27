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

O foreground mantém o desenho dentro do círculo seguro central de 66/108 da área do ícone. O fundo do ícone é sálvia (`#4E6B55`); a splash usa creme (`#F8F7F2`) e imagem central de largura 200. `app.json` referencia os assets e o config plugin `expo-splash-screen`. No nativo, `App.tsx` impede ocultação automática e libera a splash após carregamento das fontes (ou erro) e layout da raiz. Não há atraso artificial. Na web permanece o carregamento atual e é adicionado favicon.

`assets/brand/preview.png` é uma prancha de revisão, não uma captura de dispositivo. Mudanças de splash/ícone exigem novo build nativo; exportar JavaScript não aplica nem comprova esses recursos no Android instalado.

Referência consultada via Context7: [splash e ícone no Expo](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/).

## Gestos no onboarding

No Android/iOS, um `ScrollView` horizontal com `pagingEnabled` controla as três páginas; cada página possui rolagem vertical independente com `nestedScrollEnabled`. A largura vem do layout real e é reaplicada em mudanças de viewport. Ao terminar o movimento, o índice sincroniza indicadores e botão final. Os pontos também navegam pelo pager; com movimento reduzido, essa navegação programática não anima. Mascotes fora da página ativa ficam sem animação e seu conteúdo não entra na navegação do leitor de tela.

Na web, PanResponder mantém o arraste por mouse/toque, com limiar de 55 px e rejeição de movimentos predominantemente verticais. O conteúdo das etapas é compartilhado. A separação evita a disputa entre o detector JavaScript e o ScrollView nativo que impedia o swipe no Android. Não foram adicionadas dependências.

## Separação de Perfil e Ajustes

A navegação inferior possui quatro abas: Foco, Progresso, Ajustes e Perfil. Ajustes concentra durações, tema, movimento reduzido e acesso à introdução. `src/features/profile/` contém a tela de perfil, identidade/modo local, controles de dados e confirmação de exclusão. A tela usa composição por `children`; ações de exportação e exclusão permanecem coordenadas pela raiz e pelo hook de persistência. A mudança não cria autenticação nem altera armazenamento.

## Simplificação da tela de Foco

`FocusScreen` compõe somente `TimerCard`; o resumo diário é calculado apenas em Progresso, sem duplicação. Mensagens de estado curtas ficam no balão do mascote. O componente `ScreenIntro`, sem consumidores após remover cabeçalhos introdutórios, foi removido. A opção demo saiu do domínio e da configuração de sessões; `parseTimer` aceita o campo antigo somente para migrar uma demonstração para o estado inicial, preservando sessões concluídas e sem contabilizar a demonstração.

## Botões destrutivos

`Button` oferece a propriedade `destructive`, com vermelho centralizado em `destructiveColor` (`#B42318`). Com `secondary`, colore o texto e preserva fundo discreto; sem `secondary`, aplica fundo vermelho e texto branco. A ação de apagar dados e sua confirmação usam a variante, independentemente do tema escolhido.
