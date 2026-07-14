import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { getApiErrorMessage } from "../../api/errorMessage";
import {
  type OrderPaymentMethod,
  type RecordOrderPaymentInput,
  useOrderWorkflowMutations,
} from "../../api/orders/mutations";
import {
  type OrderDetail,
  useOrderDetailQuery,
} from "../../api/orders/queries";
import TextController from "../../components/form/TextController";
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
type PaymentFormValues = { amount: string };

const paymentMethodOptions: {
  label: string;
  value: OrderPaymentMethod;
}[] = [
  { label: "Cash", value: "cash" },
  { label: "Bank transfer", value: "bank_transfer" },
  { label: "Manual card", value: "card_manual" },
];

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function formatDate(value?: string) {
  if (!value) return "Not recorded";

  return dateFormatter.format(new Date(value));
}

function parseCurrencyToCents(value: string): number | null {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim().replaceAll(",", ""));
  if (!match) return null;

  const dollars = Number(match[1]);
  const cents = Number((match[2] ?? "").padEnd(2, "0"));
  const totalCents = dollars * 100 + cents;

  return Number.isSafeInteger(totalCents) ? totalCents : null;
}

function statusTone(status: OrderDetail["status"]) {
  if (status === "fulfilled") return "success" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "returned") return "neutral" as const;
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

