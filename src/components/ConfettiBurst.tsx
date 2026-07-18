import { useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

export type ConfettiBurstProps = { active: boolean; reducedMotion?: boolean };

const colours = ["#F5B544", "#37D67A", "#5AA9FF", "#FF7A66", "#FFF7EC"];

export function ConfettiBurst({ active, reducedMotion = false }: ConfettiBurstProps) {
  const [progress] = useState(() => new Animated.Value(0));
  const pieces = useMemo(
    () => Array.from({ length: 52 }, (_, index) => ({
      color: colours[index % colours.length],
      delay: (index % 11) * 55,
      left: (index * 37) % 100,
      rotate: `${(index * 43) % 360}deg`,
      size: 5 + (index % 5),
      travel: 210 + ((index * 17) % 190),
    })),
    [],
  );

  useEffect(() => {
    if (!active) {
      progress.setValue(0);
      return undefined;
    }
    const animation = Animated.timing(progress, { duration: reducedMotion ? 450 : 2200, toValue: 1, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [active, progress, reducedMotion]);

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.layer}>
      {pieces.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.piece,
            { backgroundColor: piece.color, height: piece.size, left: piece.left, top: -14, width: piece.size * 0.58 },
            {
              opacity: progress.interpolate({ inputRange: [0, 0.1, 0.82, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, piece.travel] }) },
                { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, ((index % 7) - 3) * 28] }) },
                { rotate: piece.rotate },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill, overflow: "hidden" },
  piece: { borderRadius: 2, position: "absolute" },
});
