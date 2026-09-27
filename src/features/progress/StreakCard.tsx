import { View } from "react-native";
import Check from "lucide-react-native/icons/check";
import Flame from "lucide-react-native/icons/flame";

import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import type { summarizeStreak } from "#src/domain/progress";

const ink = "#8B461F";

export function StreakCard({
  streak,
}: {
  streak: ReturnType<typeof summarizeStreak>;
}) {
  return (
    <Card className="gap-4 border-[#ECD3B5] bg-[#FAEBD8]">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F5D8B3]">
          <Flame size={25} color={ink} />
        </View>
        <Text variant="eyebrow" style={{ color: ink }}>
          SEU RITMO
        </Text>
      </View>
      <View className="gap-1">
        <Text variant="heading" style={{ color: ink }}>
          {streak.count === 0
            ? "Seu próximo começo"
            : `${streak.count} ${streak.count === 1 ? "dia" : "dias"} ${streak.count === 1 ? "seguido" : "seguidos"} com foco`}
        </Text>
        <Text style={{ color: ink }}>
          {streak.count === 0
            ? "Uma sessão pode ser seu primeiro passo."
            : "Seu hábito cresce, um dia de cada vez."}
        </Text>
      </View>
      <View className="flex-row">
        {streak.days.map(({ date, completed, today }) => (
          <View
            key={date.toISOString()}
            accessible
            accessibilityLabel={`${date.toLocaleDateString("pt-BR")}${today ? ", hoje" : ""}: ${completed ? "foco concluído" : "sem sessão concluída"}`}
            className="flex-1 items-center gap-2"
          >
            <View
              className="h-6 w-6 items-center justify-center rounded-full border"
              style={{
                backgroundColor: completed ? ink : "#FFF8EF",
                borderColor: today ? ink : "#D6B793",
                borderWidth: today ? 2 : 1,
              }}
            >
              {completed && <Check size={15} color="#FFFFFF" />}
            </View>
            <Text variant="caption" style={{ color: ink }}>
              {["D", "S", "T", "Q", "Q", "S", "S"][date.getDay()]}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="caption" style={{ color: ink }}>
        Últimos 7 dias · uma sessão concluída já conta.
      </Text>
    </Card>
  );
}
