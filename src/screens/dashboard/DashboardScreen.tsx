import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";
import { Pressable, Text, View } from "react-native";

import AppIcon, { type AppIconName } from "../../components/icons/AppIcon";
import OperationsHeader from "../../components/operations/OperationsHeader";
import StatusPill from "../../components/operations/StatusPill";
import {
  type DashboardActivity,
  type DashboardSummary,
  useDashboardQuery,
} from "../../features/operations/dashboardQuery";
import { useAuthUser } from "../../storage/authUserStore";
import { colors } from "../../theme/colors";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
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
  supporting: string;
  route: "NewCustomer" | "NewOrder" | "NewProduct" | "Restock";
}[] = [
  {
    icon: "operation",
    label: "New order",
    route: "NewOrder",
    supporting: "Phone or in-store",
  },
  {
    icon: "self-service",
    label: "Add customer",
    route: "NewCustomer",
    supporting: "Retail or wholesale",
  },
  {
    icon: "parcel",
    label: "Add product",
    route: "NewProduct",
    supporting: "Create with variants",
  },
  {
    icon: "scan",
    label: "Restock",
    route: "Restock",
    supporting: "Scan or search SKU",
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

function DashboardHeader({
  dashboard,
  onNavigate,
  onViewAll,
}: {
  dashboard?: DashboardSummary;
  onNavigate: (route: (typeof quickActions)[number]["route"]) => void;
  onViewAll: () => void;
}) {
  const pendingOrders = dashboard?.pendingOrders ?? 0;
  const salesTodayOrders = dashboard?.salesTodayOrders ?? 0;
  const metrics = [
    {
      label: "Pending orders",
      value: String(pendingOrders),
      note: `${pendingOrders} ${pendingOrders === 1 ? "needs" : "need"} review`,
      tone: "warning",
    },
    {
      label: "Sales today",
      value: currencyFormatter.format((dashboard?.salesTodayCents ?? 0) / 100),
      note: `${salesTodayOrders} ${salesTodayOrders === 1 ? "order" : "orders"}`,
      tone: "success",
    },
  ] as const;

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
              onPress={() => onNavigate(action.route)}
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
          onPress={onViewAll}
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
          Loading recent activity…
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center rounded-2xl border border-border bg-surface px-5 py-6">
        <Text className="text-sm font-semibold text-foreground">
          Could not load recent activity
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

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [user] = useAuthUser();
  const dashboardQuery = useDashboardQuery();
  const rootNavigation = navigation.getParent<NavigationProp<ParamListBase>>();
  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  const firstName = user?.name.trim().split(/\s+/)[0] || "there";

  return (
    <View className="flex-1 bg-background pt-safe">
      <OperationsHeader
        eyebrow={dateFormatter.format(now)}
        title={`${greeting}, ${firstName}`}
        subtitle="Here is what needs attention today."
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20 }}
        data={dashboardQuery.data?.activity ?? []}
        estimatedItemSize={78}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <DashboardHeader
            dashboard={dashboardQuery.data}
            onNavigate={(route) => rootNavigation?.navigate(route)}
            onViewAll={() =>
              navigation.navigate("Orders", { screen: "OrderList" })
            }
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
        renderItem={(props) => (
          <ActivityCard
            {...props}
            onPress={(orderId) =>
              navigation.navigate("Orders", {
                initial: false,
                params: { orderId },
                screen: "OrderDetail",
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
