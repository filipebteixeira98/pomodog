# Pomodog

Protótipo funcional de um companheiro de foco: timer Pomodoro, cachorro animado, onboarding, personalização discreta e progresso sem punições. Interface em português, modo local e integração opcional com Google/Firebase em desenvolvimento.

## Experimentar

Requer Node.js 24 e npm. Dependências registradas em `package-lock.json`.

```sh
npm ci
npm run web
```

Abra o endereço exibido no terminal e toque em **Começar a focar**. Ajuste as durações em **Ajustes** e acompanhe as sessões em **Progresso**.

Na primeira abertura, a introdução mostra três passos curtos. É possível pular. A introdução aparece novamente após apagar os dados locais em Perfil. Uma sessão restaurada em andamento não é interrompida pelo onboarding automático. Na última etapa, **Mostrar como funciona** abre um tour opcional dos controles reais. Você também pode acessá-lo em **Ajustes → Rever tour guiado**.

Para abrir no Android com development build (expo-dev-client):

```sh
npm run android
```

O projeto usa Expo SDK 57, React Native 0.86 e TypeScript. O fluxo de notificações usa development build; siga [o guia de instalação e validação](docs/development-build.md). A exportação do JavaScript Android não equivale a gerar ou testar um APK.

## Funcionalidades

- Foco de 15, 25 ou 50 minutos e descanso de 5, 10 ou 15 minutos.
- Início, pausa, retomada e reinício com confirmação de descarte.
- Contagem baseada no horário final, recuperada ao retornar ao aplicativo ou reabri-lo.
- Nino (nome provisório): cachorro vetorial original com entrada animada, respiração do tronco, cabeça e patas articuladas, cauda animada e diálogos no onboarding.
- Três cores de interface e coleira; opção de reduzir movimento, respeitando também a configuração do sistema.
- Sessões de foco concluídas, minutos do dia e histórico dos últimos sete dias; armazenamento das últimas 1.000 sessões.
- Preferências e sessão atual salvas no dispositivo. Descansos não contam como foco.
- Onboarding por swipe nos dois sentidos, indicação “Deslize para explorar”, pontos acessíveis e botão de entrada apenas na última etapa; permite pular e mantém a conclusão salva. Animações seguem Ajustes e sistema.
- Navegação inferior com Foco, Progresso, Ajustes e Perfil. Entrada Google e sincronização Firebase implementadas; validação completa com login real ainda pendente.
- Exclusão de dados locais com confirmação em Perfil; dados ilegíveis são preservados e o salvamento fica suspenso até recuperação explícita.
- Ícone do Nino, versões adaptativa/monocromática para Android e splash nativa configurada; validação visual em release pendente.
- Poppins empacotada, ícones Lucide e estilos Tailwind via NativeWind para Android e web.

## Limites desta versão

- Aviso local opcional de conclusão em **Ajustes → Avisar ao terminar** (Android/iOS). Requer permissão; agendamento é feito no sistema e pode funcionar com a tela bloqueada. Economia de bateria, permissões, modo silencioso e restrições do sistema podem atrasar ou silenciar o aviso. Não há garantia de alarme exato; validar esta entrega em dispositivo antes de um teste prolongado. Na web, o controle não é exibido.
- Sem LoFi, pagamentos ou telemetria de uso. Bibliotecas musicais ainda precisam ser selecionadas e ter suas licenças verificadas.
- Sem conta, dados pertencem à instalação/navegador. A integração de contas usa somente o projeto Firebase de desenvolvimento; produção e exclusão de conta ainda estão pendentes.
- Ainda não publicado, sem APK ou distribuição na loja. O endereço local depende do servidor em execução.

## Verificação

```sh
npm run typecheck
npm test
npm run format:check
npm run export:web
npm run export:android
```

Os 47 testes cobrem passagem do tempo em segundo plano, pausa/retomada, restauração, conclusão única, exclusão de descansos e migração segura de demonstrações antigas, migração de dados antigos, onboarding persistido, dados inválidos, progresso entre datas locais, identidade, exportação e exclusão serializada sem sobrescrever registros corrompidos, e idempotência de agendamento de notificações.

`npm audit` identificou 12 avisos moderados na árvore de ferramentas do Expo, relacionados à dependência transitiva `uuid` por `xcode`. A sugestão automática envolve downgrade incompatível com o SDK instalado; não foi aplicada. Reavaliar antes de distribuição.

## Organização

- `App.tsx`: fontes e providers; `src/Pomodog.tsx`: composição das telas.
- `src/features/`: foco, progresso, ajustes e onboarding.
- `src/components/ui/`: componentes reutilizáveis por composição.
- `src/hooks/`, `src/domain/` e `src/storage/`: estado, regras e persistência separados da interface.
- `src/Dog.tsx` e `src/features/mascot/`: composição, ilustração original e animação articulada do mascote.
- `src/timer.ts`: regras do timer e validação do estado salvo.
- `tests/timer.test.ts`: testes das regras de tempo.
- [Produto e validação](docs/produto-e-validacao.md): hipóteses e roteiro para avaliações.
- [Arquitetura e bundle](docs/arquitetura.md): escolhas, responsabilidades e custo das dependências.
- [Plano de ação](docs/plano-de-acao.md): etapas desta entrega.
- [Próximas etapas](docs/proximas-etapas.md): autenticação opcional, validação nativa e integrações futuras.

## Histórico de desenvolvimento

Repositório privado: [filipebteixeira98/pomodog](https://github.com/filipebteixeira98/pomodog). Commits incrementais seguem Conventional Commits, em inglês. Use `npm run format` para formatar alterações e ordenar imports automaticamente e execute os checks antes de cada commit.

Configuração baseada na documentação do Expo consultada via Context7: [templates](https://github.com/expo/expo/blob/main/docs/pages/more/create-expo.mdx) e [suporte web](https://github.com/expo/expo/blob/main/docs/pages/workflow/web.mdx).

## Assets da marca

Fonte vetorial e PNGs em `assets/brand/`. Para regenerar: `npm run assets:generate`. Veja a [prancha de revisão](assets/brand/preview.png). Ícone e splash nativa requerem novo build; Expo Go não reproduz integralmente a splash final.

### Executar no Android pessoal

O fluxo de notificações agora usa development build, com expo-dev-client instalado. Siga [o guia de instalação e validação](docs/development-build.md). `npm run android` compila e instala no aparelho conectado; `npm start` inicia o Metro para o cliente próprio.

## Diagnóstico de erros

Sentry integrado para erros JavaScript. Envio opcional em Ajustes, desligado por padrão e independente da conta. [Configuração, privacidade e validação](docs/sentry.md). Reinstale development build após adicionar o SDK; uploads de source maps de release exigem SENTRY_AUTH_TOKEN no ambiente de build.

### Source maps

`npm run sentry:export:web` e `npm run sentry:export:android` geram bundles/mapas privados. `npm run sentry:check` verifica os IDs; `npm run sentry:upload` envia após configurar o token de build em `.env.sentry-build-plugin` (veja o arquivo `.example`). Mapas de APK são enviados pelo plugin Gradle no build de release. [Instruções e pendências](docs/sentry.md).
