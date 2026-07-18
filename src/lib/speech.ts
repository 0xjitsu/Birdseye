import * as Speech from "expo-speech";

export function speakGuideLine(message: string): void {
  Speech.stop();
  Speech.speak(message, { language: "en-US", rate: 0.94 });
}

export function stopGuideSpeech(): void {
  Speech.stop();
}
