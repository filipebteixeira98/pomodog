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
