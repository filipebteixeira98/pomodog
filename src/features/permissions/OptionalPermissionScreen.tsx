import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Modal, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "#src/components/ui/Button";
import { Text } from "#src/components/ui/Text";

export function OptionalPermissionScreen({
  accent,
  reducedMotion,
  onSave,
  onContinue,
  onBack,
  children,
  allowLabel,
  errorMessage = "Não foi possível salvar. Tente novamente.",
}: {
  accent: string;
  reducedMotion: boolean;
  onSave: (enabled: boolean) => Promise<void | boolean>;
  onContinue: () => void;
  onBack: () => void;
  children: ReactNode;
  allowLabel: string;
  errorMessage?: string;
}) {
  const [pending, setPending] = useState<boolean | null>(null);
  const [notice, setNotice] = useState("");
  const saving = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function saveChoice(enabled: boolean) {
    if (saving.current) return;
    saving.current = true;
    setPending(enabled);
    setNotice("");
    try {
      const saved = await onSave(enabled);
      if (!mounted.current) return;
      if (saved === false) setNotice(errorMessage);
      else onContinue();
    } catch {
      if (mounted.current) setNotice(errorMessage);
    } finally {
      saving.current = false;
      if (mounted.current) setPending(null);
    }
  }
  const goBack = () => {
    if (!saving.current) onBack();
  };
  return (
    <Modal
      visible
      animationType={reducedMotion ? "none" : "fade"}
      onRequestClose={goBack}
    >
      <SafeAreaView className="flex-1 bg-canvas">
        <View className="w-full max-w-[540px] flex-1 self-center">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="grow justify-center gap-5 px-7 py-6"
          >
            {children}
            {notice !== "" && (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                className="rounded-xl bg-[#F9E8CB] p-3 text-[#785621]"
              >
                {notice}
              </Text>
            )}
            <View className="gap-3">
              <Button
                accent={accent}
                disabled={pending !== null}
                onPress={() => void saveChoice(true)}
                icon={
                  pending === true ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : undefined
                }
              >
                {pending === true ? "Salvando…" : allowLabel}
              </Button>
              <Button
                accent={accent}
                secondary
                disabled={pending !== null}
                onPress={() => void saveChoice(false)}
                icon={
                  pending === false ? (
                    <ActivityIndicator color="#343C32" size="small" />
                  ) : undefined
                }
              >
                {pending === false ? "Salvando…" : "Agora não"}
              </Button>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
