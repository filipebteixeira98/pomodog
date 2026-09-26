import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import Coffee from "lucide-react-native/icons/coffee";
import PawPrint from "lucide-react-native/icons/paw-print";
import Sprout from "lucide-react-native/icons/sprout";
import Target from "lucide-react-native/icons/target";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, TextButton } from "#src/components/ui/Button";
import { Text } from "#src/components/ui/Text";
import { Dog } from "#src/Dog";
import { mascot } from "#src/domain/mascot";
import { SpeechBubble } from "#src/features/onboarding/SpeechBubble";

const steps = [
  {
    title: `Oi! Eu sou ${mascot.name}.`,
    description:
      "Vou fazer companhia a você. Escolha uma tarefa pequena e toque em “Começar a focar”. Vamos dar esse primeiro passo juntos?",
    tip: "Comece com 25 minutos. Ajuste quando quiser.",
    Icon: Target,
  },
  {
    title: "Vamos no seu ritmo?",
    description:
      "Enquanto você foca, fico quietinho. Precisa parar? Pause e retome quando puder. Depois de concluir, escolha um descanso para nós dois.",
    tip: "Foco, descanso e um novo começo. Sem pressa.",
    Icon: Coffee,
  },
  {
    title: "Cada volta conta.",
    description:
      "Você encontra suas conquistas em “Meu progresso” e pode mudar o nosso cantinho em “Ajustes”. Ficarei feliz em ver você voltar!",
    tip: "Seu progresso fica salvo neste dispositivo.",
    Icon: Sprout,
  },
];

export function Onboarding({
  accent,
  reducedMotion,
  onFinish,
}: {
  accent: string;
  reducedMotion: boolean;
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);
  const calm = reducedMotion || motionPaused;
  const transition = useRef(new Animated.Value(1)).current;
  const scroll = useRef<ScrollView>(null);
  const step = steps[index];
  const last = index === steps.length - 1;

  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    transition.setValue(calm ? 1 : 0);
    if (calm) return;
    const animation = Animated.timing(transition, {
      toValue: 1,
      duration: 280,
      useNativeDriver: Platform.OS !== "web",
    });
    animation.start();
    return () => animation.stop();
  }, [index, calm, transition]);

  return (
    <Modal
      visible
      animationType={reducedMotion ? "none" : "fade"}
      onRequestClose={onFinish}
    >
      <SafeAreaView className="flex-1 bg-canvas">
        <View className="w-full max-w-[540px] flex-1 self-center">
          <View className="flex-row items-center justify-between px-6 py-4">
            <View className="flex-row items-center gap-2">
              <PawPrint size={23} color={accent} />
              <Text variant="label">Boas-vindas ao pomodog</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pular introdução"
              onPress={onFinish}
              className="min-h-11 justify-center px-2"
            >
              <Text variant="caption">Pular</Text>
            </Pressable>
          </View>
          <ScrollView
            ref={scroll}
            contentContainerClassName="grow justify-center px-7 py-4"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{
                opacity: transition,
                transform: [
                  {
                    translateY: transition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              }}
            >
              <View className="items-center gap-3">
                <SpeechBubble title={step.title} accent={accent}>
                  {step.description}
                </SpeechBubble>
                <Dog
                  key={index}
                  accent={accent}
                  resting={index === 1}
                  celebrating={last}
                  reducedMotion={calm}
                  expressive
                />
                <View className="w-full flex-row items-center gap-3 rounded-2xl bg-soft p-4">
                  <step.Icon color={accent} size={22} />
                  <Text variant="caption" className="flex-1 text-ink">
                    {step.tip}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
          <View className="gap-3 px-7 pb-4 pt-2">
            {!reducedMotion ? (
              <TextButton onPress={() => setMotionPaused((value) => !value)}>
                {motionPaused ? "Ativar movimentos" : "Pausar movimentos"}
              </TextButton>
            ) : (
              <Text variant="caption" className="text-center">
                Movimento reduzido está ativado.
              </Text>
            )}
            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Progresso da introdução"
              accessibilityValue={{
                min: 1,
                max: steps.length,
                now: index + 1,
                text: `Etapa ${index + 1} de ${steps.length}`,
              }}
              className="flex-row items-center justify-center gap-2"
            >
              {steps.map((_, dot) => (
                <View
                  key={dot}
                  className={`h-1.5 rounded-full ${dot === index ? "w-6" : "w-1.5"}`}
                  style={{
                    backgroundColor: dot === index ? accent : "#DDE1D5",
                  }}
                />
              ))}
            </View>
            <Button
              accent={accent}
              onPress={() =>
                last ? onFinish() : setIndex((current) => current + 1)
              }
              icon={<ArrowRight color="#FFFFFF" size={18} />}
            >
              {last ? "Ir para meu foco" : "Continuar"}
            </Button>
            {index > 0 ? (
              <TextButton onPress={() => setIndex((current) => current - 1)}>
                Voltar
              </TextButton>
            ) : (
              <Text variant="caption" className="py-3 text-center">
                Leva menos de um minuto. No seu tempo.
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
