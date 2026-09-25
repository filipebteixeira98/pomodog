import type { ComponentProps } from "react";
import { View } from "react-native";
import PawPrint from "lucide-react-native/icons/paw-print";

import { ScreenIntro } from "../../components/ScreenIntro";
import { Text } from "../../components/ui/Text";
import { summarizeDay } from "../../domain/progress";
import { TimerCard } from "./TimerCard";

export function FocusScreen(props: ComponentProps<typeof TimerCard>) {
  const { timer, accent } = props;
  const today = summarizeDay(timer.sessions);
  const title =
    timer.status === "completed"
      ? "Um passo de cada vez."
      : timer.mode === "break"
        ? "Respire. Você merece."
        : "Seu tempo, com companhia.";
  return (
    <>
      <ScreenIntro
        accent={accent}
        eyebrow="MENOS PRESSA, MAIS PRESENÇA"
        title={title}
        subtitle="Um momento para o que importa. No seu ritmo."
      />
      <TimerCard {...props} />
      <View className="flex-row flex-wrap items-center justify-between gap-3 rounded-[20px] bg-soft p-5">
        <View>
          <Text variant="eyebrow" className="text-[9px]">
            SEU DIA, ATÉ AQUI
          </Text>
          <Text className="mt-1 text-ink">
            <Text className="font-poppins-semibold" style={{ color: accent }}>
              {today.minutes} min
            </Text>{" "}
            de presença
          </Text>
        </View>
        <View className="flex-row items-center gap-2 rounded-full bg-surface px-3 py-2">
          <PawPrint color={accent} size={16} />
          <Text variant="caption" style={{ color: accent }}>
            {today.count} {today.count === 1 ? "sessão" : "sessões"}
          </Text>
        </View>
      </View>
      <Text variant="caption" className="px-3 text-center">
        Cada começo conta. Seu companheiro está por aqui.
      </Text>
    </>
  );
}
