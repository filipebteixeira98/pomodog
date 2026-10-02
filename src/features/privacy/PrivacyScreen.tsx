import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, View } from "react-native";
import Bug from "lucide-react-native/icons/bug";
import ChartNoAxesColumn from "lucide-react-native/icons/chart-no-axes-column";
import ShieldCheck from "lucide-react-native/icons/shield-check";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";

export function PrivacyScreen({
  accent,
  reducedMotion,
  usageSupported,
  onSave,
  onContinue,
  onBack,
}: {
  accent: string;
  reducedMotion: boolean;
  usageSupported: boolean;
  onSave: (enabled: boolean) => Promise<void>;
  onContinue: () => void;
  onBack: () => void;
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
  async function continueToTour(enabled: boolean) {
    if (saving.current) return;
    saving.current = true;
    setPending(enabled);
    setNotice("");
    try {
      await onSave(enabled);
      if (mounted.current) onContinue();
    } catch {
      if (mounted.current)
        setNotice("Não foi possível salvar. Tente novamente.");
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
            <View className="gap-3">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-soft">
                <ShieldCheck size={28} color={accent} />
              </View>
              <Text variant="eyebrow">SUA PRIVACIDADE</Text>
              <Text variant="title">Compartilhar dados?</Text>
              <Text>Ajude a melhorar o app. É opcional.</Text>
            </View>
            <Card className="gap-4 p-5">
              <View className="flex-row items-center gap-3">
                <Bug size={21} color={accent} />
                <View className="flex-1 gap-1">
                  <Text variant="label">Diagnóstico</Text>
                  <Text variant="caption">Dados técnicos de falhas.</Text>
                </View>
              </View>
              {usageSupported && (
                <View className="flex-row items-center gap-3">
                  <ChartNoAxesColumn size={21} color={accent} />
                  <View className="flex-1 gap-1">
                    <Text variant="label">Uso do app</Text>
                    <Text variant="caption">Telas visitadas e ciclos.</Text>
                  </View>
                </View>
              )}
              <Text variant="caption">
                {usageSupported
                  ? "Inclui dados do dispositivo e identificador da instalação. Sem nome, e-mail ou textos pessoais."
                  : "Seu nome, e-mail e histórico de foco não são enviados."}
              </Text>
            </Card>
            <Text variant="caption">
              Você pode mudar cada permissão em Ajustes.
            </Text>
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
                onPress={() => void continueToTour(true)}
                icon={
                  pending === true ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : undefined
                }
              >
                {pending === true ? "Salvando…" : "Sim, autorizo"}
              </Button>
              <Button
                accent={accent}
                secondary
                disabled={pending !== null}
                onPress={() => void continueToTour(false)}
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
