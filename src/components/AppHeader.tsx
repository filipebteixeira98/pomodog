import { View } from "react-native";
import PawPrint from "lucide-react-native/icons/paw-print";

import { Text } from "#src/components/ui/Text";

export function AppHeader({ accent }: { accent: string }) {
  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      <View className="flex-1 flex-row flex-wrap items-center gap-2.5">
        <View
          className="h-9 w-9 rotate-[-8deg] items-center justify-center rounded-xl"
          style={{ backgroundColor: accent }}
        >
          <PawPrint color="#FFF9EC" size={22} />
        </View>
        <Text className="font-poppins-semibold text-[25px] leading-9 tracking-[-1.2px] text-ink">
          pomodog<Text style={{ color: accent }}>.</Text>
        </Text>
        <View
          accessible
          accessibilityLabel="Versão beta, em desenvolvimento e testes"
          className="rounded-full border border-line bg-soft px-2.5 py-1"
        >
          <Text className="font-poppins-semibold text-[10px] leading-4 tracking-[0.5px] text-ink">
            Beta
          </Text>
        </View>
      </View>
    </View>
  );
}
