import { View } from "react-native";
import Download from "lucide-react-native/icons/download";
import ShieldCheck from "lucide-react-native/icons/shield-check";
import Trash from "lucide-react-native/icons/trash";

import { Button, destructiveColor } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";

type Props = {
  accent: string;
  onExport: () => void;
  onErase: () => void;
  exporting: boolean;
  exportDisabled: boolean;
  eraseDisabled: boolean;
  notice: string;
};

export function LocalDataCard({
  accent,
  onExport,
  onErase,
  exporting,
  exportDisabled,
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
      <Text variant="caption">
        Você pode guardar uma cópia em JSON ou apagar os dados locais. Cópias
        exportadas ficam sob seu controle.
      </Text>
      <Button
        accent={accent}
        secondary
        disabled={exportDisabled || exporting}
        onPress={onExport}
        icon={<Download size={18} color={accent} />}
      >
        {exporting ? "Preparando arquivo…" : "Exportar meus dados"}
      </Button>
      <Button
        accent={accent}
        secondary
        destructive
        disabled={eraseDisabled || exporting}
        onPress={onErase}
        icon={<Trash size={18} color={destructiveColor} />}
      >
        Apagar dados deste dispositivo
      </Button>
      {notice !== "" && <Text accessibilityLiveRegion="polite">{notice}</Text>}
    </Card>
  );
}
