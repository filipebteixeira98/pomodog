import { View } from "react-native";
import Svg, { Circle, G, Line, Path, Rect } from "react-native-svg";

import { WelcomeDog } from "#src/features/welcome/WelcomeDog";

export function WelcomeArtwork({
  accent,
  reducedMotion,
}: {
  accent: string;
  reducedMotion: boolean;
}) {
  return (
    <View className="w-full max-w-[360px] self-center">
      <WelcomeDog accent={accent} reducedMotion={reducedMotion} />
      <View
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="absolute bottom-2 right-4"
      >
        <Svg width={90} height={102} viewBox="0 0 90 102">
          <Rect x="35" y="4" width="20" height="9" rx="4" fill={accent} />
          <Line
            x1="45"
            y1="13"
            x2="45"
            y2="20"
            stroke={accent}
            strokeWidth="5"
          />
          <Circle cx="45" cy="57" r="38" fill="#F0C3AC" />
          <Circle cx="45" cy="57" r="29" fill="#FFFEFA" />
          <Path
            d="M45 31 A26 26 0 1 1 22.5 70"
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <G stroke="#343C32" strokeWidth="3" strokeLinecap="round">
            <Line x1="45" y1="57" x2="45" y2="39" />
            <Line x1="45" y1="57" x2="57" y2="63" />
          </G>
          <Circle cx="45" cy="57" r="3.5" fill="#343C32" />
        </Svg>
      </View>
    </View>
  );
}
