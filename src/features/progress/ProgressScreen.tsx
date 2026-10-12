import { View } from "react-native";
import Check from "lucide-react-native/icons/check";
import PawPrint from "lucide-react-native/icons/paw-print";

import { Button } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import {
  summarizeDay,
  summarizeProgress,
  summarizeStreak,
} from "#src/domain/progress";
import { StreakCard } from "#src/features/progress/StreakCard";
import type { Session } from "#src/timer";

export function ProgressScreen({
  sessions,
  accent,
  onFocus,
}: {
  sessions: Session[];
  accent: string;
  onFocus: () => void;
}) {
  const now = Date.now();
  const completed = sessions.filter((session) => session.endedAt <= now);
  const today = summarizeDay(completed, now);
  const week = summarizeProgress(completed, now);
  const chartMaximum = Math.max(1, ...week.days.map((day) => day.minutes));
  const recent = [...completed]
    .sort((a, b) => b.endedAt - a.endedAt)
    .slice(0, 5);
  return (
    <>
      <StreakCard streak={summarizeStreak(completed, now)} />
      <Card>
        <Text variant="eyebrow">SEU DIA, ATÉ AQUI</Text>
        <Text
          className="mt-3 text-[54px] leading-[72px]"
          style={{ color: accent }}
        >
          {today.minutes}
          <Text className="text-[22px]" style={{ color: accent }}>
            {" "}
            min
          </Text>
        </Text>
        <Text>
          {today.count}{" "}
          {today.count === 1
            ? "sessão de foco concluída"
            : "sessões de foco concluídas"}
        </Text>
      </Card>
      <Card>
        <Text variant="heading">Últimos 7 dias</Text>
        <Text variant="caption" className="mt-1">
          Incluindo hoje · apenas sessões concluídas
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-y-4">
          <Statistic
            value={String(week.minutes)}
            label="minutos de foco"
            accent={accent}
          />
          <Statistic
            value={String(week.count)}
            label="sessões concluídas"
            accent={accent}
          />
        </View>
        <Text variant="caption" className="mt-4">
          Média por sessão: {week.count ? `${week.averageMinutes} min` : "—"}
        </Text>
        <View className="mb-4 mt-6 flex-row justify-between">
          {week.days.map(({ date, minutes }) => (
            <View
              key={date.toISOString()}
              accessible
              accessibilityLabel={`${date.toLocaleDateString("pt-BR")}: ${minutes} minutos de foco`}
              className="flex-1 items-center gap-2"
            >
              <Text variant="caption">{minutes}</Text>
              <View className="h-[100px] justify-end">
                <View
                  className="w-[18px] rounded-md"
                  style={{
                    height: minutes
                      ? Math.max(4, (minutes / chartMaximum) * 100)
                      : 3,
                    backgroundColor: minutes ? accent : "#DFE4D7",
                  }}
                />
              </View>
              <Text variant="caption">
                {["D", "S", "T", "Q", "Q", "S", "S"][date.getDay()]}
              </Text>
            </View>
          ))}
        </View>
        <Text variant="caption">
          Minutos por dia · escala ajustada ao maior valor
        </Text>
      </Card>
      <Card>
        <Text variant="heading">Pequenas conquistas</Text>
        {recent.length === 0 ? (
          <View className="gap-3 py-5">
            <PawPrint color={accent} size={30} />
            <Text variant="label">Seu primeiro passo ainda vem.</Text>
            <Text>Ao concluir um foco, ele aparece aqui.</Text>
            <Button accent={accent} onPress={onFocus}>
              Preparar meu primeiro foco
            </Button>
          </View>
        ) : (
          recent.map((session) => (
            <View
              key={session.id}
              className="flex-row items-center gap-3 border-b border-soft py-4"
            >
              <PawPrint color={accent} size={19} />
              <View className="flex-1">
                <Text variant="label">
                  {Math.round(session.seconds / 60)} minutos para você
                </Text>
                <Text variant="caption">
                  {new Date(session.endedAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <Check color={accent} size={18} />
            </View>
          ))
        )}
      </Card>
    </>
  );
}

function Statistic({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <View
      className="w-1/2 pr-3"
      accessible
      accessibilityLabel={`${value} ${label}`}
    >
      <Text variant="heading" style={{ color: accent }}>
        {value}
      </Text>
      <Text variant="caption">{label}</Text>
    </View>
  );
}
