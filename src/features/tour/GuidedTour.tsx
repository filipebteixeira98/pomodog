import { useEffect, useRef, useState, type RefObject } from "react";
import {
  BackHandler,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";

import { Button, TextButton } from "#src/components/ui/Button";
import { Text } from "#src/components/ui/Text";

export type TourTargets = Record<
  "modes" | "action" | "navigation",
  RefObject<View | null>
>;
const steps = [
  {
    target: "modes",
    title: "Seu momento",
    description: "Escolha entre foco e descanso.",
  },
  {
    target: "action",
    title: "Seu primeiro ciclo",
    description: "Use este botão para iniciar, pausar ou retomar sua sessão.",
  },
  {
    target: "navigation",
    title: "Seu cantinho",
    description:
      "Veja seu progresso, ajuste preferências e cuide dos seus dados.",
  },
] as const;
type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
  screenWidth: number;
  screenHeight: number;
};

export function GuidedTour({
  index,
  targets,
  host,
  accent,
  onChange,
  onClose,
}: {
  index: number;
  targets: TourTargets;
  host: RefObject<View | null>;
  accent: string;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const panel = useRef<View>(null);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const window = useWindowDimensions();
  const step = steps[index];
  useEffect(() => {
    let cancelled = false;
    setBounds(null);
    const measure = () =>
      host.current?.measureInWindow((hx, hy, screenWidth, screenHeight) => {
        targets[step.target].current?.measureInWindow((x, y, width, height) => {
          if (cancelled || width <= 0 || height <= 0) return;
          const next = {
            x: Math.max(0, x - hx - 4),
            y: Math.max(0, y - hy - 4),
            width: Math.max(
              0,
              Math.min(width + 8, screenWidth - Math.max(0, x - hx - 4)),
            ),
            height: Math.max(
              0,
              Math.min(height + 8, screenHeight - Math.max(0, y - hy - 4)),
            ),
            screenWidth,
            screenHeight,
          };
          setBounds((current) =>
            JSON.stringify(current) === JSON.stringify(next) ? current : next,
          );
        });
      });
    measure();
    // Track layout after mounting, scrolling, resizing and font scaling.
    const interval = setInterval(measure, 150);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    host,
    targets,
    step.target,
    window.width,
    window.height,
    window.fontScale,
  ]);
  useEffect(() => {
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => listener.remove();
  }, [onClose]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const previous = document.activeElement as HTMLElement | null;
    return () => previous?.focus();
  }, []);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const element = panel.current as unknown as HTMLElement | null;
    const buttons = () =>
      Array.from(
        element?.querySelectorAll<HTMLElement>('[role="button"], button') ?? [],
      );
    buttons()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const items = buttons();
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    element?.addEventListener("keydown", onKey);
    return () => element?.removeEventListener("keydown", onKey);
  }, [index, onClose]);

  const shade = "rgba(25, 34, 28, 0.68)";
  const below = bounds ? bounds.screenHeight - bounds.y - bounds.height : 0;
  const useBelow = bounds ? below >= bounds.y : true;
  const available = bounds ? (useBelow ? below : bounds.y) - 24 : 300;
  return (
    <View
      className="absolute inset-0"
      accessibilityViewIsModal
      onAccessibilityEscape={onClose}
    >
      <View className="absolute inset-0" onStartShouldSetResponder={() => true}>
        {bounds ? (
          <>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: bounds.y,
                backgroundColor: shade,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: bounds.y + bounds.height,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: shade,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: bounds.y,
                left: 0,
                width: bounds.x,
                height: bounds.height,
                backgroundColor: shade,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: bounds.y,
                left: bounds.x + bounds.width,
                right: 0,
                height: bounds.height,
                backgroundColor: shade,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: bounds.y,
                left: bounds.x,
                width: bounds.width,
                height: bounds.height,
                borderWidth: 3,
                borderRadius: 16,
                borderColor: accent,
              }}
            />
          </>
        ) : (
          <View
            className="absolute inset-0"
            style={{ backgroundColor: shade }}
          />
        )}
      </View>
      <View
        ref={panel}
        role="dialog"
        aria-label="Tour guiado"
        className="absolute self-center rounded-3xl border border-line bg-surface p-5"
        style={{
          width: "90%",
          maxWidth: 420,
          maxHeight: Math.max(140, available),
          ...(bounds
            ? useBelow
              ? { top: bounds.y + bounds.height + 12 }
              : { bottom: bounds.screenHeight - bounds.y + 12 }
            : { top: "25%" }),
        }}
      >
        <ScrollView contentContainerClassName="gap-3">
          <Text variant="eyebrow">GUIA RÁPIDO · {index + 1} DE 3</Text>
          <Text variant="heading" accessibilityLiveRegion="polite">
            {step.title}
          </Text>
          <Text>{step.description}</Text>
          <Button
            accent={accent}
            onPress={() => (index === 2 ? onClose() : onChange(index + 1))}
          >
            {index === 2 ? "Concluir tour" : "Próximo"}
          </Button>
          {index > 0 && (
            <TextButton onPress={() => onChange(index - 1)}>Voltar</TextButton>
          )}
          <TextButton onPress={onClose}>Pular tour</TextButton>
        </ScrollView>
      </View>
    </View>
  );
}
