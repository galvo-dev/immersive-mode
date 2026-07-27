import ExpoModulesCore

// iOS no-op. There is no edge back-gesture to fight on iOS, and iOS full-screen is a
// separate concern out of scope for the immersive game mode. The stub exists only so
// requireNativeModule('ImmersiveMode') resolves identically across platforms; the shared
// useImmersiveGameMode hook already guards to Android, so these are never called on iOS.
public class ImmersiveModeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ImmersiveMode")

    Function("enter") { (_ edgeBandDp: Double) in }

    Function("exit") { }
  }
}
