// JS surface for the immersive-mode native module. Consumers use the useImmersiveGameMode hook
// (re-exported below, or via src/games/lib), not the native object directly.
//
// THIS FILE IS A BARREL ONLY. The native object lives in ./native and the hook in
// ./use-immersive-game-mode, and both import DOWNWARD — never back through here. Defining the
// value here while also re-exporting the hook that consumes it made a require cycle
// (index -> use-immersive-game-mode -> index) that Metro logged on every launch. Cycles are
// permitted but resolve to whichever binding initialised first, so the hook could see
// `ImmersiveMode` as undefined depending on which module Metro entered from.
import { ImmersiveMode } from './native';

export { ImmersiveMode } from './native';

/** The ergonomic surface most consumers want — one line in a game screen. */
export { useImmersiveGameMode } from './use-immersive-game-mode';

export default ImmersiveMode;
