# Verificação do primeiro protótipo

Verificado em 25/09/2026.

- TypeScript: passou.
- Regras do timer: cinco testes passaram.
- Exportação de produção web: passou.
- Exportação do JavaScript/Hermes Android: passou; não constitui teste em dispositivo ou APK.
- Navegador Chromium automatizado: página carregou, sem erros capturados.
- Demonstração de 10 segundos: concluiu e manteve zero sessões no progresso.
- Sessão normal iniciada e pausada: recarregamento preservou a possibilidade de retomar.
- Tema terracota: persistiu ao recarregar.
- Recuperação de sessão vencida: horário final simulado no armazenamento exclusivo do navegador de teste; recarregamento registrou uma sessão de 1.500 segundos.
- Tela de 320 px: largura do conteúdo de 320 px, sem transbordamento horizontal.
- Inspeção visual em 390 × 844 e 1440 × 1000.
- Dados sintéticos removidos do navegador de teste ao concluir.

Capturas: [foco no celular](screenshots/foco-mobile.png), [progresso no celular](screenshots/progresso-mobile.png) e [foco no desktop](screenshots/foco-desktop.png).

Pendente: execução no Android físico, comportamento com tela bloqueada, notificações e avaliação por usuários. Os testes do navegador não comprovam esses aspectos nativos.

## Refatoração e onboarding

- TypeScript e formatação Prettier: passaram.
- Nove testes de domínio: passaram, incluindo migração de registros antigos, persistência do onboarding e limites de data local no progresso.
- Exportações web e Hermes Android: passaram com NativeWind, Poppins e Lucide.
- Introdução: avançar pelas três etapas, voltar, pular, concluir e reabrir pelos ajustes.
- Conclusão persistida: a introdução não reaparece após recarregar.
- Movimento reduzido e tema terracota: mantidos ao recarregar.
- Tela de 320 px: conteúdo com 320 px, sem transbordamento horizontal.
- Fundo do modal: atributo `aria-hidden` confirmado no navegador; flags nativas configuradas. Leitor de tela em Android físico ainda não testado.
- Demonstração de 10 segundos: conclusão verificada após refatoração e onboarding.
- Migração no navegador com registro sintético antigo: preservou 1 sessão, 1.234 segundos restantes e tema lavanda; não interrompeu a sessão pausada com o onboarding.
- Cancelamento de reinício, retomada e nova pausa: verificados.
- Dados sintéticos de histórico removidos antes de capturar as telas finais. Sem erros capturados no navegador.

Capturas atuais: [foco](screenshots/foco-atual.png), [progresso](screenshots/progresso-atual.png), [introdução](screenshots/onboarding-inicio.png) e [introdução em 320 px](screenshots/onboarding-320.png).

## Diálogos, ajustes e autonomia — 26/09/2026

- TypeScript e os 16 testes passaram, incluindo fila de escrita/exclusão, corrupção, versões futuras, limites, exportação e identidade.
- Exportações web (758 KB de JavaScript) e Hermes Android (2,9 MB) passaram.
- Nino entra em cena, move o corpo e a cauda; transformações da cauda variaram durante a animação e ficaram estáveis ao pausar movimentos.
- Ajustes acessíveis pela terceira aba, com preferências e modo local. Identidade autenticada coberta por teste do contrato; não há serviço de login integrado.
- Download real de JSON verificado: versão, data, timer e preferências legíveis.
- Cancelar exclusão preservou o tema; confirmar restaurou padrões e histórico vazio após recarregar.
- Registro corrompido permaneceu intacto com aviso e exportação bloqueada. Exclusão explícita permitiu salvar novamente e preservou uma chave não pertencente ao aplicativo.
- Layout de 320 px sem transbordamento horizontal. Nova sessão Chromium carregou a versão final sem erros capturados.
- Android físico e compartilhamento nativo ainda pendentes. `npm audit`: 11 avisos moderados transitivos, nenhum alto/crítico; correção automática incompatível com o SDK não aplicada.

Capturas: [diálogos](screenshots/onboarding-dialogos.png), [320 px](screenshots/onboarding-dialogos-320.png) e [aba Ajustes](screenshots/ajustes-aba.png).

## Migração para aliases

