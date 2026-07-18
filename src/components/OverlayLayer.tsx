import { Fragment, useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Line, Polygon, Rect } from "react-native-svg";

import type { NormalizedPoint, TaskOverlay } from "../data/packs";
import type { PaperQuad, SpatialPose } from "../render/types";

export type OverlayLayerProps = {
  overlays: readonly TaskOverlay[];
  pose?: SpatialPose;
  captureRevision?: number;
  locked?: boolean;
};

type Viewport = { width: number; height: number };
type PixelPoint = { x: number; y: number };

// The authored pack values describe this quiet, centred paper frame. On a
// Vision tier we first turn them into paper-local coordinates, then project
// them through the live four-corner paper quad.
const authoredPaper = { left: 0.28, right: 0.72, top: 0.3, bottom: 0.74 };

function scalePoint([x, y]: NormalizedPoint, { width, height }: Viewport): PixelPoint {
  return { x: x * width, y: y * height };
}

function normalizePaperPoint([x, y]: NormalizedPoint): PixelPoint {
  return {
    x: (x - authoredPaper.left) / (authoredPaper.right - authoredPaper.left),
    y: (y - authoredPaper.top) / (authoredPaper.bottom - authoredPaper.top),
  };
}

/** A projective unit-square → quadrilateral transform, not an affine cheat. */
export function projectPointThroughQuad(
  point: PixelPoint,
  quad: PaperQuad,
  viewport: Viewport,
): PixelPoint {
  const [topLeft, topRight, bottomRight, bottomLeft] = quad.map((corner) =>
    scalePoint(corner, viewport),
  ) as [PixelPoint, PixelPoint, PixelPoint, PixelPoint];
  const dx1 = topRight.x - bottomRight.x;
  const dx2 = bottomLeft.x - bottomRight.x;
  const dx3 = topLeft.x - topRight.x + bottomRight.x - bottomLeft.x;
  const dy1 = topRight.y - bottomRight.y;
  const dy2 = bottomLeft.y - bottomRight.y;
  const dy3 = topLeft.y - topRight.y + bottomRight.y - bottomLeft.y;
  const denominator = dx1 * dy2 - dx2 * dy1;

  if (Math.abs(denominator) < 0.000001) {
    return {
      x: topLeft.x + (topRight.x - topLeft.x) * point.x + (bottomLeft.x - topLeft.x) * point.y,
      y: topLeft.y + (topRight.y - topLeft.y) * point.x + (bottomLeft.y - topLeft.y) * point.y,
    };
  }

  const g = (dx3 * dy2 - dx2 * dy3) / denominator;
  const h = (dx1 * dy3 - dx3 * dy1) / denominator;
  const a = topRight.x * (g + 1) - topLeft.x;
  const b = bottomLeft.x * (h + 1) - topLeft.x;
  const c = topLeft.x;
  const d = topRight.y * (g + 1) - topLeft.y;
  const e = bottomLeft.y * (h + 1) - topLeft.y;
  const f = topLeft.y;
  const divisor = g * point.x + h * point.y + 1;

  return {
    x: (a * point.x + b * point.y + c) / divisor,
    y: (d * point.x + e * point.y + f) / divisor,
  };
}

export function projectOverlayPoint(
  point: NormalizedPoint,
  viewport: Viewport,
  paperQuad?: PaperQuad,
): PixelPoint {
  if (!paperQuad) return scalePoint(point, viewport);
  return projectPointThroughQuad(normalizePaperPoint(point), paperQuad, viewport);
}

function arrowHead(from: PixelPoint, to: PixelPoint): string {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const head = Math.min(20, Math.max(12, Math.hypot(to.x - from.x, to.y - from.y) * 0.16));
  const left = { x: to.x - head * Math.cos(angle - Math.PI / 6), y: to.y - head * Math.sin(angle - Math.PI / 6) };
  const right = { x: to.x - head * Math.cos(angle + Math.PI / 6), y: to.y - head * Math.sin(angle + Math.PI / 6) };
  return `${to.x},${to.y} ${left.x},${left.y} ${right.x},${right.y}`;
}

/**
 * Pure display surface for every renderer. It does not choose a tier and it
 * never changes the learning geometry: only the renderer's pose can alter a
 * projection.
 */
export function OverlayLayer({
  overlays,
  pose,
  captureRevision = 0,
  locked = true,
}: OverlayLayerProps) {
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0 });
  const [snap] = useState(() => new Animated.Value(0));
  const signature = useMemo(() => JSON.stringify(overlays), [overlays]);
  const motion = pose?.motion;
  const paperQuad = pose?.paperQuad;

  useEffect(() => {
    snap.setValue(0);
    if (!locked) return undefined;
    const animation = Animated.spring(snap, {
      damping: 7,
      stiffness: 200,
      toValue: 1,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [locked, signature, snap]);

  const overlayColour = captureRevision % 2 === 1 ? "#37D67A" : "#F5B544";

  return (
    <View
      pointerEvents="none"
      style={styles.layer}
      onLayout={({ nativeEvent: { layout } }) =>
        setViewport({ height: layout.height, width: layout.width })
      }
    >
      {viewport.width > 0 && viewport.height > 0 ? (
        <Animated.View
          style={[
            styles.layer,
            {
              opacity: locked ? snap : 0,
              transform: [
                { translateX: motion?.tiltX ?? 0 },
                { translateY: motion?.tiltY ?? 0 },
                { scale: snap.interpolate({ inputRange: [0, 1], outputRange: [1.15, 1] }) },
              ],
            },
          ]}
        >
          <Svg height={viewport.height} width={viewport.width}>
            {!paperQuad ? (
              <Rect
                x={viewport.width * 0.18}
                y={viewport.height * 0.2}
                width={viewport.width * 0.64}
                height={viewport.height * 0.58}
                rx={22}
                fill="rgba(245,181,68,0.035)"
                stroke="rgba(245,181,68,0.42)"
                strokeDasharray="7 9"
                strokeWidth={1.5}
              />
            ) : null}
            {overlays.map((overlay, index) => {
              if (overlay.type === "outline") {
                return (
                  <Polygon
                    key={`outline-${index}`}
                    fill="rgba(245,181,68,0.08)"
                    points={overlay.points
                      .map((point) => {
                        const projected = projectOverlayPoint(point, viewport, paperQuad);
                        return `${projected.x},${projected.y}`;
                      })
                      .join(" ")}
                    stroke={overlayColour}
                    strokeWidth={3}
                  />
                );
              }

              if (overlay.type === "line") {
                const [from, to] = overlay.points;
                const start = projectOverlayPoint(from, viewport, paperQuad);
                const end = projectOverlayPoint(to, viewport, paperQuad);
                return (
                  <Line
                    key={`line-${index}`}
                    stroke={overlayColour}
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    strokeWidth={3.5}
                    x1={start.x}
                    x2={end.x}
                    y1={start.y}
                    y2={end.y}
                  />
                );
              }

              const start = projectOverlayPoint(overlay.from, viewport, paperQuad);
              const end = projectOverlayPoint(overlay.to, viewport, paperQuad);
              return (
                <Fragment key={`arrow-${index}`}>
                  <Line stroke="#37D67A" strokeLinecap="round" strokeWidth={4} x1={start.x} x2={end.x} y1={start.y} y2={end.y} />
                  <Polygon fill="#37D67A" points={arrowHead(start, end)} />
                </Fragment>
              );
            })}
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ layer: { ...StyleSheet.absoluteFill } });
