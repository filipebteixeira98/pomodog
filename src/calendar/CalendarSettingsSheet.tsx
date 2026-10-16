import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import {
  BottomSheetTextInput,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import Unlink from "lucide-react-native/icons/unlink";

import type { CalendarSnapshot } from "#src/calendar/integration";
import {
  defaultCalendarPreferences,
  type CalendarPreferences,
} from "#src/calendar/model";
import { calendar } from "#src/calendar/service";
import { BottomSheet } from "#src/components/ui/BottomSheet";
import { Button, TextButton } from "#src/components/ui/Button";
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const sheet = useRef<BottomSheetModal>(null);
  const operation = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const busy = state.busy || pending;
  const canDismiss = useCallback(
    () => !operation.current && !calendar.getSnapshot().busy,
    [],
  );
  async function save() {
    if (!canDismiss()) return;
    operation.current = true;
    setPending(true);
    Keyboard.dismiss();
    setError("");
    let saved = false;
    try {
      saved = await calendar.save({
        ...draft,
        start: minutes(start),
        end: minutes(end),
        reminder: minutes(reminder),
      });
    } catch {
      if (mounted.current)
        setError("Não foi possível salvar. Tente novamente.");
    } finally {
      operation.current = false;
      if (mounted.current) setPending(false);
    }
    if (saved && mounted.current) sheet.current?.dismiss();
  }
  async function disconnect() {
    if (!canDismiss()) return;
    operation.current = true;
    setPending(true);
    setError("");
    let disconnected = false;
    try {
      await calendar.disconnect();
      disconnected = true;
    } catch {
      if (mounted.current)
        setError("Não foi possível desconectar. Tente novamente.");
    } finally {
      operation.current = false;
      if (mounted.current) setPending(false);
    }
    if (disconnected && mounted.current) sheet.current?.dismiss();
  }
  return (
    <BottomSheet
      modalRef={sheet}
      title="Sua agenda, seu ritmo"
      accessibilityLabel="Ajustes da agenda"
      closeLabel="Fechar ajustes da agenda"
      busy={busy}
      canDismiss={canDismiss}
      onDismiss={onClose}
      reducedMotion={reducedMotion}
    >
      <Text variant="caption">
        Só horários ocupados da agenda principal. Sem detalhes dos eventos.
      </Text>
      <View className="flex-row gap-3">
        <TimeField
          label="Foco das"
          value={start}
          onChange={setStart}
          disabled={busy}
        />
        <TimeField label="Até" value={end} onChange={setEnd} disabled={busy} />
      </View>
      <View className="gap-2">
        <Text variant="label">Dias de foco</Text>
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
        description="Antecipe o foco se amanhã estiver ocupado."
        value={draft.anticipate}
        disabled={busy}
        accent={accent}
        onChange={(anticipate) => setDraft((p) => ({ ...p, anticipate }))}
      />
      <Toggle
        label="Lembretes da agenda"
        description="Um aviso antes do foco."
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
            Entre 07h e 21h, antes do foco. Se já passou, a sugestão fica no
            app.
          </Text>
        </View>
      )}
      {(state.notice || error) !== "" && (
        <Text
          variant="caption"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
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
        Gerenciar acesso no Google
      </TextButton>
    </BottomSheet>
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
      <BottomSheetTextInput
        accessibilityLabel={`${label}, no formato horas e minutos`}
        value={value}
        onChangeText={onChange}
        editable={!disabled}
        maxLength={5}
        placeholder="09:00"
        selectTextOnFocus
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.timeInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  timeInput: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7E8DE",
    backgroundColor: "#F8F7F2",
    paddingHorizontal: 12,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#343C32",
  },
});

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
