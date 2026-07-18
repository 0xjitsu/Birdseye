import { NativeModules, Platform } from "react-native";

import type { TaskOverlay } from "../data/packs";
import type { AnnotationRenderer, AnnotationTarget, SpatialPose } from "./types";

/**
 * Tier one. Its target is the Viro scene bridge in ARCameraStage. The bridge
 * creates an ARKit plane anchor at lock time, so every normalized guide is
 * rendered as world geometry rather than an overlay glued to the display.
 */
export class ARRenderer implements AnnotationRenderer {
  readonly tier = "ar" as const;
  private target: AnnotationTarget | null = null;

  isAvailable(): boolean {
    return (
      Platform.OS === "ios" &&
      NativeModules.VRTARSceneNavigatorModule != null &&
      NativeModules.VRTARUtils != null
    );
  }

  mount(target: AnnotationTarget): void {
    this.target = target;
  }

  renderAnnotations(overlays: readonly TaskOverlay[], pose: SpatialPose): void {
    this.target?.draw(overlays, { worldAnchor: pose.worldAnchor });
  }

  pulseCapture(): void {
    this.target?.pulse();
  }

  clear(): void {
    this.target?.clear();
  }
}
