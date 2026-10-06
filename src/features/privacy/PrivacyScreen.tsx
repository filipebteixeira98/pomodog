import { View } from "react-native";
import Bug from "lucide-react-native/icons/bug";
import ChartNoAxesColumn from "lucide-react-native/icons/chart-no-axes-column";
import ShieldCheck from "lucide-react-native/icons/shield-check";

import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import { OptionalPermissionScreen } from "#src/features/permissions/OptionalPermissionScreen";
import { PrivacyDetails } from "#src/features/privacy/PrivacyDetails";

export function PrivacyScreen({
  usageSupported,
  ...props
}: {
  accent: string;
  reducedMotion: boolean;
  usageSupported: boolean;
  onSave: (enabled: boolean) => Promise<void>;
  onContinue: () => void;
  onBack: () => void;
}) {
  const { accent } = props;
  return (
    <OptionalPermissionScreen {...props} allowLabel="Sim, autorizo">
      <View className="gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-soft">
          <ShieldCheck size={28} color={accent} />
        </View>
        <Text variant="eyebrow">SUA PRIVACIDADE</Text>
        <Text variant="title">Compartilhar dados?</Text>
        <Text>Ajude a melhorar o app. É opcional.</Text>
      </View>
      <Card className="gap-4 p-5">
        <View className="flex-row items-center gap-3">
          <Bug size={21} color={accent} />
          <View className="flex-1 gap-1">
            <Text variant="label">Diagnóstico</Text>
            <Text variant="caption">Dados técnicos de falhas.</Text>
          </View>
        </View>
        {usageSupported && (
          <View className="flex-row items-center gap-3">
            <ChartNoAxesColumn size={21} color={accent} />
            <View className="flex-1 gap-1">
              <Text variant="label">Uso do app</Text>
              <Text variant="caption">Telas visitadas e ciclos.</Text>
            </View>
          </View>
        )}
        <Text variant="caption">
          {usageSupported
            ? "Inclui dados do dispositivo e identificador da instalação. Sem nome, e-mail ou textos pessoais."
            : "Seu nome, e-mail e histórico de foco não são enviados."}
        </Text>
      </Card>
      <Text variant="caption">
        {usageSupported
          ? "Compartilhamento com Google Analytics e Sentry."
          : "Compartilhamento com Sentry."}{" "}
        Você pode mudar cada permissão em Ajustes.
      </Text>
      <PrivacyDetails accent={accent} reducedMotion={props.reducedMotion} />
    </OptionalPermissionScreen>
  );
}
