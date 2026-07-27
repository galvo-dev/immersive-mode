// JS surface for the immersive-mode native module. Uses requireOptionalNativeModule so this
// is a hard no-op wherever the native module is absent — web (output:'single'), or a JS-only
// context before a dev build — instead of throwing. On iOS the native stub resolves and the
// calls are no-ops. Consumers use the useImmersiveGameMode hook (src/games/lib), not this
// directly.
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

export default ImmersiveMode;

// The ergonomic surface most consumers want — one line in a game screen.
export { useImmersiveGameMode } from './use-immersive-game-mode';
