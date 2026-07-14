import {
  LegendList,
  type LegendListRef,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useReducer, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { PosVariant } from "../../api/pos/queries";
import {
  usePosCatalogQuery,
  usePosCustomersQuery,
} from "../../api/pos/queries";
import {
  type PosPaymentMethod,
  type PosPaymentTerms,
  usePosCheckoutMutation,
} from "../../api/pos/usePosCheckoutMutation";
import AppIcon from "../../components/icons/AppIcon";
import SearchField from "../../components/operations/SearchField";
import LiveTutorialOverlay from "../../features/tutorial/LiveTutorialOverlay";
import {
  findStaffTutorial,
  type StaffTutorialId,
} from "../../features/tutorial/staffTutorials";
import { useLiveTutorialController } from "../../features/tutorial/useLiveTutorialController";
import { colors } from "../../theme/colors";

type NewOrderRoute = RouteProp<
  { NewOrder: { tutorialId?: StaffTutorialId } | undefined },
  "NewOrder"
>;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const paymentMethods: {
  label: string;
  value: PosPaymentMethod;
}[] = [
  { label: "Cash", value: "cash" },
  { label: "Bank transfer", value: "bank_transfer" },
  { label: "Manual card", value: "card_manual" },
];

type OrderSelectionState = {
  quantities: Record<string, number>;
  saleType: "preorder" | "sale";
};

type OrderSelectionAction =
  | { saleType: "preorder" | "sale"; type: "changeSaleType" }
  | { quantity: number; type: "changeQuantity"; variantId: string };

function orderSelectionReducer(
  state: OrderSelectionState,
  action: OrderSelectionAction,
): OrderSelectionState {
  if (action.type === "changeSaleType") {
    return { quantities: {}, saleType: action.saleType };
  }

  return {
    ...state,
    quantities: {
      ...state.quantities,
      [action.variantId]: Math.max(action.quantity, 0),
    },
  };
}

function formatCurrency(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

function OrderTypeSelector({
  onChange,
  value,
}: {
  onChange: (value: "preorder" | "sale") => void;
  value: "preorder" | "sale";
}) {
  return (
    <View>
      <Text className="mb-2 text-xs font-bold uppercase tracking-[1px] text-subtle">
        Order type
      </Text>
      <View className="flex-row rounded-2xl bg-surface-muted p-1">
        {(["sale", "preorder"] as const).map((type) => {
          const selected = value === type;

          return (
            <Pressable
              accessibilityRole="button"
              className={
                selected
                  ? "min-h-11 flex-1 items-center justify-center rounded-xl bg-surface"
                  : "min-h-11 flex-1 items-center justify-center rounded-xl"
              }
              key={type}
              onPress={() => onChange(type)}
            >
              <Text
                className={
                  selected
                    ? "font-bold text-primary"
                    : "font-semibold text-muted"
                }
              >
                {type === "sale" ? "In-stock sale" : "Preorder"}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {value === "preorder" ? (
        <Text className="mt-2 text-sm leading-5 text-muted">
          Use for chat orders even when stock is zero. Payment and stock
          allocation can be recorded later.
        </Text>
      ) : null}
    </View>
  );
}

function PaymentSelector({
  onChange,
  onChangeTerms,
  terms,
  value,
}: {
  onChange: (value: PosPaymentMethod) => void;
  onChangeTerms: (value: PosPaymentTerms) => void;
  terms: PosPaymentTerms;
  value: PosPaymentMethod;
}) {
  return (
    <>
      <Text className="mb-2 text-xs font-bold uppercase tracking-[1px] text-subtle">
        3 · Customer payment
      </Text>
      <View className="mb-3 flex-row gap-2">
        {([
          { label: "Paid now", value: "immediate" },
          { label: "Pay later", value: "credit" },
        ] as const).map((option) => {
          const selected = terms === option.value;

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
              onPress={() => onChangeTerms(option.value)}
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
      {terms === "immediate" ? (
        <View className="mb-3 flex-row gap-2">
          {paymentMethods.map((method) => {
            const selected = value === method.value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={
                  selected
                    ? "min-h-11 flex-1 items-center justify-center rounded-xl bg-primary-soft px-2"
                    : "min-h-11 flex-1 items-center justify-center rounded-xl border border-border px-2"
                }
                key={method.value}
                onPress={() => onChange(method.value)}
              >
                <Text
                  className={
                    selected
                      ? "text-center text-xs font-bold text-primary"
                      : "text-center text-xs font-semibold text-muted"
                  }
                >
                  {method.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text className="mb-3 text-sm leading-5 text-muted">
          Stock is deducted now. Record partial or full payments later from the
          order invoice.
        </Text>
      )}
    </>
  );
}

type ProductRowProps = LegendListRenderItemProps<PosVariant> & {
  isPreorder: boolean;
  onChangeQuantity: (variantId: string, nextQuantity: number) => void;
  quantity: number;
};

function ProductRow({
  isPreorder,
  item,
  onChangeQuantity,
  quantity,
}: ProductRowProps) {
  const maximumQuantity = isPreorder
    ? Number.POSITIVE_INFINITY
    : Math.max(item.stock, 0);
  const availableQuantity = isPreorder
    ? item.stock
    : Math.max(item.stock - quantity, 0);

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
        <AppIcon name="parcel" color={colors.primary} size={22} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-foreground">
          {item.name}
        </Text>
        <Text className="mt-0.5 text-xs text-muted">
          {item.sku} · {item.size} · {item.color}
        </Text>
        <Text className="mt-1 text-sm font-semibold text-primary">
          {formatCurrency(item.priceCents)} · {availableQuantity} available
        </Text>
        {isPreorder ? (
          <Text className="mt-1 text-xs font-bold uppercase text-warning">
            Preorder · stock is not deducted now
          </Text>
        ) : null}
      </View>
      <View className="items-center gap-1.5">
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityLabel={`Remove one ${item.name}`}
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-muted disabled:opacity-40"
            disabled={quantity === 0}
            onPress={() => onChangeQuantity(item.id, quantity - 1)}
          >
            <Text className="text-xl font-semibold text-primary">−</Text>
          </Pressable>
          <Text className="min-w-5 text-center text-base font-bold text-foreground">
            {quantity}
          </Text>
          <Pressable
            accessibilityLabel={`Add one ${item.name}`}
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full bg-primary disabled:opacity-40"
            disabled={maximumQuantity === 0 || quantity >= maximumQuantity}
            onPress={() => onChangeQuantity(item.id, quantity + 1)}
          >
            <Text className="text-xl font-semibold text-on-primary">+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function OrderScreenHeader({
  itemCount,
  onBack,
  saleType,
  tutorialMode,
}: {
  itemCount: number;
  onBack: () => void;
  saleType: "preorder" | "sale";
  tutorialMode: boolean;
}) {
  return (
    <View className="flex-row items-center gap-3 px-5 pb-4 pt-3">
      <Pressable
        accessibilityLabel="Back to orders"
        accessibilityRole="button"
        className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface active:bg-surface-muted"
        onPress={onBack}
      >
        <Text className="text-2xl text-primary">‹</Text>
      </Pressable>
      <View className="flex-1">
        <Text className="text-2xl font-bold text-foreground">
          {saleType === "preorder" ? "New preorder" : "New sale"}
        </Text>
        <Text className="text-sm text-muted">
          {tutorialMode
            ? "Practice guide · Nothing will be saved"
            : saleType === "preorder"
              ? "Customer, items, and expected total"
              : "Customer, items, and payment"}
        </Text>
      </View>
      <View className="rounded-full bg-primary-soft px-3 py-2">
        <Text className="text-sm font-bold text-primary">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Text>
      </View>
    </View>
  );
}

export default function NewOrderScreen() {
  const navigation = useNavigation();
  const route = useRoute<NewOrderRoute>();
  const listRef = useRef<LegendListRef | null>(null);
  const tutorial = route.params?.tutorialId
    ? findStaffTutorial(route.params.tutorialId)
    : null;
  const tutorialMode =
    tutorial?.id === "sale-order" || tutorial?.id === "preorder";
  const customersQuery = usePosCustomersQuery();
  const catalogQuery = usePosCatalogQuery();
  const checkoutMutation = usePosCheckoutMutation();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>("cash");
  const [paymentTerms, setPaymentTerms] =
    useState<PosPaymentTerms>("immediate");
  const [search, setSearch] = useState("");
  const [{ quantities, saleType }, dispatchSelection] = useReducer(
    orderSelectionReducer,
    {
      quantities: {},
      saleType: tutorial?.id === "preorder" ? "preorder" : "sale",
    },
  );
  const { showStep: showTutorialStep, startOnLayout, tour } =
    useLiveTutorialController({
      enabled: tutorialMode,
      onBeforeStep: (index) => {
        if (index < 2) {
          void listRef.current?.scrollToOffset({ animated: true, offset: 0 });
        } else if (index === 2) {
          void listRef.current?.scrollToOffset({
            animated: true,
            offset: 180,
          });
        }
      },
      steps: tutorial?.steps ?? [],
    });

  const variants = (() => {
    const query = search.trim().toLowerCase();
    const catalog = catalogQuery.data ?? [];

    if (!query) return catalog;

    return catalog.filter((variant) =>
      [variant.name, variant.sku, variant.color, variant.size].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  })();

  const cart = (catalogQuery.data ?? []).flatMap((variant) => {
    const quantity = quantities[variant.id] ?? 0;

    return quantity > 0 ? [{ quantity, variant }] : [];
  });
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCents = cart.reduce(
    (total, item) => total + item.quantity * item.variant.priceCents,
    0,
  );
  const canCheckout =
    !tutorialMode &&
    Boolean(selectedCustomerId) &&
    itemCount > 0 &&
    !checkoutMutation.isPending;

  const changeQuantity = (variantId: string, nextQuantity: number) => {
    dispatchSelection({
      quantity: nextQuantity,
      type: "changeQuantity",
      variantId,
    });
  };

  const changeSaleType = (type: "preorder" | "sale") => {
    dispatchSelection({ saleType: type, type: "changeSaleType" });
  };

  const handleCheckout = async () => {
    if (tutorialMode) return;
    if (!selectedCustomerId || itemCount === 0) return;

    try {
      await checkoutMutation.mutateAsync({
        customerId: selectedCustomerId,
        items: cart.map(({ quantity, variant }) => ({
          productVariantId: variant.id,
          quantity,
        })),
        paymentMethod,
        paymentTerms: saleType === "sale" ? paymentTerms : "immediate",
        saleType,
        totalCents,
      });
      navigation.goBack();
    } catch {
      // The mutation state renders a safe, actionable error below.
    }
  };

  return (
    <View
      className="flex-1 bg-background pt-safe"
      onLayout={startOnLayout}
    >
      <OrderScreenHeader
        itemCount={itemCount}
        onBack={() => navigation.goBack()}
        saleType={saleType}
        tutorialMode={tutorialMode}
      />

      <LegendList
        contentContainerStyle={{ paddingBottom: 280, paddingHorizontal: 20 }}
        data={variants}
        estimatedItemSize={104}
        extraData={quantities}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(variant) => variant.id}
        ListEmptyComponent={
          <View className="rounded-2xl border border-border bg-surface p-6">
            <Text className="text-center text-sm text-muted">
              {catalogQuery.isPending
                ? "Loading products…"
                : saleType === "preorder"
                  ? "No variants match your search."
                  : "No in-stock variants match your search."}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <View
              {...(tutorialMode
                ? tour.getTargetProps("order-type")
                : undefined)}
            >
              <OrderTypeSelector onChange={changeSaleType} value={saleType} />
            </View>
            <View
              {...(tutorialMode
                ? tour.getTargetProps("order-customer")
                : undefined)}
            >
              <Text className="mb-2 text-xs font-bold uppercase tracking-[1px] text-subtle">
                1 · Customer
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {(customersQuery.data ?? []).map((customer) => {
                    const selected = selectedCustomerId === customer.id;

                    return (
                      <Pressable
                        accessibilityRole="button"
                        className={
                          selected
                            ? "min-w-40 rounded-2xl bg-primary p-3"
                            : "min-w-40 rounded-2xl border border-border bg-surface p-3"
                        }
                        key={customer.id}
                        onPress={() => setSelectedCustomerId(customer.id)}
                      >
                        <Text
                          className={
                            selected
                              ? "font-bold text-on-primary"
                              : "font-bold text-foreground"
                          }
                        >
                          {customer.name}
                        </Text>
                        <Text
                          className={
                            selected
                              ? "mt-1 text-xs text-primary-soft"
                              : "mt-1 text-xs text-muted"
                          }
                          numberOfLines={1}
                        >
                          {customer.detail}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
              {customersQuery.isError ? (
                <Text className="mt-2 text-sm text-danger">
                  Customers could not be loaded. Pull back and try again.
                </Text>
              ) : null}
            </View>

            <View
              {...(tutorialMode
                ? tour.getTargetProps("order-products")
                : undefined)}
            >
              <Text className="mb-2 text-xs font-bold uppercase tracking-[1px] text-subtle">
                2 · Products
              </Text>
              <SearchField
                onChangeText={setSearch}
                placeholder="Search product, SKU, size, or color"
                value={search}
              />
            </View>
          </View>
        }
        maintainVisibleContentPosition
        ref={listRef}
        recycleItems
        renderItem={(props) => (
          <ProductRow
            {...props}
            isPreorder={saleType === "preorder"}
            onChangeQuantity={changeQuantity}
            quantity={quantities[props.item.id] ?? 0}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <View
        {...(tutorialMode
          ? tour.getTargetProps("order-complete")
          : undefined)}
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface px-5 pb-safe-offset-4 pt-4"
      >
        {saleType === "sale" ? (
          <PaymentSelector
            onChange={setPaymentMethod}
            onChangeTerms={setPaymentTerms}
            terms={paymentTerms}
            value={paymentMethod}
          />
        ) : (
          <Text className="mb-3 text-sm text-muted">
            No inventory movement or payment will be recorded at confirmation.
          </Text>
        )}
        {checkoutMutation.isError ? (
          <Text accessibilityRole="alert" className="mb-2 text-sm text-danger">
            {saleType === "preorder" ? "Preorder" : "Sale"} could not be
            completed. Check the connection, then try again.
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          className="min-h-14 flex-row items-center justify-between rounded-2xl bg-primary px-5 disabled:opacity-40 active:bg-primary-pressed"
          disabled={!canCheckout}
          onPress={handleCheckout}
        >
          <View>
            <Text className="text-xs font-semibold text-primary-soft">
              {tutorialMode
                ? "Practice only"
                : checkoutMutation.isPending
                ? saleType === "preorder"
                  ? "Confirming preorder…"
                  : paymentTerms === "credit"
                    ? "Creating credit sale…"
                    : "Completing sale…"
                : saleType === "preorder"
                  ? "Confirm preorder"
                  : paymentTerms === "credit"
                    ? "Create credit sale"
                    : "Complete sale"}
            </Text>
            <Text className="text-base font-bold text-on-primary">
              {tutorialMode
                ? "No order will be created"
                : selectedCustomerId
                ? `${itemCount} ${itemCount === 1 ? "item" : "items"}`
                : "Select a customer"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-on-primary">
            {tutorialMode ? "DEMO" : formatCurrency(totalCents)}
          </Text>
        </Pressable>
      </View>
      {tutorialMode ? (
        <LiveTutorialOverlay
          onClose={() => navigation.goBack()}
          onStepChange={showTutorialStep}
          tour={tour}
        />
      ) : null}
    </View>
  );
}
