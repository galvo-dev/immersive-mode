package expo.modules.immersivemode

import android.graphics.Rect
import android.os.Build
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Reusable "immersive game mode" for whole-screen-swipe games (Hijack first; 2048 /
// arrow-untangle / mahjong follow). Two synchronous JS functions:
//   enter(edgeBandDp): sticky-immersive full-screen + full-height L/R gesture-exclusion bands
//   exit(): restore the system bars + clear exclusions
//
// WHY this exact combination (canonical AOSP behavior, see the spec):
//  - BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE is "stickily hidden", which LIFTS the system's
//    ~200dp-per-edge cap on setSystemGestureExclusionRects — so we can claim the FULL screen
//    height on the left+right edges. Verbatim from View.setSystemGestureExclusionRects:
//    "The limit does not apply while the navigation bar is SYSTEM_UI_FLAG_IMMERSIVE_STICKY
//    stickily hidden, nor to the input method and home activity."
//  - The L/R edges host the back gesture (not a bar); the transient-bars reveal is top/bottom
//    only. So excluding the L/R edges delivers an edge steer-pan to the app instead of firing
//    system back — exactly the goal.
//  - We NEVER exclude the bottom, so the mandatory home gesture always works (safety valve).
// All window mutations run on the UI thread; a null activity is a graceful no-op (never throws
// into JS from a useEffect).
class ImmersiveModeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ImmersiveMode")

    Function("enter") { edgeBandDp: Double ->
      val activity = appContext.currentActivity
      if (activity != null) activity.runOnUiThread {
        val window = activity.window
        val decor = window.decorView

        // Draw edge-to-edge (already the enforced default on API 35+, explicit for older devices).
        WindowCompat.setDecorFitsSystemWindows(window, false)

        // Full-bleed into the display cutout in portrait (SHORT_EDGES). On API 35+ the OS
        // coerces this to ALWAYS anyway; the real win is pre-Android-15 devices (minSdk 26).
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
          window.attributes = window.attributes.apply {
            layoutInDisplayCutoutMode =
              WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
          }
        }

        // Sticky-immersive: hide status + nav; a top/bottom swipe reveals them transiently.
        // Set the behavior BEFORE hiding so the cap-lift invariant holds atomically.
        val controller = WindowCompat.getInsetsController(window, decor)
        controller.systemBarsBehavior =
          WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        controller.hide(WindowInsetsCompat.Type.systemBars())

        // Full screen-HEIGHT L/R exclusion bands. decor.post{} guarantees a laid-out size
        // (width/height are 0 before first layout, which would give empty rects). NO bottom rect.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
          decor.post {
            val band = (edgeBandDp * activity.resources.displayMetrics.density).toInt()
            val w = decor.width
            val h = decor.height
            if (w > 0 && h > 0 && band > 0) {
              decor.systemGestureExclusionRects = listOf(
                Rect(0, 0, band, h),
                Rect(w - band, 0, w, h),
              )
            }
          }
        }
      }
    }

    Function("exit") {
      val activity = appContext.currentActivity
      if (activity != null) activity.runOnUiThread {
        val window = activity.window
        val decor = window.decorView

        // Clear exclusions FIRST so no stale L/R bands linger once the bars return.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
          decor.systemGestureExclusionRects = emptyList()
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
          window.attributes = window.attributes.apply {
            layoutInDisplayCutoutMode =
              WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT
          }
        }
        WindowCompat.getInsetsController(window, decor)
          .show(WindowInsetsCompat.Type.systemBars())
        WindowCompat.setDecorFitsSystemWindows(window, true)
      }
    }
  }
}
