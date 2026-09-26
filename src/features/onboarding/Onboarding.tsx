import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import Coffee from "lucide-react-native/icons/coffee";
import MoveHorizontal from "lucide-react-native/icons/move-horizontal";
import PawPrint from "lucide-react-native/icons/paw-print";
import Sprout from "lucide-react-native/icons/sprout";
import Target from "lucide-react-native/icons/target";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "#src/components/ui/Button";
import { Text } from "#src/components/ui/Text";
import { Dog } from "#src/Dog";
import { mascot } from "#src/domain/mascot";
import { SpeechBubble } from "#src/features/onboarding/SpeechBubble";

const webSwipeStyle = {
  overflow: "hidden",
  touchAction: "pan-y",
  userSelect: "none",
} as const;

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
  const transition = useRef(new Animated.Value(1)).current;
  const drag = useRef(new Animated.Value(0)).current;
  const scroll = useRef<ScrollView>(null);
  const pager = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const step = steps[index];
  const last = index === steps.length - 1;

  const swipe = useMemo(() => {
    const reset = () => {
      if (reducedMotion) return drag.setValue(0);
      Animated.timing(drag, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    };
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy, numberActiveTouches }) =>
        numberActiveTouches === 1 &&
        Math.abs(dx) > 12 &&
        Math.abs(dx) > Math.abs(dy) * 1.5,
      onPanResponderGrant: () => drag.stopAnimation(),
      onPanResponderMove: (_, { dx }) => {
        if (!reducedMotion) drag.setValue(Math.max(-100, Math.min(100, dx)));
      },
      onPanResponderRelease: (_, { dx, dy }) => {
        if (Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          setIndex((current) =>
            Math.max(
              0,
              Math.min(steps.length - 1, current + (dx < 0 ? 1 : -1)),
            ),
          );
        }
        reset();
      },
      onPanResponderTerminate: reset,
    });
  }, [drag, reducedMotion]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    scroll.current?.scrollTo({ y: 0, animated: false });
    transition.setValue(reducedMotion ? 1 : 0);
    if (reducedMotion) return;
    const animation = Animated.timing(transition, {
      toValue: 1,
      duration: 280,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [index, reducedMotion, transition]);

  function goToPage(page: number) {
    if (Platform.OS !== "web") {
      pager.current?.scrollTo({
        x: page * pageWidth,
        animated: !reducedMotion,
      });
    }
    setIndex(page);
  }

  useEffect(() => {
    if (Platform.OS !== "web" && pageWidth > 0) {
      pager.current?.scrollTo({ x: index * pageWidth, animated: false });
    }
    // Keep the current page aligned when the viewport changes, not during gestures.
  }, [pageWidth]);

  const renderStep = (step: (typeof steps)[number], page: number) => (
    <View className="items-center gap-3">
      <SpeechBubble title={step.title} accent={accent}>
        {step.description}
      </SpeechBubble>
      <Dog
        key={page}
        accent={accent}
        resting={page === 1}
        celebrating={page === steps.length - 1}
        reducedMotion={reducedMotion || page !== index}
        expressive
      />
      <View className="w-full flex-row items-center gap-3 rounded-2xl bg-soft p-4">
        <step.Icon color={accent} size={22} />
        <Text variant="caption" className="flex-1 text-ink">
          {step.tip}
        </Text>
      </View>
    </View>
  );

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
          {Platform.OS !== "web" ? (
            <View
              className="flex-1"
              onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}
            >
              {pageWidth > 0 && (
                <ScrollView
                  ref={pager}
                  horizontal
                  pagingEnabled
                  directionalLockEnabled
                  showsHorizontalScrollIndicator={false}
                  bounces={false}
                  overScrollMode="never"
                  onMomentumScrollEnd={(event) => {
                    const page = Math.round(
                      event.nativeEvent.contentOffset.x / pageWidth,
                    );
                    setIndex(Math.max(0, Math.min(steps.length - 1, page)));
                  }}
                >
                  {steps.map((item, page) => (
                    <ScrollView
                      key={item.title}
                      style={{ width: pageWidth }}
                      contentContainerClassName="grow justify-center px-7 py-4"
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                      accessibilityElementsHidden={page !== index}
                      importantForAccessibility={
                        page === index ? "auto" : "no-hide-descendants"
                      }
                    >
                      {renderStep(item, page)}
                    </ScrollView>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <View
              className="flex-1 overflow-hidden"
              {...swipe.panHandlers}
              style={Platform.OS === "web" ? webSwipeStyle : undefined}
            >
              <ScrollView
                ref={scroll}
                contentContainerClassName="grow justify-center px-7 py-4"
                showsVerticalScrollIndicator={false}
              >
                <Animated.View
                  style={{
                    opacity: transition,
                    transform: [
                      { translateX: drag },
                      {
                        translateY: transition.interpolate({
                          inputRange: [0, 1],
                          outputRange: [12, 0],
                        }),
                      },
                    ],
                  }}
                >
                  {renderStep(step, index)}
                </Animated.View>
              </ScrollView>
            </View>
          )}
          <View className="gap-3 px-7 pb-4 pt-2">
            <View className="flex-row items-center justify-center">
              {steps.map((_, dot) => (
                <Pressable
                  key={dot}
                  accessibilityRole="button"
                  accessibilityLabel={`Ir para etapa ${dot + 1} de ${steps.length}`}
                  accessibilityState={{ selected: dot === index }}
                  onPress={() => goToPage(dot)}
                  className="h-11 w-11 items-center justify-center"
                >
                  <View
                    className={`h-1.5 rounded-full ${dot === index ? "w-6" : "w-1.5"}`}
                    style={{
                      backgroundColor: dot === index ? accent : "#DDE1D5",
                    }}
                  />
                </Pressable>
              ))}
            </View>
            {last ? (
              <Button
                accent={accent}
                onPress={onFinish}
                icon={<ArrowRight color="#FFFFFF" size={18} />}
              >
                Ir para meu foco
              </Button>
            ) : (
              <View className="min-h-12 flex-row items-center justify-center gap-2">
                <MoveHorizontal size={20} color={accent} />
                <Text variant="caption">Deslize para explorar</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
