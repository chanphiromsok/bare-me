import {
  LegendList,
  type LegendListRef,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { ModalBottomSheet } from "@swmansion/react-native-bottom-sheet";
import { useReducer, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const productSheetDetents: [number, "content"] = [0, "content"];

type ProductFilter = "all" | "available" | "selected";

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
        {(
          [
            { label: "Paid now", value: "immediate" },
            { label: "Pay later", value: "credit" },
          ] as const
        ).map((option) => {
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

function ProductPickerSheet({
  catalog,
  isOpen,
  isPreorder,
  onChangeQuantity,
  onClose,
  quantities,
  state,
}: {
  catalog: PosVariant[];
  isOpen: boolean;
  isPreorder: boolean;
  onChangeQuantity: (variantId: string, nextQuantity: number) => void;
  onClose: () => void;
  quantities: Record<string, number>;
  state: "error" | "pending" | "ready";
}) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<ProductFilter>(
    isPreorder ? "all" : "available",
  );
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const filteredVariants = catalog.filter((variant) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "available" && variant.stock > 0) ||
      (filter === "selected" && (quantities[variant.id] ?? 0) > 0);
    const matchesSearch =
      !query ||
      [variant.name, variant.sku, variant.color, variant.size].some((value) =>
        value.toLowerCase().includes(query),
      );

    return matchesFilter && matchesSearch;
  });

  const selectedItemCount = catalog.reduce(
    (total, variant) => total + (quantities[variant.id] ?? 0),
    0,
  );
  const selectedTotalCents = catalog.reduce(
    (total, variant) =>
      total + (quantities[variant.id] ?? 0) * variant.priceCents,
    0,
  );
  const filters: { label: string; value: ProductFilter }[] = [
    { label: "All", value: "all" },
    { label: isPreorder ? "Stocked" : "In stock", value: "available" },
    { label: `Selected (${selectedItemCount})`, value: "selected" },
  ];

  return (
    <ModalBottomSheet
      detents={productSheetDetents}
      index={isOpen ? 1 : 0}
      onIndexChange={(nextIndex) => {
        if (nextIndex === 0) onClose();
      }}
      scrimColor={colors.overlay}
      surface={<View style={styles.productSheetSurface} />}
    >
      <View
        accessibilityViewIsModal
        className="flex-1 overflow-hidden rounded-t-[28px] bg-surface"
      >
        <View className="items-center pb-1 pt-2">
          <View className="h-1 w-10 rounded-full bg-border" />
        </View>
        <View className="flex-row items-center gap-3 border-b border-border px-4 pb-3 pt-1">
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">
              Add products
            </Text>
            <Text className="mt-0.5 text-sm text-muted">
              {isPreorder
                ? "Choose any variant, even when stock is zero."
                : "Choose variants currently available to sell."}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Close product picker"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full bg-surface-muted active:opacity-70"
            onPress={onClose}
          >
            <Text className="text-2xl leading-7 text-foreground">×</Text>
          </Pressable>
        </View>

        <View className="gap-3 border-b border-border bg-surface px-4 py-3">
          <SearchField
            onChangeText={setSearch}
            placeholder="Search name, SKU, size, or color"
            value={search}
          />
          <ScrollView
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
          >
            <View className="flex-row gap-2">
              {filters.map((option) => {
                const selected = filter === option.value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={
                      selected
                        ? "min-h-11 items-center justify-center rounded-full bg-primary px-4"
                        : "min-h-11 items-center justify-center rounded-full border border-border bg-surface px-4"
                    }
                    key={option.value}
                    onPress={() => setFilter(option.value)}
                  >
                    <Text
                      className={
                        selected
                          ? "text-sm font-bold text-on-primary"
                          : "text-sm font-semibold text-muted"
                      }
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <LegendList
          contentContainerStyle={{ padding: 16 }}
          data={filteredVariants}
          estimatedItemSize={104}
          extraData={quantities}
          ItemSeparatorComponent={() => <View className="h-3" />}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          keyExtractor={(variant) => variant.id}
          ListEmptyComponent={
            <View className="rounded-2xl border border-border bg-surface-muted p-6">
              <Text className="text-center text-sm font-semibold text-muted">
                {state === "pending"
                  ? "Loading products…"
                  : state === "error"
                    ? "Products could not be loaded. Close this picker and try again."
                    : filter === "selected"
                      ? "No products selected yet."
                      : "No variants match this search and filter."}
              </Text>
            </View>
          }
          maintainVisibleContentPosition
          recycleItems
          renderItem={(props) => (
            <ProductRow
              {...props}
              isPreorder={isPreorder}
              onChangeQuantity={onChangeQuantity}
              quantity={quantities[props.item.id] ?? 0}
            />
          )}
          showsVerticalScrollIndicator={false}
        />

        <View
          className="border-t border-border bg-surface px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <Pressable
            accessibilityLabel={`Done choosing products, ${selectedItemCount} items selected`}
            accessibilityRole="button"
            className="min-h-14 flex-row items-center justify-between rounded-2xl bg-primary px-5 active:bg-primary-pressed"
            onPress={onClose}
          >
            <View>
              <Text className="text-xs font-semibold text-primary-soft">
                Done choosing products
              </Text>
              <Text className="text-base font-bold text-on-primary">
                {selectedItemCount} {selectedItemCount === 1 ? "item" : "items"}
              </Text>
            </View>
            <Text className="text-xl font-bold text-on-primary">
              {formatCurrency(selectedTotalCents)}
            </Text>
          </Pressable>
        </View>
      </View>
    </ModalBottomSheet>
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
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [{ quantities, saleType }, dispatchSelection] = useReducer(
    orderSelectionReducer,
    {
      quantities: {},
      saleType: tutorial?.id === "preorder" ? "preorder" : "sale",
    },
  );
  const {
    showStep: showTutorialStep,
    startOnLayout,
    tour,
  } = useLiveTutorialController({
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

  const cart = (catalogQuery.data ?? []).flatMap((variant) => {
    const quantity = quantities[variant.id] ?? 0;

    return quantity > 0 ? [{ quantity, variant }] : [];
  });
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCents = cart.reduce(
    (total, item) => total + item.quantity * item.variant.priceCents,
    0,
  );
  const selectedVariants = cart.map(({ variant }) => variant);
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
    <View className="flex-1 bg-background pt-safe" onLayout={startOnLayout}>
      <View
        accessibilityElementsHidden={productPickerOpen}
        importantForAccessibility={
          productPickerOpen ? "no-hide-descendants" : "auto"
        }
      >
        <OrderScreenHeader
          itemCount={itemCount}
          onBack={() => navigation.goBack()}
          saleType={saleType}
          tutorialMode={tutorialMode}
        />
      </View>

      <LegendList
        accessibilityElementsHidden={productPickerOpen}
        contentContainerStyle={{ paddingBottom: 280, paddingHorizontal: 20 }}
        data={selectedVariants}
        estimatedItemSize={104}
        extraData={quantities}
        importantForAccessibility={
          productPickerOpen ? "no-hide-descendants" : "auto"
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(variant) => variant.id}
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
              <Pressable
                accessibilityLabel="Browse and choose products"
                accessibilityRole="button"
                className="min-h-20 flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
                onPress={() => setProductPickerOpen(true)}
              >
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
                  <AppIcon name="scan" color={colors.primary} size={22} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">
                    Browse products
                  </Text>
                  <Text className="mt-0.5 text-sm text-muted">
                    {itemCount > 0
                      ? `${itemCount} ${itemCount === 1 ? "item" : "items"} selected · Search to add more`
                      : "Search and filter the full catalog"}
                  </Text>
                </View>
                <Text className="text-2xl text-primary">›</Text>
              </Pressable>
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

      <ProductPickerSheet
        catalog={catalogQuery.data ?? []}
        isOpen={productPickerOpen}
        isPreorder={saleType === "preorder"}
        key={saleType}
        onChangeQuantity={changeQuantity}
        onClose={() => setProductPickerOpen(false)}
        quantities={quantities}
        state={
          catalogQuery.isPending
            ? "pending"
            : catalogQuery.isError
              ? "error"
              : "ready"
        }
      />

      <View
        {...(tutorialMode ? tour.getTargetProps("order-complete") : undefined)}
        accessibilityElementsHidden={productPickerOpen}
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface px-5 pb-safe-offset-4 pt-4"
        importantForAccessibility={
          productPickerOpen ? "no-hide-descendants" : "auto"
        }
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

const styles = StyleSheet.create({
  productSheetSurface: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    boxShadow: `0 -4px 12px ${colors.shadow}`,
  },
});
