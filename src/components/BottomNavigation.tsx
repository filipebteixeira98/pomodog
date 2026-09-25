import { Pressable, View } from "react-native";
import ChartNoAxesColumnIncreasing from "lucide-react-native/icons/chart-no-axes-column-increasing";
import PawPrint from "lucide-react-native/icons/paw-print";
import SlidersHorizontal from "lucide-react-native/icons/sliders-horizontal";

import { Text } from "./ui/Text";

export type Tab = "focus" | "progress" | "settings";
const tabs = [
  { id: "focus", label: "Meu foco", Icon: PawPrint },
  { id: "progress", label: "Meu progresso", Icon: ChartNoAxesColumnIncreasing },
  { id: "settings", label: "Ajustes", Icon: SlidersHorizontal },
] as const;

export function BottomNavigation({
  value,
  onChange,
  accent,
}: {
  value: Tab;
  onChange: (tab: Tab) => void;
  accent: string;
}) {
  return (
    <View className="flex-row border-t border-line bg-canvas py-2.5">
      {tabs.map(({ id, label, Icon }) => {
        const selected = value === id;
        const color = selected ? accent : "#73796D";
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(id)}
            className="min-h-[54px] flex-1 items-center gap-1 pt-1"
          >
            <Icon size={20} color={color} />
            <Text
              variant="caption"
              className="font-poppins-medium"
              style={{ color }}
            >
              {label}
            </Text>
            {selected && (
              <View
                className="h-1 w-1 rounded-full"
                style={{ backgroundColor: accent }}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
