import { StyleSheet, Text, View } from "react-native";
import { LineGraph, type GraphPoint } from "react-native-graph";

import type { DashboardSalesPoint } from "../../../features/operations/dashboardQuery";
import { colors } from "../../../theme/colors";

export default function SalesTrendChart({
  accessibilityLabel,
  loading,
  points,
}: {
  accessibilityLabel: string;
  loading: boolean;
  points: DashboardSalesPoint[];
}) {
  const graphPoints: GraphPoint[] = points.map(({ time, value }) => ({
    date: new Date(time * 1_000),
    value,
  }));
  const firstDate = graphPoints[0]?.date;
  const lastDate = graphPoints.at(-1)?.date;
  const maxValue = Math.max(...graphPoints.map((point) => point.value), 0);
  const canRenderGraph = firstDate && lastDate && graphPoints.length >= 2;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={styles.container}
    >
      <View pointerEvents="none" style={[styles.gridLine, styles.gridTop]} />
      <View pointerEvents="none" style={[styles.gridLine, styles.gridMiddle]} />
      <View pointerEvents="none" style={[styles.gridLine, styles.gridBottom]} />

      {canRenderGraph ? (
        <LineGraph
          animated={false}
          color={colors.primary}
          lineThickness={2.5}
          points={graphPoints}
          range={{
            x: { max: lastDate, min: firstDate },
            y: { max: Math.max(maxValue * 1.08, 1), min: 0 },
          }}
          style={styles.graph}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {loading ? "Loading sales…" : "No fulfilled sales"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  graph: {
    flex: 1,
  },
  gridBottom: {
    bottom: 8,
  },
  gridLine: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    left: 0,
    opacity: 0.72,
    position: "absolute",
    right: 0,
  },
  gridMiddle: {
    top: "50%",
  },
  gridTop: {
    top: 12,
  },
  container: {
    height: 154,
    overflow: "hidden",
    paddingBottom: 8,
    paddingTop: 12,
  },
});
