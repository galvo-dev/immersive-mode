// Reusable "immersive game mode" for whole-screen-swipe games. While `active` is true on
// Android, the game is full-screen (system bars hidden) and the ENTIRE left+right edges deliver
// touches to the app instead of the system back gesture — sticky-immersive
// (BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE) lifts the setSystemGestureExclusionRects 200dp-per-edge
// cap, and the native module claims full-HEIGHT L/R bands. The bottom home gesture stays
// mandatory. Bars + gestures restore whenever `active` flips false (pause/death/quit), on
// app-background, and on unmount. No-op on iOS/web (the native module is a stub/absent).
//
// Games opt in with one line — e.g. `useImmersiveGameMode(!paused && dead === null)`. Suits
// whole-screen-swipe games; tap-only games do not need it.
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

// Import the native surface DIRECTLY, never through ./index — index re-exports this hook, so
// going back through it forms a require cycle Metro warns about on every launch.
import { ImmersiveMode } from './native';

export function useImmersiveGameMode(active: boolean, edgeBandDp = 48): void {
  useEffect(() => {
    if (Platform.OS !== 'android' || !active) return;
    ImmersiveMode.enter(edgeBandDp);
    // Restore bars when the app leaves the foreground (the system switcher must be reachable),
    // and re-enter on return. The listener only exists while `active` is true, so a
    // background-while-paused can never re-hide the bars underneath the pause/death overlay.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') ImmersiveMode.enter(edgeBandDp);
      else ImmersiveMode.exit();
    });
    return () => {
      sub.remove();
      ImmersiveMode.exit();
    };
  }, [active, edgeBandDp]);
}
