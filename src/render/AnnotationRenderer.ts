import { NativeModules, Platform, UIManager } from "react-native";
import { useEffect, useMemo, useState } from "react";

import type { TaskStep } from "../data/packs";
import { ARRenderer } from "./ARRenderer";
import { HomographyRenderer } from "./HomographyRenderer";
import { ScreenSpaceRenderer } from "./ScreenSpaceRenderer";
import type {
  AnnotationRenderer,
  RendererCapabilities,
  SpatialPose,
} from "./types";

export type { AnnotationRenderer, AnnotationTarget, RendererCapabilities, SpatialPose, SpatialTier } from "./types";

const fallbackCapabilities: RendererCapabilities = {
  arSupported: false,
  homographySupported: false,
};

/** Highest reliable tier wins; this is the only renderer selection point. */
export function pickRenderer(
  capabilities: RendererCapabilities = fallbackCapabilities,
): AnnotationRenderer {
  const candidates: AnnotationRenderer[] = [
    ...(capabilities.arSupported ? [new ARRenderer()] : []),
    ...(capabilities.homographySupported ? [new HomographyRenderer()] : []),
    new ScreenSpaceRenderer(),
  ];

  return candidates.find((renderer) => renderer.isAvailable()) ?? new ScreenSpaceRenderer();
}

/**
 * The single annotation entry point. Callers hand this a current `TaskStep`
 * and a pose provider; each renderer receives the same normalized fold data.
 */
export function renderAnnotations(
  renderer: AnnotationRenderer,
  step: Pick<TaskStep, "overlay">,
  poseProvider: () => SpatialPose,
): void {
  renderer.renderAnnotations(step.overlay, poseProvider());
}

function nativeHomographyIsAvailable(): boolean {
  return (
    Platform.OS === "ios" &&
    UIManager.getViewManagerConfig("OriPaperCameraView") !== null
  );
}

async function checkArSupport(): Promise<boolean> {
  if (
    Platform.OS !== "ios" ||
    NativeModules.VRTARUtils == null ||
    NativeModules.VRTARSceneNavigatorModule == null
  ) {
    return false;
  }

  try {
    // Import only after the native Viro modules have been verified. This keeps
    // Simulator and web fallback bundles from trying to construct an AR view.
    const viro = (await import("@reactvision/react-viro")) as unknown as {
      isARSupportedOnDevice?: () => Promise<{ isARSupported: boolean }>;
    };
    const support = await viro.isARSupportedOnDevice?.();
    return support?.isARSupported === true;
  } catch {
    return false;
  }
}

/** Resolves native capability asynchronously, defaulting safely to Screen Space. */
export function useSpatialRenderer(): AnnotationRenderer {
  const [capabilities, setCapabilities] = useState<RendererCapabilities>(() => ({
    ...fallbackCapabilities,
    homographySupported: nativeHomographyIsAvailable(),
  }));

  useEffect(() => {
    let active = true;

    void checkArSupport().then((arSupported) => {
      if (!active) return;
      setCapabilities({
        arSupported,
        homographySupported: nativeHomographyIsAvailable(),
      });
    });

    return () => {
      active = false;
    };
  }, []);

  return useMemo(
    () => pickRenderer(capabilities),
    [capabilities.arSupported, capabilities.homographySupported],
  );
}
