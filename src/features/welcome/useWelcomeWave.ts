import { useEffect, useRef } from "react";
import { Animated, AppState, Easing, Platform } from "react-native";

/** A brief greeting at the wrist, independent of the slower head/tail motion. */
export function useWelcomeWave(reducedMotion: boolean) {
  const wave = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const move = (toValue: number, duration: number) =>
      Animated.timing(wave, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      });
    const greeting = Animated.loop(
      Animated.sequence([
        move(0, 600),
        move(1, 280),
        move(-0.65, 360),
        move(0.85, 340),
        move(0, 320),
        // Hold natively instead of scheduling a JavaScript timer every cycle.
        move(0, 4200),
      ]),
    );
    function stop() {
      greeting.stop();
      wave.setValue(0);
    }
    function start() {
      stop();
      if (reducedMotion) return;
      greeting.reset();
      greeting.start();
    }
    if (
      AppState.currentState !== "background" &&
      AppState.currentState !== "inactive"
    )
      start();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") start();
      else stop();
    });
    return () => {
      subscription.remove();
      stop();
    };
  }, [reducedMotion, wave]);
  return wave;
}
