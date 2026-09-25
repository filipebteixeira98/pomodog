import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

type Props = { resting: boolean; celebrating: boolean; reducedMotion: boolean; accent: string };

/** Original vector illustration: no third-party artwork or remote assets. */
export function Dog({ resting, celebrating, reducedMotion, accent }: Props) {
  const breath = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reducedMotion) { breath.setValue(0); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: celebrating ? 650 : 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(breath, { toValue: 0, duration: celebrating ? 650 : 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [breath, celebrating, reducedMotion]);
  return (
    <Animated.View accessible accessibilityLabel={celebrating ? 'Cachorro feliz com a sessão concluída' : resting ? 'Cachorro descansando ao seu lado' : 'Cachorro pronto para acompanhar você'}
      style={{ width: '100%', maxWidth: 360, alignSelf: 'center', transform: [{ translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, celebrating ? -7 : -3] }) }] }}>
      <Svg width="100%" height={208} viewBox="0 0 360 230">
        <Circle cx="180" cy="112" r="99" fill="#ECEDE1" />
        <Circle cx="267" cy="48" r="18" fill="#F4DBA0" />
        <Path d="M53 155 Q40 134 48 113 Q66 128 60 150 M64 172 Q78 137 92 146 Q94 167 64 172" fill="#ADBFA0" />
        <Path d="M57 178 Q61 148 51 132" fill="none" stroke="#829A7B" strokeWidth="3" strokeLinecap="round" />
        <Ellipse cx="186" cy="199" rx="112" ry="15" fill="#DCE0D0" />
        <Path d="M226 167 Q279 130 279 162 Q274 189 239 184" fill="#CA9261" stroke="#624838" strokeWidth="3" />
        <Ellipse cx="190" cy="166" rx="64" ry="34" fill="#D9A572" />
        <Ellipse cx="178" cy="172" rx="38" ry="27" fill="#F7E7CE" />
        <Rect x="123" y="172" width="38" height="25" rx="12" fill="#F7E7CE" />
        <Rect x="202" y="172" width="42" height="25" rx="12" fill="#E8BF8F" />
        <Path d="M130 89 Q91 66 99 113 Q102 140 125 136" fill="#9C6B49" stroke="#624838" strokeWidth="3" />
        <Path d="M211 85 Q252 63 247 108 Q245 137 221 136" fill="#9C6B49" stroke="#624838" strokeWidth="3" />
        <Path d="M119 117 Q113 71 157 67 Q199 56 219 91 Q235 129 211 151 Q187 168 149 154 Q119 147 119 117" fill="#E6B782" stroke="#624838" strokeWidth="3" />
        <Path d="M166 70 Q186 65 190 84 L194 119 L158 119 Z" fill="#F8EAD6" />
        <Ellipse cx="176" cy="133" rx="34" ry="24" fill="#F8EAD6" />
        {resting ? <G stroke="#624838" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <Path d="M137 112 Q145 120 153 112" /><Path d="M199 112 Q207 120 215 112" />
        </G> : <G fill="#473B31"><Ellipse cx="145" cy="111" rx="4" ry="6" /><Ellipse cx="207" cy="111" rx="4" ry="6" /><Circle cx="146" cy="109" r="1.3" fill="white" /><Circle cx="208" cy="109" r="1.3" fill="white" /></G>}
        <Ellipse cx="135" cy="127" rx="9" ry="5" fill="#DFA080" opacity="0.6" />
        <Ellipse cx="215" cy="127" rx="9" ry="5" fill="#DFA080" opacity="0.6" />
        <Path d="M166 125 Q176 120 186 125 Q184 135 176 136 Q168 134 166 125" fill="#473B31" />
        <Path d="M176 136 L176 141 M165 143 Q175 151 185 143" stroke="#624838" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {celebrating && <Path d="M174 147 Q188 143 184 154 Q179 163 174 153 Z" fill="#CF857E" />}
        <Path d="M140 156 Q178 172 214 155 L211 164 Q177 179 143 165 Z" fill={accent} />
        <Circle cx="179" cy="171" r="7" fill="#F2CD77" stroke="#B88C46" strokeWidth="1.5" />
        <Path d="M179 168 L179 174 M176 171 L182 171" stroke="#B88C46" strokeWidth="1.5" />
        <G stroke="#9DAD8C" strokeWidth="2" strokeLinecap="round"><Path d="M94 193 L90 187 M98 195 L101 186 M278 195 L282 189" /></G>
        {celebrating && <G fill="#D1A35D"><Path d="M84 64 L87 72 L95 75 L87 78 L84 86 L81 78 L73 75 L81 72 Z" /><Path d="M268 105 L271 111 L277 114 L271 117 L268 123 L265 117 L259 114 L265 111 Z" /></G>}
      </Svg>
    </Animated.View>
  );
}
