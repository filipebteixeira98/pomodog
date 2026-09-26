import { View } from "react-native";
import Check from "lucide-react-native/icons/check";
import PawPrint from "lucide-react-native/icons/paw-print";

import { ScreenIntro } from "#src/components/ScreenIntro";
import { Button } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import { summarizeDay, summarizeWeek } from "#src/domain/progress";
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
  const today = summarizeDay(sessions);
  return (
    <>
      <ScreenIntro
        accent={accent}
        eyebrow="PEQUENOS PASSOS CONTAM"
        title="Seu caminho até aqui."
        subtitle="Presença vale mais que uma sequência perfeita."
      />
      <Card>
        <Text variant="eyebrow">HOJE</Text>
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
        <View className="mb-4 mt-6 flex-row justify-between">
          {summarizeWeek(sessions).map(({ date, minutes }) => (
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
                      ? Math.max(8, Math.min(100, (minutes / 120) * 100))
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
          Minutos de foco por dia · barras com teto de 120 min
        </Text>
      </Card>
      <Card>
        <Text variant="heading">Pequenas conquistas</Text>
        {sessions.length === 0 ? (
          <View className="gap-3 py-5">
            <PawPrint color={accent} size={30} />
            <Text variant="label">Seu primeiro passo ainda vem.</Text>
            <Text>
              Ao concluir um foco, ele aparece aqui. A demonstração não entra no
              histórico.
            </Text>
            <Button accent={accent} onPress={onFocus}>
              Preparar meu primeiro foco
            </Button>
          </View>
        ) : (
          sessions
            .slice(-5)
            .reverse()
            .map((session) => (
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
      <Text variant="caption" className="text-center">
        Histórico local das últimas 1.000 sessões, neste dispositivo.
      </Text>
    </>
  );
}
