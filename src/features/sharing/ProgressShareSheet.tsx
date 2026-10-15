import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import Share2 from "lucide-react-native/icons/share-2";
import X from "lucide-react-native/icons/x";
import type Svg from "react-native-svg";

import { Button } from "#src/components/ui/Button";
import { Sheet } from "#src/components/ui/Sheet";
import { Text } from "#src/components/ui/Text";
import {
  createProgressShareAction,
  progressPng,
} from "#src/features/sharing/imageExport";
import type { SharedProgress } from "#src/features/sharing/progressShare";
import { ProgressShareArtwork } from "#src/features/sharing/ProgressShareArtwork";
import { shareProgressImage } from "#src/features/sharing/shareImage";
import { reportError } from "#src/monitoring/sentry";

export function ProgressShareSheet({
  progress,
  accent,
  reducedMotion,
  onClose,
}: {
  progress: SharedProgress;
  accent: string;
  reducedMotion: boolean;
  onClose: () => void;
}) {
  const svg = useRef<Svg>(null);
  const mounted = useRef(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [action] = useState(() =>
    createProgressShareAction({
      capture: (signal) => {
        if (!svg.current)
          return Promise.reject(new Error("progress-image-not-ready"));
        return progressPng(svg.current, signal);
      },
      deliver: shareProgressImage,
    }),
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      action.cancel();
    };
  }, [action]);

  async function share() {
    if (action.busy()) return;
    setError("");
    setPending(true);
    try {
      await action.run();
      // Native chooser completion cannot confirm whether a post was published.
    } catch (failure) {
      if (mounted.current) {
        setError("Não foi possível compartilhar a imagem. Tente novamente.");
        reportError(failure, "sharing.image");
      }
    } finally {
      if (mounted.current) setPending(false);
    }
  }

  const close = () => {
    if (!action.busy()) onClose();
  };
  return (
    <Sheet visible onClose={close} reducedMotion={reducedMotion}>
      <View className="flex-row items-center gap-2">
        <Text variant="heading" className="flex-1">
          Seu progresso
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar prévia de compartilhamento"
          disabled={pending}
          onPress={close}
          className="-mr-2 h-11 w-11 items-center justify-center rounded-full active:bg-soft disabled:opacity-40"
        >
          <X size={20} color="#73796D" />
        </Pressable>
      </View>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Imagem Pomodog: ${progress.streakDays} dias seguidos com foco. Últimos sete dias: ${progress.weekMinutes} minutos e ${progress.weekSessions} sessões concluídas.`}
        style={{ width: "100%", aspectRatio: 4 / 5 }}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="h-full w-full"
        >
          <ProgressShareArtwork ref={svg} progress={progress} accent={accent} />
        </View>
      </View>
      <Text variant="caption">
        Apenas este resumo será compartilhado. Você escolhe o destino.
      </Text>
      {error !== "" && (
        <Text
          variant="caption"
          accessibilityRole="alert"
          className="text-[#B42318]"
        >
          {error}
        </Text>
      )}
      <Button
        accent={accent}
        disabled={pending}
        onPress={() => void share()}
        icon={
          pending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Share2 size={18} color="#FFFFFF" />
          )
        }
      >
        {pending
          ? "Preparando…"
          : Platform.OS === "web"
            ? "Salvar imagem"
            : "Compartilhar imagem"}
      </Button>
    </Sheet>
  );
}
