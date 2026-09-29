import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Bone from "lucide-react-native/icons/bone";
import Pause from "lucide-react-native/icons/pause";
import Play from "lucide-react-native/icons/play";

import { Button, TextButton } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import { Dog } from "#src/Dog";
import { mascot } from "#src/domain/mascot";
import type { TourTargets } from "#src/features/tour/GuidedTour";
import { clockText, type Mode, type Timer } from "#src/timer";

type Props = {
  tourTargets?: TourTargets;
  timer: Timer;
  accent: string;
  reducedMotion: boolean;
  ready: boolean;
  onConfigure: (mode: Mode) => void;
  onToggle: () => void;
  onReset: () => void;
  onFeed: () => string | null;
};

function sessionCopy(timer: Timer) {
  if (timer.status === "completed") return "Boa! Mais um passo juntos.";
  if (timer.status === "paused") return "No seu tempo. Estou aqui.";
  if (timer.mode === "break") return "Vamos descansar um pouco?";
  return timer.status === "running"
    ? "Pode focar. Estou com você."
    : "Um pequeno começo. Vamos juntos?";
}

export function TimerCard({
  tourTargets,
  timer,
  accent,
  reducedMotion,
  ready,
  onConfigure,
  onToggle,
  onReset,
  onFeed,
}: Props) {
  const [petMessage, setPetMessage] = useState<string | null>(null);
  const reaction = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (reaction.current !== null) clearTimeout(reaction.current);
    },
    [],
  );
  function feed() {
    if (!ready || reaction.current !== null) return;
    const message = onFeed();
    if (!message) return;
    setPetMessage(message);
    reaction.current = setTimeout(() => {
      reaction.current = null;
      setPetMessage(null);
    }, 6000);
  }
  const busy = timer.status === "running" || timer.status === "paused";
  const finished = timer.status === "completed";
  const copy = petMessage ?? sessionCopy(timer);
  const progress = Math.max(
    0,
    Math.min(100, (1 - timer.remaining / timer.duration) * 100),
  );
  const primaryLabel = !ready
    ? "Preparando seu cantinho…"
    : timer.status === "running"
      ? "Pausar sessão"
      : timer.status === "paused"
        ? "Retomar sessão"
        : timer.mode === "focus"
          ? "Começar a focar"
          : "Começar descanso";
  const PrimaryIcon = timer.status === "running" ? Pause : Play;

  return (
    <Card className="items-center rounded-[28px] pb-6 pt-4">
      <View
        ref={tourTargets?.modes}
        collapsable={false}
        className="mb-1 w-[250px] max-w-full flex-row rounded-2xl bg-soft p-1"
      >
        {(["focus", "break"] as const).map((mode) => (
          <Pressable
            key={mode}
            accessibilityRole="button"
            accessibilityState={{
              selected: timer.mode === mode,
              disabled: busy || !ready,
            }}
            disabled={busy || !ready}
            onPress={() => onConfigure(mode)}
            className={`min-h-10 flex-1 items-center justify-center rounded-xl ${timer.mode === mode ? "bg-surface" : ""}`}
          >
            <Text
              variant="label"
              style={{ color: timer.mode === mode ? accent : "#73796D" }}
            >
              {mode === "focus" ? "Foco" : "Descanso"}
            </Text>
          </Pressable>
        ))}
      </View>
      <View
        className="mt-4 w-full items-center pb-3"
        accessibilityLiveRegion="polite"
      >
        <View className="rounded-2xl border border-line bg-soft px-4 py-3">
          <Text
            className="text-center text-[14px] text-ink"
            accessibilityLabel={`${mascot.name} diz: ${copy}`}
          >
            {copy}
          </Text>
        </View>
        <View className="absolute bottom-1 h-4 w-4 rotate-45 border-b border-r border-line bg-soft" />
      </View>
      <Dog
        accent={accent}
        resting={timer.status === "running" && petMessage === null}
        celebrating={finished || petMessage !== null}
        reducedMotion={reducedMotion}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Dar petisco para ${mascot.name}`}
        accessibilityState={{ disabled: !ready || petMessage !== null }}
        disabled={!ready || petMessage !== null}
        onPress={feed}
        className="min-h-11 flex-row items-center justify-center gap-2 rounded-full bg-soft px-4 active:opacity-80 disabled:opacity-60"
      >
        <Bone size={18} color={accent} />
        <Text variant="label">
          {petMessage ? `${mascot.name} gostou!` : "Dar petisco"}
        </Text>
      </Pressable>
      <Text
        className="mt-2 font-sans text-[66px] leading-[90px] tracking-[-3px] text-ink"
        style={{ fontVariant: ["tabular-nums"] }}
        accessibilityLabel={`${Math.floor(Math.ceil(timer.remaining) / 60)} minutos e ${Math.ceil(timer.remaining) % 60} segundos restantes`}
      >
        {clockText(timer.remaining)}
      </Text>
      <View className="mb-5 mt-5 h-1 w-4/5 overflow-hidden rounded-full bg-soft">
        <View
          className="h-full rounded-full"
          style={{ backgroundColor: accent, width: `${progress}%` }}
        />
      </View>
      <View
        ref={tourTargets?.action}
        collapsable={false}
        className="w-full max-w-[340px]"
      >
        <Button
          accent={accent}
          disabled={!ready}
          onPress={onToggle}
          icon={<PrimaryIcon size={17} color="#FFFFFF" />}
        >
          {primaryLabel}
        </Button>
        {busy && (
          <TextButton onPress={onReset} underline={false}>
            Reiniciar sessão
          </TextButton>
        )}
      </View>
    </Card>
  );
}
