import { forwardRef } from "react";
import Svg, { G, Line, Rect, Text as SvgText } from "react-native-svg";

import {
  Celebration,
  Head,
  Paw,
  Scenery,
  Tail,
  Torso,
} from "#src/features/mascot/Artwork";
import type { SharedProgress } from "#src/features/sharing/progressShare";

export const ProgressShareArtwork = forwardRef<
  Svg,
  {
    progress: SharedProgress;
    accent: string;
  }
>(function ProgressShareArtwork({ progress, accent }, ref) {
  const { streakDays, weekMinutes, weekSessions } = progress;
  return (
    <Svg ref={ref} width="100%" height="100%" viewBox="0 0 360 450">
      <Rect width="360" height="450" rx="22" fill="#F8F7F2" />
      <G fontFamily="sans-serif" fill="#343C32">
        <SvgText x="24" y="39" fontWeight="500" fontSize="20">
          Pomodog
        </SvgText>
        <Rect x="288" y="23" width="48" height="20" rx="10" fill="#E6EEE5" />
        <SvgText
          x="312"
          y="36"
          textAnchor="middle"
          fontSize="8"
          letterSpacing="1"
          fill="#4E6B55"
        >
          BETA
        </SvgText>
        <SvgText x="24" y="64" fontSize="10" letterSpacing="1.5" fill="#73796D">
          MEU RITMO
        </SvgText>
      </G>
      <G transform="translate(45 74) scale(0.75)">
        <Scenery />
        <Tail />
        <Torso />
        <Paw />
        <Paw right />
        <Head resting={false} celebrating={weekSessions > 0} accent={accent} />
        {weekSessions > 0 && <Celebration />}
      </G>
      <G textAnchor="middle" fontFamily="sans-serif" fill="#343C32">
        <SvgText x="180" y="280" fontWeight="500" fontSize="22">
          {streakDays === 0
            ? "Meu próximo começo"
            : `${streakDays} ${streakDays === 1 ? "dia seguido" : "dias seguidos"} com foco`}
        </SvgText>
        <SvgText x="180" y="305" fontSize="12" fill="#73796D">
          Meu tempo, no meu ritmo.
        </SvgText>
        <Rect x="24" y="323" width="312" height="83" rx="18" fill="#E6EEE5" />
        <SvgText x="180" y="341" fontSize="9" letterSpacing="1" fill="#526858">
          ÚLTIMOS 7 DIAS
        </SvgText>
        <Line x1="180" y1="353" x2="180" y2="391" stroke="#C8D8C4" />
        <SvgText x="102" y="372" fontWeight="500" fontSize="27" fill={accent}>
          {weekMinutes}
        </SvgText>
        <SvgText x="258" y="372" fontWeight="500" fontSize="27" fill={accent}>
          {weekSessions}
        </SvgText>
        <SvgText x="102" y="391" fontSize="10" fill="#526858">
          minutos de foco
        </SvgText>
        <SvgText x="258" y="391" fontSize="10" fill="#526858">
          {weekSessions === 1 ? "sessão concluída" : "sessões concluídas"}
        </SvgText>
        <SvgText x="180" y="431" fontSize="10" fill="#73796D">
          Cada começo conta.
        </SvgText>
      </G>
    </Svg>
  );
});
