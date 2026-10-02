import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import Bug from "lucide-react-native/icons/bug";
import ChartNoAxesColumn from "lucide-react-native/icons/chart-no-axes-column";
import Check from "lucide-react-native/icons/check";
import ShieldCheck from "lucide-react-native/icons/shield-check";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, TextButton } from "#src/components/ui/Button";
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
  const [choice, setChoice] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const saving = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function continueToTour() {
    if (choice === null || saving.current) return;
    saving.current = true;
    setPending(true);
    setNotice("");
    try {
      await onSave(choice);
      if (mounted.current) onContinue();
    } catch {
      if (mounted.current)
        setNotice(
          "Não foi possível salvar sua escolha. Tente novamente ou continue sem compartilhar.",
        );
    } finally {
      saving.current = false;
      if (mounted.current) setPending(false);
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
              <Text variant="title">Você decide o que compartilhar.</Text>
              <Text>
                Ajude a melhorar nosso cantinho, se quiser. Seu foco continua
                igual em qualquer escolha.
              </Text>
            </View>
            <Card className="gap-4 p-5">
              <View className="flex-row items-center gap-3">
                <Bug size={21} color={accent} />
                <View className="flex-1 gap-1">
                  <Text variant="label">Diagnóstico</Text>
                  <Text variant="caption">
                    Informações técnicas sobre falhas do app.
                  </Text>
                </View>
              </View>
              {usageSupported && (
                <View className="flex-row items-center gap-3">
                  <ChartNoAxesColumn size={21} color={accent} />
                  <View className="flex-1 gap-1">
                    <Text variant="label">Uso do app</Text>
                    <Text variant="caption">
                      Telas visitadas e ciclos de foco e descanso.
                    </Text>
                  </View>
                </View>
              )}
              <Text variant="caption">
                {usageSupported
                  ? "Sem nome, e-mail ou textos pessoais. Dados de uso incluem informações do dispositivo e um identificador da instalação."
                  : "Seu nome, e-mail e histórico de foco não são enviados."}
              </Text>
            </Card>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Escolha de compartilhamento de dados opcionais"
              className="gap-3"
            >
              {[
                {
                  value: true,
                  title: "Permitir dados opcionais",
                  description: usageSupported
                    ? "Compartilhar diagnóstico e uso do app."
                    : "Compartilhar informações sobre falhas.",
                },
                {
                  value: false,
                  title: "Continuar sem compartilhar",
                  description: "Você pode ativar depois, em Ajustes.",
                },
              ].map((option) => (
                <Pressable
                  key={String(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: choice === option.value,
                    disabled: pending,
                  }}
                  accessibilityLabel={`${option.title}. ${option.description}`}
                  disabled={pending}
                  onPress={() => setChoice(option.value)}
                  className="min-h-[76px] flex-row items-center gap-3 rounded-2xl border bg-surface p-4"
                  style={{
                    borderColor: choice === option.value ? accent : "#E7E8DE",
                    backgroundColor:
                      choice === option.value ? "#ECEEE6" : "#FFFFFF",
                  }}
                >
                  <View
                    className="h-6 w-6 items-center justify-center rounded-full border"
                    style={{
                      borderColor: choice === option.value ? accent : "#C7CDBC",
                      backgroundColor:
                        choice === option.value ? accent : "transparent",
                    }}
                  >
                    {choice === option.value && (
                      <Check size={15} color="#FFFFFF" />
                    )}
                  </View>
                  <View className="flex-1 gap-1">
                    <Text variant="label">{option.title}</Text>
                    <Text variant="caption">{option.description}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
            <Text variant="caption">
              As permissões são independentes. Você pode mudar cada uma em
              Ajustes, quando quiser.
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
            <View className="gap-2">
              <Button
                accent={accent}
                disabled={choice === null || pending}
                onPress={() => void continueToTour()}
                icon={
                  pending ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <ArrowRight color="#FFFFFF" size={18} />
                  )
                }
              >
                {pending ? "Salvando escolha…" : "Continuar para o tour"}
              </Button>
              <TextButton disabled={pending} underline={false} onPress={goBack}>
                Voltar
              </TextButton>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
