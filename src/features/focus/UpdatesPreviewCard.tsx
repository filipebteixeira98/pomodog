import { Pressable, View } from "react-native";
import Sparkles from "lucide-react-native/icons/sparkles";
import X from "lucide-react-native/icons/x";

import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";

export function UpdatesPreviewCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Card className="relative min-h-[60px] items-start justify-center rounded-[18px] border-[#D4E2D2] bg-[#E6EEE5] py-2 pl-3 pr-11">
      <View className="max-w-full flex-row items-center justify-start gap-2">
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#D5E3D2]"
        >
          <Sparkles size={16} color="#4E6B55" />
        </View>
        <View accessible className="min-w-0 shrink">
          <Text
            variant="label"
            className="text-left text-[11px] leading-[16px] text-[#394D40]"
          >
            Vem novidade por aí
          </Text>
          <Text
            variant="caption"
            className="mt-0.5 text-left text-[10px] leading-[14px] text-[#526858]"
          >
            Estamos preparando novidades para você.
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar aviso de novidades"
        onPress={onDismiss}
        className="absolute bottom-0 right-0 top-0 w-11 items-center justify-center rounded-[18px] active:bg-[#D5E3D2]"
      >
        <X size={14} color="#526858" />
      </Pressable>
    </Card>
  );
}
