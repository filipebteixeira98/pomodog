# Próximas etapas — decisões ainda abertas

Registradas a pedido do usuário após o início da refatoração. Não representam recursos já implementados.

## Nome do mascote

Escolher um nome curto, acolhedor e fácil de pronunciar, que funcione nas falas e no onboarding. Possibilidades para discutir:

- **Nino**: tom próximo e simples; “Nino fica aqui com você”.
- **Pingo**: combina com a ideia de pequenos passos.
- **Bento**: sonoridade acolhedora e familiar.

São sugestões criativas, sem pesquisa de marcas ou decisão definitiva. Depois da escolha, centralizar o nome e a personalidade para manter consistência entre mensagens, acessibilidade e introdução.

## Autonomia e privacidade

Direção solicitada: uso local para quem não se autenticar, sem login obrigatório, sem coleta remota de dados de uso e sem telemetria, inclusive anônima. A versão atual já não integra autenticação ou analytics; timer, preferências e histórico ficam no dispositivo.

Próxima implementação:

1. Definir quais dados existem e explicitar o que sai do dispositivo em cada integração futura.
2. Dar ao usuário controles para exportar e apagar seus dados locais.
3. Manter o uso sem conta como fluxo completo. Uma eventual sincronização deve ser opcional e ter regras claras de migração e exclusão.
4. Verificar dependências, crash reporting, música e distribuição para evitar coleta automática introduzida por integrações. Hospedagem e ferramentas de desenvolvimento devem ser avaliadas separadamente do código do app.

## Defesa em profundidade

Planejar a partir de ameaças concretas: dados locais corrompidos, permissões excessivas, dependências comprometidas e, caso existam contas no futuro, acesso indevido e mistura de dados entre pessoas.

- Validar formato, tamanho e versão dos registros; planejar recuperação e migrações sem perda silenciosa.
- Solicitar apenas permissões necessárias a recursos explícitos.
- Não embutir segredos no cliente. Usar armazenamento apropriado para credenciais se autenticação vier a existir; AsyncStorage não é um cofre.
- Revisar dependências e artefatos de produção. Não confundir exportação JavaScript com validação da segurança de um aplicativo Android instalado.
- Definir proteção adicional de dados conforme sua sensibilidade e o modelo de ameaças. A versão atual não oferece criptografia própria do histórico.

## Antes de testar retenção por vários dias

Validar Android físico, notificações ao terminar e comportamento com tela bloqueada. A avaliação atual cobre entendimento, visual e fluxo básico; não comprova retenção.
