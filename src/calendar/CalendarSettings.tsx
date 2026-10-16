import { useState } from "react";
import { View } from "react-native";
import CalendarDays from "lucide-react-native/icons/calendar-days";

import { calendarSupported } from "#src/calendar/authorization";
import { CalendarSettingsSheet } from "#src/calendar/CalendarSettingsSheet";
import type { CalendarSnapshot } from "#src/calendar/integration";
import { Button } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";

export function CalendarSettings({
  state,
  accent,
  reducedMotion,
}: {
  state: CalendarSnapshot;
  accent: string;
  reducedMotion: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!calendarSupported) return null;
  return (
    <>
      <Card className="gap-4">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-soft">
            <CalendarDays size={22} color={accent} />
          </View>
          <View className="flex-1 gap-1">
            <Text variant="label">Google Agenda</Text>
            <Text variant="caption">
              Encontre espaço para focar antes dos compromissos.
            </Text>
          </View>
        </View>
        {state.record && (
          <Text variant="caption">
            Agenda conectada · sugestões no seu ritmo.
          </Text>
        )}
        {state.notice !== "" && (
          <Text variant="caption" accessibilityRole="alert">
            {state.notice}
          </Text>
        )}
        <Button
          accent={accent}
          secondary
          disabled={!state.ready || state.busy}
          onPress={() => setOpen(true)}
        >
          {state.record ? "Ajustar minha rotina" : "Conectar Google Agenda"}
        </Button>
      </Card>
      {open && (
        <CalendarSettingsSheet
          state={state}
          accent={accent}
          reducedMotion={reducedMotion}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
