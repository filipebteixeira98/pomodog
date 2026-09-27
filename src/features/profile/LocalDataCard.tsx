import { View } from "react-native";
import ShieldCheck from "lucide-react-native/icons/shield-check";
import Trash from "lucide-react-native/icons/trash";

import { Button, destructiveColor } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";

type Props = {
  accent: string;
  onErase: () => void;
  eraseDisabled: boolean;
  notice: string;
};

export function LocalDataCard({
  accent,
  onErase,
  eraseDisabled,
  notice,
}: Props) {
  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-soft">
          <ShieldCheck size={23} color={accent} />
        </View>
        <Text variant="eyebrow">PRIVACIDADE</Text>
      </View>
      <Text variant="heading">Seus dados, suas escolhas.</Text>
      <Text>
        Seu foco e suas preferências ficam neste dispositivo. Não coletamos
        telemetria de uso, nem anônima.
      </Text>
      <Button
        accent={accent}
        secondary
        destructive
        disabled={eraseDisabled}
        onPress={onErase}
        icon={<Trash size={18} color={destructiveColor} />}
      >
        Apagar dados deste dispositivo
      </Button>
      {notice !== "" && <Text accessibilityLiveRegion="polite">{notice}</Text>}
    </Card>
  );
}
