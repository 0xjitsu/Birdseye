import { useMemo, useRef, useState, type ComponentType } from "react";
import { StyleSheet, View } from "react-native";

import type { TaskOverlay } from "../data/packs";

type ARCameraStageProps = {
  overlays: readonly TaskOverlay[];
  captureRevision: number;
  onTrackingReady(): void;
};

type ViroBindings = {
  ViroARPlane: ComponentType<Record<string, unknown>>;
  ViroARScene: ComponentType<Record<string, unknown>>;
  ViroARSceneNavigator: ComponentType<Record<string, unknown>>;
  ViroMaterials: { createMaterials(materials: Record<string, unknown>): void };
  ViroNode: ComponentType<Record<string, unknown>>;
  ViroPolyline: ComponentType<Record<string, unknown>>;
};

let didCreateMaterials = false;

function bindings(): ViroBindings | null {
  try {
    const viro = require("@reactvision/react-viro") as ViroBindings;
    if (!didCreateMaterials) {
      viro.ViroMaterials.createMaterials({
        oriFoldAmber: {
          lightingModel: "Constant",
          diffuseColor: "#F5B544",
          blendMode: "Alpha",
        },
        oriFoldMint: {
          lightingModel: "Constant",
          diffuseColor: "#37D67A",
          blendMode: "Alpha",
        },
      });
      didCreateMaterials = true;
    }
    return viro;
  } catch {
    return null;
  }
}

function paperPoint([x, y]: readonly [number, number]): [number, number, number] {
  // 21 cm is a common square origami sheet. The selected AR plane establishes
  // the world origin, so these coordinates stay fixed while the phone moves.
  return [(x - 0.5) * 0.21, (y - 0.52) * 0.21, 0];
}

function toLinePoints(overlay: TaskOverlay): [number, number, number][] {
  if (overlay.type === "outline") {
    return [...overlay.points, overlay.points[0]].map(paperPoint);
  }
  if (overlay.type === "line") {
    return overlay.points.map(paperPoint);
  }
  return [paperPoint(overlay.from), paperPoint(overlay.to)];
}

/**
 * Viro manages the camera itself. The first stable horizontal plane is held as
 * the world anchor; every subsequent wave changes only its geometry.
 */
export function ARCameraStage({ overlays, captureRevision, onTrackingReady }: ARCameraStageProps) {
  const viro = bindings();
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const ready = useRef(false);
  const appProps = useMemo(
    () => ({ anchorId, captureRevision, overlays, onTrackingReady, setAnchorId }),
    [anchorId, captureRevision, onTrackingReady, overlays],
  );

  if (!viro) return <View style={StyleSheet.absoluteFill} />;
  const { ViroARScene, ViroARSceneNavigator, ViroARPlane, ViroNode, ViroPolyline } = viro;

  function FoldScene({ sceneNavigator }: { sceneNavigator: { viroAppProps?: typeof appProps } }) {
    const props = sceneNavigator.viroAppProps ?? appProps;
    const material = props.captureRevision % 2 === 1 ? "oriFoldMint" : "oriFoldAmber";

    return (
      <ViroARScene
        anchorDetectionTypes={["planesHorizontal"]}
        onTrackingInitialized={() => {
          if (!ready.current) {
            ready.current = true;
            props.onTrackingReady();
          }
        }}
        onAnchorFound={(anchor: unknown) => {
          const candidate = anchor as {
            anchorId?: string;
            alignment?: string;
            width?: number;
            height?: number;
          };
          if (
            !props.anchorId &&
            candidate.anchorId &&
            candidate.alignment?.startsWith("Horizontal") &&
            (candidate.width ?? 0) >= 0.15 &&
            (candidate.height ?? 0) >= 0.15
          ) {
            props.setAnchorId(candidate.anchorId);
          }
        }}
      >
        {props.anchorId ? (
          <ViroARPlane anchorId={props.anchorId} minHeight={0.15} minWidth={0.15}>
            <ViroNode position={[0, 0.004, 0]} rotation={[-90, 0, 0]}>
              {props.overlays.map((overlay, index) => (
                <ViroPolyline
                  key={`${overlay.type}-${index}-${props.captureRevision}`}
                  materials={[material]}
                  points={toLinePoints(overlay)}
                  thickness={0.004}
                />
              ))}
            </ViroNode>
          </ViroARPlane>
        ) : null}
      </ViroARScene>
    );
  }

  return (
    <ViroARSceneNavigator
      hdrEnabled
      initialScene={{ scene: FoldScene }}
      provider="none"
      style={styles.stage}
      viroAppProps={appProps}
    />
  );
}

const styles = StyleSheet.create({ stage: { ...StyleSheet.absoluteFill } });
