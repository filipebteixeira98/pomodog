import { useState } from "react";
import { Linking, View } from "react-native";
import ShieldCheck from "lucide-react-native/icons/shield-check";

import { analyticsSupported } from "#src/analytics/service";
import { Button, TextButton } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Sheet } from "#src/components/ui/Sheet";
import { Text } from "#src/components/ui/Text";
import notice from "#src/privacy/notice.json";

const contact = notice as {
  version: string;
  controller: string | null;
  contactEmail: string | null;
  policyUrl: string | null;
};

export function PrivacyDetails({
  accent,
  reducedMotion,
}: {
  accent: string;
  reducedMotion: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  async function open(url: string) {
    setError("");
    try {
      await Linking.openURL(url);
    } catch {
      setError("Não foi possível abrir. Tente novamente.");
    }
  }
  return (
    <>
      <TextButton
        onPress={() => {
          setError("");
          setVisible(true);
        }}
      >
        Informações de privacidade
      </TextButton>
      <Sheet
        visible={visible}
        onClose={() => setVisible(false)}
        reducedMotion={reducedMotion}
      >
        <Text variant="heading">Sua privacidade</Text>
        <View className="gap-2">
          <Text variant="label">Seu progresso</Text>
          <Text>
            Sem login, foco e preferências ficam neste dispositivo. Com Google,
            seu nome, e-mail, progresso e preferências são armazenados na sua
            conta.
          </Text>
        </View>
        <View className="gap-2">
          <Text variant="label">Compartilhamento opcional</Text>
          <Text>
            Falhas técnicas ajudam a corrigir problemas.{" "}
            {analyticsSupported
              ? "Dados de uso ajudam a entender telas e ciclos. "
              : ""}
            A coleta começa desligada e você pode mudar cada opção em Ajustes,
            inclusive sem conta.
          </Text>
          <Text variant="caption">
            O Sentry recebe diagnósticos.{" "}
            {analyticsSupported
              ? "O Google Analytics recebe dados de uso, do dispositivo e um identificador da instalação. "
              : ""}
            Não enviamos nome, e-mail ou textos pessoais nesses relatórios.
            Esses dados podem ser tratados fora do Brasil.
          </Text>
        </View>
        <View className="gap-2">
          <Text variant="label">Sua decisão fica registrada</Text>
          <Text>
            Guardamos opção, finalidade, data e versão deste aviso no
            dispositivo. Decisões feitas com login também são registradas na sua
            conta, sem vincular os relatórios de uso ao seu perfil.
          </Text>
        </View>
        <View className="gap-2">
          <Text variant="label">Desativar e apagar</Text>
          <Text>
            Desativar impede novos envios. Apagar dados locais ou excluir a
            conta não apaga automaticamente os relatórios já enviados. Eles
            seguem os prazos e limites de remoção dos fornecedores.
          </Text>
        </View>
        {contact.controller && (
          <Text variant="caption">Responsável: {contact.controller}</Text>
        )}
        {contact.policyUrl && (
          <Button
            accent={accent}
            secondary
            onPress={() => void open(contact.policyUrl!)}
          >
            Política de privacidade
          </Button>
        )}
        {contact.contactEmail && (
          <>
            <Text variant="caption">
              Solicite acesso, correção ou exclusão dos seus dados. O botão abre
              seu e-mail; envie a mensagem para registrar o pedido.
            </Text>
            <Button
              accent={accent}
              secondary
              onPress={() =>
                void open(
                  `mailto:${contact.contactEmail}?subject=${encodeURIComponent("Privacidade — Pomodog")}`,
                )
              }
            >
              Solicitar acesso ou exclusão
            </Button>
          </>
        )}
        {error !== "" && <Text accessibilityRole="alert">{error}</Text>}
        <Text variant="caption">
          Aviso de {contact.version.split("-").reverse().join("/")}
        </Text>
        <Button accent={accent} onPress={() => setVisible(false)}>
          Fechar
        </Button>
      </Sheet>
    </>
  );
}

export function PrivacyCard(props: { accent: string; reducedMotion: boolean }) {
  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-3">
        <ShieldCheck size={23} color={props.accent} />
        <Text variant="eyebrow">PRIVACIDADE</Text>
      </View>
      <Text variant="heading">Suas escolhas</Text>
      <Text variant="caption">
        Entenda o uso dos dados e como controlar o compartilhamento.
      </Text>
      <PrivacyDetails {...props} />
    </Card>
  );
}