- Imports relativos removidos de `App.tsx`, `index.ts`, `src/` e `tests/`; aliases internos ordenados pelo Prettier.
- TypeScript e os 16 testes existentes passaram com resolução nativa de subpaths no Node.
- Exportações web e Hermes Android passaram, incluindo CSS e módulos específicos de plataforma; tamanhos aproximados mantidos em 758 KB de JavaScript web e 2,9 MB de Hermes.
- Formatação e `git diff --check` passaram. Nenhuma dependência nova e nenhuma alteração de comportamento planejada.
- Esta refatoração foi validada por compilação, testes e exports; não inclui novo teste em navegador ou Android físico.

## Ícone e splash screen

- PNGs inspecionados: ícone 1024 × 1024 opaco, foreground e máscara monocromática 1024 × 1024 com alpha, splash 512 × 512 e favicon 64 × 64.
- Desenho do foreground dentro do círculo seguro: raio máximo de pixels visíveis 269,85 px, inferior ao limite de 312,89 px no canvas de 1024 px.
- Prancha de revisão visual inspecionada: [ícone, máscara circular e marca da splash](../assets/brand/preview.png). Trata-se de prévia gráfica, não screenshot nativo.
- TypeScript, 16 testes e resolução do config plugin via `expo config --type prebuild` passaram.
- Exportações web (759 KB de JavaScript, favicon incluído) e Hermes Android (2,9 MB) passaram.
- Pendente: build Android de release, abertura a frio, transição após carregamento de fontes e aparência em launchers/ícones temáticos. Expo Go e exportação JS não substituem essas verificações.
- Instalação reportou 12 avisos moderados nas dependências; não foi aplicada correção forçada incompatível.

## Simplificação do onboarding

Removidos o botão de pausar/ativar movimentos, o aviso local e o estado temporário correspondente. Revisão do fluxo confirmou que mascote e transições continuam recebendo a preferência combinada de Ajustes e sistema. TypeScript, Prettier e `git diff --check` passaram. Sem nova verificação em dispositivo; capturas anteriores documentam a versão anterior ao ajuste.

## Onboarding por swipe

- TypeScript e exports web/Android passaram após a mudança; sem dependências adicionais.
- Chromium: arraste real avançou da primeira para a segunda etapa. Sequência de eventos de arraste verificou retorno, limites e rejeição de deslocamentos curtos, inclusive com movimento reduzido ativado (etapas observadas: 1, 1, 2, 1, 2, 3, 3).
- Pontos acionáveis navegaram entre etapas. Botão final concluiu a introdução e o estado persistiu ao recarregar; Continuar e Voltar foram removidos.
- Tela de 320 px sem transbordamento; nenhuma exceção capturada na sessão de teste.
- [Primeira etapa em 320 px](screenshots/onboarding-swipe-320.png) e [última etapa](screenshots/onboarding-swipe-final.png).
- Gestos por toque em Android físico e leitor de tela nativo permanecem pendentes; a verificação de navegador não os substitui.

## Correção do swipe no Android

- O usuário relatou falha em emulador e aparelho. No emulador conectado (`emulator-5554`, Expo Go), o detector manual não avançou a primeira etapa com `adb shell input swipe`.
- Após substituir a detecção nativa por `ScrollView` horizontal paginado, os mesmos gestos avançaram à segunda e à terceira etapa. Gesto inverso retornou à segunda, com indicador sincronizado e remoção do botão final.
- Capturas inspecionadas: [última etapa Android](screenshots/onboarding-android-final.png) e [retorno Android](screenshots/onboarding-android-retorno.png).
- TypeScript e exports web/Android passaram. Mantida a implementação de arraste da web; conteúdo compartilhado entre plataformas.
- Ainda pendentes: confirmação em aparelho físico, iOS, leitor de tela e rolagem em telas menores. Essa verificação em Expo Go não valida splash/ícone de release nem os demais recursos nativos do backlog.

## Revisão dos diálogos

As três descrições foram reduzidas, preservando os nomes dos controles e as instruções essenciais. Revisão textual e formatação verificadas; nenhuma lógica de navegação alterada. Capturas anteriores ainda mostram os textos antigos. O efeito na compreensão e experiência precisa de avaliação com usuários.

## Perfil separado de Ajustes

- Navegador em 320 px: quatro abas legíveis e sem transbordamento horizontal; Perfil contém identidade/modo local e controles de dados, ausentes em Ajustes.
- Download JSON efetuado pela nova tela; confirmação de exclusão aberta e cancelada sem apagar dados. Preferências e Rever introdução continuam em Ajustes.
- TypeScript e exportações web/Android passaram. Sem alteração na persistência nem no contrato de identidade. Não houve nova validação em dispositivo nativo nesta entrega.
- Captura atual: [Perfil em 320 px](screenshots/perfil-320.png). Capturas anteriores de Ajustes representam a organização anterior.

