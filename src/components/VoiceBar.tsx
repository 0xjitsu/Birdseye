import { Pressable, StyleSheet, Text, View } from "react-native";

import { ChunkyButton } from "./ChunkyButton";

export type VoiceBarProps = {
  isVoiceOn: boolean;
  onNext(): void;
  onReplay(): void;
  onToggleVoice(): void;
  stepCount: number;
  stepIndex: number;
  text: string;
};

export function VoiceBar({
  isVoiceOn,
  onNext,
  onReplay,
  onToggleVoice,
  stepCount,
  stepIndex,
  text,
}: VoiceBarProps) {
  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <Text style={styles.oriLabel}>ORI SAYS</Text>
        <Pressable
          accessibilityLabel={isVoiceOn ? "Turn voice off" : "Turn voice on"}
          accessibilityRole="button"
          onPress={onToggleVoice}
          style={styles.voiceToggle}
        >
          <Text style={styles.voiceToggleText}>{isVoiceOn ? "VOICE ON" : "VOICE OFF"}</Text>
        </Pressable>
      </View>
      <Text style={styles.instruction}>{text}</Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="Replay instruction"
          accessibilityRole="button"
          onPress={onReplay}
          style={styles.replayButton}
        >
          <Text style={styles.replayText}>Replay</Text>
        </Pressable>
        <View style={styles.nextWrap}>
          <ChunkyButton compact accessibilityLabel={stepIndex === stepCount - 1 ? "Finish lesson" : "Complete step"} label={stepIndex === stepCount - 1 ? "DONE ✓" : "DONE ✓"} onPress={onNext} tone="mint" />
        </View>
      </View>
      <Text style={styles.hint}>Say “done” or tap when you are ready.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(14,20,29,0.94)",
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 13,
    padding: 17,
  },
  metaRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  oriLabel: { color: "#F5B544", fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  voiceToggle: { borderColor: "rgba(255,255,255,0.2)", borderRadius: 99, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  voiceToggleText: { color: "#D3D9DC", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  instruction: { color: "#FCFDFD", fontSize: 17, fontWeight: "800", lineHeight: 24 },
  actions: { flexDirection: "row", gap: 10 },
  replayButton: { alignItems: "center", borderColor: "rgba(255,255,255,0.24)", borderRadius: 14, borderWidth: 1, justifyContent: "center", paddingHorizontal: 16 },
  replayText: { color: "#DCE1E3", fontSize: 14, fontWeight: "800" },
  nextWrap: { flex: 1 },
  hint: { color: "#98A4AB", fontSize: 11, lineHeight: 16, textAlign: "center" },
});
