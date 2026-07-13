import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import { Text, View } from "react-native";

import {
  type OrderDetail,
  useOrderDetailQuery,
} from "../../api/orders/queries";
import AppIcon from "../../components/icons/AppIcon";
import StatusPill from "../../components/operations/StatusPill";
import TaskHeader from "../../components/operations/TaskHeader";
import type { OrdersStackParamList } from "../../navigation/ordersStack";
import { colors } from "../../theme/colors";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

type DetailRoute = RouteProp<OrdersStackParamList, "OrderDetail">;
type DetailItem = OrderDetail["items"][number];

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function formatDate(value?: string) {
  if (!value) return "Not recorded";

  return dateFormatter.format(new Date(value));
}

function statusTone(status: OrderDetail["status"]) {
  if (status === "fulfilled") return "success" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "draft") return "neutral" as const;
  return "warning" as const;
}

function ItemCard({ item }: LegendListRenderItemProps<DetailItem>) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
        <AppIcon name="parcel" color={colors.primary} size={22} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-foreground">
          {item.sku}
        </Text>
        <Text className="mt-1 text-xs text-muted">
          {item.size} · {item.color} · {formatCurrency(item.unitPriceCents)}{" "}
          each
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-sm font-semibold text-muted">
          × {item.quantity}
        </Text>
        <Text className="mt-1 text-base font-bold text-foreground">
          {formatCurrency(item.totalCents)}
        </Text>
      </View>
    </View>
  );
}

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<DetailRoute>();
  const orderQuery = useOrderDetailQuery(route.params.orderId);
  const order = orderQuery.data;

  return (
    <View className="flex-1 bg-background">
      <TaskHeader
        onBack={() => navigation.goBack()}
        subtitle="Customer, items, payment, and order timeline."
        title={order ? `Order #${order.number}` : "Order details"}
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 48, paddingHorizontal: 20 }}
        data={order?.items ?? []}
        estimatedItemSize={92}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="rounded-2xl border border-border bg-surface p-6">
            <Text className="text-center text-sm text-muted">
              {orderQuery.isPending
                ? "Loading order details…"
                : orderQuery.isError
                  ? orderQuery.error.message
                  : "This order has no line items."}
            </Text>
          </View>
        }
        ListHeaderComponent={
          order ? (
            <View className="mb-5 gap-4 pt-5">
              <View className="rounded-2xl border border-border bg-surface p-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-xs font-bold uppercase tracking-[1px] text-subtle">
                      Customer
                    </Text>
                    <Text className="mt-2 text-lg font-bold text-foreground">
                      {order.customer.name}
                    </Text>
                    <Text className="mt-1 text-sm text-muted">
                      {order.customer.contact}
                    </Text>
                  </View>
                  <StatusPill
                    label={order.status}
                    tone={statusTone(order.status)}
                  />
                </View>
              </View>
              <Text className="text-xs font-bold uppercase tracking-[1px] text-subtle">
                Items · {order.items.length}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          order ? (
            <View className="mt-5 gap-4">
              <View className="rounded-2xl border border-border bg-surface p-4">
                <Text className="text-xs font-bold uppercase tracking-[1px] text-subtle">
                  Payment summary
                </Text>
                <View className="mt-4 gap-3">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Subtotal</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {formatCurrency(order.subtotalCents)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Discount</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      −{formatCurrency(order.discountCents)}
                    </Text>
                  </View>
                  <View className="h-px bg-border" />
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-bold text-foreground">
                      Total
                    </Text>
                    <Text className="text-xl font-bold text-primary">
                      {formatCurrency(order.totalCents)}
                    </Text>
                  </View>
                  <Text className="text-xs font-semibold uppercase text-success">
                    {order.paymentState.replace("_", " ")}
                    {order.payments.length > 0
                      ? ` · ${order.payments
                          .filter((payment) => !payment.voided)
                          .map((payment) => payment.method.replace("_", " "))
                          .join(", ")}`
                      : ""}
                  </Text>
                </View>
              </View>
              <View className="rounded-2xl border border-border bg-surface p-4">
                <Text className="text-xs font-bold uppercase tracking-[1px] text-subtle">
                  Timeline
                </Text>
                <Text className="mt-3 text-sm text-muted">
                  Placed · {formatDate(order.placedAt)}
                </Text>
                <Text className="mt-2 text-sm text-muted">
                  Fulfilled · {formatDate(order.fulfilledAt)}
                </Text>
                {order.cancelReason ? (
                  <Text className="mt-2 text-sm text-danger">
                    Cancelled · {order.cancelReason}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null
        }
        recycleItems
        renderItem={(props) => <ItemCard {...props} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
