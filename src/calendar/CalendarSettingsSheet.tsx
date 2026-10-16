import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Linking,
  Pressable,
  Switch,
  TextInput,
  View,
} from "react-native";
import Unlink from "lucide-react-native/icons/unlink";
import X from "lucide-react-native/icons/x";

import type { CalendarSnapshot } from "#src/calendar/integration";
import {
  defaultCalendarPreferences,
  type CalendarPreferences,
} from "#src/calendar/model";
import { calendar } from "#src/calendar/service";
import { Button, TextButton } from "#src/components/ui/Button";
import { Sheet } from "#src/components/ui/Sheet";
import { Text } from "#src/components/ui/Text";

const clock = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
const minutes = (value: string) =>
  /^([01]?\d|2[0-3]):[0-5]\d$/.test(value)
    ? Number(value.split(":")[0]) * 60 + Number(value.split(":")[1])
    : NaN;
const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarSettingsSheet({
  state,
  accent,
  reducedMotion,
  onClose,
}: {
  state: CalendarSnapshot;
  accent: string;
  reducedMotion: boolean;
  onClose: () => void;
}) {
  const initial = state.record?.preferences ?? defaultCalendarPreferences;
  const [draft, setDraft] = useState<CalendarPreferences>(() => ({
    ...initial,
    weekdays: [...initial.weekdays],
  }));
  const [start, setStart] = useState(clock(initial.start));
  const [end, setEnd] = useState(clock(initial.end));
  const [reminder, setReminder] = useState(clock(initial.reminder));
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState("");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const busy = state.busy || disconnecting;
  async function save() {
    Keyboard.dismiss();
    setError("");
    if (
      (await calendar.save({
        ...draft,
        start: minutes(start),
        end: minutes(end),
        reminder: minutes(reminder),
      })) &&
      mounted.current
    )
      onClose();
  }
  async function disconnect() {
    if (busy) return;
    setDisconnecting(true);
    try {
      await calendar.disconnect();
      if (mounted.current) onClose();
    } catch {
      if (mounted.current)
        setError("Não foi possível desconectar. Tente novamente.");
    } finally {
      if (mounted.current) setDisconnecting(false);
    }
  }
  return (
    <Sheet
      visible
      onClose={() => {
        if (!busy) onClose();
      }}
      reducedMotion={reducedMotion}
      keyboardAware
    >
      <View className="flex-row items-center gap-2">
        <Text variant="heading" className="flex-1">
          Sua agenda, seu ritmo
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar ajustes da agenda"
          disabled={busy}
          onPress={onClose}
          className="-mr-2 h-11 w-11 items-center justify-center rounded-full active:bg-soft"
        >
          <X size={20} color="#73796D" />
        </Pressable>
      </View>
      <Text>
        Usamos só horários ocupados da agenda principal. Sem títulos ou
        participantes.
      </Text>
      <View className="flex-row gap-3">
        <TimeField
          label="Foco a partir de"
          value={start}
          onChange={setStart}
          disabled={busy}
        />
        <TimeField label="Até" value={end} onChange={setEnd} disabled={busy} />
      </View>
      <View className="gap-2">
        <Text variant="label">Seus dias de foco</Text>
        <View className="flex-row flex-wrap gap-2">
          {days.map((label, day) => {
            const selected = draft.weekdays.includes(day);
            return (
              <Pressable
                key={day}
                accessibilityRole="checkbox"
                accessibilityLabel={label}
                accessibilityState={{ checked: selected, disabled: busy }}
                disabled={busy}
                onPress={() =>
                  setDraft((p) => ({
                    ...p,
                    weekdays: selected
                      ? p.weekdays.filter((d) => d !== day)
                      : [...p.weekdays, day],
                  }))
                }
                className="min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 py-2"
                style={{
                  borderColor: selected ? accent : "#E7E8DE",
                  backgroundColor: selected ? "#EEF1E7" : undefined,
                }}
              >
                <Text variant="caption">{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Toggle
        label="Antecipar para hoje"
        description="Se amanhã estiver ocupado, procurar espaço hoje."
        value={draft.anticipate}
        disabled={busy}
        accent={accent}
        onChange={(anticipate) => setDraft((p) => ({ ...p, anticipate }))}
      />
      <Toggle
        label="Lembretes da agenda"
        description="Um aviso no dia sugerido, antes do foco."
        value={draft.reminders}
        disabled={busy}
        accent={accent}
        onChange={(reminders) => setDraft((p) => ({ ...p, reminders }))}
      />
      {draft.reminders && (
        <View className="gap-2">
          <View className="flex-row">
            <TimeField
              label="Avisar às"
              value={reminder}
              onChange={setReminder}
              disabled={busy}
            />
          </View>
          <Text variant="caption">
            Entre 07:00 e 21:00, antes do início da sua faixa de foco. Se o
            horário de hoje já passou, a sugestão aparece apenas no app.
          </Text>
        </View>
      )}
      <Text variant="caption">
        A agenda é consultada ao abrir ou voltar ao app. Você pode ignorar
        sugestões ou desconectar quando quiser.
      </Text>
      {(state.notice || error) !== "" && (
        <Text
          variant="caption"
          accessibilityRole="alert"
          className="text-[#B42318]"
        >
          {error || state.notice}
        </Text>
      )}
      <Button
        accent={accent}
        disabled={busy}
        onPress={() => void save()}
        icon={
          busy ? <ActivityIndicator size="small" color="#FFFFFF" /> : undefined
        }
      >
        {busy
          ? "Preparando…"
          : state.record
            ? "Salvar rotina"
            : "Conectar Google Agenda"}
      </Button>
      {state.record && (
        <Button
          accent={accent}
          secondary
          disabled={busy}
          icon={<Unlink size={18} color={accent} />}
          onPress={() => void disconnect()}
        >
          Desconectar agenda
        </Button>
      )}
      <TextButton
        disabled={busy}
        underline={false}
        onPress={() => {
          void Linking.openURL(
            "https://myaccount.google.com/connections",
          ).catch(() => setError("Não foi possível abrir sua Conta Google."));
        }}
      >
        Gerenciar permissão no Google
      </TextButton>
    </Sheet>
  );
}

function TimeField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <View className="flex-1 gap-2">
      <Text variant="label">{label}</Text>
      <TextInput
        accessibilityLabel={`${label}, no formato horas e minutos`}
        value={value}
        onChangeText={onChange}
        editable={!disabled}
        maxLength={5}
        placeholder="09:00"
        selectTextOnFocus
        autoCapitalize="none"
        className="min-h-12 rounded-xl border border-line bg-canvas px-3 font-sans text-[14px] text-ink"
      />
    </View>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
  disabled,
  accent,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
  accent: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1 gap-1">
        <Text variant="label">{label}</Text>
        <Text variant="caption">{description}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ true: accent }}
      />
    </View>
  );
}
