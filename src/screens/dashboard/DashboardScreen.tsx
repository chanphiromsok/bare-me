import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import AppIcon, { type AppIconName } from "../../components/icons/AppIcon";
import OperationsHeader from "../../components/operations/OperationsHeader";
import StatusPill from "../../components/operations/StatusPill";
import {
  dashboardRanges,
  type DashboardActivity,
  type DashboardRange,
  type DashboardSummary,
  useDashboardQuery,
} from "../../features/operations/dashboardQuery";
import { useAuthUser } from "../../storage/authUserStore";
import { colors } from "../../theme/colors";
import SalesTrendChart from "./components/SalesTrendChart";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  notation: "compact",
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  weekday: "long",
});

const quickActions: {
  icon: AppIconName;
  label: string;
  route: "NewCustomer" | "NewOrder" | "NewProduct" | "Restock";
  supporting: string;
}[] = [
  {
    icon: "operation",
    label: "Order",
    route: "NewOrder",
    supporting: "Create a new order",
  },
  {
    icon: "self-service",
    label: "Customer",
    route: "NewCustomer",
    supporting: "Add a customer",
  },
  {
    icon: "parcel",
    label: "Product",
    route: "NewProduct",
    supporting: "Add a product",
  },
  {
    icon: "scan",
    label: "Restock",
    route: "Restock",
    supporting: "Restock inventory",
  },
];

type ActivityCardProps = LegendListRenderItemProps<DashboardActivity> & {
  onPress: (orderId: string) => void;
};

function ActivityCard({ item, onPress }: ActivityCardProps) {
  const tone =
    item.status === "Fulfilled"
      ? "success"
      : item.status === "Cancelled"
        ? "danger"
        : item.status === "Draft"
          ? "neutral"
          : "warning";

  return (
    <Pressable
      accessibilityLabel={`Open ${item.title}`}
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
      onPress={() => onPress(item.orderId)}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
        <AppIcon name="history" color={colors.textSubtle} size={19} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">
          {item.title}
        </Text>
        <Text className="mt-0.5 text-xs text-muted">{item.detail}</Text>
      </View>
      <StatusPill label={item.status} tone={tone} />
    </Pressable>
  );
}

