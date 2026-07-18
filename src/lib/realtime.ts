/**
 * The demo deliberately remains local-first. A server-minted Realtime token
 * can enable a richer voice session later; the UI always has text and tap as
 * a complete fallback so a missing key never blocks a fold.
 */
export type OriRealtimeStatus = "ready" | "fallback";

export function getOriRealtimeStatus(): OriRealtimeStatus {
  return process.env.EXPO_PUBLIC_OPENAI_API_KEY ? "ready" : "fallback";
}

export function oriRealtimeInstruction(step: { n: number; say: string }): string {
  return [
    "You are Ori, an upbeat and concise origami expert companion.",
    `Guide only step ${step.n}: ${step.say}`,
    "Use one or two encouraging sentences. Confirm progress only after the learner says done, next, or okay.",
  ].join(" ");
}
