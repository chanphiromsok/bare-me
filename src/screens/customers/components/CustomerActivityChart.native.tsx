import { Canvas, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { memo, useEffect, useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";

import type { CustomerActivityPoint } from "../../../features/operations/customerQueries";
import { colors } from "../../../theme/colors";

const chartHeight = 132;
const chartHorizontalInset = 72;
const chartPaddingBottom = 8;
const chartPaddingTop = 10;

function buildPath(
  points: CustomerActivityPoint[],
  valueForPoint: (point: CustomerActivityPoint) => number,
  width: number,
  maxValue: number,
): SkPath {
  const builder = Skia.PathBuilder.Make();
  const drawableHeight = chartHeight - chartPaddingTop - chartPaddingBottom;

  points.forEach((point, index) => {
    const x = points.length > 1 ? (index / (points.length - 1)) * width : 0;
    const y =
      chartPaddingTop + drawableHeight * (1 - valueForPoint(point) / maxValue);

    if (index === 0) builder.moveTo(x, y);
    else builder.lineTo(x, y);
  });

  return builder.detach();
}

const CustomerActivityChart = memo(function CustomerActivityChart({
  accessibilityLabel,
  points,
}: {
  accessibilityLabel: string;
  points: CustomerActivityPoint[];
}) {
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.max(screenWidth - chartHorizontalInset, 1);
  const progress = useSharedValue(0);
  const maxValue = Math.max(
    ...points.map((point) => point.purchasedCents),
    ...points.map((point) => point.paidCents),
    1,
  );
  const { paidPath, purchasedPath } = useMemo(
    () => ({
      paidPath: buildPath(points, (point) => point.paidCents, width, maxValue),
      purchasedPath: buildPath(
        points,
        (point) => point.purchasedCents,
        width,
        maxValue,
      ),
    }),
    [maxValue, points, width],
  );
  const canRender = points.length >= 2;

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 650 });
  }, [paidPath, progress, purchasedPath]);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={styles.container}
    >
      <View pointerEvents="none" style={[styles.gridLine, styles.gridTop]} />
      <View pointerEvents="none" style={[styles.gridLine, styles.gridMiddle]} />
      <View pointerEvents="none" style={[styles.gridLine, styles.gridBottom]} />

      {canRender ? (
        <Canvas opaque={false} pointerEvents="none" style={styles.canvas}>
          <Path
            color={colors.primary}
            end={progress}
            path={purchasedPath}
            strokeCap="round"
            strokeJoin="round"
            strokeWidth={2.5}
            style="stroke"
          />
          <Path
            color={colors.success}
            end={progress}
            path={paidPath}
            strokeCap="round"
            strokeJoin="round"
            strokeWidth={2.5}
            style="stroke"
          />
        </Canvas>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No customer activity yet</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
  container: {
    height: chartHeight,
    overflow: "hidden",
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  gridBottom: {
    bottom: chartPaddingBottom,
  },
  gridLine: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    left: 0,
    opacity: 0.7,
    position: "absolute",
    right: 0,
  },
  gridMiddle: {
    top: "50%",
  },
  gridTop: {
    top: chartPaddingTop,
  },
});

export default CustomerActivityChart;