function PeriodFilter({
  disabled,
  onChange,
  value,
}: {
  disabled: boolean;
  onChange: (range: DashboardRange) => void;
  value: DashboardRange;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-lg font-bold text-foreground">
          Sales overview
        </Text>
        <Text className="mt-0.5 text-xs text-muted">Fulfilled orders only</Text>
      </View>
      <View className="flex-row gap-1 rounded-xl bg-surface-muted p-1">
        {dashboardRanges.map((range) => {
          const selected = range.key === value;

          return (
            <Pressable
              accessibilityLabel={`Show sales for ${range.label}`}
              accessibilityRole="button"
              accessibilityState={{ disabled, selected }}
              className={
                selected
                  ? "min-h-11 min-w-12 items-center justify-center rounded-lg border border-border bg-surface px-2"
                  : "min-h-11 min-w-12 items-center justify-center rounded-lg px-2 active:bg-surface"
              }
              disabled={disabled}
              key={range.key}
              onPress={() => onChange(range.key)}
            >
              <Text
                className={
                  selected
                    ? "text-xs font-bold text-primary"
                    : "text-xs font-semibold text-muted"
                }
              >
                {range.shortLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-h-20 flex-1 justify-center rounded-2xl bg-surface-muted px-3 py-3">
      <Text className="text-[11px] font-semibold uppercase tracking-[0.5px] text-muted">
        {label}
      </Text>
      <Text
        className="mt-1.5 text-lg font-bold text-foreground"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function SalesCard({
  dashboard,
  loading,
  range,
}: {
  dashboard?: DashboardSummary;
  loading: boolean;
  range: DashboardRange;
}) {
  const salesCents = dashboard?.salesCents ?? 0;
  const previousSalesCents = dashboard?.previousSalesCents ?? 0;
  const salesIncreased = salesCents >= previousSalesCents;
  const change =
    previousSalesCents > 0
      ? Math.round(
          ((salesCents - previousSalesCents) / previousSalesCents) * 100,
        )
      : undefined;
  const points = dashboard?.salesPoints ?? [];
  const axisLabels = points.length
    ? [points[0], points[Math.floor((points.length - 1) / 2)], points.at(-1)]
    : [];
  const rangeLabel =
    dashboardRanges.find((candidate) => candidate.key === range)?.label ??
    "7 days";
  const totalLabel = loading
    ? "Loading sales"
    : `${currencyFormatter.format(salesCents / 100)} in fulfilled sales over ${rangeLabel}`;

  return (
    <View
      className="rounded-3xl border border-border bg-surface p-4"
      style={styles.salesCard}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs font-semibold text-muted">Net sales</Text>
          <Text className="mt-1 text-[30px] font-bold leading-9 text-foreground">
            {loading ? "—" : currencyFormatter.format(salesCents / 100)}
          </Text>
        </View>
        <View
          className={
            salesIncreased
              ? "rounded-full bg-green-50 px-2.5 py-1.5"
              : "rounded-full bg-red-50 px-2.5 py-1.5"
          }
        >
          <Text
            className={
              salesIncreased
                ? "text-xs font-bold text-success"
                : "text-xs font-bold text-danger"
            }
          >
            {change === undefined
              ? "No prior sales"
              : `${change >= 0 ? "↑" : "↓"} ${Math.abs(change)}%`}
          </Text>
        </View>
      </View>
      <Text className="mt-0.5 text-xs text-muted">
        Compared with the previous period
      </Text>

      <View className="mt-2">
        <SalesTrendChart
          accessibilityLabel={totalLabel}
          loading={loading}
          points={points}
        />
      </View>
      <View className="mt-1 flex-row justify-between">
        {axisLabels.map((point) => (
          <Text
            className="text-[11px] font-medium text-muted"
            key={point?.time}
          >
            {point?.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function DashboardHeader({
  dashboard,
  loading,
  onNavigate,
  onOpenOrders,
  onRangeChange,
  range,
  updating,
}: {
  dashboard?: DashboardSummary;
  loading: boolean;
  onNavigate: (route: (typeof quickActions)[number]["route"]) => void;
  onOpenOrders: () => void;
  onRangeChange: (range: DashboardRange) => void;
  range: DashboardRange;
  updating: boolean;
}) {
  const pendingOrders = dashboard?.pendingOrders ?? 0;

  return (
    <View className="mb-4 gap-5">
      <View className="gap-3">
        <PeriodFilter
          disabled={updating}
          onChange={onRangeChange}
          value={range}
        />
        <SalesCard dashboard={dashboard} loading={loading} range={range} />
      </View>

      <View className="flex-row gap-2">
        <MetricTile
          label="Orders"
          value={String(dashboard?.fulfilledOrders ?? 0)}
        />
        <MetricTile
          label="Average"
          value={compactCurrencyFormatter.format(
            (dashboard?.averageOrderCents ?? 0) / 100,
          )}
        />
        <MetricTile
          label="Unpaid"
          value={compactCurrencyFormatter.format(
            (dashboard?.outstandingCents ?? 0) / 100,
          )}
        />
      </View>

      {pendingOrders > 0 ? (
        <Pressable
          accessibilityLabel={`${pendingOrders} pending ${pendingOrders === 1 ? "order needs" : "orders need"} review. Open orders.`}
          accessibilityRole="button"
          className="min-h-12 flex-row items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 active:opacity-70"
          onPress={onOpenOrders}
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
            <AppIcon name="history" color={colors.warning} size={18} />
          </View>
          <Text className="flex-1 text-sm font-semibold text-foreground">
            {pendingOrders} pending{" "}
            {pendingOrders === 1 ? "order needs" : "orders need"} review
          </Text>
          <Text className="text-lg text-warning">›</Text>
        </Pressable>
      ) : null}

      <View>
        <Text className="text-lg font-bold text-foreground">Quick actions</Text>
        <View className="mt-3 flex-row gap-2">
          {quickActions.map((action) => (
            <Pressable
              accessibilityLabel={`${action.label}. ${action.supporting}`}
              accessibilityRole="button"
              className="min-h-20 flex-1 items-center justify-center rounded-2xl border border-border bg-surface px-1.5 py-2 active:bg-primary-soft"
              key={action.label}
              onPress={() => onNavigate(action.route)}
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
                <AppIcon name={action.icon} color={colors.primary} size={20} />
              </View>
              <Text className="mt-2 text-center text-[11px] font-bold text-foreground">
                {action.label}
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
          <Text className="mt-0.5 text-xs text-muted">
            Latest order changes
          </Text>
        </View>
        <Pressable
          accessibilityLabel="View all orders"
          accessibilityRole="button"
          className="min-h-11 justify-center px-1"
          onPress={onOpenOrders}
        >
          <Text className="text-sm font-semibold text-primary">View all</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ActivityEmptyState({
  error,
  loading,
  onRetry,
}: {
  error: boolean;
  loading: boolean;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <View className="items-center rounded-2xl border border-border bg-surface px-5 py-7">
        <Text className="text-sm font-medium text-muted">
          Loading dashboard…
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center rounded-2xl border border-border bg-surface px-5 py-6">
        <Text className="text-sm font-semibold text-foreground">
          Could not load dashboard
        </Text>
        <Pressable
          accessibilityRole="button"
          className="mt-2 min-h-11 justify-center px-4"
          onPress={onRetry}
        >
          <Text className="text-sm font-semibold text-primary">Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="items-center rounded-2xl border border-border bg-surface px-5 py-7">
      <Text className="text-sm font-medium text-muted">
        No order activity yet.
      </Text>
    </View>
  );
}

function ActivitySeparator() {
  return <View className="h-3" />;
}

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [user] = useAuthUser();
  const [range, setRange] = useState<DashboardRange>("7d");
  const dashboardQuery = useDashboardQuery(range);
  const rootNavigation = navigation.getParent<NavigationProp<ParamListBase>>();
  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  const firstName = user?.name.trim().split(/\s+/)[0] || "there";
  const openOrders = () => {
    navigation.navigate("Orders", { screen: "OrderList" });
  };
  const openActivity = (orderId: string) => {
    navigation.navigate("Orders", {
      initial: false,
      params: { orderId },
      screen: "OrderDetail",
    });
  };
  const renderActivity = (
    props: LegendListRenderItemProps<DashboardActivity>,
  ) => <ActivityCard {...props} onPress={openActivity} />;

  return (
    <View className="flex-1 bg-background pt-safe">
      <OperationsHeader
        eyebrow={dateFormatter.format(now)}
        title={`${greeting}, ${firstName}`}
        subtitle="Your store performance at a glance."
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20 }}
        data={dashboardQuery.data?.activity ?? []}
        estimatedItemSize={78}
        ItemSeparatorComponent={ActivitySeparator}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <DashboardHeader
            dashboard={dashboardQuery.data}
            loading={dashboardQuery.isPending && !dashboardQuery.data}
            onNavigate={(route) => rootNavigation?.navigate(route)}
            onOpenOrders={openOrders}
            onRangeChange={setRange}
            range={range}
            updating={dashboardQuery.isFetching}
          />
        }
        ListEmptyComponent={
          <ActivityEmptyState
            error={dashboardQuery.isError}
            loading={dashboardQuery.isPending}
            onRetry={() => void dashboardQuery.refetch()}
          />
        }
        recycleItems
        renderItem={renderActivity}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  salesCard: {
    boxShadow: "0 2px 8px rgba(20, 32, 51, 0.08)",
  },
});