## Interface centrada no Pomodoro

- TypeScript, 17 testes e exports web/Android passaram. Novo teste cobre migração de demonstração antiga sem perda nem incremento do histórico.
- Navegador em 320 px: Foco sem demonstração, cabeçalho ou resumo diário; mensagem curta no balão do mascote. Início, pausa e preservação da sessão ao trocar abas verificados.
- Progresso reúne minutos e sessões em Seu dia, até aqui, sem duplicação; largura de conteúdo igual à viewport (320 px).
- Capturas: [Foco](screenshots/foco-minimalista-320.png) e [Progresso](screenshots/progresso-minimalista-320.png). Sem nova verificação em dispositivo nesta entrega.

## Cor das ações destrutivas

TypeScript e formatação passaram. No navegador, conferidas as cores computadas: ação de exclusão com texto vermelho `#B42318` sobre fundo discreto, confirmação com fundo vermelho e texto branco, cancelamento neutro. Confirmação aberta e cancelada sem apagar dados. Sem alteração no fluxo de persistência.

## Espaçamento e ícones informativos

TypeScript, formatação e revisão do diff passaram. Inspecionados no navegador em 320 px o [aviso de histórico local](screenshots/progresso-aviso-local.png) e o [ícone de Tempo de foco](screenshots/ajustes-icone-foco.png), sem transbordamento horizontal. Padding inferior do card de Foco aumentado para 24 px. Ajustes exclusivamente visuais, sem nova validação nativa.

## Hierarquia de Perfil e Ajustes

TypeScript e formatação passaram. Capturas em 320 px verificadas: [Ajustes](screenshots/ajustes-hierarquia.png) com PREFERÊNCIAS, subtítulo e rótulo de duração separado; [Perfil](screenshots/perfil-hierarquia.png) com PRIVACIDADE e subtítulo abaixo. Sem transbordamento horizontal. Mudança visual, sem alteração dos controles.

## Perfil sem exportação

TypeScript, formatação e diff verificados. No navegador, Perfil apresenta apenas Apagar dados deste dispositivo; confirmada ausência de Exportar meus dados e JSON. Removida a referência a cópias exportadas na confirmação. Exclusão e limpeza do cache legado preservadas; nenhuma integração remota ativada.

## Rever introdução com ícone

TypeScript e formatação passaram. No navegador, confirmados ausência do aviso técnico em Ajustes, ícone no botão Rever introdução e reabertura/fechamento do onboarding pelo mesmo fluxo. Sem alteração no timer ou nas notificações.

## Tour guiado — 27/09/2026

- TypeScript, 17 testes existentes e exports web/Android passaram; nenhuma dependência adicionada.
- Navegador: entrada pelo botão Mostrar como funciona na última etapa do onboarding e por Rever tour guiado em Ajustes. Avançar, voltar, concluir e pular verificados.
- Timer permaneceu ocioso após concluir o tour; onboarding ficou concluído no armazenamento local ao aceitar a oferta.
- Telas de 500 × 757 e 320 × 568 inspecionadas; destaque do botão acompanha a rolagem. Preferência de movimento reduzido ativada na verificação de tela pequena.
- Foco de teclado inicia em Próximo, Shift+Tab retorna a Pular tour e Escape fecha. Sessão de navegador sem erros capturados.
- Capturas: [modos](screenshots/tour-modos-320.png), [sessão](screenshots/tour-sessao-320.png), [navegação](screenshots/tour-navegacao.png).
- Sem emulador/aparelho conectado na consulta ADB desta entrega: posicionamento, botão Voltar e leitor de tela nativos ainda precisam de validação em dispositivo.

## Controles e fundo da splash — 27/09/2026

- TypeScript, 17 testes existentes e git diff --check passaram.
- Revisão do código confirmou remoção do fluxo Rever introdução e sublinhado desativado somente em Reiniciar sessão.
- Imagem da splash inspecionada: contém somente o mascote, sem texto. Fundo do plugin atualizado para #EEF0E6 e prancha regenerada pelo script de assets.
- A configuração nativa exige novo build. Não foi validada abertura em dispositivo nesta alteração; Expo Go não comprova o resultado final, conforme documentação do Expo consultada via Context7.

