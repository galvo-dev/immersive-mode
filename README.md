# @galvo/immersive-mode

True full-screen immersive mode for React Native games on **Android** — and the part everyone else
leaves out: it excludes the **full-height** left and right edges from the system back gesture, so a
whole-screen-swipe game stops navigating backwards mid-play.

No-op on iOS and web, by design. Drop it in unconditionally.

```bash
npx expo install @galvo/immersive-mode
```

Requires a **development build** (it ships native code, so it does not run in Expo Go).

## Use

```tsx
import { useImmersiveGameMode } from '@galvo/immersive-mode';

export function GameScreen() {
  const [paused, setPaused] = useState(false);
  const [dead, setDead] = useState<number | null>(null);

  // Immersive while actually playing; bars come back on pause/death automatically.
  useImmersiveGameMode(!paused && dead === null);

  return <YourGame />;
}
```

That is the whole API surface most apps need. The hook restores the system bars whenever `active`
flips false, when the app is backgrounded, and on unmount — so the task switcher is always
reachable and you cannot strand a user in a chrome-less screen.

Imperative access is available if you are driving it from outside React:

```ts
import { ImmersiveMode } from '@galvo/immersive-mode';

ImmersiveMode.enter(48); // edge band in dp, default 48
ImmersiveMode.exit();
```

## Why this exists

Android's `setSystemGestureExclusionRects` caps you at **200dp per edge**. For a game where the
player swipes anywhere on the screen, that is not enough — a swipe starting below the excluded band
is captured by the system back gesture and the player gets thrown out of the level.

Entering **sticky immersive** (`BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`) lifts that cap, which lets
this module claim genuinely full-height left/right bands. The bottom home gesture stays mandatory —
that one is not negotiable on Android, and should not be.

The result: swipes belong to your game, the system stays escapable, and nothing changes on the
platforms where none of this applies.

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `useImmersiveGameMode` | `(active: boolean, edgeBandDp?: number) => void` | The recommended surface. Handles AppState and unmount. |
| `ImmersiveMode.enter` | `(edgeBandDp?: number) => void` | Imperative. Default `48`. |
| `ImmersiveMode.exit` | `() => void` | Restores bars and clears exclusion rects. |

The native module is loaded with `requireOptionalNativeModule`, so on web or in a JS-only context
before a dev build the calls are hard no-ops rather than throwing.

## Platform behaviour

| Platform | Behaviour |
| --- | --- |
| Android | Sticky immersive + full-height L/R gesture exclusion |
| iOS | No-op (native stub resolves, calls do nothing) |
| Web | No-op (native module absent) |

## License

MIT — see [LICENSE](./LICENSE).

Built for [Galvo](https://galvo.dev), a catalog of GPU effects and games for React Native.
