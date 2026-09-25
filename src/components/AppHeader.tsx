import { View } from "react-native";
import PawPrint from "lucide-react-native/icons/paw-print";

import { Text } from "./ui/Text";

export function AppHeader({ accent }: { accent: string }) {
  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      <View className="flex-row items-center gap-2.5">
        <View
          className="h-9 w-9 rotate-[-8deg] items-center justify-center rounded-xl"
          style={{ backgroundColor: accent }}
        >
          <PawPrint color="#FFF9EC" size={22} />
        </View>
        <Text className="font-poppins-semibold text-[25px] leading-9 tracking-[-1.2px] text-ink">
          pomodog<Text style={{ color: accent }}>.</Text>
        </Text>
      </View>
    </View>
  );
}
