import { Fragment, useEffect, useMemo, useState, type ReactElement } from "react";
import { Animated, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Svg, { Line, Polygon, Rect } from "react-native-svg";

import type { NormalizedPoint, TaskOverlay, TaskStep } from "../data/packs";

export type SpatialPose = { x: number; y: number };
export type AnnotationRenderer = (step: Pick<TaskStep, "overlay">, pose: SpatialPose, captureRevision?: number, locked?: boolean) => ReactElement;
export type OverlayLayerProps = {
  overlays: readonly TaskOverlay[];
  pose?: SpatialPose;
  captureRevision?: number;
  locked?: boolean;
};

type Viewport = { width: number; height: number };

function scalePoint([x, y]: NormalizedPoint, { width, height }: Viewport) {
  return { x: x * width, y: y * height };
}

function arrowHead(from: NormalizedPoint, to: NormalizedPoint, viewport: Viewport) {
  const start = scalePoint(from, viewport);
  const end = scalePoint(to, viewport);
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const head = Math.min(20, Math.max(12, Math.hypot(end.x - start.x, end.y - start.y) * 0.16));
  const left = { x: end.x - head * Math.cos(angle - Math.PI / 6), y: end.y - head * Math.sin(angle - Math.PI / 6) };
  const right = { x: end.x - head * Math.cos(angle + Math.PI / 6), y: end.y - head * Math.sin(angle + Math.PI / 6) };
  return `${end.x},${end.y} ${left.x},${left.y} ${right.x},${right.y}`;
}

/**
 * Tier 1 spatial renderer. It consumes normalized annotation data and a tiny
 * device-motion pose, so a future AR renderer can swap only this component.
 */
export function OverlayLayer({ overlays, pose = { x: 0, y: 0 }, captureRevision = 0, locked = true }: OverlayLayerProps) {
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0 });
  const [snap] = useState(() => new Animated.Value(0));
  const signature = useMemo(() => JSON.stringify(overlays), [overlays]);

  useEffect(() => {
    snap.setValue(0);
    if (!locked) {
      return undefined;
    }
    const animation = Animated.spring(snap, { damping: 7, stiffness: 200, toValue: 1, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [locked, signature, snap]);

  const onLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => setViewport({ height: layout.height, width: layout.width });
  const overlayColour = captureRevision % 2 === 1 ? "#37D67A" : "#F5B544";

  return (
    <View pointerEvents="none" style={styles.layer} onLayout={onLayout}>
      {viewport.width > 0 && viewport.height > 0 ? (
        <Animated.View
          style={[
            styles.layer,
            {
              opacity: locked ? snap : 0,
              transform: [
                { translateX: pose.x },
                { translateY: pose.y },
                { scale: snap.interpolate({ inputRange: [0, 1], outputRange: [1.15, 1] }) },
              ],
            },
          ]}
        >
          <Svg height={viewport.height} width={viewport.width}>
            <Rect x={viewport.width * 0.18} y={viewport.height * 0.2} width={viewport.width * 0.64} height={viewport.height * 0.58} rx={22} fill="rgba(245,181,68,0.035)" stroke="rgba(245,181,68,0.42)" strokeDasharray="7 9" strokeWidth={1.5} />
            {overlays.map((overlay, index) => {
              if (overlay.type === "outline") {
                return <Polygon key={`outline-${index}`} fill="rgba(245,181,68,0.08)" points={overlay.points.map((point) => { const scaled = scalePoint(point, viewport); return `${scaled.x},${scaled.y}`; }).join(" ")} stroke={overlayColour} strokeWidth={3} />;
              }
              if (overlay.type === "line") {
                const [from, to] = overlay.points;
                const start = scalePoint(from, viewport);
                const end = scalePoint(to, viewport);
                return <Line key={`line-${index}`} stroke={overlayColour} strokeDasharray="10 8" strokeLinecap="round" strokeWidth={3.5} x1={start.x} x2={end.x} y1={start.y} y2={end.y} />;
              }
              const start = scalePoint(overlay.from, viewport);
              const end = scalePoint(overlay.to, viewport);
              return (
                <Fragment key={`arrow-${index}`}>
                  <Line stroke="#37D67A" strokeLinecap="round" strokeWidth={4} x1={start.x} x2={end.x} y1={start.y} y2={end.y} />
                  <Polygon fill="#37D67A" points={arrowHead(overlay.from, overlay.to, viewport)} />
                </Fragment>
              );
            })}
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Stable seam: replace this with the AR anchor renderer without changing pack data. */
export const renderAnnotations: AnnotationRenderer = (step, pose, captureRevision = 0, locked = true) => (
  <OverlayLayer captureRevision={captureRevision} locked={locked} overlays={step.overlay} pose={pose} />
);

const styles = StyleSheet.create({ layer: { ...StyleSheet.absoluteFill } });
