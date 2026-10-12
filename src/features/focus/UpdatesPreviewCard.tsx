import { View } from "react-native";
import Sparkles from "lucide-react-native/icons/sparkles";

import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";

export function UpdatesPreviewCard() {
  return (
    <Card
      accessible
      className="flex-row items-center gap-3 rounded-[22px] border-[#D4E2D2] bg-[#E6EEE5] p-4"
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#D5E3D2]"
      >
        <Sparkles size={20} color="#4E6B55" />
      </View>
      <View className="flex-1">
        <Text variant="label" className="text-[#394D40]">
          Vem novidade por aí
        </Text>
        <Text
          variant="caption"
          className="mt-1 text-[12px] leading-[18px] text-[#526858]"
        >
          Novos mascotes e sons estão em planejamento.
        </Text>
      </View>
    </Card>
  );
}
