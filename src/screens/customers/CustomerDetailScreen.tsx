import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type ParamListBase,
  type RouteProp,
} from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import StatusPill from "../../components/operations/StatusPill";
import TaskHeader from "../../components/operations/TaskHeader";
import {
  type CustomerActivityPoint,
  type CustomerOrder,
  type CustomerSummary,
  useCustomerDetailQuery,
} from "../../features/operations/customerQueries";
import type { CustomersStackParamList } from "../../navigation/customersStack";
import { colors } from "../../theme/colors";
import CustomerActivityChart from "./components/CustomerActivityChart";

type DetailRoute = RouteProp<CustomersStackParamList, "CustomerDetail">;

type DetailListItem =
  | { id: string; kind: "history"; order: CustomerOrder }
  | { id: string; kind: "invoice"; order: CustomerOrder }
  | { id: string; kind: "section"; subtitle: string; title: string };

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

function statusTone(status: CustomerOrder["status"]) {
  if (status === "Fulfilled") return "success" as const;
  if (status === "Cancelled" || status === "Returned")
    return "neutral" as const;
  return "warning" as const;
}

function openOrder(orderId: string, navigation: NavigationProp<ParamListBase>) {
  navigation.getParent()?.navigate("Orders", {
    screen: "OrderDetail",
    params: { orderId },
    initial: false,
  });
}

