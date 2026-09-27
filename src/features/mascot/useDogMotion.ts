import { useEffect, useRef } from "react";
import { Animated, AppState, Easing, Platform } from "react-native";

type Options = {
  resting: boolean;
  celebrating: boolean;
  expressive: boolean;
  reducedMotion: boolean;
};

const useNativeDriver = Platform.OS !== "web";

function timing(value: Animated.Value, toValue: number, duration: number) {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.inOut(Easing.sin),
    useNativeDriver,
    isInteraction: false,
  });
}

/** Animate transforms only; no React updates or timers on each frame. */
export function useDogMotion({
  resting,
  celebrating,
  expressive,
  reducedMotion,
}: Options) {
  const breath = useRef(new Animated.Value(0)).current;
  const gesture = useRef(new Animated.Value(0)).current;
  const wag = useRef(new Animated.Value(0)).current;
  const arrival = useRef(new Animated.Value(0)).current;
  const lively = !resting && (expressive || celebrating);

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        timing(breath, 1, resting ? 2600 : 1800),
        timing(breath, 0, resting ? 2600 : 1800),
      ]),
    );
    const gestures = Animated.loop(
      Animated.sequence([
        timing(gesture, 1, lively ? 500 : 1100),
        timing(gesture, 0, lively ? 500 : 1100),
        timing(gesture, -1, lively ? 500 : 1100),
        timing(gesture, 0, lively ? 500 : 1100),
        // A native-driven hold avoids a JS delay between every gesture.
        timing(gesture, 0, lively ? 900 : 5000),
      ]),
    );
    const tail = Animated.loop(
      Animated.sequence([
        timing(wag, 1, 230),
        timing(wag, -1, 460),
        timing(wag, 0, 230),
      ]),
    );
    const entrance = Animated.timing(arrival, {
      toValue: 0,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver,
      isInteraction: false,
    });
    function stop() {
      breathing.stop();
      gestures.stop();
      tail.stop();
      entrance.stop();
      breath.setValue(0);
      gesture.setValue(0);
      wag.setValue(0);
      arrival.setValue(0);
    }
    function start(enter = false) {
      stop();
      if (reducedMotion) return;
      breathing.reset();
      gestures.reset();
      tail.reset();
      if (enter && expressive) {
        arrival.setValue(-35);
        entrance.start();
      }
      breathing.start();
      if (!resting) gestures.start();
      if (lively) tail.start();
    }
    if (
      AppState.currentState !== "background" &&
      AppState.currentState !== "inactive"
    )
      start(true);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") start();
      else stop();
    });
    return () => {
      subscription.remove();
      stop();
    };
  }, [
    arrival,
    breath,
    expressive,
    gesture,
    lively,
    reducedMotion,
    resting,
    wag,
  ]);

  return { arrival, breath, gesture, wag, lively };
}
