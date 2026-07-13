import { Text, View } from "react-native";
import dayjs from "dayjs";
import { type GraphPoint } from "react-native-graph";

import BranchFilterRow from "./components/BranchFilterRow";
import { dashboardColors } from "./components/dashboardColors";
import DateRangeField from "./components/DateRangeField";
import ShipmentTrendsCard from "./components/ShipmentTrendsCard";
import StatCard, { type StatItem } from "./components/StatCard";
import BrandLogo from "../../components/BrandLogo";
import { LazyScrollView } from "../../components/scroll/LazyScrollView";

const STATS: StatItem[] = [
  {
    label: "Total Shipments",
    value: "120",
    delta: "-95.32%",
    direction: "down",
    sentiment: "bad",
    icon: "shipment-box",
    iconColor: dashboardColors.shipmentsIcon,
    iconBackground: dashboardColors.shipmentsIconBg,
  },
  {
    label: "Total Revenue",
    value: "KHR 1,065,000",
    delta: "+12.48%",
    direction: "up",
    sentiment: "good",
    icon: "dollar-circle",
    iconColor: dashboardColors.revenueIcon,
    iconBackground: dashboardColors.revenueIconBg,
  },
  {
    label: "Delivered",
    value: "42",
    delta: "+8.75%",
    direction: "up",
    sentiment: "good",
    icon: "delivered-check",
    iconColor: dashboardColors.deliveredIcon,
    iconBackground: dashboardColors.deliveredIconBg,
  },
  {
    label: "Pending Void Requests",
    value: "KHR 1,065,000",
    delta: "+100.00%",
    direction: "up",
    sentiment: "bad",
    icon: "void-doc",
    iconColor: dashboardColors.voidIcon,
    iconBackground: dashboardColors.voidIconBg,
  },
];

const TREND_VALUES = [
  0.75, 0.9, 1.6, 2.3, 2.5, 2.4, 2.35, 2.5, 2.9, 3.15, 3.2, 3.1, 3.05, 3.25,
  3.35, 3.4,
];

const TREND_POINTS: GraphPoint[] = TREND_VALUES.map((value, index) => ({
  value,
  date: dayjs("2026-07-06").add(index * 6, "hour").toDate(),
}));

const TREND_X_LABELS = ["Jul 06", "Jul 07", "Jul 08", "Jul 09"];

const TODAY = dayjs().format("YYYY-MM-DD");

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-surface-muted pt-safe">
      <View className="px-5">
        <BrandLogo />
      </View>
      <LazyScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-28"
        showsVerticalScrollIndicator={false}
        recycleItems
      >
        <Text className="text-[16px] font-bold text-primary">DashBoard</Text>

        <View className="mt-[7px] w-[78%]">
          <DateRangeField range={{ from: TODAY, to: TODAY }} />
        </View>

        <View className="mt-[10px]">
          <BranchFilterRow branch="All Branch" />
        </View>

        <View className="mt-[10px] gap-[14px]">
          <View className="flex-row gap-[11px]">
            <View className="flex-[176]">
              <StatCard item={STATS[0]} />
            </View>
            <View className="flex-[203]">
              <StatCard item={STATS[1]} />
            </View>
          </View>
          <View className="flex-row gap-[11px]">
            <View className="flex-[176]">
              <StatCard item={STATS[2]} />
            </View>
            <View className="flex-[203]">
              <StatCard item={STATS[3]} />
            </View>
          </View>
        </View>

        <View className="mt-[13px]">
          <ShipmentTrendsCard
            points={TREND_POINTS}
            xLabels={TREND_X_LABELS}
          />
        </View>
      </LazyScrollView>
    </View>
  );
}