## Animação corporal — 27/09/2026

- TypeScript, 17 testes existentes, formatação dos arquivos alterados e diff passaram. Exports web (766 KB de JavaScript) e Android (2,9 MB de Hermes) concluídos, sem dependências novas.
- No navegador, amostradas 20 poses da introdução em quatro segundos: cabeça, tronco, ambas as patas e cauda apresentaram transformações distintas.
- Durante sessão de foco, tronco e cabeça respiram; patas e cauda permanecem paradas. Sessão pausada após a verificação.
- Com Reduzir animações ativo, todas as seis camadas permaneceram na transformação identidade em duas medições separadas por 1,5 segundo.
- Inspecionada composição em Foco a 320 × 568 e introdução em viewport maior. Comemoração acessada em viewport de 320 × 568; conteúdo da introdução continua rolável. Nenhum erro capturado na sessão de navegador.
- Revisão dos ciclos incluiu reset antes de reiniciar loops interrompidos, cleanup de animações/listener e imobilização do mascote atrás do onboarding.
- ADB não encontrou aparelho/emulador conectado. Aparência, retomada após segundo plano e desempenho/FPS nativos ainda precisam de verificação em dispositivo; exportar o bundle não comprova esses comportamentos.

## Correção de texto no SVG — 27/09/2026

Removidos dois filhos JSX explícitos `{" "}` em Scenery e Head de Artwork.tsx. Esses espaços eram nós de texto dentro do SVG e causavam “Text strings must be rendered within a <Text> component” no Expo Go; LogBoxData.js apenas reportava o erro. TypeScript, Prettier e diff passaram. Inspeção da árvore sintática de Artwork.tsx e Dog.tsx confirmou ausência de filhos JSX com texto literal. A validação anterior no navegador não detectou essa restrição nativa; confirmação em Expo Go após recarregar permanece pendente.

## Dashboard semanal — 27/09/2026

TypeScript e 20 testes passaram. Novos cenários cobrem histórico vazio, limites do período entre anos, exclusão de registros futuros, dias distintos e arredondamento após soma. Estado vazio inspecionado no navegador em 320 × 720: estatísticas legíveis e média exibida como travessão. Cálculos com histórico preenchido verificados nos testes; inspeção visual nativa pendente. Sem mudanças no armazenamento ou telemetria.

## Card de sequência

TypeScript e 23 testes passaram, também com TZ=America/New_York para exercitar transição de horário de verão. Cenários cobrem virada de ano, mais de sete dias, múltiplas sessões no mesmo dia, tolerância durante hoje, interrupção, reinício, histórico vazio e registros futuros. Estado inicial inspecionado no navegador a 320 px: fundo pastel, chama e marcadores legíveis. Contagens preenchidas verificadas nos testes; inspeção em dispositivo nativo pendente.

## Resumo semanal simplificado

Removido somente o indicador Dias com foco da interface semanal. Minutos e sessões permanecem em duas colunas; média por sessão passa para uma linha própria. TypeScript, formatação e diff passaram. Sem alterações no cálculo da sequência; inspeção visual em dispositivo pendente.

## Alimentação e incentivo

TypeScript, 26 testes e export Android passaram. Novos testes cobrem alternância/contexto das frases, ausência de mutação do timer, persistência e descarte de metadados inválidos. No navegador em 320 px, petisco mostra reação e frase no balão existente. Durante foco em andamento, deadline e histórico permaneceram idênticos; após seis segundos o botão voltou a habilitar e a mensagem habitual reapareceu. Registro petCare confirmado no armazenamento local. Sessão de teste pausada ao final. Avaliação visual no Expo Go/dispositivo e anúncio por leitor de tela nativo pendentes.

## Validação em dispositivo informada pelo usuário

O usuário confirmou sucesso das implementações anteriores, incluindo alimentação/animações, em aparelho físico com Expo Go. Relato registrado como validação do usuário, sem atribuí-lo a execução automatizada. Não abrange o aviso de conclusão implementado depois.

## Aviso local de conclusão

TypeScript e 32 testes passaram; exports web (778 KB de JavaScript) e Android (3,1 MB de Hermes) concluídos. Cenários novos cobrem opt-in/migração, agendamento e substituição por deadline, pausa/reinício/desativação, conclusão sem repetição, permissão negada, corrida entre agendamento e cancelamento e recuperação após falha da plataforma. Navegador confirmou controle desativado na web. Não houve teste de entrega real de notificação nesta execução.

