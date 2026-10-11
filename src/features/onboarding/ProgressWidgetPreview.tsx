import type { ReactNode } from "react";
import { Image, View } from "react-native";
import CircleCheck from "lucide-react-native/icons/circle-check";
import Clock from "lucide-react-native/icons/clock";
import Flame from "lucide-react-native/icons/flame";

import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";

export function ProgressWidgetPreview() {
  return (
    <View className="w-full gap-2">
      <Card
        accessible
        accessibilityRole="image"
        accessibilityLabel="Exemplo de widget: 3 dias seguidos com foco, 2 sessões e 50 minutos hoje, 125 minutos nos últimos 7 dias."
        className="gap-2 border-[#ECD3B5] bg-[#FAEBD8] p-3"
      >
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#4E6B55]">
            <Image
              source={require("#assets/brand/adaptive-foreground.png")}
              style={{ width: 58, height: 58 }}
              resizeMode="contain"
              accessible={false}
            />
          </View>
          <Text variant="label" className="flex-1 text-[#394D40]">
            Pomodog
          </Text>
          <Flame size={23} color="#B66431" />
        </View>
        <View className="flex-row items-center gap-3">
          <Text
            variant="title"
            className="text-[32px] leading-[40px] text-[#8B461F]"
          >
            3
          </Text>
          <Text className="flex-1 text-[#8B461F]">
            Dias seguidos{"\n"}com foco
          </Text>
        </View>
        <View className="gap-2">
          <View className="flex-row gap-2">
            <PreviewStat
              icon={<CircleCheck size={18} color="#526858" />}
              value="2"
              label="sessões hoje"
            />
            <PreviewStat
              icon={<Clock size={18} color="#526858" />}
              value="50"
              label="minutos hoje"
            />
          </View>
          <View className="flex-row items-center gap-2 rounded-xl bg-[#E6EEE5] p-2">
            <Text variant="caption" className="flex-1 text-[#526858]">
              Últimos 7 dias
            </Text>
            <Text variant="label" className="text-[#394D40]">
              125 min
            </Text>
          </View>
        </View>
      </Card>
      <Text variant="caption" className="text-center">
        Prévia ilustrativa
      </Text>
    </View>
  );
}

function PreviewStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View className="flex-1 gap-1 rounded-2xl bg-[#F8F7F2] p-2">
      <View className="flex-row items-center gap-2">
        {icon}
        <Text variant="heading" className="flex-1 text-center text-[#394D40]">
          {value}
        </Text>
      </View>
      <Text variant="caption" className="text-center text-[#526858]">
        {label}
      </Text>
    </View>
  );
}
