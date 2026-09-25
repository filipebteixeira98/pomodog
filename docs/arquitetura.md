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
