import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import AppIcon, { type AppIconName } from "../../../components/icons/AppIcon";
import { dashboardColors } from "./dashboardColors";

export type StatItem = {
  label: string;
  value: string;
  delta: string;
  direction: "up" | "down";
  sentiment: "good" | "bad";
  icon: AppIconName;
  iconColor: string;
  iconBackground: string;
};

const StatCard = memo(function StatCard({ item }: { item: StatItem }) {
  const deltaColor =
    item.sentiment === "good"
      ? dashboardColors.deltaUp
      : dashboardColors.deltaDown;
  return (
    <View
      className="h-[140px] justify-center rounded-[14px] bg-white px-[15px] py-[10px]"
      style={styles.card}
    >
      <View
        className="h-[37px] w-[37px] items-center justify-center rounded-full"
        style={{ backgroundColor: item.iconBackground }}
      >
        <AppIcon name={item.icon} color={item.iconColor} size={19} />
      </View>
      <Text
        className="mt-[11px] text-[12px] font-semibold text-primary/75"
        numberOfLines={1}
      >
        {item.label}
      </Text>
      <Text
        className="mt-0.5 text-[22px] font-semibold leading-[26px] text-primary"
        numberOfLines={1}
      >
        {item.value}
      </Text>
      <View className="mt-1 flex-row items-center gap-[7px]">
        <Text
          className="text-[13px] font-medium leading-[15px]"
          style={{ color: deltaColor }}
        >
          {item.direction === "up" ? "↑" : "↓"}
        </Text>
        <Text
          className="text-[12px] font-medium"
          style={{ color: deltaColor }}
        >
          {item.delta}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: "rgba(32, 67, 131, 0.5)",
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default StatCard;
