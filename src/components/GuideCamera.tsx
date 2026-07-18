import { CameraView, useCameraPermissions } from "expo-camera";
import { DeviceMotion } from "expo-sensors";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

import type { TaskPack } from "../data/packs";
import { feedbackCapture, feedbackLock, setSoundEnabled } from "../lib/feedback";
import { speakGuideLine, stopGuideSpeech } from "../lib/speech";
import type { SpatialPose } from "../render/types";
import { OverlayLayer } from "./OverlayLayer";
import { OriCharacter } from "./OriCharacter";
import { XPBar } from "./XPBar";
import { VoiceBar } from "./VoiceBar";

export type GuideCameraProps = {
  pack: TaskPack;
  stepIndex: number;
  activePower?: string;
  onAdvance(): void;
  onExit(): void;
};

/** Reliable Tier 1 renderer: a calibrated motion-parallax guide over CameraView. */
export function GuideCamera({ pack, stepIndex, activePower, onAdvance, onExit }: GuideCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [locked, setLocked] = useState(() => stepIndex > 0);
  const [motionAvailable, setMotionAvailable] = useState(false);
  const [pose, setPose] = useState<SpatialPose>({ motion: { tiltX: 0, tiltY: 0 } });
  const [captureRevision, setCaptureRevision] = useState(0);
  const [cheerLine, setCheerLine] = useState<string | null>(null);
  const [scan] = useState(() => new Animated.Value(0));
  const [lockPing] = useState(() => new Animated.Value(0));
  const [capture] = useState(() => new Animated.Value(0));
  const calibratedRotation = useRef<{ beta: number; gamma: number } | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advancing = useRef(false);
  const currentStep = pack.steps[stepIndex];

  useEffect(() => {
    if (!currentStep) {
      return;
    }
    if (isVoiceOn) {
      speakGuideLine(currentStep.say);
    }
  }, [currentStep, isVoiceOn]);

  useEffect(() => stopGuideSpeech, []);

  useEffect(() => {
    if (stepIndex > 0) {
      return undefined;
    }
    scan.setValue(0);
    const sweep = Animated.timing(scan, { duration: 1100, easing: Easing.inOut(Easing.quad), toValue: 1, useNativeDriver: true });
    sweep.start(({ finished }) => {
      if (!finished) return;
      setLocked(true);
      feedbackLock();
      lockPing.setValue(0);
      Animated.timing(lockPing, { duration: 600, easing: Easing.out(Easing.cubic), toValue: 1, useNativeDriver: true }).start();
    });
    return () => sweep.stop();
  }, [lockPing, scan, stepIndex]);

  useEffect(() => {
    let active = true;
    let subscription: { remove(): void } | null = null;
    const startMotion = async () => {
      try {
        const available = await DeviceMotion.isAvailableAsync();
        if (!active || !available) return;
        const permissionResult = await DeviceMotion.requestPermissionsAsync();
        if (!active || !permissionResult.granted) return;
        setMotionAvailable(true);
        DeviceMotion.setUpdateInterval(50);
        subscription = DeviceMotion.addListener((measurement) => {
          const { beta, gamma } = measurement.rotation;
          if (!Number.isFinite(beta) || !Number.isFinite(gamma)) return;
          calibratedRotation.current ??= { beta, gamma };
          const initial = calibratedRotation.current;
          setPose({
            motion: {
              tiltX: Math.max(-7, Math.min(7, (gamma - initial.gamma) * 12)),
              tiltY: Math.max(-7, Math.min(7, (beta - initial.beta) * 12)),
            },
          });
        });
      } catch {
        // The annotation remains useful without sensor access (or on desktop web).
      }
    };
    void startMotion();
    return () => { active = false; subscription?.remove(); };
  }, []);

  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  const replay = () => { if (currentStep) speakGuideLine(currentStep.say); };
  const toggleVoice = () => setIsVoiceOn((current) => !current);
  const toggleSound = () => setIsSoundOn((current) => { const next = !current; setSoundEnabled(next); return next; });
  const exit = () => { stopGuideSpeech(); onExit(); };

  const advance = () => {
    if (advancing.current || !currentStep) return;
    advancing.current = true;
    feedbackCapture();
    setCaptureRevision((current) => current + 1);
    setCheerLine(currentStep.cheer ?? "Nice fold!");
    capture.setValue(0);
    Animated.timing(capture, { duration: 520, easing: Easing.out(Easing.cubic), toValue: 1, useNativeDriver: true }).start();
    advanceTimer.current = setTimeout(onAdvance, 610);
  };

  if (!permission) {
    return <View style={styles.loading}><ActivityIndicator color="#F5B544" /><Text style={styles.loadingText}>Opening your fold space…</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <OriCharacter size={122} state="nudge" />
        <Text style={styles.permissionEyebrow}>ORI NEEDS ONE THING</Text>
        <Text style={styles.permissionTitle}>Let Ori see the task.</Text>
        <Text style={styles.permissionCopy}>Your camera stays on your phone. It gives the amber guide a place to land.</Text>
        <Pressable accessibilityLabel="Enable camera" accessibilityRole="button" onPress={() => void requestPermission()} style={styles.permissionButton}><Text style={styles.permissionButtonText}>Enable camera</Text></Pressable>
        <Pressable accessibilityLabel="Back to lobby" accessibilityRole="button" onPress={exit} style={styles.textButton}><Text style={styles.textButtonText}>Back to lobby</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView facing="back" onMountError={(event) => setCameraError(event.message)} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={styles.vignette} />
      {currentStep ? <OverlayLayer captureRevision={captureRevision} locked={locked} overlays={currentStep.overlay} pose={pose} /> : null}
      <Animated.View pointerEvents="none" style={[styles.scanLine, { opacity: locked ? 0 : 0.72, transform: [{ translateY: scan.interpolate({ inputRange: [0, 1], outputRange: [-110, 760] }) }] }]} />
      {locked ? <Animated.View pointerEvents="none" style={[styles.lockRing, { opacity: lockPing.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.85, 0] }), transform: [{ scale: lockPing.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.16] }) }] }]} /> : null}
      <Animated.View pointerEvents="none" style={[styles.captureRing, { opacity: capture.interpolate({ inputRange: [0, 0.08, 1], outputRange: [0, 0.85, 0] }), transform: [{ scale: capture.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.6] }) }] }]} />

      <View pointerEvents="box-none" style={styles.chrome}>
        <View>
          <View style={styles.header}>
            <Pressable accessibilityLabel="Back to lobby" accessibilityRole="button" onPress={exit} style={styles.topButton}><Text style={styles.topButtonText}>‹</Text></Pressable>
            <View style={styles.waveChip}><Text style={styles.waveText}>WAVE {stepIndex + 1}/{pack.steps.length}</Text></View>
            <Pressable accessibilityLabel="Toggle sound" accessibilityRole="button" onPress={toggleSound} style={styles.soundButton}><Text style={styles.soundText}>{isSoundOn ? "🔊" : "🔇"}</Text></Pressable>
          </View>
          <XPBar current={stepIndex + 1} total={pack.steps.length} xp={stepIndex * 10} />
          <View style={styles.lockRow}>
            <Text style={styles.lockChip}>◎ {locked ? "SPATIAL LOCK" : "SCANNING…"}</Text>
            {activePower ? <Text style={styles.powerChip}>✦ {activePower.toUpperCase()}</Text> : null}
            {motionAvailable ? <Text style={styles.motionDot}>MOTION ON</Text> : null}
          </View>
        </View>

        {cameraError ? <View style={styles.cameraError}><Text style={styles.cameraErrorTitle}>Camera preview unavailable</Text><Text style={styles.cameraErrorCopy}>The step guide still works; restart before your demo.</Text></View> : null}

        <View style={styles.bottomArea}>
          <View style={styles.oriLine}>
            <OriCharacter size={86} state={cheerLine ? "cheer" : "talking"} />
            <View style={styles.bubble}><Text style={styles.bubbleText}>{cheerLine ?? currentStep?.say}</Text></View>
          </View>
          <VoiceBar isVoiceOn={isVoiceOn} onNext={advance} onReplay={replay} onToggleVoice={toggleVoice} stepCount={pack.steps.length} stepIndex={stepIndex} text={currentStep?.say ?? ""} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#0E141D", flex: 1 },
  loading: { alignItems: "center", backgroundColor: "#0E141D", flex: 1, gap: 12, justifyContent: "center" },
  loadingText: { color: "#F7FBFD", fontSize: 15, fontWeight: "800" },
  permissionScreen: { alignItems: "center", backgroundColor: "#FFF7EC", flex: 1, gap: 13, justifyContent: "center", padding: 30 },
  permissionEyebrow: { color: "#E39A22", fontFamily: "monospace", fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  permissionTitle: { color: "#1E2530", fontSize: 35, fontWeight: "900", letterSpacing: -1.2, textAlign: "center" },
  permissionCopy: { color: "#657080", fontSize: 16, fontWeight: "600", lineHeight: 23, maxWidth: 310, textAlign: "center" },
  permissionButton: { alignItems: "center", backgroundColor: "#F5B544", borderBottomColor: "#C77C16", borderBottomWidth: 5, borderRadius: 18, marginTop: 8, minHeight: 62, justifyContent: "center", paddingHorizontal: 28 },
  permissionButtonText: { color: "#402B07", fontSize: 16, fontWeight: "900" },
  textButton: { padding: 10 },
  textButtonText: { color: "#657080", fontSize: 14, fontWeight: "800" },
  vignette: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(3,7,12,0.18)" },
  scanLine: { backgroundColor: "#5AA9FF", height: 2, left: 22, position: "absolute", right: 22, shadowColor: "#5AA9FF", shadowOpacity: 0.9, shadowRadius: 12, top: 0 },
  lockRing: { alignSelf: "center", borderColor: "#F5B544", borderRadius: 138, borderWidth: 2, height: 276, position: "absolute", top: "27%", width: 276 },
  captureRing: { alignSelf: "center", borderColor: "#37D67A", borderRadius: 58, borderWidth: 4, height: 116, position: "absolute", top: "42%", width: 116 },
  chrome: { ...StyleSheet.absoluteFill, justifyContent: "space-between", padding: 20, paddingBottom: 22, paddingTop: 54 },
  header: { alignItems: "center", flexDirection: "row", gap: 9, marginBottom: 12 },
  topButton: { alignItems: "center", backgroundColor: "rgba(14,20,29,0.8)", borderColor: "rgba(255,255,255,0.22)", borderRadius: 15, borderWidth: 1, height: 40, justifyContent: "center", width: 40 },
  topButtonText: { color: "#FFF7EC", fontSize: 31, fontWeight: "400", lineHeight: 33 },
  waveChip: { alignItems: "center", backgroundColor: "rgba(14,20,29,0.84)", borderColor: "rgba(255,255,255,0.18)", borderRadius: 14, borderWidth: 1, flex: 1, paddingVertical: 11 },
  waveText: { color: "#FFF7EC", fontFamily: "monospace", fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  soundButton: { alignItems: "center", backgroundColor: "rgba(14,20,29,0.84)", borderColor: "rgba(255,255,255,0.18)", borderRadius: 15, borderWidth: 1, height: 40, justifyContent: "center", width: 40 },
  soundText: { fontSize: 15 },
  lockRow: { alignItems: "center", flexDirection: "row", gap: 7, marginTop: 10 },
  lockChip: { backgroundColor: "rgba(7,16,25,0.78)", borderColor: "rgba(90,169,255,0.55)", borderRadius: 99, borderWidth: 1, color: "#BDE0FF", fontFamily: "monospace", fontSize: 9, fontWeight: "900", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5 },
  powerChip: { backgroundColor: "rgba(245,181,68,0.87)", borderRadius: 99, color: "#402B07", fontFamily: "monospace", fontSize: 8, fontWeight: "900", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5 },
  motionDot: { color: "#71E9A2", fontFamily: "monospace", fontSize: 8, fontWeight: "900" },
  cameraError: { alignSelf: "center", backgroundColor: "rgba(89,42,31,0.92)", borderColor: "#FFB4A8", borderRadius: 15, borderWidth: 1, marginTop: 30, padding: 13 },
  cameraErrorTitle: { color: "#FFE7E0", fontSize: 13, fontWeight: "900" },
  cameraErrorCopy: { color: "#FFD0C7", fontSize: 11, fontWeight: "600", marginTop: 3 },
  bottomArea: { gap: 7 },
  oriLine: { alignItems: "flex-end", flexDirection: "row", gap: 3 },
  bubble: { backgroundColor: "#FFF7EC", borderBottomLeftRadius: 6, borderRadius: 18, flex: 1, marginBottom: 13, padding: 10 },
  bubbleText: { color: "#28303A", fontSize: 12, fontWeight: "800", lineHeight: 17 },
});
