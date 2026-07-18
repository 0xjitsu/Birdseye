import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, Text, View } from "react-native";

import type { TaskPack } from "../data/packs";
import { feedbackFinish } from "../lib/feedback";
import { ChunkyButton } from "./ChunkyButton";
import { ConfettiBurst } from "./ConfettiBurst";
import { OriCharacter } from "./OriCharacter";

export type DoneScreenProps = {
  pack: TaskPack;
  coins: number;
  gems: number;
  onClaim(): void;
  onCollection(): void;
};

export function DoneScreen({ pack, coins, gems, onClaim, onCollection }: DoneScreenProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    feedbackFinish();
    void AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion).catch(() => undefined);
  }, []);

  return (
    <View style={styles.screen}>
      <ConfettiBurst active reducedMotion={reducedMotion} />
      <View style={styles.orbit} />
      <OriCharacter size={144} state="cheer" />
      <Text style={styles.kicker}>STAGE CLEAR</Text>
      <Text style={styles.title}>You did it!</Text>
      <Text style={styles.subtitle}>{pack.title} complete · that was a real fold.</Text>
      <View style={styles.cardFlip}>
        <Text style={styles.cardEmoji}>{pack.emoji}</Text>
        <Text style={styles.cardTitle}>{pack.title}</Text>
        <Text style={styles.cardStatus}>NEW FOLD UNLOCKED</Text>
      </View>
      <View style={styles.rewards}>
        <View style={styles.reward}><Text style={styles.rewardNumber}>+{pack.xp}</Text><Text style={styles.rewardLabel}>XP EARNED</Text></View>
        <View style={styles.reward}><Text style={styles.rewardNumber}>🪙 {coins}</Text><Text style={styles.rewardLabel}>COINS</Text></View>
        <View style={styles.reward}><Text style={styles.rewardNumber}>💎 {gems}</Text><Text style={styles.rewardLabel}>GEMS</Text></View>
      </View>
      <ChunkyButton accessibilityLabel="Claim rewards" label="CLAIM REWARDS" onPress={onClaim} style={styles.claim} />
      <ChunkyButton accessibilityLabel="Open My Folds" compact label="VIEW MY FOLDS" onPress={onCollection} tone="cream" style={styles.collection} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: "center", backgroundColor: "#FFF7EC", flex: 1, justifyContent: "center", overflow: "hidden", padding: 24 },
  orbit: { backgroundColor: "#F5B54424", borderColor: "#F5B54455", borderRadius: 154, borderWidth: 2, height: 308, position: "absolute", top: 86, width: 308 },
  kicker: { color: "#E39A22", fontFamily: "monospace", fontSize: 11, fontWeight: "900", letterSpacing: 1.5, marginTop: 8 },
  title: { color: "#1E2530", fontSize: 42, fontWeight: "900", letterSpacing: -1.4, marginTop: 1 },
  subtitle: { color: "#657080", fontSize: 14, fontWeight: "700", marginTop: 3, textAlign: "center" },
  cardFlip: { alignItems: "center", backgroundColor: "#F5B544", borderBottomColor: "#C77C16", borderBottomWidth: 5, borderRadius: 24, marginTop: 20, padding: 16, transform: [{ rotate: "-2deg" }], width: 174 },
  cardEmoji: { fontSize: 47 },
  cardTitle: { color: "#402B07", fontSize: 17, fontWeight: "900", marginTop: 2 },
  cardStatus: { color: "#73510C", fontFamily: "monospace", fontSize: 9, fontWeight: "900", letterSpacing: 0.4, marginTop: 4 },
  rewards: { flexDirection: "row", gap: 8, marginTop: 19, width: "100%" },
  reward: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E6D9C2", borderRadius: 16, borderWidth: 1, flex: 1, paddingHorizontal: 4, paddingVertical: 11 },
  rewardNumber: { color: "#1E2530", fontSize: 15, fontWeight: "900" },
  rewardLabel: { color: "#8B8175", fontFamily: "monospace", fontSize: 8, fontWeight: "900", marginTop: 3 },
  claim: { marginTop: 19, width: "100%" },
  collection: { marginTop: 10, width: "100%" },
});
