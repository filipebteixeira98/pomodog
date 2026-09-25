# Pomodog

Protótipo funcional de um companheiro de foco: timer Pomodoro, cachorro animado, personalização discreta e progresso sem punições. Interface em português, com armazenamento local e sem cadastro.

## Experimentar

Requer Node.js 24 e npm. Dependências registradas em `package-lock.json`.

```sh
npm ci
npm run web
```

Abra o endereço exibido no terminal. Para apresentar rapidamente o ciclo completo, use **Experimentar em 10 segundos** e depois **Começar a focar**. A demonstração não altera o histórico.

Para abrir no Android com Expo Go compatível com o SDK instalado:

```sh
npm start
```

Use o QR code no Expo Go, com celular e computador na mesma rede. O projeto usa Expo SDK 57, React Native 0.86 e TypeScript. A execução em dispositivo físico ainda precisa ser validada; a exportação do JavaScript Android não equivale a gerar ou testar um APK.

## Funcionalidades

- Foco de 15, 25 ou 50 minutos e descanso de 5, 10 ou 15 minutos.
- Início, pausa, retomada e reinício com confirmação de descarte.
- Contagem baseada no horário final, recuperada ao retornar ao aplicativo ou reabri-lo.
- Cachorro vetorial original com estados de espera, companhia e celebração.
- Três cores de interface e coleira; opção de reduzir movimento, respeitando também a configuração do sistema.
- Sessões de foco concluídas, minutos do dia e histórico dos últimos sete dias; armazenamento das últimas 1.000 sessões.
- Preferências e sessão atual salvas no dispositivo. Descansos e demonstrações não contam como foco.

## Limites desta versão

- Sem notificações ou som ao concluir com a tela bloqueada. Ao voltar, o timer recupera o tempo decorrido. Validar notificações e comportamento nativo antes de um teste prolongado de rotina.
- Sem LoFi, pagamentos, conta, sincronização ou telemetria remota. Bibliotecas musicais ainda precisam ser selecionadas e ter suas licenças verificadas.
- Dados pertencem à instalação/navegador: limpar dados ou trocar de dispositivo não preserva o histórico.
- Ainda não publicado, sem APK ou distribuição na loja. O endereço local depende do servidor em execução.

## Verificação

```sh
npm run typecheck
npm test
npm run export:web
npx expo export --platform android --output-dir dist-android
```

Os testes do timer cobrem passagem do tempo em segundo plano, pausa/retomada, restauração, conclusão única, exclusão de demonstrações/descansos e rejeição de dados inválidos.

`npm audit` identificou 10 avisos moderados na árvore de ferramentas do Expo, relacionados à dependência transitiva `uuid` por `xcode`. A sugestão automática envolve downgrade incompatível de Expo; não foi aplicada. Reavaliar antes de distribuição.

## Organização

- `App.tsx`: telas, controles e persistência local.
- `src/Dog.tsx`: ilustração original e animação do mascote.
- `src/timer.ts`: regras do timer e validação do estado salvo.
- `tests/timer.test.ts`: testes das regras de tempo.
- [Produto e validação](docs/produto-e-validacao.md): hipóteses e roteiro para avaliações.

Configuração baseada na documentação do Expo consultada via Context7: [templates](https://github.com/expo/expo/blob/main/docs/pages/more/create-expo.mdx) e [suporte web](https://github.com/expo/expo/blob/main/docs/pages/workflow/web.mdx).
