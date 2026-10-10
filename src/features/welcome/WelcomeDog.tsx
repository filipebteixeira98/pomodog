import { memo, useState } from "react";
import { Animated, View } from "react-native";
import { Ellipse, Path, Rect } from "react-native-svg";

import { mascot } from "#src/domain/mascot";
import { Canvas, Head, Scenery } from "#src/features/mascot/Artwork";
import { useDogMotion } from "#src/features/mascot/useDogMotion";

const layer = { position: "absolute" as const, width: 360, height: 230 };

/** An upright greeting pose, composed with Nino's shared face and motion lifecycle. */
export const WelcomeDog = memo(function WelcomeDog({
  accent,
  reducedMotion,
}: {
  accent: string;
  reducedMotion: boolean;
}) {
  const [width, setWidth] = useState(360);
  const { breath, gesture } = useDogMotion({
    resting: false,
    celebrating: false,
    expressive: false,
    reducedMotion,
  });
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${mascot.name} lhe dando boas-vindas, sentado com a pata levantada`}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ width: "100%", maxWidth: 360, height: 208, alignSelf: "center" }}
    >
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
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
          testID="welcome-mascot-tail"
          style={{
            ...layer,
            transformOrigin: [227, 175, 0],
            transform: [
              {
                rotate: gesture.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ["-9deg", "0deg", "9deg"],
                }),
              },
            ],
          }}
        >
          <Canvas>
            <Path
              d="M221 169 Q255 163 260 137 Q281 125 279 146 Q277 181 228 184 Z"
              fill="#CA9261"
              stroke="#624838"
              strokeWidth="3"
            />
          </Canvas>
        </Animated.View>
        <Animated.View
          style={{
            ...layer,
            transformOrigin: [185, 199, 0],
            transform: [
              {
                scaleY: breath.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.02],
                }),
              },
            ],
          }}
        >
          <Canvas>
            <Ellipse cx="145" cy="190" rx="22" ry="13" fill="#D9A572" />
            <Ellipse cx="226" cy="190" rx="22" ry="13" fill="#D9A572" />
            <Path
              d="M151 145 Q146 121 176 119 Q210 116 222 146 L235 181 Q244 200 221 202 L149 202 Q129 201 140 181 Z"
              fill="#D9A572"
            />
            <Path
              d="M172 138 Q187 127 203 144 L209 185 Q203 201 181 199 Q156 177 172 138 Z"
              fill="#F7E7CE"
            />
            <Rect
              x="195"
              y="153"
              width="27"
              height="46"
              rx="13"
              fill="#E8BF8F"
            />
            <Rect
              x="190"
              y="184"
              width="38"
              height="19"
              rx="9"
              fill="#F7E7CE"
            />
            <Path
              d="M202 197 L202 202 M212 197 L212 202"
              stroke="#C39469"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </Canvas>
        </Animated.View>
        <Animated.View
          testID="welcome-mascot-wave"
          style={{
            ...layer,
            transformOrigin: [151, 165, 0],
            transform: [
              {
                rotate: gesture.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ["-9deg", "0deg", "16deg"],
                }),
              },
            ],
          }}
        >
          <Canvas>
            <Path
              d="M155 156 Q133 155 122 137 L120 128 Q108 123 103 134 Q104 148 117 162 Q132 180 156 174 Z"
              fill="#F7E7CE"
            />
            <Path
              d="M106 136 L112 133 M111 142 L116 138"
              stroke="#C39469"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </Canvas>
        </Animated.View>
        <Animated.View
          testID="welcome-mascot-head"
          style={{
            ...layer,
            transformOrigin: [176, 158, 0],
            transform: [
              { translateY: -26 },
              {
                rotate: gesture.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ["-4deg", "0deg", "4deg"],
                }),
              },
            ],
          }}
        >
          <Head resting={false} celebrating={false} accent={accent} />
        </Animated.View>
      </View>
    </View>
  );
});
