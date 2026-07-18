import { CameraView } from "expo-camera";
import {
  Platform,
  requireNativeComponent,
  StyleSheet,
  UIManager,
  type NativeSyntheticEvent,
  type ViewProps,
} from "react-native";

import type { PaperQuad } from "../render/types";

type PaperQuadEvent = NativeSyntheticEvent<{ corners: readonly number[] }>;

type NativePaperCameraProps = ViewProps & {
  detectionIntervalMs?: number;
  onPaperQuad?: (event: PaperQuadEvent) => void;
};

const NativePaperCamera =
  Platform.OS === "ios" && UIManager.getViewManagerConfig("OriPaperCameraView")
    ? requireNativeComponent<NativePaperCameraProps>("OriPaperCameraView")
    : null;

function parsePaperQuad(corners: readonly number[]): PaperQuad | null {
  if (corners.length !== 8 || corners.some((value) => !Number.isFinite(value))) {
    return null;
  }

  const quad = [
    [corners[0], corners[1]],
    [corners[2], corners[3]],
    [corners[4], corners[5]],
    [corners[6], corners[7]],
  ] as const;

  return quad.every(([x, y]) => x >= 0 && x <= 1 && y >= 0 && y <= 1)
    ? quad
    : null;
}

export type PaperCameraStageProps = {
  onPaperQuad(quad: PaperQuad): void;
  onMountError(message: string): void;
};

/** Native AVFoundation + Vision camera used only by the homography tier. */
export function PaperCameraStage({ onPaperQuad, onMountError }: PaperCameraStageProps) {
  if (!NativePaperCamera) {
    // A stale development build must remain demoable rather than red-screening.
    return (
      <CameraView
        facing="back"
        onMountError={(event) => onMountError(event.message)}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return (
    <NativePaperCamera
      detectionIntervalMs={100}
      onPaperQuad={(event) => {
        const quad = parsePaperQuad(event.nativeEvent.corners);
        if (quad) onPaperQuad(quad);
      }}
      style={StyleSheet.absoluteFill}
    />
  );
}
