import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { TaskPack } from "../data/packs";
import { OriCharacter } from "./OriCharacter";

export type CollectionProps = {
  packs: readonly TaskPack[];
  unlockedPackIds: readonly string[];
  onBack(): void;
  onChoosePack(pack: TaskPack): void;
};

export function Collection({ packs, unlockedPackIds, onBack, onChoosePack }: CollectionProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Back to lobby" accessibilityRole="button" onPress={onBack} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <View><Text style={styles.kicker}>COLLECTION</Text><Text style={styles.title}>My Folds</Text></View>
        <OriCharacter size={58} state="nudge" />
      </View>
      <Text style={styles.copy}>Every finished fold becomes a little keepsake. Collect them all.</Text>
      <View style={styles.grid}>
        {packs.map((pack) => {
          const isUnlocked = unlockedPackIds.includes(pack.id);
          return (
            <Pressable
              key={pack.id}
              accessibilityLabel={isUnlocked ? `Practice ${pack.title}` : `${pack.title} locked`}
              accessibilityRole="button"
              disabled={!isUnlocked}
              onPress={() => onChoosePack(pack)}
              style={[styles.card, isUnlocked ? styles.unlocked : styles.locked]}
            >
              <Text style={styles.cardEmoji}>{isUnlocked ? pack.emoji : "🔒"}</Text>
              <Text style={[styles.cardTitle, !isUnlocked ? styles.lockedText : null]}>{pack.title}</Text>
              <Text style={[styles.cardMeta, !isUnlocked ? styles.lockedText : null]}>{isUnlocked ? `+${pack.xp} XP · READY` : "LOCKED"}</Text>
              {isUnlocked ? <View style={styles.shine} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.tip}><Text style={styles.tipTitle}>✦ A little nudge</Text><Text style={styles.tipCopy}>Finish a lesson to flip its card into your collection.</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFF7EC", flex: 1 },
  content: { padding: 22, paddingBottom: 44, paddingTop: 56 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  back: { alignItems: "center", backgroundColor: "#FFFFFF", borderBottomColor: "#D6C8AE", borderBottomWidth: 3, borderRadius: 15, height: 46, justifyContent: "center", width: 46 },
  backText: { color: "#1E2530", fontSize: 34, fontWeight: "400", lineHeight: 35 },
  kicker: { color: "#E39A22", fontFamily: "monospace", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: "#1E2530", fontSize: 30, fontWeight: "900", letterSpacing: -0.9, marginTop: 3 },
  copy: { color: "#657080", fontSize: 15, fontWeight: "600", lineHeight: 22, marginBottom: 24, marginTop: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { borderRadius: 22, minHeight: 178, overflow: "hidden", padding: 16, width: "47.8%" },
  unlocked: { backgroundColor: "#F5B544", borderBottomColor: "#C77C16", borderBottomWidth: 5 },
  locked: { backgroundColor: "#E8E0D3", borderColor: "#D6C9B4", borderWidth: 1 },
  cardEmoji: { fontSize: 43 },
  cardTitle: { color: "#2F2815", fontSize: 16, fontWeight: "900", marginTop: 20 },
  cardMeta: { color: "#765814", fontFamily: "monospace", fontSize: 9, fontWeight: "900", marginTop: 5 },
  lockedText: { color: "#9D9589" },
  shine: { backgroundColor: "#FFF7EC66", borderRadius: 99, height: 90, position: "absolute", right: -40, top: -45, width: 90 },
  tip: { backgroundColor: "#DFF7EA", borderColor: "#A7E9C6", borderRadius: 18, borderWidth: 1, marginTop: 20, padding: 15 },
  tipTitle: { color: "#197146", fontSize: 14, fontWeight: "900" },
  tipCopy: { color: "#337658", fontSize: 13, fontWeight: "600", lineHeight: 19, marginTop: 3 },
});
