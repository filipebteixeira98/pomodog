import { Pressable, View } from "react-native";
import Sparkles from "lucide-react-native/icons/sparkles";
import X from "lucide-react-native/icons/x";

import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";

export function UpdatesPreviewCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Card className="flex-row items-center gap-3 rounded-[22px] border-[#D4E2D2] bg-[#E6EEE5] p-4 pb-2">
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#D5E3D2]"
      >
        <Sparkles size={20} color="#4E6B55" />
      </View>
      <View accessible className="flex-1">
        <Text variant="label" className="text-[#394D40]">
          Vem novidade por aí
        </Text>
        <Text
          variant="caption"
          className="mt-1 text-[12px] leading-[18px] text-[#526858]"
        >
          Estamos preparando novidades para você.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar aviso de novidades"
        onPress={onDismiss}
        className="-mr-2 -mt-2 h-11 w-11 shrink-0 items-center justify-center self-start rounded-full active:bg-[#D5E3D2]"
      >
        <X size={17} color="#526858" />
      </Pressable>
    </Card>
  );
}
