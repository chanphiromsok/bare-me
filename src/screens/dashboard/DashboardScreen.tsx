import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import { Pressable, Text, View } from "react-native";

import AppIcon, { type AppIconName } from "../../components/icons/AppIcon";
import OperationsHeader from "../../components/operations/OperationsHeader";
import StatusPill from "../../components/operations/StatusPill";
import {
  type Activity,
  useActivityQuery,
} from "../../features/operations/queries";
import { colors } from "../../theme";

const metrics = [
  {
    label: "Pending orders",
    value: "12",
    note: "4 need review",
    tone: "warning",
  },
  { label: "Sales today", value: "$1,248", note: "18 orders", tone: "success" },
] as const;

const quickActions: {
  icon: AppIconName;
  label: string;
  supporting: string;
}[] = [
  { icon: "operation", label: "New order", supporting: "Phone or in-store" },
  {
    icon: "self-service",
    label: "Add customer",
    supporting: "Retail or wholesale",
  },
  { icon: "parcel", label: "Add product", supporting: "Create with variants" },
  { icon: "scan", label: "Restock", supporting: "Scan or search SKU" },
];

function ActivityCard({ item }: LegendListRenderItemProps<Activity>) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
        <AppIcon name="history" color={colors.textSubtle} size={19} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">
          {item.title}
        </Text>
        <Text className="mt-0.5 text-xs text-muted">{item.detail}</Text>
      </View>
      <StatusPill
        label={item.status}
        tone={item.status === "Restocked" ? "success" : "warning"}
      />
    </View>
  );
}

function DashboardHeader() {
  return (
    <View className="mb-3 gap-6">
      <View className="flex-row gap-3">
        {metrics.map((metric) => (
          <View
            className="min-h-32 flex-1 justify-between rounded-2xl border border-border bg-surface p-4"
            key={metric.label}
          >
            <Text className="text-[13px] font-medium text-muted">
              {metric.label}
            </Text>
            <Text className="mt-3 text-[28px] font-bold leading-8 text-foreground">
              {metric.value}
            </Text>
            <Text
              className={
                metric.tone === "success"
                  ? "mt-1 text-xs font-semibold text-success"
                  : "mt-1 text-xs font-semibold text-warning"
              }
            >
              {metric.note}
            </Text>
          </View>
        ))}
      </View>

      <View>
        <Text className="text-lg font-bold text-foreground">Quick actions</Text>
        <Text className="mt-1 text-sm text-muted">
          Start the most common store tasks.
        </Text>
        <View className="mt-3 flex-row flex-wrap justify-between gap-y-3">
          {quickActions.map((action) => (
            <Pressable
              accessibilityLabel={`${action.label}. ${action.supporting}`}
              accessibilityRole="button"
              className="w-[48.5%] rounded-2xl border border-border bg-surface p-4 active:bg-primary-soft"
              key={action.label}
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
                <AppIcon name={action.icon} color={colors.primary} size={22} />
              </View>
              <Text className="mt-3 text-[15px] font-bold text-foreground">
                {action.label}
              </Text>
              <Text className="mt-1 text-xs leading-4 text-muted">
                {action.supporting}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="flex-row items-end justify-between">
        <View>
          <Text className="text-lg font-bold text-foreground">
            Recent activity
          </Text>
          <Text className="mt-1 text-sm text-muted">
            Latest changes across the store.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className="min-h-11 justify-center px-1"
        >
          <Text className="text-sm font-semibold text-primary">View all</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const activityQuery = useActivityQuery();

  return (
    <View className="flex-1 bg-background pt-safe">
      <OperationsHeader
        eyebrow="Monday, 13 July"
        title="Good morning, Phirom"
        subtitle="Here is what needs attention today."
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20 }}
        data={activityQuery.data ?? []}
        estimatedItemSize={78}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<DashboardHeader />}
        recycleItems
        renderItem={(props) => <ActivityCard {...props} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
