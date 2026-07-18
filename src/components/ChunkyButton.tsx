import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

export type ChunkyButtonProps = {
  label: string;
  onPress(): void;
  accessibilityLabel?: string;
  tone?: "amber" | "mint" | "night" | "cream";
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ChunkyButton({
  label,
  onPress,
  accessibilityLabel = label,
  tone = "amber",
  compact = false,
  style,
}: ChunkyButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[tone],
        compact ? styles.compact : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <Text style={[styles.label, styles[`${tone}Label`]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 18,
    borderBottomWidth: 5,
    justifyContent: "center",
    minHeight: 64,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  compact: { borderRadius: 14, borderBottomWidth: 4, minHeight: 48, paddingHorizontal: 15, paddingVertical: 9 },
  pressed: { borderBottomWidth: 1, transform: [{ translateY: 4 }] },
  amber: { backgroundColor: "#F5B544", borderBottomColor: "#C77C16" },
  mint: { backgroundColor: "#37D67A", borderBottomColor: "#1A9C55" },
  night: { backgroundColor: "#273442", borderBottomColor: "#101923" },
  cream: { backgroundColor: "#FFF7EC", borderBottomColor: "#D8C9AD" },
  label: { fontSize: 16, fontWeight: "900", letterSpacing: 0.2 },
  amberLabel: { color: "#402B07" },
  mintLabel: { color: "#073A22" },
  nightLabel: { color: "#F8FCFF" },
  creamLabel: { color: "#1E2530" },
});
