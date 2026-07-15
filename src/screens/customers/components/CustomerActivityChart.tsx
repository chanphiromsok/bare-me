import { StyleSheet, View } from "react-native";

import type { CustomerActivityPoint } from "../../../features/operations/customerQueries";
import { colors } from "../../../theme/colors";

export default function CustomerActivityChart({
  accessibilityLabel,
  points,
}: {
  accessibilityLabel: string;
  points: CustomerActivityPoint[];
}) {
  const maxValue = Math.max(
    ...points.map((point) => Math.max(point.purchasedCents, point.paidCents)),
    1,
  );

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={styles.container}
    >
      {points.map((point) => (
        <View key={point.time} style={styles.day}>
          <View
            style={[
              styles.bar,
              styles.purchased,
              { height: Math.max((point.purchasedCents / maxValue) * 112, 1) },
            ]}
          />
          <View
            style={[
              styles.bar,
              styles.paid,
              { height: Math.max((point.paidCents / maxValue) * 112, 1) },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: 1,
    flex: 1,
    maxWidth: 4,
  },
  container: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 2,
    height: 132,
    justifyContent: "space-between",
    paddingBottom: 8,
    paddingTop: 10,
  },
  day: {
    alignItems: "flex-end",
    flex: 1,
    flexDirection: "row",
    gap: 1,
    height: "100%",
  },
  paid: {
    backgroundColor: colors.success,
  },
  purchased: {
    backgroundColor: colors.primary,
  },
});
