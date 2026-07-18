# Ori / Birdseye

Ori turns a short physical task into a camera-guided game. The stage path is
local and reliable: live camera, spatial-feeling normalized fold lines, tap
progression, device text-to-speech, haptics, rewards, and an all-vector Ori
companion. It completes end-to-end without a server, network, or OpenAI key.

## Run the stage path

```sh
npm ci
npx expo start
```

Open the project in Expo Go on a physical phone, grant camera access, and select
**Play · Fold a Crane**. Mount the phone about 30 cm above the table in portrait;
centre a square sheet of paper inside the dotted frame. The Tier 1 overlay is a
fixed-camera, normalized guide with subtle device-motion parallax—not object
tracking—so keep the phone and paper still during the demo.

Voice is device text-to-speech. It can be turned off in the guide; tap **Done**
to advance every step. On iPhone, check Silent Mode before presenting. The sound
toggle safely disables optional synthesized web sound; haptics are guarded and
may be unavailable while the iOS camera is active.

## Optional voice setup

Create `Birdseye/.env` with `EXPO_PUBLIC_OPENAI_API_KEY=...` to indicate that a
server-minted OpenAI Realtime session is available. Never ship that key in a
public app: the built-in demo intentionally uses the complete local text/tap
fallback until a secure token endpoint is wired to `src/lib/realtime.ts`.

## Web portal

Use the same interface in a browser for visual iteration:

```sh
npm run start:web
```

The browser version requests its camera only after you open a lesson. Grant
browser camera access to preview the live workspace; the deployed portal is
HTTPS, so its camera permission can work on a physical phone or desktop browser.
Build the static portal with `npm run build:web`. Vercel is configured to publish
the generated `dist` directory as a preview deployment.

## Demo path

1. Start **Play · Fold a Crane**.
2. Show the scan sweep, `◎ SPATIAL LOCK`, and first amber guide.
3. Fold through the waves, tapping **Done** after each capture pulse.
4. Pick a level-up power between waves, then finish the Stage Clear chest reward.
5. Open **My Folds** to show the newly unlocked crane card.

## Development

The repository retains earlier experimental native WebRTC and gyro code, but the
Ori stage path does not import or depend on it. Read the [Expo SDK 57
reference](https://docs.expo.dev/versions/v57.0.0/) before changing Expo config
or dependencies. Run `npm run typecheck`, `npm test`, and `npm run lint` before a
hand-off.
