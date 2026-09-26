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
