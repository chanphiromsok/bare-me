import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LineGraph, type GraphPoint } from "react-native-graph";

import { dashboardColors } from "./dashboardColors";

const Y_TICKS = [4, 3, 2, 1, 0] as const;

const ShipmentTrendsCard = memo(function ShipmentTrendsCard({
  points,
  xLabels,
  maxValue = 4,
  onPressInterval,
}: {
  points: GraphPoint[];
  xLabels: string[];
  maxValue?: number;
  onPressInterval?: () => void;
}) {
  return (
    <View
      className="rounded-[10px] bg-white px-[13px] py-[10px]"
      style={styles.card}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-[14px] font-semibold text-primary">
          Shipment Trends
        </Text>
        <Pressable
          accessibilityRole="button"
          className="h-[28px] flex-row items-center gap-[10px] rounded-[6px] px-[10px] active:opacity-70"
          style={styles.intervalChip}
          onPress={onPressInterval}
        >
          <Text className="text-[14px] text-primary">Daily</Text>
          <Text className="text-[11px] leading-[13px] text-primary">▼</Text>
        </Pressable>
      </View>

      <View className="mt-[14px] flex-row">
        <View className="w-[16px] justify-between py-0">
          {Y_TICKS.map((tick) => (
            <Text
              key={tick}
              className="text-[13px] font-semibold leading-[16px] text-primary/75"
            >
              {tick}
            </Text>
          ))}
        </View>
        <View className="ml-[6px] h-[150px] flex-1">
          <View
            className="absolute inset-x-0 top-[8px] justify-between"
            style={styles.gridArea}
          >
            {Y_TICKS.map((tick) => (
              <View key={tick} style={styles.gridLine} />
            ))}
          </View>
          <LineGraph
            animated={false}
            points={points}
            color={dashboardColors.chartLine}
            lineThickness={2}
            range={{ y: { min: 0, max: maxValue } }}
            style={styles.graph}
          />
        </View>
      </View>

      <View className="ml-[22px] mt-[6px] flex-row justify-between">
        {xLabels.map((label) => (
          <Text key={label} className="text-[12px] text-primary/75">
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: "rgba(32, 67, 131, 0.5)",
    borderWidth: StyleSheet.hairlineWidth,
  },
  graph: {
    bottom: 8,
    left: 0,
    position: "absolute",
    right: 0,
    top: 8,
  },
  gridArea: {
    bottom: 8,
    position: "absolute",
  },
  gridLine: {
    backgroundColor: "rgba(32, 67, 131, 0.18)",
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  intervalChip: {
    borderColor: "rgba(32, 67, 131, 0.5)",
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default ShipmentTrendsCard;
