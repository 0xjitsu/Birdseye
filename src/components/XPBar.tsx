import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export type XPBarProps = { current: number; total: number; xp: number };

export function XPBar({ current, total, xp }: XPBarProps) {
  const [fill] = useState(() => new Animated.Value(current / total));

  useEffect(() => {
    Animated.spring(fill, { damping: 11, stiffness: 130, toValue: current / total, useNativeDriver: false }).start();
  }, [current, fill, total]);

  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fill.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
      </View>
      <View style={styles.xpPill}><Text style={styles.xp}>⚡ {xp}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "center", flexDirection: "row", gap: 9 },
  track: { backgroundColor: "rgba(255,255,255,0.22)", borderRadius: 99, flex: 1, height: 11, overflow: "hidden" },
  fill: { backgroundColor: "#F5B544", borderRadius: 99, height: "100%" },
  xpPill: { backgroundColor: "rgba(14,20,29,0.84)", borderColor: "rgba(255,255,255,0.24)", borderRadius: 14, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  xp: { color: "#FFF4D7", fontFamily: "monospace", fontSize: 11, fontWeight: "800" },
});
