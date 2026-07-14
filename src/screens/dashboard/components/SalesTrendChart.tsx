import { StyleSheet, View } from "react-native";

import type {
  DashboardRange,
  DashboardSalesPoint,
} from "../../../features/operations/dashboardQuery";
import { colors } from "../../../theme/colors";

export default function SalesTrendChart({
  accessibilityLabel,
  points,
}: {
  accessibilityLabel: string;
  loading: boolean;
  points: DashboardSalesPoint[];
  range: DashboardRange;
}) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={styles.container}
    >
      {points.map((point) => (
        <View
          key={point.time}
          style={[
            styles.bar,
            { height: Math.max((point.value / maxValue) * 130, 2) },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    flex: 1,
    maxWidth: 12,
  },
  container: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 3,
    height: 154,
    justifyContent: "space-between",
    paddingBottom: 8,
    paddingTop: 12,
  },
});
