import { View } from "react-native";
import CalendarDays from "lucide-react-native/icons/calendar-days";

import type { CalendarSnapshot } from "#src/calendar/integration";
import { calendar } from "#src/calendar/service";
import { Button, TextButton } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import { dayKey } from "#src/timer";

export function CalendarSuggestionCard({
  state,
  accent,
  onPrepare,
}: {
  state: CalendarSnapshot;
  accent: string;
  onPrepare: () => void;
}) {
  const suggestion = state.record?.suggestion;
  if (!suggestion || suggestion.start <= Date.now()) return null;
  const date = new Date(suggestion.start);
  const day =
    dayKey(suggestion.start) === dayKey(Date.now()) ? "hoje" : "amanhã";
  const time = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <Card className="gap-3 bg-[#EEF1E7]">
      <View className="flex-row items-center gap-3">
        <CalendarDays size={22} color={accent} />
        <Text variant="label" className="flex-1">
          Um espaço para você
        </Text>
      </View>
      <Text>
        Que tal um foco {day} às {time}, antes dos compromissos?
      </Text>
      <Button
        accent={accent}
        disabled={state.busy}
        onPress={() => {
          void calendar.dismiss();
          onPrepare();
        }}
      >
        Preparar foco
      </Button>
      <TextButton
        underline={false}
        disabled={state.busy}
        onPress={() => {
          void calendar.dismiss();
        }}
      >
        Agora não
      </TextButton>
    </Card>
  );
}
