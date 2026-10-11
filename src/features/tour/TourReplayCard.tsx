import { Image, View } from "react-native";
import RotateCcw from "lucide-react-native/icons/rotate-ccw";

import { Button } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import { mascot } from "#src/domain/mascot";

export function TourReplayCard({
  accent,
  onReplay,
}: {
  accent: string;
  onReplay: () => void;
}) {
  return (
    <Card className="gap-4 border-[#EFDCB6] bg-[#FFF2D8]">
      <View className="flex-row items-center gap-3">
        <View className="flex-1 gap-1">
          <Text variant="heading">Uma ajuda do {mascot.name}</Text>
          <Text variant="caption">Reveja os primeiros passos.</Text>
        </View>
        <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#FFE4B5]">
          <Image
            source={require("#assets/brand/adaptive-foreground.png")}
            style={{ width: 156, height: 156 }}
            resizeMode="contain"
            accessible={false}
          />
        </View>
      </View>
      <Button
        accent={accent}
        secondary
        onPress={onReplay}
        icon={<RotateCcw size={18} color={accent} />}
      >
        Rever tour guiado
      </Button>
    </Card>
  );
}
