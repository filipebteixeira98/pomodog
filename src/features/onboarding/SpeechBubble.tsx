import { View } from "react-native";

import { Text } from "#src/components/ui/Text";
import { mascot } from "#src/domain/mascot";

export function SpeechBubble({
  title,
  children,
  accent,
}: {
  title: string;
  children: string;
  accent: string;
}) {
  return (
    <View className="w-full pb-3" accessibilityLiveRegion="polite">
      <View className="gap-2 rounded-3xl border border-line bg-surface p-5">
        <Text variant="eyebrow" style={{ color: accent }}>
          {mascot.name.toUpperCase()} DIZ
        </Text>
        <Text variant="heading">{title}</Text>
        <Text className="text-[14px] leading-6 text-ink">{children}</Text>
      </View>
      <View className="absolute bottom-1 left-16 h-5 w-5 rotate-45 border-b border-r border-line bg-surface" />
    </View>
  );
}
