import { Pressable, View } from "react-native";
import Pause from "lucide-react-native/icons/pause";
import Play from "lucide-react-native/icons/play";

import { Button, TextButton } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Text } from "../../components/ui/Text";
import { Dog } from "../../Dog";
import { clockText, type Mode, type Timer } from "../../timer";

type Props = {
  timer: Timer;
  accent: string;
  reducedMotion: boolean;
  ready: boolean;
  onConfigure: (mode: Mode, seconds?: number, demo?: boolean) => void;
  onToggle: () => void;
  onReset: () => void;
};

function sessionCopy(timer: Timer) {
  if (timer.status === "completed")
    return {
      message: "Boa! Um momento dedicado a você.",
      caption: "SESSÃO CONCLUÍDA",
    };
  if (timer.status === "paused")
    return {
      message: "Sem pressa. Continuamos quando quiser.",
      caption: "UM RESPIRO NO CAMINHO",
    };
  if (timer.mode === "break")
    return {
      message: "Vamos recarregar as energias juntos.",
      caption: "DESCANSAR TAMBÉM FAZ PARTE",
    };
  return {
    message:
      timer.status === "running"
        ? "Pode focar. Eu fico aqui com você."
        : "Um pequeno começo já faz diferença.",
    caption: "UM PASSO DE CADA VEZ",
  };
}

export function TimerCard({
  timer,
  accent,
  reducedMotion,
  ready,
  onConfigure,
  onToggle,
  onReset,
}: Props) {
  const busy = timer.status === "running" || timer.status === "paused";
  const finished = timer.status === "completed";
  const copy = sessionCopy(timer);
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
    <Card className="items-center rounded-[28px] pb-2 pt-4">
      <View className="mb-1 w-[250px] max-w-full flex-row rounded-2xl bg-soft p-1">
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
      <Dog
        accent={accent}
        resting={timer.status === "running"}
        celebrating={finished}
        reducedMotion={reducedMotion}
      />
      <Text
        variant="caption"
        className="text-center"
        accessibilityLiveRegion="polite"
      >
        {copy.message}
      </Text>
      <Text
        className="mt-2 font-sans text-[66px] leading-[90px] tracking-[-3px] text-ink"
        style={{ fontVariant: ["tabular-nums"] }}
        accessibilityLabel={`${Math.floor(Math.ceil(timer.remaining) / 60)} minutos e ${Math.ceil(timer.remaining) % 60} segundos restantes`}
      >
        {clockText(timer.remaining)}
      </Text>
      <Text variant="eyebrow" className="text-center text-[9px] leading-4">
        {timer.demo ? "DEMONSTRAÇÃO · NÃO CONTA NO PROGRESSO" : copy.caption}
      </Text>
      <View className="mb-5 mt-5 h-1 w-4/5 overflow-hidden rounded-full bg-soft">
        <View
          className="h-full rounded-full"
          style={{ backgroundColor: accent, width: `${progress}%` }}
        />
      </View>
      <View className="w-full max-w-[340px]">
        {finished ? (
          <Button
            accent={accent}
            onPress={() =>
              onConfigure(
                timer.demo || timer.mode === "break" ? "focus" : "break",
              )
            }
          >
            {timer.demo
              ? "Voltar ao foco"
              : timer.mode === "focus"
                ? "Preparar descanso"
                : "Preparar próximo foco"}
          </Button>
        ) : (
          <Button
            accent={accent}
            disabled={!ready}
            onPress={onToggle}
            icon={<PrimaryIcon size={17} color="#FFFFFF" />}
          >
            {primaryLabel}
          </Button>
        )}
        {busy ? (
          <TextButton onPress={onReset}>Reiniciar sessão</TextButton>
        ) : (
          !finished && (
            <TextButton
              disabled={!ready}
              onPress={() =>
                timer.demo
                  ? onConfigure("focus")
                  : onConfigure("focus", 10, true)
              }
            >
              {timer.demo
                ? "Sair da demonstração"
                : "Experimentar em 10 segundos"}
            </TextButton>
          )
        )}
      </View>
    </Card>
  );
}
