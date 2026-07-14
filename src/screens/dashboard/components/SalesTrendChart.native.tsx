import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { LiveChart, type LiveChartPoint } from "react-native-livechart";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import type { DashboardSalesPoint } from "../../../features/operations/dashboardQuery";
import { colors } from "../../../theme/colors";

function formatSalesValue(value: number): string {
  "worklet";

  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value)}`;
}

export default function SalesTrendChart({
  accessibilityLabel,
  loading,
  points,
}: {
  accessibilityLabel: string;
  loading: boolean;
  points: DashboardSalesPoint[];
}) {
  const data = useSharedValue<LiveChartPoint[]>(
    points.map(({ time, value }) => ({ time, value })),
  );
  const value = useDerivedValue(() => {
    const currentData = data.get();
    return currentData.length ? currentData[currentData.length - 1].value : 0;
  });
  const firstTime = points[0]?.time ?? 0;
  const lastTime = points.at(-1)?.time ?? firstTime + 1;

  useEffect(() => {
    data.set(
      points.map(({ time, value: pointValue }) => ({
        time,
        value: pointValue,
      })),
    );
  }, [data, points]);

  return (
    <View style={styles.container}>
      <LiveChart
        accessibilityLabel={accessibilityLabel}
        accentColor={colors.primary}
        badge={false}
        data={data}
        dot={false}
        emptyText="No fulfilled sales"
        formatValue={formatSalesValue}
        gradient
        gridStyle={{ color: colors.border, opacity: 0.6 }}
        insets={{ bottom: 8, left: 4, right: 8, top: 12 }}
        leftEdgeFade={false}
        loading={loading}
        momentum={false}
        nonNegative
        nowOverride={lastTime}
        pulse={false}
        scrub={false}
        static
        theme="light"
        timeWindow={Math.max(lastTime - firstTime, 1)}
        transitions={false}
        value={value}
        windowBuffer={0.03}
        xAxis={false}
        yAxis={{ minGap: 42 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 154,
    overflow: "hidden",
  },
});
