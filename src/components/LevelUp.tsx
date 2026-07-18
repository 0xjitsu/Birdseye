import { StyleSheet, Text, View } from "react-native";

import { feedbackLevelUp } from "../lib/feedback";
import { ChunkyButton } from "./ChunkyButton";
import { OriCharacter } from "./OriCharacter";

export type Power = { name: string; emoji: string; copy: string; rarity: "RARE" | "EPIC" | "LEGENDARY" };
export type LevelUpProps = { wave: number; totalWaves: number; onPick(power: Power): void };

const powers: readonly Power[] = [
  { name: "Precision Guide", emoji: "🎯", copy: "Sharper guide lines", rarity: "RARE" },
  { name: "Golden Hands", emoji: "✨", copy: "+5 bonus gems", rarity: "EPIC" },
  { name: "Spatial Boost", emoji: "🧭", copy: "Steadier anchors", rarity: "LEGENDARY" },
];

export function LevelUp({ wave, totalWaves, onPick }: LevelUpProps) {
  const pick = (power: Power) => {
    feedbackLevelUp();
    onPick(power);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.radial} />
      <OriCharacter size={104} state="cheer" />
      <Text style={styles.kicker}>WAVE {wave} CLEARED</Text>
      <Text style={styles.title}>LEVEL UP!</Text>
      <Text style={styles.sub}>Choose one power for wave {wave + 1} of {totalWaves}.</Text>
      <View style={styles.cards}>
        {powers.map((power) => (
          <View key={power.name} style={[styles.powerCard, power.rarity === "RARE" ? styles.rare : power.rarity === "EPIC" ? styles.epic : styles.legendary]}>
            <Text style={styles.rarity}>{power.rarity}</Text>
            <Text style={styles.powerEmoji}>{power.emoji}</Text>
            <Text style={styles.powerName}>{power.name}</Text>
            <Text style={styles.powerCopy}>{power.copy}</Text>
            <ChunkyButton compact label="CHOOSE" tone="cream" onPress={() => pick(power)} accessibilityLabel={`Choose ${power.name}`} />
          </View>
        ))}
      </View>
      <Text style={styles.footer}>Powers are a friendly boost — your hands still lead the fold.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: "center", backgroundColor: "#101722", flex: 1, justifyContent: "center", overflow: "hidden", padding: 20 },
  radial: { backgroundColor: "#5AA9FF22", borderRadius: 260, height: 520, position: "absolute", width: 520 },
  kicker: { color: "#37D67A", fontFamily: "monospace", fontSize: 11, fontWeight: "900", letterSpacing: 1.4, marginTop: 3 },
  title: { color: "#FFF7EC", fontSize: 43, fontWeight: "900", letterSpacing: -1.5, marginTop: 4 },
  sub: { color: "#B5C0CD", fontSize: 14, fontWeight: "600", lineHeight: 20, marginTop: 4, textAlign: "center" },
  cards: { gap: 10, marginTop: 22, width: "100%" },
  powerCard: { alignItems: "center", backgroundColor: "#192330", borderRadius: 21, borderWidth: 2, minHeight: 128, padding: 12 },
  rare: { borderColor: "#5AA9FF" },
  epic: { borderColor: "#BF78FF" },
  legendary: { borderColor: "#F5B544" },
  rarity: { color: "#B8C4CF", fontFamily: "monospace", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  powerEmoji: { fontSize: 27, marginTop: -3 },
  powerName: { color: "#FFF7EC", fontSize: 17, fontWeight: "900", marginTop: -2 },
  powerCopy: { color: "#B6C0CB", fontSize: 11, fontWeight: "700", marginBottom: 7, marginTop: 2 },
  footer: { color: "#8493A0", fontSize: 11, fontWeight: "600", lineHeight: 17, marginTop: 15, maxWidth: 290, textAlign: "center" },
});
