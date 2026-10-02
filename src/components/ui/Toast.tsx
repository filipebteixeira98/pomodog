import { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  View,
} from "react-native";
import CircleCheck from "lucide-react-native/icons/circle-check";
import X from "lucide-react-native/icons/x";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "#src/components/ui/Text";
import { useReducedMotion } from "#src/hooks/useReducedMotion";

export function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) opacity.setValue(1);
    else
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }).start();
    return () => opacity.stopAnimation();
  }, [opacity, reducedMotion]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const duration =
      Platform.OS === "android"
        ? AccessibilityInfo.getRecommendedTimeoutMillis(5000)
        : Promise.resolve(5000);
    void duration
      .catch(() => 5000)
      .then((duration) => {
        if (active) timer = setTimeout(onDismiss, Math.max(5000, duration));
      });
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [onDismiss]);

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 items-center px-4"
      style={{ top: insets.top + 72 }}
    >
      <Animated.View style={{ opacity, width: "100%", maxWidth: 440 }}>
        <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface py-2 pl-4 pr-2">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-soft">
            <CircleCheck size={20} color="#4E6B55" />
          </View>
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            variant="label"
            className="flex-1"
          >
            {message}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar confirmação"
            onPress={onDismiss}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-soft"
          >
            <X size={17} color="#73796D" />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
