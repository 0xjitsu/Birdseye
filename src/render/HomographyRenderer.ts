import { Platform, UIManager } from "react-native";

import type { TaskOverlay } from "../data/packs";
import type { AnnotationRenderer, AnnotationTarget, SpatialPose } from "./types";

/**
 * Tier two. `OriPaperCameraView` runs `VNDetectRectanglesRequest` on-device
 * and provides a perspective paper quad; OverlayLayer maps the shared fold
 * endpoints through that quad.
 */
export class HomographyRenderer implements AnnotationRenderer {
  readonly tier = "homography" as const;
  private target: AnnotationTarget | null = null;

  isAvailable(): boolean {
    return (
      Platform.OS === "ios" &&
      UIManager.getViewManagerConfig("OriPaperCameraView") !== null
    );
  }

  mount(target: AnnotationTarget): void {
    this.target = target;
  }

  renderAnnotations(overlays: readonly TaskOverlay[], pose: SpatialPose): void {
    this.target?.draw(overlays, { paperQuad: pose.paperQuad });
  }

  pulseCapture(): void {
    this.target?.pulse();
  }

  clear(): void {
    this.target?.clear();
  }
}
