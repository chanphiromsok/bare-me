import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import { useAtom } from "jotai";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import AppIcon from "../../components/icons/AppIcon";
import SearchField from "../../components/operations/SearchField";
import StatusPill from "../../components/operations/StatusPill";
import PagerStickyHeader from "../../components/pager/PagerStickyHeader";
import {
  orderFilterAtom,
  type OrderFilter,
} from "../../features/operations/filters";
import {
  type Order,
  useOrderListQuery,
} from "../../features/operations/orderListQuery";
import { colors } from "../../theme/colors";
import type { OrdersStackParamList } from "../../navigation/ordersStack";

type OrdersNavigation = NativeStackNavigationProp<
  OrdersStackParamList,
  "OrderList"
>;

const filters: { label: string; value: OrderFilter }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Preorders", value: "preorder" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Returned", value: "returned" },
  { label: "Cancelled", value: "cancelled" },
];

type OrderCardProps = LegendListRenderItemProps<Order> & {
  onPress: (orderId: string) => void;
};

type OrderListPageProps = {
  errorMessage?: string;
  isError: boolean;
  isPending: boolean;
  onOpenOrder: (orderId: string) => void;
  onRetry: () => void;
  orders: Order[];
  search: string;
};

function filterOrders(
  orders: Order[],
  filter: OrderFilter,
  search: string,
): Order[] {
  const term = search.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesStatus =
      filter === "all" ||
      (filter === "preorder"
        ? order.orderKind === "preorder"
        : order.status.toLowerCase() === filter);
    const matchesSearch =
      !term ||
      order.number.toLowerCase().includes(term) ||
      order.customer.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });
}

function OrderCard({ item: order, onPress }: OrderCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open order ${order.number}`}
      className="rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
      onPress={() => onPress(order.id)}
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
            {order.orderKind === "preorder" ? (
              <Text className="mt-1 text-xs font-bold uppercase text-warning">
                Preorder
              </Text>
            ) : null}
          </View>
        </View>
        <StatusPill
          label={order.status}
          tone={
            order.status === "Fulfilled"
              ? "success"
              : order.status === "Returned" || order.status === "Cancelled"
                ? "neutral"
                : "warning"
          }
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

function OrderListPage({
  errorMessage,
  isError,
  isPending,
  onOpenOrder,
  onRetry,
  orders,
  search,
}: OrderListPageProps) {
  const emptyState = isPending ? (
    <View className="rounded-2xl border border-border bg-surface p-6">
      <Text className="text-center text-sm text-muted">Loading orders…</Text>
    </View>
  ) : isError ? (
    <View className="items-center rounded-2xl border border-border bg-surface p-6">
      <Text className="text-center text-sm font-semibold text-foreground">
        Orders could not be loaded
      </Text>
      <Text className="mt-1 text-center text-sm text-muted">
        {errorMessage}
      </Text>
      <Pressable
        accessibilityRole="button"
        className="mt-4 min-h-11 justify-center rounded-full bg-primary px-5 active:bg-primary-pressed"
        onPress={onRetry}
      >
        <Text className="text-sm font-semibold text-on-primary">Try again</Text>
      </Pressable>
    </View>
  ) : (
    <View className="rounded-2xl border border-border bg-surface p-6">
      <Text className="text-center text-sm text-muted">
        No orders match this status or search.
      </Text>
    </View>
  );

  return (
    <LegendList
      contentContainerStyle={{
        paddingBottom: 112,
        paddingHorizontal: 20,
        paddingTop: 16,
      }}
      data={orders}
      estimatedItemSize={124}
      extraData={search}
      ItemSeparatorComponent={() => <View className="h-3" />}
      keyExtractor={(order) => order.id}
      ListEmptyComponent={emptyState}
      recycleItems
      renderItem={(props) => <OrderCard {...props} onPress={onOpenOrder} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default function OrdersScreen() {
  const navigation = useNavigation<OrdersNavigation>();
  const [filter, setFilter] = useAtom(orderFilterAtom);
  const [search, setSearch] = useState("");
  const ordersQuery = useOrderListQuery("all");
  const activeIndex = Math.max(
    filters.findIndex((item) => item.value === filter),
    0,
  );
  const openOrder = (orderId: string) =>
    navigation.navigate("OrderDetail", { orderId });

  return (
    <View className="flex-1 bg-background pt-safe">
      <PagerStickyHeader
        activeIndex={activeIndex}
        items={filters}
        onIndexChange={(index) => setFilter(filters[index]?.value ?? "all")}
        renderHeader={() => (
          <View className="px-5 pb-2 pt-2">
            <SearchField
              onChangeText={setSearch}
              placeholder="Search order or customer"
              showFilterIcon={false}
              value={search}
            />
          </View>
        )}
      >
        {filters.map((item, index) => (
          <View className="flex-1" key={item.value}>
            {Math.abs(index - activeIndex) <= 1 ? (
              <OrderListPage
                errorMessage={ordersQuery.error?.message}
                isError={ordersQuery.isError}
                isPending={ordersQuery.isPending}
                onOpenOrder={openOrder}
                onRetry={() => ordersQuery.refetch()}
                orders={filterOrders(
                  ordersQuery.data ?? [],
                  item.value,
                  search,
                )}
                search={search}
              />
            ) : null}
          </View>
        ))}
      </PagerStickyHeader>
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
