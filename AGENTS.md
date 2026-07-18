# Ori — engineering contract

Read the exact [Expo SDK 57 documentation](https://docs.expo.dev/versions/v57.0.0/) before changing Expo code or native configuration.

Ori is a camera-first real-world learning game: point, capture, learn. It is iOS-first and App-Store-bound, so it uses Expo's bare workflow rather than Expo Go.

## Locked stack

- Expo SDK 57 with `npx expo prebuild`; use a development build on hardware.
- ARKit through `@reactvision/react-viro` (ViroReact).
- Apple Vision rectangle detection for the paper-space homography fallback.
- `react-native-reanimated` and `react-native-svg` for motion and overlay UI.
- `expo-camera`, `expo-haptics`, `expo-av`, and OpenAI Realtime (with a secure, ephemeral-token server) for the camera, feedback, sound, and voice.

## Annotation contract — never bypass it

All learning annotations go through `src/render/AnnotationRenderer.ts` and its `renderAnnotations(step, poseProvider)` API. The same normalized paper-space data in `src/data/packs.ts` feeds all renderer tiers:

1. `ARRenderer` — ViroReact / ARKit world anchor, used on AR-capable hardware.
2. `HomographyRenderer` — Apple Vision paper quad mapped into the camera view.
3. `ScreenSpaceRenderer` — motion-parallax fallback for a Simulator or unavailable AR.

`pickRenderer()` owns runtime selection. The active tier must remain visible in the `◎ SPATIAL LOCK` HUD. Keep camera frames on-device; never store or upload them.

## Commands

```sh
npm install
npx expo prebuild --clean
npx expo run:ios --device
npm run lint && npm run typecheck && npm test
eas build -p ios --profile production
```

The full app remains guest-first: a missing Realtime configuration always falls back to text and the Done button.
