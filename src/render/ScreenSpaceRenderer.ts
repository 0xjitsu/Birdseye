import type { AnnotationRenderer, AnnotationTarget, SpatialPose } from "./types";
import type { TaskOverlay } from "../data/packs";

/**
 * Guaranteed tier-three fallback. The camera remains usable in a Simulator,
 * while small calibrated motion offsets make the guide read as spatial.
 */
export class ScreenSpaceRenderer implements AnnotationRenderer {
  readonly tier = "screen" as const;
  private target: AnnotationTarget | null = null;

  isAvailable(): boolean {
    return true;
  }

  mount(target: AnnotationTarget): void {
    this.target = target;
  }

  renderAnnotations(overlays: readonly TaskOverlay[], pose: SpatialPose): void {
    const motion = pose.motion;
    this.target?.draw(overlays, {
      motion: motion
        ? {
            tiltX: clamp(motion.tiltX, -20, 20) * 1.4,
            tiltY: clamp(motion.tiltY, -20, 20) * 1.1,
          }
        : undefined,
    });
  }

  pulseCapture(): void {
    this.target?.pulse();
  }

  clear(): void {
    this.target?.clear();
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : 0));
}
