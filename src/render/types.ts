import type { TaskOverlay } from "../data/packs";

export type SpatialTier = "ar" | "homography" | "screen";

export type Point = readonly [number, number];

/** Clockwise paper corners: top-left, top-right, bottom-right, bottom-left. */
export type PaperQuad = readonly [Point, Point, Point, Point];

export type SpatialPose = {
  motion?: { tiltX: number; tiltY: number };
  paperQuad?: PaperQuad;
  worldAnchor?: { position: readonly [number, number, number] };
};

export type AnnotationTarget = {
  draw(overlays: readonly TaskOverlay[], pose: SpatialPose): void;
  pulse(): void;
  clear(): void;
};

export type AnnotationRenderer = {
  readonly tier: SpatialTier;
  isAvailable(): boolean;
  mount(target: AnnotationTarget): void;
  renderAnnotations(overlays: readonly TaskOverlay[], pose: SpatialPose): void;
  pulseCapture(): void;
  clear(): void;
};

export type RendererCapabilities = {
  arSupported: boolean;
  homographySupported: boolean;
};