function OrderCard({
  item,
}: LegendListRenderItemProps<
  Extract<DetailListItem, { kind: "history" | "invoice" }>
>) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { order } = item;
  const invoice = item.kind === "invoice";

  return (
    <Pressable
      accessibilityLabel={
        invoice
          ? `Open invoice ${order.number}, ${order.balance} remaining`
          : `Open order ${order.number}`
      }
      accessibilityRole="button"
      className={
        invoice
          ? "rounded-2xl border border-amber-200 bg-amber-50 p-4 active:opacity-70"
          : "rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
      }
      onPress={() => openOrder(order.id, navigation)}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-foreground">
            Order {order.number}
          </Text>
          <Text className="mt-1 text-xs font-medium text-muted">
            {order.date}
          </Text>
        </View>
        <StatusPill label={order.status} tone={statusTone(order.status)} />
      </View>

      {invoice ? (
        <View className="mt-4 flex-row items-end justify-between gap-3">
          <View>
            <Text className="text-xs font-semibold text-warning">
              Remaining
            </Text>
            <Text className="mt-1 text-xl font-bold text-foreground">
              {order.balance}
            </Text>
          </View>
          <Text className="pb-0.5 text-right text-xs font-medium text-muted">
            Paid {currencyFormatter.format(order.paidCents / 100)} of{" "}
            {order.total}
          </Text>
        </View>
      ) : (
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-sm font-bold text-foreground">
            {order.total}
          </Text>
          <Text className="text-xs font-semibold text-muted">
            {order.paymentState === "partially_paid"
              ? `${order.balance} remaining`
              : order.paymentState === "paid"
                ? "Paid"
                : "Unpaid"}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function SectionHeader({
  item,
}: LegendListRenderItemProps<Extract<DetailListItem, { kind: "section" }>>) {
  return (
    <View className="pb-1 pt-2">
      <Text className="text-lg font-bold text-foreground">{item.title}</Text>
      <Text className="mt-0.5 text-xs text-muted">{item.subtitle}</Text>
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

function CustomerHeader({
  activity,
  customer,
  invoiceCount,
  totalPaidCents,
  totalPurchasedCents,
  totalUnpaidCents,
}: {
  activity: CustomerActivityPoint[];
  customer: CustomerSummary;
  invoiceCount: number;
  totalPaidCents: number;
  totalPurchasedCents: number;
  totalUnpaidCents: number;
}) {
  const axisLabels = activity.length
    ? [
        activity[0],
        activity[Math.floor((activity.length - 1) / 2)],
        activity.at(-1),
      ]
    : [];
  const chartLabel = `${customer.name} purchased ${currencyFormatter.format(totalPurchasedCents / 100)} and paid ${currencyFormatter.format(totalPaidCents / 100)}`;

  return (
    <View className="mb-3 gap-4">
      <View className="rounded-2xl border border-border bg-surface p-4">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-xs font-bold uppercase tracking-[1px] text-subtle">
            {customer.type} customer
          </Text>
          <StatusPill
            label={customer.confirmed ? "Confirmed" : "Needs approval"}
            tone={customer.confirmed ? "success" : "warning"}
          />
        </View>
        {customer.businessName ? (
          <Text className="mt-3 text-sm text-muted">
            Contact: {customer.contactName}
          </Text>
        ) : null}
        <Text className="mt-3 text-sm text-muted">
          {customer.phone ?? customer.email ?? "No contact details"}
        </Text>
      </View>

      <View className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
        <Text className="text-xs font-bold uppercase tracking-[0.7px] text-warning">
          Outstanding balance
        </Text>
        <Text className="mt-2 text-[30px] font-bold leading-9 text-foreground">
          {currencyFormatter.format(totalUnpaidCents / 100)}
        </Text>
        <Text className="mt-1 text-sm font-medium text-muted">
          {invoiceCount === 0
            ? "No unpaid invoices"
            : `${invoiceCount} unpaid ${invoiceCount === 1 ? "invoice" : "invoices"}`}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <MetricTile
          label="Purchased"
          value={currencyFormatter.format(totalPurchasedCents / 100)}
        />
        <MetricTile
          label="Paid"
          value={currencyFormatter.format(totalPaidCents / 100)}
        />
      </View>

      <View
        className="rounded-3xl border border-border bg-surface p-4"
        style={styles.chartCard}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View>
            <Text className="text-base font-bold text-foreground">
              Bought vs paid
            </Text>
            <Text className="mt-0.5 text-xs text-muted">Last 30 days</Text>
          </View>
          <View className="gap-1.5">
            <View className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full bg-primary" />
              <Text className="text-[11px] font-semibold text-muted">
                Purchased
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View style={styles.paidLegendDot} />
              <Text className="text-[11px] font-semibold text-muted">Paid</Text>
            </View>
          </View>
        </View>
        <CustomerActivityChart
          accessibilityLabel={chartLabel}
          points={activity}
        />
        <View className="flex-row justify-between">
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
    </View>
  );
}

function buildListItems(
  orders: CustomerOrder[],
  outstandingInvoices: CustomerOrder[],
): DetailListItem[] {
  const items: DetailListItem[] = [];

  if (outstandingInvoices.length) {
    items.push({
      id: "section-unpaid",
      kind: "section",
      subtitle: "Tap an invoice to review or record another payment.",
      title: "Unpaid invoices",
    });
    items.push(
      ...outstandingInvoices.map((order) => ({
        id: `invoice-${order.id}`,
        kind: "invoice" as const,
        order,
      })),
    );
  }

  if (orders.length) {
    items.push({
      id: "section-history",
      kind: "section",
      subtitle: `${orders.length} ${orders.length === 1 ? "order" : "orders"} in this customer account.`,
      title: "Order history",
    });
    items.push(
      ...orders.map((order) => ({
        id: `history-${order.id}`,
        kind: "history" as const,
        order,
      })),
    );
  }

  return items;
}

function renderDetailItem(props: LegendListRenderItemProps<DetailListItem>) {
  if (props.item.kind === "section") {
    return (
      <SectionHeader
        {...(props as LegendListRenderItemProps<
          Extract<DetailListItem, { kind: "section" }>
        >)}
      />
    );
  }

  return (
    <OrderCard
      {...(props as LegendListRenderItemProps<
        Extract<DetailListItem, { kind: "history" | "invoice" }>
      >)}
    />
  );
}

export default function CustomerDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<DetailRoute>();
  const detailQuery = useCustomerDetailQuery(route.params.customerId);
  const detail = detailQuery.data;
  const listItems = detail
    ? buildListItems(detail.orders, detail.outstandingInvoices)
    : [];

  return (
    <View className="flex-1 bg-background">
      <TaskHeader
        onBack={() => navigation.goBack()}
        subtitle="Invoices, payments, and purchase history."
        title={detail?.customer.name ?? "Customer details"}
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 48, paddingHorizontal: 20 }}
        data={listItems}
        estimatedItemSize={98}
        getItemType={(item) => item.kind}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="py-8 text-center text-sm text-muted">
            {detailQuery.isPending
              ? "Loading customer…"
              : detailQuery.isError
                ? detailQuery.error.message
                : "This customer has no orders yet."}
          </Text>
        }
        ListHeaderComponent={
          detail ? (
            <CustomerHeader
              activity={detail.activity}
              customer={detail.customer}
              invoiceCount={detail.outstandingInvoices.length}
              totalPaidCents={detail.totalPaidCents}
              totalPurchasedCents={detail.totalPurchasedCents}
              totalUnpaidCents={detail.totalUnpaidCents}
            />
          ) : null
        }
        recycleItems
        renderItem={renderDetailItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    boxShadow: "0 2px 8px rgba(20, 32, 51, 0.08)",
  },
  paidLegendDot: {
    backgroundColor: colors.success,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
});