Roteiro em aparelho: ativar Avisar ao terminar e conceder permissão; concluir um descanso com tela bloqueada; verificar ausência de aviso após pausar/reiniciar; retomar e conferir novo horário; desativar e apagar dados com aviso pendente. Repetir negando permissão e revogando-a nos ajustes do sistema. Conferir Android e binário próprio antes de afirmar pontualidade: o sistema pode usar alarmes inexatos e limitar som/entrega.

## Correção de Expo Go e destino do Metro

TypeScript, 33 testes e export Android (3 MB de Hermes) passaram. Novo teste percorre os imports locais da versão instalada de expo-notifications, com resolução Android, e rejeita entrypoint geral e módulos de tokens/registro remoto. Inspeção encontrou 14 módulos locais sem dependência de push remoto. Duas tentativas de export de desenvolvimento com sourcemaps ficaram sem conclusão e foram interrompidas; não são evidência de sucesso. Export Android normal concluído. Ainda necessária confirmação de abertura e notificação local em Expo Go físico após reiniciar com npm start -- --clear. Scripts start/android fixam --go; s alterna para outro tipo de cliente e não é necessário para este fluxo.

## Falha ao habilitar avisos: diagnóstico preservado

TypeScript, 34 testes e export Android passaram. Teste novo confirma preservação da causa nativa e mensagem por etapa. Solicitação Android explícita adicionada; erro em Ajustes movido para o topo com rolagem ao aviso. Logs de desenvolvimento incluem etapa, código, mensagem e stack. Sem acesso ao erro original do aparelho, a causa raiz e a resolução da ativação ainda não estão confirmadas; repetir no Expo Go e coletar a linha [Pomodog notifications] se persistir.

## Canal e leitura de erros nativos

TypeScript e 35 testes passaram. Novo teste cobre mensagem não enumerável, código nativo, causas encadeadas e ciclos. Configuração do canal omite sound; diagnóstico agora é string legível no console e selecionável no card de Ajustes somente em desenvolvimento. A origem exata da rejeição no aparelho continua sem confirmação; repetir ativação após recarregar e usar o diagnóstico caso persista.

## Preparação do development build e limpeza da interface

TypeScript, 34 testes e export Android (3,1 MB Hermes) passaram. Configuração Expo resolvida confirmou scheme pomodog, pacote com.filipebteixeira98.pomodog e plugin expo-dev-client. Detectados JDK 17 e SDK Android locais; Java padrão 25 documentado no guia. Removido teste de imports internos, pois o fluxo agora usa API pública e cliente próprio. Não houve compilação Gradle, instalação em aparelho ou teste de entrega de notificação nesta execução. Interface sem diagnóstico nativo, explicação de indisponibilidade ou banner global; falhas curtas ficam junto ao controle e detalhes permanecem no console.

## Idempotência de agendamento e instrumentação `__DEV__`

TypeScript, 47 testes e format:check passaram. Sincronização do scheduler tornou-se idempotente: `pending()` consulta pedido existente e compara deadline/mode antes de cancelar. Metadata `{ deadline, mode }` em `content.data` permite comparação sem depender de formato nativo. 13 novos testes cobrem idempotência, reschedule por deadline/mode diferente, opt-out, pause/reset/disable, resume, completed/expired, falhas de leitura e metadata inválida. Instrumentação `__DEV__` adicionada ao adaptador nativo com logs `[Pomodog notifications]` para diagnóstico em dispositivo. Validação física realizada em Pixel 7 (emulador) e Samsung g32 (fisico): foreground e background OK.

## Remoção do botão "Pular tour" na última etapa

O botão "Pular tour" foi removido da última etapa do tour guiado (`src/features/tour/GuidedTour.tsx`). Na etapa final, "Concluir tour" e "Pular tour" executavam a mesma ação (`onClose()`), tornando o segundo redundante. O botão agora aparece apenas nas etapas 0 e 1, onde oferece ação diferente de "Próximo".

## Transição automática de modo ao concluir ciclo

TypeScript, 48 testes e format:check passaram. `reconcile` em `src/timer.ts` agora troca automaticamente o modo ao concluir (foco → descanso, descanso → foco). O botão "Preparar descanso/próximo foco" foi removido de `TimerCard.tsx`; o usuário apenas toca "Começar" quando quiser iniciar o próximo ciclo. Teste novo em `tests/timer.test.ts` cobre a transição bidirecional.