function PaymentSummary({
  order,
  paymentMethods,
}: {
  order: OrderDetail;
  paymentMethods: string[];
}) {
  return (
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
          <Text className="text-base font-bold text-foreground">Total</Text>
          <Text className="text-xl font-bold text-primary">
            {formatCurrency(order.totalCents)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted">Customer paid</Text>
          <Text className="text-sm font-bold text-success">
            {formatCurrency(order.paidCents)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted">Remaining balance</Text>
          <Text
            className={
              order.balanceCents > 0
                ? "text-sm font-bold text-danger"
                : "text-sm font-bold text-success"
            }
          >
            {formatCurrency(order.balanceCents)}
          </Text>
        </View>
        <Text className="text-xs font-semibold uppercase text-success">
          {order.paymentState.replace("_", " ")}
          {paymentMethods.length > 0
            ? ` · ${paymentMethods.join(", ")}`
            : ""}
        </Text>
      </View>
    </View>
  );
}

function ManualPaymentForm({
  balanceCents,
  error,
  isPending,
  onRecord,
}: {
  balanceCents: number;
  error: unknown;
  isPending: boolean;
  onRecord: (input: RecordOrderPaymentInput) => Promise<unknown>;
}) {
  const [method, setMethod] = useState<OrderPaymentMethod>("cash");
  const { control, handleSubmit, reset } = useForm<PaymentFormValues>({
    defaultValues: { amount: "" },
  });
  const submit = handleSubmit(async ({ amount }) => {
    const amountCents = parseCurrencyToCents(amount);
    if (amountCents === null) return;

    try {
      await onRecord({ amountCents, method });
      reset();
      Keyboard.dismiss();
    } catch {
      // The mutation error below explains what staff can correct.
    }
  });

  return (
    <View className="rounded-2xl border border-border bg-surface p-4">
      <Text className="text-xs font-bold uppercase tracking-[1px] text-subtle">
        Record customer payment
      </Text>
      <Text className="mt-2 text-sm leading-5 text-muted">
        Enter what the customer paid now. Remaining balance: {formatCurrency(balanceCents)}.
      </Text>
      <View className="mt-4">
        <TextController
          control={control}
          keyboardType="decimal-pad"
          label="Amount paid (USD)"
          name="amount"
          placeholder="0.00"
          rules={{
            required: "Paid amount is required",
            validate: (value) => {
              const amountCents = parseCurrencyToCents(value);

              if (amountCents === null || amountCents <= 0) {
                return "Enter an amount greater than zero";
              }

              return (
                amountCents <= balanceCents ||
                `Cannot exceed ${formatCurrency(balanceCents)}`
              );
            },
          }}
        />
      </View>
      <Text className="mb-2 mt-4 text-xs font-bold uppercase tracking-[1px] text-subtle">
        Payment method
      </Text>
      <View className="flex-row gap-2">
        {paymentMethodOptions.map((option) => {
          const selected = method === option.value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={
                selected
                  ? "min-h-11 flex-1 items-center justify-center rounded-xl bg-primary-soft px-2"
                  : "min-h-11 flex-1 items-center justify-center rounded-xl border border-border px-2"
              }
              key={option.value}
              onPress={() => setMethod(option.value)}
            >
              <Text
                className={
                  selected
                    ? "text-center text-xs font-bold text-primary"
                    : "text-center text-xs font-semibold text-muted"
                }
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text accessibilityRole="alert" className="mt-3 text-sm text-danger">
          {getApiErrorMessage(error, "Payment could not be recorded.")}
        </Text>
      ) : null}
      <View className="mt-4">
        <ActionButton
          disabled={isPending}
          label={isPending ? "Recording payment…" : "Record payment"}
          onPress={() => void submit()}
        />
      </View>
    </View>
  );
}

function ActionButton({
  disabled,
  label,
  onPress,
  tone = "primary",
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  tone?: "danger" | "primary";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-12 items-center justify-center rounded-xl px-4 ${
        tone === "danger" ? "border border-danger" : "bg-primary"
      } ${disabled ? "opacity-50" : "active:opacity-80"}`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text
        className={
          tone === "danger"
            ? "text-sm font-bold text-danger"
            : "text-sm font-bold text-on-primary"
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<DetailRoute>();
  const orderQuery = useOrderDetailQuery(route.params.orderId);
  const workflow = useOrderWorkflowMutations(route.params.orderId);
  const order = orderQuery.data;
  const workflowPending =
    workflow.allocateStock.isPending ||
    workflow.cancel.isPending ||
    workflow.fulfill.isPending ||
    workflow.recordPayment.isPending ||
    workflow.returnOrder.isPending ||
    workflow.submit.isPending;
  const workflowError =
    workflow.allocateStock.isError ||
    workflow.cancel.isError ||
    workflow.fulfill.isError ||
    workflow.returnOrder.isError ||
    workflow.submit.isError;
  const balanceCents = order?.balanceCents ?? 0;
  const paymentMethods =
    order?.payments.reduce<string[]>((methods, payment) => {
      if (!payment.voided) methods.push(payment.method.replace("_", " "));
      return methods;
    }, []) ?? [];

  const confirmCancel = () => {
    Alert.alert(
      "Cancel this order?",
      order?.orderKind === "preorder"
        ? "Any reserved stock will be released. This action cannot be undone."
        : "Committed stock will be restored. This action cannot be undone.",
      [
        { style: "cancel", text: "Keep order" },
        {
          onPress: () => workflow.cancel.mutate("Cancelled by staff"),
          style: "destructive",
          text: "Cancel order",
        },
      ],
    );
  };

  const confirmReturn = () => {
    Alert.alert(
      "Return this order?",
      "All sold items will be added back to stock. Confirm the customer has returned every item before continuing.",
      [
        { style: "cancel", text: "Keep fulfilled" },
        {
          onPress: () => workflow.returnOrder.mutate("Full return by staff"),
          style: "destructive",
          text: "Return all items",
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
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
                    label={
                      order.orderKind === "preorder"
                        ? order.fulfillmentStatus.replace("_", " ")
                        : order.status
                    }
                    tone={statusTone(order.status)}
                  />
                </View>
                {order.orderKind === "preorder" ? (
                  <View className="mt-4 rounded-xl bg-warning-soft p-3">
                    <Text className="text-xs font-bold uppercase text-warning">
                      Preorder
                    </Text>
                    <Text className="mt-1 text-sm leading-5 text-muted">
                      Stock is deducted only when this order is fulfilled.
                    </Text>
                  </View>
                ) : null}
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
              <PaymentSummary
                order={order}
                paymentMethods={paymentMethods}
              />
              {balanceCents > 0 &&
              (order.status === "pending" || order.status === "fulfilled") ? (
                <ManualPaymentForm
                  balanceCents={balanceCents}
                  error={workflow.recordPayment.error}
                  isPending={workflow.recordPayment.isPending}
                  onRecord={workflow.recordPayment.mutateAsync}
                />
              ) : null}
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
                {order.returnedAt ? (
                  <Text className="mt-2 text-sm text-muted">
                    Returned · {formatDate(order.returnedAt)}
                    {order.returnReason ? ` · ${order.returnReason}` : ""}
                  </Text>
                ) : null}
              </View>
              {order.status === "draft" || order.status === "pending" ? (
                <View className="rounded-2xl border border-border bg-surface p-4">
                  <Text className="text-xs font-bold uppercase tracking-[1px] text-subtle">
                    Staff actions
                  </Text>
                  <View className="mt-4 gap-3">
                    {order.status === "draft" ? (
                      <ActionButton
                        disabled={workflowPending}
                        label="Confirm order"
                        onPress={() => workflow.submit.mutate()}
                      />
                    ) : null}
                    {order.orderKind === "preorder" &&
                    order.status === "pending" &&
                    order.fulfillmentStatus === "awaiting_stock" ? (
                      <ActionButton
                        disabled={workflowPending}
                        label="Allocate available stock"
                        onPress={() => workflow.allocateStock.mutate()}
                      />
                    ) : null}
                    {order.status === "pending" &&
                    (balanceCents === 0 || order.paymentTerms === "credit") &&
                    (order.orderKind === "sale" ||
                      order.fulfillmentStatus === "ready") ? (
                      <ActionButton
                        disabled={workflowPending}
                        label={
                          order.orderKind === "preorder"
                            ? "Complete pickup or delivery"
                            : "Fulfill order"
                        }
                        onPress={() => workflow.fulfill.mutate()}
                      />
                    ) : null}
                    <ActionButton
                      disabled={workflowPending}
                      label="Cancel order"
                      onPress={confirmCancel}
                      tone="danger"
                    />
                    {workflowError ? (
                      <Text
                        accessibilityRole="alert"
                        className="text-sm text-danger"
                      >
                        The order could not be updated. Refresh and try again.
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
              {order.status === "fulfilled" ? (
                <View className="rounded-2xl border border-border bg-surface p-4">
                  <Text className="text-xs font-bold uppercase tracking-[1px] text-subtle">
                    Return
                  </Text>
                  <Text className="mt-2 text-sm leading-5 text-muted">
                    Full returns restore every item to stock and cannot be
                    reversed.
                  </Text>
                  <View className="mt-4">
                    <ActionButton
                      disabled={workflowPending}
                      label="Return all items"
                      onPress={confirmReturn}
                      tone="danger"
                    />
                  </View>
                  {workflowError ? (
                    <Text
                      accessibilityRole="alert"
                      className="mt-3 text-sm text-danger"
                    >
                      The return could not be recorded. Refresh and try again.
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null
        }
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        keyboardShouldPersistTaps="handled"
        recycleItems
        renderItem={(props) => <ItemCard {...props} />}
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAvoidingView>
  );
}
