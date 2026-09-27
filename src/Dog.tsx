import { memo, useState } from "react";
import { Animated, View } from "react-native";

import { mascot } from "#src/domain/mascot";
import {
  Celebration,
  Head,
  Paw,
  Scenery,
  Tail,
  Torso,
} from "#src/features/mascot/Artwork";
import { useDogMotion } from "#src/features/mascot/useDogMotion";

type Props = {
  resting: boolean;
  celebrating: boolean;
  reducedMotion: boolean;
  accent: string;
  expressive?: boolean;
};

const layer = { position: "absolute" as const, width: 360, height: 230 };

/** Shared fixed-coordinate canvas keeps joints aligned at every screen width. */
export const Dog = memo(function Dog({
  resting,
  celebrating,
  reducedMotion,
  accent,
  expressive = false,
}: Props) {
  const [width, setWidth] = useState(360);
  const { arrival, breath, gesture, wag, lively } = useDogMotion({
    resting,
    celebrating,
    reducedMotion,
    expressive,
  });
  const headAngle = lively ? 8 : 3;
  return (
    <View
      accessible
      accessibilityLabel={`${mascot.name}, ${resting ? "descansando ao seu lado" : celebrating ? "feliz por você" : "seu companheiro de foco"}`}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ width: "100%", maxWidth: 360, height: 208, alignSelf: "center" }}
    >
      <View
        pointerEvents="none"
        style={{
          ...layer,
          left: "50%",
          marginLeft: -180,
          top: -11,
          transform: [{ scale: Math.min(width / 360, 208 / 230) }],
        }}
      >
        <Scenery />
        <Animated.View
          testID="mascot-body"
          style={{ ...layer, transform: [{ translateX: arrival }] }}
        >
          <Animated.View
            testID="mascot-tail"
            style={{
              ...layer,
              transformOrigin: [236, 175, 0],
              transform: [
                {
                  rotate: wag.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: ["-18deg", "0deg", "18deg"],
                  }),
                },
              ],
            }}
          >
            <Tail />
          </Animated.View>
          <Animated.View
            testID="mascot-torso"
            style={{
              ...layer,
              transformOrigin: [190, 197, 0],
              transform: [
                {
                  scaleY: breath.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, resting ? 1.045 : 1.025],
                  }),
                },
                {
                  rotate: gesture.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [
                      lively ? "-2deg" : "-0.5deg",
                      "0deg",
                      lively ? "2deg" : "0.5deg",
                    ],
                  }),
                },
              ],
            }}
          >
            <Torso />
          </Animated.View>
          <Animated.View
            testID="mascot-paw-left"
            style={{
              ...layer,
              transformOrigin: [142, 166, 0],
              transform: [
                {
                  rotate: gesture.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: ["0deg", "0deg", lively ? "16deg" : "2deg"],
                  }),
                },
                {
                  translateY: gesture.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [0, 0, lively ? -4 : 0],
                  }),
                },
              ],
            }}
          >
            <Paw />
          </Animated.View>
          <Animated.View
            testID="mascot-paw-right"
            style={{
              ...layer,
              transformOrigin: [223, 166, 0],
              transform: [
                {
                  rotate: gesture.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [lively ? "-16deg" : "-2deg", "0deg", "0deg"],
                  }),
                },
                {
                  translateY: gesture.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [lively ? -4 : 0, 0, 0],
                  }),
                },
              ],
            }}
          >
            <Paw right />
          </Animated.View>
          <Animated.View
            testID="mascot-head"
            style={{
              ...layer,
              transformOrigin: [176, 158, 0],
              transform: [
                {
                  translateY: breath.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, resting ? -2 : -1],
                  }),
                },
                {
                  rotate: gesture.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [
                      `-${headAngle}deg`,
                      "0deg",
                      `${headAngle}deg`,
                    ],
                  }),
                },
              ],
            }}
          >
            <Head resting={resting} celebrating={celebrating} accent={accent} />
          </Animated.View>
        </Animated.View>
        {celebrating && (
          <View style={layer}>
            <Celebration />
          </View>
        )}
      </View>
    </View>
  );
});
