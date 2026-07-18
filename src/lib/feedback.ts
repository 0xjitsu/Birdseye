import * as Haptics from "expo-haptics";

type Tone = { frequency: number; duration: number; glideTo?: number; delay?: number };

let soundEnabled = true;

function playWebTones(tones: readonly Tone[]): void {
  if (!soundEnabled || typeof globalThis === "undefined") {
    return;
  }

  // WebAudio is deliberately optional: native Expo Go remains fully usable even
  // when the platform has no oscillator API available.
  const AudioContextConstructor = (globalThis as {
    AudioContext?: new () => {
      createGain(): {
        connect(destination: unknown): void;
        gain: { setValueAtTime(value: number, when: number): void; exponentialRampToValueAtTime(value: number, when: number): void };
      };
      createOscillator(): {
        connect(destination: unknown): void;
        frequency: { setValueAtTime(value: number, when: number): void; linearRampToValueAtTime(value: number, when: number): void };
        type: OscillatorType;
        start(when: number): void;
        stop(when: number): void;
      };
      currentTime: number;
      destination: unknown;
    };
  }).AudioContext;

  if (!AudioContextConstructor) {
    return;
  }

  try {
    const context = new AudioContextConstructor();
    tones.forEach(({ frequency, duration, glideTo, delay = 0 }) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + delay;
      const end = start + duration / 1000;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      if (glideTo) {
        oscillator.frequency.linearRampToValueAtTime(glideTo, end);
      }
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.055, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(end + 0.02);
    });
  } catch {
    // Sound is delight, never a prerequisite for progressing through a lesson.
  }
}

function haptic(action: () => Promise<void>): void {
  void action().catch(() => undefined);
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function feedbackTap(): void {
  playWebTones([{ frequency: 320, duration: 60 }]);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function feedbackCapture(): void {
  playWebTones([
    { frequency: 660, glideTo: 990, duration: 100 },
    { frequency: 990, glideTo: 1320, duration: 140, delay: 0.06 },
  ]);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function feedbackLock(): void {
  playWebTones([
    { frequency: 240, glideTo: 120, duration: 120 },
    { frequency: 880, glideTo: 1200, duration: 100, delay: 0.12 },
  ]);
}

export function feedbackLevelUp(): void {
  playWebTones([
    { frequency: 523, duration: 90 },
    { frequency: 659, duration: 90, delay: 0.09 },
    { frequency: 784, duration: 90, delay: 0.18 },
  ]);
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function feedbackFinish(): void {
  playWebTones([
    { frequency: 523, duration: 90 },
    { frequency: 659, duration: 90, delay: 0.09 },
    { frequency: 784, duration: 90, delay: 0.18 },
    { frequency: 1046, duration: 130, delay: 0.27 },
  ]);
  haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
