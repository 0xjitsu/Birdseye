import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, Path, Text as SvgText } from "react-native-svg";

export type OriState = "idle" | "talking" | "thinking" | "cheer" | "nudge";

export type OriCharacterProps = {
  state?: OriState;
  size?: number;
  accessibilityLabel?: string;
};

/** The tiny origami guide is intentionally all-vector so it stays crisp and portable. */
export function OriCharacter({
  state = "idle",
  size = 92,
  accessibilityLabel = "Ori, your origami crane companion",
}: OriCharacterProps) {
  const [bob] = useState(() => new Animated.Value(0));
  const [tilt] = useState(() => new Animated.Value(0));
  const [hop] = useState(() => new Animated.Value(0));

  useEffect(() => {
    bob.stopAnimation();
    tilt.stopAnimation();
    hop.stopAnimation();

    if (state === "cheer") {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(hop, { toValue: -16, duration: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.spring(hop, { toValue: 0, damping: 7, stiffness: 200, useNativeDriver: true }),
          Animated.timing(hop, { toValue: -8, duration: 110, useNativeDriver: true }),
          Animated.spring(hop, { toValue: 0, damping: 8, stiffness: 180, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(tilt, { toValue: -4, duration: 120, useNativeDriver: true }),
          Animated.timing(tilt, { toValue: 4, duration: 180, useNativeDriver: true }),
          Animated.spring(tilt, { toValue: 0, damping: 7, stiffness: 190, useNativeDriver: true }),
        ]),
      ]).start();
      return undefined;
    }

    const bobAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -5, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    bobAnimation.start();

    const targetTilt = state === "thinking" ? -8 : state === "nudge" ? 8 : state === "talking" ? 4 : 0;
    Animated.spring(tilt, { toValue: targetTilt, damping: 8, stiffness: 180, useNativeDriver: true }).start();

    return () => bobAnimation.stop();
  }, [bob, hop, state, tilt]);

  return (
    <View accessibilityLabel={accessibilityLabel} style={{ height: size, width: size }}>
      <Animated.View
        style={[
          styles.character,
          { transform: [{ translateY: Animated.add(bob, hop) }, { rotate: tilt.interpolate({ inputRange: [-12, 12], outputRange: ["-12deg", "12deg"] }) }] },
        ]}
      >
        <Svg height={size} viewBox="0 0 100 100" width={size}>
          <Ellipse cx="50" cy="90" fill="#09101922" rx="24" ry="5" />
          {state === "talking" ? (
            <>
              <Path d="M5 18 H39 Q44 18 44 23 V35 Q44 40 39 40 H17 L11 45 L12 40 H10 Q5 40 5 35 Z" fill="#FFF7EC" stroke="#DCCCA9" />
              <Circle cx="18" cy="29" fill="#8797AB" r="2" />
              <Circle cx="25" cy="29" fill="#8797AB" r="2" />
              <Circle cx="32" cy="29" fill="#8797AB" r="2" />
            </>
          ) : null}
          {state === "thinking" ? <SvgText fill="#5AA9FF" fontSize="18" fontWeight="800" x="76" y="26">…</SvgText> : null}
          {state === "cheer" ? (
            <>
              <SvgText fill="#F5B544" fontSize="17" x="8" y="25">✦</SvgText>
              <SvgText fill="#FF7A66" fontSize="13" x="80" y="19">✦</SvgText>
              <SvgText fill="#37D67A" fontSize="12" x="19" y="76">✦</SvgText>
            </>
          ) : null}
          <Path d="M15 52 L50 35 L85 52 L50 60 Z" fill="#F5B544" />
          <Path d="M50 60 L50 83 L31 72 Z" fill="#FFD27F" />
          <Path d="M50 60 L50 83 L69 72 Z" fill="#E39A22" />
          <Path d="M85 52 L72 28 L60 46 Z" fill="#FFD27F" />
          <Path d="M15 52 L50 60 L27 63 Z" fill="#E39A22" opacity="0.7" />
          <Circle cx="68" cy="37" fill="#1E2530" r="2.7" />
          {state === "talking" ? <Path d="M84 52 L91 57 L78 58 Z" fill="#E39A22" /> : null}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  character: { alignItems: "center", justifyContent: "center" },
});
