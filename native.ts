// The native surface, kept OUT of index.ts to break a require cycle.
//
// index.ts used to both define `ImmersiveMode` and re-export `useImmersiveGameMode`, while the hook
// imported `ImmersiveMode` back from './index' — so Metro logged
//   Require cycle: immersive-mode/index.ts -> use-immersive-game-mode.ts -> index.ts
// on every launch. Cycles are permitted but resolve to whichever binding happens to be initialised
// first, so the hook could observe `ImmersiveMode` as undefined depending on which module Metro
// entered from. Owning the value here and having BOTH files import it downward removes the edge.
//
// `requireOptionalNativeModule` so this is a hard no-op wherever the native module is absent — web
// (output:'single'), or a JS-only context before a dev build — instead of throwing. On iOS the
// native stub resolves and the calls are no-ops.
import { requireOptionalNativeModule } from 'expo';

interface ImmersiveModeNative {
  /** Enter sticky-immersive full-screen and exclude full-height L/R bands (Android only). */
  enter(edgeBandDp: number): void;
  /** Restore the system bars and clear the gesture-exclusion bands. */
  exit(): void;
}

const native = requireOptionalNativeModule<ImmersiveModeNative>('ImmersiveMode');

export const ImmersiveMode = {
  enter(edgeBandDp = 48): void {
    native?.enter(edgeBandDp);
  },
  exit(): void {
    native?.exit();
  },
};
