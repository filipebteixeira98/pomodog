import { View } from "react-native";
import Bell from "lucide-react-native/icons/bell";

import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import { OptionalPermissionScreen } from "#src/features/permissions/OptionalPermissionScreen";

export function NotificationsScreen(props: {
  accent: string;
  reducedMotion: boolean;
  onSave: (enabled: boolean) => Promise<boolean>;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <OptionalPermissionScreen
      {...props}
      allowLabel="Sim, ativar"
      errorMessage="Não foi possível ativar. Confira a permissão do dispositivo ou escolha Agora não."
    >
      <View className="gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-soft">
          <Bell size={28} color={props.accent} />
        </View>
        <Text variant="eyebrow">NOTIFICAÇÕES</Text>
        <Text variant="title">Avisar ao terminar?</Text>
        <Text>Receba um aviso quando seu foco ou descanso terminar.</Text>
      </View>
      <Card className="gap-3 p-5">
        <Text variant="label">Mesmo com a tela bloqueada.</Text>
        <Text variant="caption">
          Ao ativar, permita notificações no dispositivo.
        </Text>
      </Card>
      <Text variant="caption">É opcional. Você pode mudar em Ajustes.</Text>
    </OptionalPermissionScreen>
  );
}
