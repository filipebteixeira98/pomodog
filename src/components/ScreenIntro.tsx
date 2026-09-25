import { View } from "react-native";
import { Text } from "./ui/Text";

export function ScreenIntro({
  eyebrow,
  title,
  subtitle,
  accent,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <View className="mb-1 items-center gap-2">
      <Text variant="eyebrow" className="text-center" style={{ color: accent }}>
        {eyebrow}
      </Text>
      <Text variant="title" className="text-center">
        {title}
      </Text>
      <Text className="text-center">{subtitle}</Text>
    </View>
  );
}
