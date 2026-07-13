import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import { useAtom } from "jotai";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";

import AppIcon from "../../components/icons/AppIcon";
import OperationsHeader from "../../components/operations/OperationsHeader";
import SearchField from "../../components/operations/SearchField";
import StatusPill from "../../components/operations/StatusPill";
import {
  orderFilterAtom,
  type OrderFilter,
} from "../../features/operations/filters";
import { type Order, useOrdersQuery } from "../../features/operations/queries";
import { colors } from "../../theme";
import type { OrdersStackParamList } from "../../navigation/ordersStack";

type OrdersNavigation = NativeStackNavigationProp<
  OrdersStackParamList,
  "OrderList"
>;

const filters: { label: string; value: OrderFilter }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Fulfilled", value: "fulfilled" },
];

function OrderCard({ item: order }: LegendListRenderItemProps<Order>) {
  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
            <AppIcon name="operation" color={colors.primary} size={21} />
          </View>
          <View>
            <Text className="text-base font-bold text-foreground">
              Order {order.number}
            </Text>
            <Text className="mt-0.5 text-sm text-muted">{order.customer}</Text>
          </View>
        </View>
        <StatusPill
          label={order.status}
          tone={order.status === "Fulfilled" ? "success" : "warning"}
        />
      </View>
      <View className="mt-4 flex-row items-center justify-between border-t border-border pt-3">
        <Text className="text-sm text-muted">{order.items}</Text>
        <Text className="text-base font-bold text-foreground">
          {order.total}
        </Text>
      </View>
    </Pressable>
  );
}

export default function OrdersScreen() {
  const navigation = useNavigation<OrdersNavigation>();
  const [filter, setFilter] = useAtom(orderFilterAtom);
  const ordersQuery = useOrdersQuery(filter);

  const emptyState = ordersQuery.isPending ? (
    <View className="rounded-2xl border border-border bg-surface p-6">
      <Text className="text-center text-sm text-muted">Loading orders…</Text>
    </View>
  ) : ordersQuery.isError ? (
    <View className="items-center rounded-2xl border border-border bg-surface p-6">
      <Text className="text-center text-sm font-semibold text-foreground">
        Orders could not be loaded
      </Text>
      <Text className="mt-1 text-center text-sm text-muted">
        {ordersQuery.error.message}
      </Text>
      <Pressable
        accessibilityRole="button"
        className="mt-4 min-h-11 justify-center rounded-full bg-primary px-5 active:bg-primary-pressed"
        onPress={() => ordersQuery.refetch()}
      >
        <Text className="text-sm font-semibold text-on-primary">Try again</Text>
      </Pressable>
    </View>
  ) : (
    <View className="rounded-2xl border border-border bg-surface p-6">
      <Text className="text-center text-sm text-muted">
        No orders match this filter.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background pt-safe">
      <OperationsHeader
        title="Orders"
        subtitle="Review, confirm, pay, and fulfill orders."
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20 }}
        data={ordersQuery.data ?? []}
        estimatedItemSize={124}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(order) => order.number}
        ListEmptyComponent={emptyState}
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <SearchField placeholder="Search order or customer" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {filters.map((item) => {
                  const selected = filter === item.value;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      className={
                        selected
                          ? "min-h-11 justify-center rounded-full bg-primary px-4"
                          : "min-h-11 justify-center rounded-full border border-border bg-surface px-4"
                      }
                      key={item.value}
                      onPress={() => setFilter(item.value)}
                    >
                      <Text
                        className={
                          selected
                            ? "text-sm font-semibold text-on-primary"
                            : "text-sm font-semibold text-subtle"
                        }
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        }
        maintainVisibleContentPosition
        recycleItems
        renderItem={(props) => <OrderCard {...props} />}
        showsVerticalScrollIndicator={false}
      />
      <Pressable
        accessibilityLabel="Create new order"
        accessibilityRole="button"
        className="absolute bottom-safe-offset-5 right-5 h-14 flex-row items-center gap-2 rounded-full bg-primary px-5 active:bg-primary-pressed"
        onPress={() => navigation.navigate("NewOrder")}
      >
        <AppIcon name="operation" color={colors.textOnPrimary} size={21} />
        <Text className="text-[15px] font-bold text-on-primary">New order</Text>
      </Pressable>
    </View>
  );
}
