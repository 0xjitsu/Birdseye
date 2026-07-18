import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { TaskPack } from "../data/packs";
import { ChunkyButton } from "./ChunkyButton";
import { OriCharacter } from "./OriCharacter";

export type HomeProps = {
  packs: readonly TaskPack[];
  coins: number;
  gems: number;
  xp: number;
  unlockedPackIds: readonly string[];
  onChoosePack(pack: TaskPack): void;
  onOpenCollection(): void;
};

/** Archero-like game lobby: one obvious primary action, all progress in view. */
export function Home({
  packs,
  coins,
  gems,
  xp,
  unlockedPackIds,
  onChoosePack,
  onOpenCollection,
}: HomeProps) {
  const crane = packs[0];
  const unlockedCount = unlockedPackIds.length;

  return (
    <View style={styles.screen}>
      <View style={styles.auroraOne} />
      <View style={styles.auroraTwo} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.currencyRow}>
          <Text style={styles.brand}>ORI</Text>
          <View style={styles.currencies}>
            <Text style={styles.currency}>🪙 {coins}</Text>
            <Text style={styles.currency}>💎 {gems}</Text>
            <Text style={styles.currency}>⚡ {xp}</Text>
          </View>
        </View>

        <View style={styles.heroArea}>
          <View style={styles.pedestalGlow} />
          <View style={styles.pedestalRim} />
          <View style={styles.oriWrap}><OriCharacter size={150} state="idle" /></View>
          <Text style={styles.heroEyebrow}>YOUR COMPANION</Text>
          <Text style={styles.heroTitle}>Ori is ready{`\n`}to make something.</Text>
          <Text style={styles.heroCopy}>Point, fold, capture. One small win at a time.</Text>
        </View>

        <View style={styles.chapterCard}>
          <View style={styles.chapterTop}>
            <View>
              <Text style={styles.chapterKicker}>CHAPTER 1 · STAGE 1</Text>
              <Text style={styles.chapterTitle}>The Crane</Text>
            </View>
            <Text style={styles.stars}>★ ★ ☆</Text>
          </View>
          <View style={styles.chapterProgress}><View style={styles.chapterProgressFill} /></View>
          <Text style={styles.chapterHint}>5 waves · {crane?.xp ?? 50} XP · spatial guide on</Text>
        </View>

        {crane ? (
          <ChunkyButton
            accessibilityLabel="Start Paper Crane"
            label="PLAY · FOLD A CRANE"
            onPress={() => onChoosePack(crane)}
            style={styles.playButton}
          />
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.chestCard}>
            <Text style={styles.chestEmoji}>🎁</Text>
            <View><Text style={styles.metaKicker}>NEXT CHEST</Text><Text style={styles.metaTitle}>Open in 04:12</Text></View>
          </View>
          <Pressable accessibilityLabel="Open My Folds" accessibilityRole="button" onPress={onOpenCollection} style={styles.foldsCard}>
            <Text style={styles.metaKicker}>MY FOLDS</Text>
            <Text style={styles.foldCollection}>{unlockedCount}/3 <Text style={styles.cardsWord}>CARDS</Text></Text>
          </Pressable>
        </View>

        <View style={styles.lessonShelf}>
          <View style={styles.shelfHead}><Text style={styles.shelfTitle}>More to make</Text><Text style={styles.streak}>🔥 1 DAY</Text></View>
          <View style={styles.packRow}>
            {packs.slice(1).map((pack) => (
              <Pressable key={pack.id} accessibilityLabel={`Start ${pack.title}`} accessibilityRole="button" onPress={() => onChoosePack(pack)} style={styles.packCard}>
                <Text style={styles.packEmoji}>{pack.emoji}</Text>
                <Text numberOfLines={1} style={styles.packTitle}>{pack.title}</Text>
                <Text style={styles.packMeta}>+{pack.xp} XP</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.nav}>
        <Text style={styles.navItem}>⚙︎{`\n`}<Text style={styles.navLabel}>Gear</Text></Text>
        <Pressable accessibilityLabel="Open My Folds" accessibilityRole="button" onPress={onOpenCollection}><Text style={styles.navItem}>🕊{`\n`}<Text style={styles.navLabel}>Hero</Text></Text></Pressable>
        <View style={styles.playTab}><Text style={styles.playTabText}>▶</Text></View>
        <Text style={styles.navItem}>✦{`\n`}<Text style={styles.navLabel}>Shop</Text></Text>
        <Text style={styles.navItem}>⚑{`\n`}<Text style={styles.navLabel}>Events</Text></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#0E141D", flex: 1 },
  content: { paddingBottom: 112, paddingHorizontal: 20, paddingTop: 55 },
  auroraOne: { backgroundColor: "#5AA9FF22", borderRadius: 200, height: 260, position: "absolute", right: -130, top: 90, width: 260 },
  auroraTwo: { backgroundColor: "#F5B54416", borderRadius: 190, height: 220, left: -110, position: "absolute", top: 280, width: 220 },
  currencyRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  brand: { color: "#FFF7EC", fontSize: 23, fontWeight: "900", letterSpacing: 4 },
  currencies: { flexDirection: "row", gap: 6 },
  currency: { backgroundColor: "#182330", borderColor: "#2A3A4B", borderRadius: 12, borderWidth: 1, color: "#FFF7EC", fontFamily: "monospace", fontSize: 10, fontWeight: "800", overflow: "hidden", paddingHorizontal: 7, paddingVertical: 6 },
  heroArea: { alignItems: "center", minHeight: 330, paddingTop: 35, position: "relative" },
  pedestalGlow: { backgroundColor: "#F5B5442E", borderRadius: 140, height: 180, position: "absolute", top: 33, width: 180 },
  pedestalRim: { backgroundColor: "#263646", borderColor: "#3F586A", borderRadius: 90, borderWidth: 2, bottom: 96, height: 30, position: "absolute", width: 174 },
  oriWrap: { marginBottom: 1, marginTop: 8 },
  heroEyebrow: { color: "#F5B544", fontFamily: "monospace", fontSize: 10, fontWeight: "900", letterSpacing: 1.3, marginTop: 4 },
  heroTitle: { color: "#FFF7EC", fontSize: 31, fontWeight: "900", letterSpacing: -1.1, lineHeight: 34, marginTop: 7, textAlign: "center" },
  heroCopy: { color: "#AEBAC6", fontSize: 14, fontWeight: "600", marginTop: 8, textAlign: "center" },
  chapterCard: { backgroundColor: "#16212C", borderColor: "#2D4254", borderRadius: 22, borderWidth: 1, gap: 11, padding: 16 },
  chapterTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  chapterKicker: { color: "#90A1B2", fontFamily: "monospace", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  chapterTitle: { color: "#FFF7EC", fontSize: 22, fontWeight: "900", letterSpacing: -0.5, marginTop: 3 },
  stars: { color: "#F5B544", fontSize: 18, letterSpacing: 2 },
  chapterProgress: { backgroundColor: "#0B1017", borderRadius: 99, height: 8, overflow: "hidden" },
  chapterProgressFill: { backgroundColor: "#F5B544", borderRadius: 99, height: "100%", width: "22%" },
  chapterHint: { color: "#94A2AD", fontSize: 12, fontWeight: "700" },
  playButton: { marginTop: 16 },
  metaRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  chestCard: { alignItems: "center", backgroundColor: "#192735", borderColor: "#2D4254", borderRadius: 18, borderWidth: 1, flex: 1, flexDirection: "row", gap: 9, padding: 12 },
  chestEmoji: { fontSize: 25 },
  foldsCard: { backgroundColor: "#FFF7EC", borderRadius: 18, flex: 0.85, padding: 12 },
  metaKicker: { color: "#8C9CAC", fontFamily: "monospace", fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  metaTitle: { color: "#EDF4FA", fontSize: 12, fontWeight: "800", marginTop: 3 },
  foldCollection: { color: "#1E2530", fontSize: 22, fontWeight: "900", marginTop: 4 },
  cardsWord: { color: "#657080", fontFamily: "monospace", fontSize: 9, letterSpacing: 0.6 },
  lessonShelf: { marginTop: 24 },
  shelfHead: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  shelfTitle: { color: "#FFF7EC", fontSize: 17, fontWeight: "900" },
  streak: { color: "#FF9A79", fontFamily: "monospace", fontSize: 10, fontWeight: "900" },
  packRow: { flexDirection: "row", gap: 10 },
  packCard: { backgroundColor: "#1A2733", borderColor: "#2D4254", borderRadius: 18, borderWidth: 1, flex: 1, minHeight: 114, padding: 12 },
  packEmoji: { fontSize: 30 },
  packTitle: { color: "#F7FBFD", fontSize: 13, fontWeight: "900", marginTop: 9 },
  packMeta: { color: "#F5B544", fontFamily: "monospace", fontSize: 10, fontWeight: "800", marginTop: 4 },
  nav: { alignItems: "center", backgroundColor: "#111C27", borderTopColor: "#273746", borderTopWidth: 1, bottom: 0, flexDirection: "row", justifyContent: "space-around", left: 0, paddingBottom: 15, paddingTop: 10, position: "absolute", right: 0 },
  navItem: { color: "#8493A0", fontSize: 16, lineHeight: 17, textAlign: "center" },
  navLabel: { fontFamily: "monospace", fontSize: 9, fontWeight: "800" },
  playTab: { alignItems: "center", backgroundColor: "#F5B544", borderColor: "#D58C1D", borderRadius: 24, borderWidth: 3, height: 48, justifyContent: "center", marginTop: -28, width: 58 },
  playTabText: { color: "#3C2908", fontSize: 19, marginLeft: 2 },
});
