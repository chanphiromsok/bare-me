import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { ModalBottomSheet } from "@swmansion/react-native-bottom-sheet";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useReducer,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { PosCustomer, PosVariant } from "../../api/pos/queries";
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
  type StaffTutorial,
  type StaffTutorialId,
} from "../../features/tutorial/staffTutorials";
import { useLiveTutorialController } from "../../features/tutorial/useLiveTutorialController";
import { colors } from "../../theme/colors";

type NewOrderRoute = RouteProp<
  { NewOrder: { tutorialId?: StaffTutorialId } | undefined },
  "NewOrder"
>;

type NewOrderFlowParamList = {
  Catalog: undefined;
  OrderTypePicker: undefined;
  ProductFilterPicker: undefined;
  Review: undefined;
};

type FlowNavigation = NativeStackNavigationProp<NewOrderFlowParamList>;
type ProductFilter = "all" | "available" | "selected";
type SaleType = "preorder" | "sale";

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

const customerSheetDetents: [number, "content"] = [0, "content"];

type OrderSelectionState = {
  quantities: Record<string, number>;
  saleType: SaleType;
};

type OrderSelectionAction =
  | { saleType: SaleType; type: "changeSaleType" }
  | { quantity: number; type: "changeQuantity"; variantId: string };

type CartItem = {
  quantity: number;
  variant: PosVariant;
};

type OrderDraftContextValue = {
  cart: CartItem[];
  catalog: PosVariant[];
  catalogState: "error" | "pending" | "ready";
  changeQuantity: (variantId: string, nextQuantity: number) => void;
  changeSaleType: (saleType: SaleType) => void;
  closeCustomerPicker: () => void;
  customerPickerOpen: boolean;
  customers: PosCustomer[];
  customersState: "error" | "pending" | "ready";
  itemCount: number;
  openCustomerPicker: () => void;
  paymentMethod: PosPaymentMethod;
  paymentTerms: PosPaymentTerms;
  productFilter: ProductFilter;
  quantities: Record<string, number>;
  saleType: SaleType;
  selectedCustomer: PosCustomer | undefined;
  selectedCustomerId: string | undefined;
  setPaymentMethod: (paymentMethod: PosPaymentMethod) => void;
  setPaymentTerms: (paymentTerms: PosPaymentTerms) => void;
  setProductFilter: (filter: ProductFilter) => void;
  setSelectedCustomerId: (customerId: string | undefined) => void;
  totalCents: number;
  tutorial: StaffTutorial | null;
  tutorialMode: boolean;
};

const OrderDraftContext = createContext<OrderDraftContextValue | null>(null);

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

function useOrderDraft() {
  const context = useContext(OrderDraftContext);

  if (!context) {
    throw new Error("useOrderDraft must be used within OrderDraftProvider.");
  }

  return context;
}

function OrderDraftProvider({
  children,
  tutorial,
}: PropsWithChildren<{ tutorial: StaffTutorial | null }>) {
  const customersQuery = usePosCustomersQuery();
  const catalogQuery = usePosCatalogQuery();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>("cash");
  const [paymentTerms, setPaymentTerms] =
    useState<PosPaymentTerms>("immediate");
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [productFilter, setProductFilter] = useState<ProductFilter>(
    tutorial?.id === "preorder" ? "all" : "available",
  );
  const [{ quantities, saleType }, dispatchSelection] = useReducer(
    orderSelectionReducer,
    {
      quantities: {},
      saleType: tutorial?.id === "preorder" ? "preorder" : "sale",
    },
  );

  const catalog = catalogQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const cart = catalog.flatMap((variant) => {
    const quantity = quantities[variant.id] ?? 0;

    return quantity > 0 ? [{ quantity, variant }] : [];
  });
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCents = cart.reduce(
    (total, item) => total + item.quantity * item.variant.priceCents,
    0,
  );
  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  );

  const changeQuantity = (variantId: string, nextQuantity: number) => {
    dispatchSelection({
      quantity: nextQuantity,
      type: "changeQuantity",
      variantId,
    });
  };

  const changeSaleType = (nextSaleType: SaleType) => {
    setProductFilter(nextSaleType === "preorder" ? "all" : "available");
    dispatchSelection({ saleType: nextSaleType, type: "changeSaleType" });
  };

  return (
    <OrderDraftContext.Provider
      value={{
        cart,
        catalog,
        catalogState: catalogQuery.isPending
          ? "pending"
          : catalogQuery.isError
            ? "error"
            : "ready",
        changeQuantity,
        changeSaleType,
        closeCustomerPicker: () => setCustomerPickerOpen(false),
        customerPickerOpen,
        customers,
        customersState: customersQuery.isPending
          ? "pending"
          : customersQuery.isError
            ? "error"
            : "ready",
        itemCount,
        openCustomerPicker: () => setCustomerPickerOpen(true),
        paymentMethod,
        paymentTerms,
        productFilter,
        quantities,
        saleType,
        selectedCustomer,
        selectedCustomerId,
        setPaymentMethod,
        setPaymentTerms,
        setProductFilter,
        setSelectedCustomerId,
        totalCents,
        tutorial,
        tutorialMode:
          tutorial?.id === "sale-order" || tutorial?.id === "preorder",
      }}
    >
      <View
        accessibilityElementsHidden={customerPickerOpen}
        className="flex-1"
        importantForAccessibility={
          customerPickerOpen ? "no-hide-descendants" : "auto"
        }
      >
        {children}
      </View>
      <CustomerPickerSheet />
    </OrderDraftContext.Provider>
  );
}

function ProductRow({
  item,
  onChangeQuantity,
  quantity,
  saleType,
}: LegendListRenderItemProps<PosVariant> & {
  onChangeQuantity: (variantId: string, nextQuantity: number) => void;
  quantity: number;
  saleType: SaleType;
}) {
  const isPreorder = saleType === "preorder";
  const maximumQuantity = isPreorder
    ? Number.POSITIVE_INFINITY
    : Math.max(item.stock, 0);
  const availableQuantity = isPreorder
    ? item.stock
    : Math.max(item.stock - quantity, 0);
  const stockLabel = isPreorder
    ? `${availableQuantity} on hand`
    : `${availableQuantity} left`;
  const addButton = (
    <Pressable
      accessibilityLabel={`Add one ${item.name}`}
      accessibilityRole="button"
      accessibilityHint={
        isPreorder
          ? `${quantity} currently in order. Preorders can exceed stock on hand.`
          : `${quantity} currently in order. ${availableQuantity} available.`
      }
      accessibilityState={{
        disabled: maximumQuantity === 0 || quantity >= maximumQuantity,
      }}
      accessibilityValue={{ text: `${quantity} in order` }}
      className={
        quantity > 0
          ? "h-11 w-11 items-center justify-center rounded-full bg-surface disabled:opacity-40 active:opacity-70"
          : "h-11 w-11 items-center justify-center rounded-full bg-primary-soft disabled:opacity-40 active:opacity-70"
      }
      disabled={maximumQuantity === 0 || quantity >= maximumQuantity}
      onPress={() => onChangeQuantity(item.id, quantity + 1)}
    >
      <Text className="text-xl font-semibold text-primary">+</Text>
    </Pressable>
  );

  return (
    <View
      className={
        quantity > 0
          ? "rounded-xl bg-primary-soft p-3"
          : "rounded-xl bg-surface p-3"
      }
    >
      <View className="flex-row items-center gap-3">
        <View
          accessibilityElementsHidden
          className="h-10 w-10 items-center justify-center rounded-lg bg-surface-muted"
          importantForAccessibility="no-hide-descendants"
        >
          <AppIcon name="parcel" color={colors.iconMuted} size={20} />
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-foreground"
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
            {item.sku} · {item.size} · {item.color}
          </Text>
          <Text
            className="mt-1 text-sm font-semibold text-foreground"
            numberOfLines={1}
          >
            {formatCurrency(item.priceCents)}
            <Text className="font-normal text-muted">{` · ${stockLabel}`}</Text>
          </Text>
          {isPreorder && item.stock === 0 ? (
            <Text className="mt-1 text-xs font-semibold text-warning">
              Preorder · no stock on hand
            </Text>
          ) : null}
        </View>
        {quantity === 0 ? addButton : null}
      </View>
      {quantity > 0 ? (
        <View className="mt-3 flex-row items-center justify-between border-t border-border pt-2">
          <Text className="text-sm font-semibold text-muted">
            {quantity} {quantity === 1 ? "item" : "items"} in order
          </Text>
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityLabel={`Remove one ${item.name}`}
              accessibilityRole="button"
              accessibilityValue={{ text: `${quantity} in order` }}
              className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
              onPress={() => onChangeQuantity(item.id, quantity - 1)}
            >
              <Text className="text-xl font-semibold text-foreground">−</Text>
            </Pressable>
            <Text className="min-w-5 text-center text-base font-bold text-foreground">
              {quantity}
            </Text>
            {addButton}
          </View>
        </View>
      ) : null}
    </View>
  );
}

type ProductGridCardProps = {
  item: PosVariant;
  onChangeQuantity: (variantId: string, nextQuantity: number) => void;
  quantity: number;
  saleType: SaleType;
};

function ProductGridCard({
  item,
  onChangeQuantity,
  quantity,
  saleType,
}: ProductGridCardProps) {
  const isPreorder = saleType === "preorder";
  const maximumQuantity = isPreorder
    ? Number.POSITIVE_INFINITY
    : Math.max(item.stock, 0);
  const availableQuantity = isPreorder
    ? item.stock
    : Math.max(item.stock - quantity, 0);
  const canAdd = maximumQuantity > 0 && quantity < maximumQuantity;
  const stockLabel = isPreorder
    ? `${availableQuantity} on hand`
    : `${availableQuantity} left`;

  return (
    <View
      className="flex-1 rounded-[20px] bg-surface"
      style={styles.cardShadow}
    >
      <View
        className={
          quantity > 0
            ? "flex-1 overflow-hidden rounded-[20px] border border-primary bg-surface"
            : "flex-1 overflow-hidden rounded-[20px] border border-border/70 bg-surface"
        }
      >
        <View
          className={
            quantity > 0
              ? "relative m-2 mb-0 h-28 items-center justify-center rounded-2xl bg-primary-soft"
              : "relative m-2 mb-0 h-28 items-center justify-center rounded-2xl bg-surface-muted"
          }
        >
          <View className="absolute left-2 top-2 rounded-full bg-surface px-2.5 py-1">
            <Text
              className={
                availableQuantity === 0
                  ? "text-[11px] font-bold text-warning"
                  : "text-[11px] font-semibold text-muted"
              }
              numberOfLines={1}
            >
              {stockLabel}
            </Text>
          </View>

          <View
            accessibilityElementsHidden
            className="h-12 w-12 items-center justify-center rounded-xl bg-surface"
            importantForAccessibility="no-hide-descendants"
          >
            <AppIcon name="parcel" color={colors.primary} size={24} />
          </View>

          {quantity === 0 ? (
            <Pressable
              accessibilityHint={
                isPreorder
                  ? "Preorders can exceed stock on hand."
                  : `${availableQuantity} available.`
              }
              accessibilityLabel={`Add one ${item.name}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canAdd }}
              className="absolute bottom-2 right-2 h-11 w-11 items-center justify-center rounded-full bg-surface disabled:opacity-40 active:bg-primary-soft"
              disabled={!canAdd}
              onPress={() => onChangeQuantity(item.id, 1)}
              style={styles.controlShadow}
            >
              <Text className="text-2xl font-medium text-primary">+</Text>
            </Pressable>
          ) : (
            <View
              className="absolute bottom-2 right-2 flex-row items-center rounded-full bg-surface"
              style={styles.controlShadow}
            >
              <Pressable
                accessibilityLabel={`Remove one ${item.name}`}
                accessibilityRole="button"
                accessibilityValue={{ text: `${quantity} in order` }}
                className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-muted"
                onPress={() => onChangeQuantity(item.id, quantity - 1)}
              >
                <Text className="text-xl font-semibold text-foreground">−</Text>
              </Pressable>
              <Text className="min-w-7 text-center text-sm font-bold text-foreground">
                {quantity}
              </Text>
              <Pressable
                accessibilityHint={
                  isPreorder
                    ? "Preorders can exceed stock on hand."
                    : `${availableQuantity} available.`
                }
                accessibilityLabel={`Add one ${item.name}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canAdd }}
                accessibilityValue={{ text: `${quantity} in order` }}
                className="h-11 w-11 items-center justify-center rounded-full disabled:opacity-40 active:bg-primary-soft"
                disabled={!canAdd}
                onPress={() => onChangeQuantity(item.id, quantity + 1)}
              >
                <Text className="text-xl font-semibold text-primary">+</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="min-h-24 px-3 pb-3 pt-3">
          <Text className="text-[17px] font-bold leading-5 text-foreground">
            {formatCurrency(item.priceCents)}
          </Text>
          <Text
            className="mt-1.5 text-[14px] font-semibold leading-[18px] text-foreground"
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text className="mt-1 text-xs leading-4 text-muted" numberOfLines={1}>
            {item.size} · {item.color}
          </Text>
        </View>
      </View>
    </View>
  );
}

function PaymentSelector() {
  const { paymentMethod, paymentTerms, setPaymentMethod, setPaymentTerms } =
    useOrderDraft();

  return (
    <View className="rounded-xl bg-surface p-3">
      <View className="mb-3 flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-base font-bold text-foreground">
          Payment
        </Text>
        <View className="flex-row rounded-lg bg-surface-muted p-1">
          {(
            [
              { label: "Paid now", value: "immediate" },
              { label: "Pay later", value: "credit" },
            ] as const
          ).map((option) => {
            const selected = paymentTerms === option.value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={
                  selected
                    ? "min-h-11 items-center justify-center rounded-md bg-surface px-3"
                    : "min-h-11 items-center justify-center rounded-lg px-3"
                }
                key={option.value}
                onPress={() => setPaymentTerms(option.value)}
              >
                <Text
                  className={
                    selected
                      ? "text-xs font-bold text-foreground"
                      : "text-xs font-semibold text-muted"
                  }
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {paymentTerms === "immediate" ? (
        <View className="flex-row rounded-lg bg-surface-muted p-1">
          {paymentMethods.map((method) => {
            const selected = paymentMethod === method.value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={
                  selected
                    ? "min-h-11 flex-1 items-center justify-center rounded-md bg-surface px-2"
                    : "min-h-11 flex-1 items-center justify-center rounded-md px-2"
                }
                key={method.value}
                onPress={() => setPaymentMethod(method.value)}
              >
                <Text
                  className={
                    selected
                      ? "text-center text-xs font-bold text-foreground"
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
        <Text className="text-sm leading-5 text-muted">
          Stock is deducted now. Record partial or full payments later from the
          order invoice.
        </Text>
      )}
    </View>
  );
}

function CatalogToolbar({
  onChangeSearch,
  search,
  tour,
}: {
  onChangeSearch: (search: string) => void;
  search: string;
  tour: ReturnType<typeof useLiveTutorialController>["tour"];
}) {
  const navigation = useNavigation<FlowNavigation>();
  const {
    openCustomerPicker,
    productFilter,
    saleType,
    selectedCustomer,
    tutorialMode,
  } = useOrderDraft();
  const defaultFilter = saleType === "preorder" ? "all" : "available";

  return (
    <View className="gap-3 bg-background px-4 pb-3 pt-safe-offset-2">
      <View
        className="flex-row items-center gap-3"
        {...(tutorialMode ? tour.getTargetProps("order-products") : undefined)}
      >
        <Pressable
          accessibilityLabel="Close new order"
          accessibilityRole="button"
          className="h-12 w-10 items-center justify-center active:opacity-60"
          onPress={() => navigation.getParent()?.goBack()}
        >
          <Text className="text-[26px] font-medium text-foreground">‹</Text>
        </Pressable>
        <View className="flex-1">
          <SearchField
            appearance="soft"
            filterAccessibilityLabel="Filter products"
            filterActive={productFilter !== defaultFilter}
            onChangeText={onChangeSearch}
            onFilterPress={() => navigation.navigate("ProductFilterPicker")}
            placeholder="Search products or SKU"
            value={search}
          />
        </View>
      </View>

      {tutorialMode ? (
        <Text className="px-1 text-xs font-semibold text-warning">
          Practice guide · Nothing will be saved
        </Text>
      ) : null}

      <View className="flex-row items-center gap-2">
        <View
          className="flex-1"
          {...(tutorialMode
            ? tour.getTargetProps("order-customer")
            : undefined)}
        >
          <Pressable
            accessibilityLabel={
              selectedCustomer
                ? `Selected customer ${selectedCustomer.name}`
                : "Choose customer"
            }
            accessibilityRole="button"
            className="h-12 flex-row items-center gap-3 rounded-[14px] border border-border/70 bg-surface px-3 active:bg-surface-muted"
            onPress={openCustomerPicker}
          >
            <AppIcon
              accessible={false}
              name="profile"
              color={selectedCustomer ? colors.primary : colors.iconMuted}
              size={20}
            />
            <Text
              className={
                selectedCustomer
                  ? "flex-1 text-sm font-bold text-foreground"
                  : "flex-1 text-sm font-semibold text-muted"
              }
              numberOfLines={1}
            >
              {selectedCustomer?.name ?? "Choose customer"}
            </Text>
            <Text className="text-lg text-primary">›</Text>
          </Pressable>
        </View>
        <View
          {...(tutorialMode ? tour.getTargetProps("order-type") : undefined)}
        >
          <Pressable
            accessibilityLabel="Choose order type"
            accessibilityRole="button"
            className="h-12 flex-row items-center gap-1.5 rounded-[14px] border border-border/70 bg-surface px-3 active:bg-surface-muted"
            onPress={() => navigation.navigate("OrderTypePicker")}
          >
            <Text className="text-[15px] font-semibold text-foreground">
              {saleType === "preorder" ? "Preorder" : "Sale"}
            </Text>
            <Text className="text-base text-muted">⌄</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function CatalogScreen() {
  const navigation = useNavigation<FlowNavigation>();
  const {
    catalog,
    catalogState,
    changeQuantity,
    itemCount,
    productFilter,
    quantities,
    saleType,
    totalCents,
    tutorial,
    tutorialMode,
  } = useOrderDraft();
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const filteredVariants = catalog.filter((variant) => {
    const matchesFilter =
      productFilter === "all" ||
      (productFilter === "available" && variant.stock > 0) ||
      (productFilter === "selected" && (quantities[variant.id] ?? 0) > 0);
    const matchesSearch =
      !query ||
      [variant.name, variant.sku, variant.color, variant.size].some((value) =>
        value.toLowerCase().includes(query),
      );

    return matchesFilter && matchesSearch;
  });
  const {
    showStep: showTutorialStep,
    startOnLayout,
    tour,
  } = useLiveTutorialController({
    enabled: tutorialMode,
    steps: tutorial?.steps ?? [],
  });
  return (
    <View className="flex-1 bg-background" onLayout={startOnLayout}>
      <CatalogToolbar onChangeSearch={setSearch} search={search} tour={tour} />

      <LegendList
        columnWrapperStyle={{ columnGap: 12, rowGap: 12 }}
        contentContainerStyle={{
          paddingBottom: 124,
          paddingHorizontal: 16,
          paddingTop: 4,
        }}
        data={filteredVariants}
        estimatedItemSize={220}
        extraData={quantities}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={(variant) => variant.id}
        ListEmptyComponent={
          <View className="rounded-2xl border border-border bg-surface-muted p-6">
            <Text className="text-center text-sm font-semibold text-muted">
              {catalogState === "pending"
                ? "Loading products…"
                : catalogState === "error"
                  ? "Products could not be loaded. Check the connection and try again."
                  : productFilter === "selected"
                    ? "No products selected yet."
                    : "No variants match this search and filter."}
            </Text>
          </View>
        }
        ListHeaderComponent={
          saleType === "preorder" ? (
            <View className="mb-3 flex-row gap-2 rounded-xl bg-surface p-3">
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <AppIcon name="calendar" color={colors.primary} size={18} />
              </View>
              <Text className="flex-1 text-sm leading-5 text-muted">
                Preorders can include zero-stock products. Inventory is deducted
                only when the order is fulfilled.
              </Text>
            </View>
          ) : null
        }
        maintainVisibleContentPosition
        numColumns={2}
        recycleItems
        renderItem={({ item }) => (
          <ProductGridCard
            item={item}
            onChangeQuantity={changeQuantity}
            quantity={quantities[item.id] ?? 0}
            saleType={saleType}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <View
        className="absolute bottom-0 left-0 right-0 px-4 pb-safe-offset-3 pt-2"
        {...(tutorialMode ? tour.getTargetProps("order-complete") : undefined)}
      >
        <View
          className="min-h-16 flex-row items-center gap-3 rounded-[20px] bg-surface p-2 pl-4"
          style={styles.checkoutShadow}
        >
          <View className="flex-1">
            <Text className="text-xs font-medium leading-4 text-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Text>
            <Text className="mt-0.5 text-xl font-bold leading-6 text-foreground">
              {formatCurrency(totalCents)}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={`Review order with ${itemCount} items`}
            accessibilityRole="button"
            className="h-12 min-w-36 items-center justify-center rounded-2xl bg-primary px-5 disabled:opacity-40 active:bg-primary-pressed"
            disabled={itemCount === 0}
            onPress={() => navigation.navigate("Review")}
          >
            <Text className="text-[15px] font-semibold text-on-primary">
              Review order
            </Text>
          </Pressable>
        </View>
      </View>

      {tutorialMode ? (
        <LiveTutorialOverlay
          onClose={() => navigation.getParent()?.goBack()}
          onStepChange={showTutorialStep}
          tour={tour}
        />
      ) : null}
    </View>
  );
}

function CustomerPickerSheet() {
  const { height } = useWindowDimensions();
  const {
    closeCustomerPicker,
    customerPickerOpen,
    customers,
    customersState,
    selectedCustomerId,
    setSelectedCustomerId,
  } = useOrderDraft();
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const filteredCustomers = customers.filter((customer) =>
    [customer.name, customer.detail].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );

  return (
    <ModalBottomSheet
      detents={customerSheetDetents}
      index={customerPickerOpen ? 1 : 0}
      onIndexChange={(nextIndex) => {
        if (nextIndex === 0) closeCustomerPicker();
      }}
      scrimColor={colors.overlay}
      surface={<View style={styles.sheetSurface} />}
    >
      <View
        accessibilityViewIsModal
        className="overflow-hidden rounded-t-[28px] bg-surface"
        style={{ height: height * 0.88 }}
      >
        <LegendList
          contentContainerStyle={{ paddingBottom: 32 }}
          data={filteredCustomers}
          estimatedItemSize={72}
          ItemSeparatorComponent={() => (
            <View className="mx-16 h-px bg-border" />
          )}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          keyExtractor={(customer) => customer.id}
          ListEmptyComponent={
            <View className="px-4">
              <View className="rounded-2xl bg-surface-muted p-6">
                <Text className="text-center text-sm font-semibold text-muted">
                  {customersState === "pending"
                    ? "Loading customers…"
                    : customersState === "error"
                      ? "Customers could not be loaded. Check the connection and try again."
                      : "No customers match this search."}
                </Text>
              </View>
            </View>
          }
          ListHeaderComponent={
            <View className="mb-3 bg-surface">
              <View className="flex-row items-center gap-3 border-b border-border px-4 pb-3 pt-3">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-foreground">
                    Choose customer
                  </Text>
                  <Text className="mt-0.5 text-sm text-muted">
                    Search by name, phone, or email.
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel="Close customer picker"
                  accessibilityRole="button"
                  className="h-11 w-11 items-center justify-center rounded-full bg-surface-muted active:opacity-70"
                  onPress={closeCustomerPicker}
                >
                  <Text className="text-2xl leading-7 text-foreground">×</Text>
                </Pressable>
              </View>
              <View className="px-4 py-3">
                <SearchField
                  onChangeText={setSearch}
                  placeholder="Search customers"
                  showFilterIcon={false}
                  value={search}
                />
              </View>
            </View>
          }
          recycleItems
          renderItem={({ item }) => {
            const selected = item.id === selectedCustomerId;

            return (
              <View className="px-4">
                <Pressable
                  accessibilityLabel={`Choose ${item.name}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={
                    selected
                      ? "min-h-16 flex-row items-center gap-3 rounded-xl bg-primary-soft p-3"
                      : "min-h-16 flex-row items-center gap-3 rounded-xl bg-surface p-3 active:bg-surface-muted"
                  }
                  onPress={() => {
                    setSelectedCustomerId(item.id);
                    closeCustomerPicker();
                  }}
                >
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
                    <AppIcon
                      accessible={false}
                      name="profile"
                      color={colors.iconMuted}
                      size={19}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-bold text-foreground"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className="mt-0.5 text-xs text-muted"
                      numberOfLines={1}
                    >
                      {item.detail}
                    </Text>
                  </View>
                  {selected ? (
                    <Text className="text-lg font-bold text-primary">✓</Text>
                  ) : (
                    <Text className="text-xl text-primary">›</Text>
                  )}
                </Pressable>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ModalBottomSheet>
  );
}

function OrderTypePickerScreen() {
  const navigation = useNavigation<FlowNavigation>();
  const { changeSaleType, itemCount, saleType } = useOrderDraft();
  const insets = useSafeAreaInsets();

  const selectType = (nextSaleType: SaleType) => {
    if (nextSaleType === saleType) {
      navigation.goBack();
      return;
    }

    const applyChange = () => {
      changeSaleType(nextSaleType);
      navigation.goBack();
    };

    if (itemCount === 0) {
      applyChange();
      return;
    }

    Alert.alert(
      "Change order type?",
      `Changing to ${nextSaleType === "preorder" ? "Preorder" : "In-stock sale"} clears the ${itemCount} ${itemCount === 1 ? "item" : "items"} currently selected.`,
      [
        { style: "cancel", text: "Keep current order" },
        {
          onPress: applyChange,
          style: "destructive",
          text: "Change and clear",
        },
      ],
    );
  };

  const options: {
    description: string;
    label: string;
    value: SaleType;
  }[] = [
    {
      description: "Sell available products and deduct stock when confirmed.",
      label: "In-stock sale",
      value: "sale",
    },
    {
      description:
        "Accept zero-stock products and deduct inventory after fulfillment.",
      label: "Preorder",
      value: "preorder",
    },
  ];

  return (
    <View
      className="bg-surface px-4 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      <Text className="text-xl font-bold text-foreground">Order type</Text>
      <Text className="mb-4 mt-1 text-sm leading-5 text-muted">
        Choose when inventory should be deducted.
      </Text>
      <View className="gap-3">
        {options.map((option) => {
          const selected = option.value === saleType;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={
                selected
                  ? "min-h-20 flex-row gap-3 rounded-xl bg-primary-soft p-4"
                  : "min-h-20 flex-row gap-3 rounded-xl bg-surface-muted p-4 active:opacity-70"
              }
              key={option.value}
              onPress={() => selectType(option.value)}
            >
              <View
                className={
                  selected
                    ? "mt-0.5 h-5 w-5 items-center justify-center rounded-full border-2 border-primary"
                    : "mt-0.5 h-5 w-5 rounded-full border-2 border-border"
                }
              >
                {selected ? (
                  <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                ) : null}
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground">
                  {option.label}
                </Text>
                <Text className="mt-1 text-sm leading-5 text-muted">
                  {option.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ProductFilterPickerScreen() {
  const navigation = useNavigation<FlowNavigation>();
  const { itemCount, productFilter, saleType, setProductFilter } =
    useOrderDraft();
  const insets = useSafeAreaInsets();
  const options: {
    description: string;
    label: string;
    value: ProductFilter;
  }[] = [
    {
      description: "Browse every product in the catalog.",
      label: "All products",
      value: "all",
    },
    {
      description:
        saleType === "preorder"
          ? "Only products currently on hand."
          : "Only products available to sell now.",
      label: saleType === "preorder" ? "Stocked products" : "In stock",
      value: "available",
    },
    {
      description: "Only products already added to this order.",
      label: `Selected (${itemCount})`,
      value: "selected",
    },
  ];

  const selectFilter = (nextFilter: ProductFilter) => {
    setProductFilter(nextFilter);
    navigation.goBack();
  };

  return (
    <View
      className="bg-surface px-4 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      <Text className="text-xl font-bold text-foreground">Show products</Text>
      <Text className="mb-2 mt-1 text-sm leading-5 text-muted">
        Choose which products appear in the catalog.
      </Text>
      <View>
        {options.map((option, index) => {
          const selected = option.value === productFilter;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={
                index < options.length - 1
                  ? "min-h-16 flex-row items-center gap-3 border-b border-border/70 py-3 active:opacity-60"
                  : "min-h-16 flex-row items-center gap-3 py-3 active:opacity-60"
              }
              key={option.value}
              onPress={() => selectFilter(option.value)}
            >
              <View
                className={
                  selected
                    ? "h-6 w-6 items-center justify-center rounded-full bg-primary"
                    : "h-6 w-6 rounded-full border border-border"
                }
              >
                {selected ? (
                  <Text className="text-sm font-bold text-on-primary">✓</Text>
                ) : null}
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {option.label}
                </Text>
                <Text className="mt-0.5 text-sm text-muted">
                  {option.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ReviewScreen() {
  const navigation = useNavigation<FlowNavigation>();
  const {
    cart,
    changeQuantity,
    itemCount,
    openCustomerPicker,
    paymentMethod,
    paymentTerms,
    quantities,
    saleType,
    selectedCustomer,
    selectedCustomerId,
    totalCents,
    tutorialMode,
  } = useOrderDraft();
  const checkoutMutation = usePosCheckoutMutation();
  const canCheckout =
    !tutorialMode &&
    Boolean(selectedCustomerId) &&
    itemCount > 0 &&
    !checkoutMutation.isPending;

  const handleCheckout = async () => {
    if (!canCheckout || !selectedCustomerId) return;

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
      navigation.getParent()?.goBack();
    } catch {
      // The mutation state renders a safe, actionable error below.
    }
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-1">
        <Pressable
          accessibilityLabel="Back to products"
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-muted"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-2xl text-foreground">‹</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground">
            Review order
          </Text>
          <Text className="text-xs font-semibold text-muted">
            {saleType === "preorder" ? "Preorder" : "In-stock sale"} ·{" "}
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Text>
        </View>
        <Text className="text-lg font-bold text-foreground">
          {formatCurrency(totalCents)}
        </Text>
      </View>

      <LegendList
        contentContainerStyle={{ padding: 16, paddingBottom: 124 }}
        data={cart.map(({ variant }) => variant)}
        estimatedItemSize={96}
        extraData={quantities}
        ItemSeparatorComponent={() => <View className="h-2" />}
        keyExtractor={(variant) => variant.id}
        ListFooterComponent={
          <View className="gap-3 pt-4">
            {saleType === "sale" ? (
              <PaymentSelector />
            ) : (
              <View className="flex-row gap-2 rounded-xl bg-surface p-4">
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <AppIcon name="calendar" color={colors.primary} size={20} />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-foreground">
                    Payment after fulfillment
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-muted">
                    Confirm the request now. Allocate stock and record payment
                    when the products arrive.
                  </Text>
                </View>
              </View>
            )}
          </View>
        }
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <View>
              <Text className="mb-2 text-xs font-bold uppercase tracking-[1px] text-subtle">
                Customer
              </Text>
              <Pressable
                accessibilityLabel={
                  selectedCustomer
                    ? `Change customer ${selectedCustomer.name}`
                    : "Choose customer before confirming"
                }
                accessibilityRole="button"
                className={
                  selectedCustomer
                    ? "min-h-16 flex-row items-center gap-3 rounded-xl bg-surface p-3 active:bg-surface-muted"
                    : "min-h-16 flex-row items-center gap-3 rounded-xl bg-surface p-3 active:bg-surface-muted"
                }
                onPress={openCustomerPicker}
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
                  <AppIcon
                    accessible={false}
                    name="profile"
                    color={colors.iconMuted}
                    size={19}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-foreground">
                    {selectedCustomer?.name ?? "Choose customer"}
                  </Text>
                  <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
                    {selectedCustomer?.detail ??
                      "A customer is required to track payments and balance."}
                  </Text>
                </View>
                <Text className="text-xl text-primary">›</Text>
              </Pressable>
            </View>
            <Text className="text-xs font-bold uppercase tracking-[1px] text-subtle">
              Items
            </Text>
          </View>
        }
        maintainVisibleContentPosition
        recycleItems
        renderItem={(props) => (
          <ProductRow
            {...props}
            onChangeQuantity={changeQuantity}
            quantity={quantities[props.item.id] ?? 0}
            saleType={saleType}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface px-4 pb-safe-offset-2 pt-2">
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
                  : "Choose a customer"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-on-primary">
            {tutorialMode ? "DEMO" : formatCurrency(totalCents)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const FlowStack = createNativeStackNavigator<NewOrderFlowParamList>();

function NewOrderFlow() {
  return (
    <FlowStack.Navigator
      initialRouteName="Catalog"
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
        headerShown: false,
      }}
    >
      <FlowStack.Screen component={CatalogScreen} name="Catalog" />
      <FlowStack.Screen component={ReviewScreen} name="Review" />
      <FlowStack.Screen
        component={OrderTypePickerScreen}
        name="OrderTypePicker"
        options={{
          contentStyle: { backgroundColor: colors.surface },
          presentation: "formSheet",
          sheetAllowedDetents: "fitToContents",
          sheetCornerRadius: 28,
          sheetGrabberVisible: true,
        }}
      />
      <FlowStack.Screen
        component={ProductFilterPickerScreen}
        name="ProductFilterPicker"
        options={{
          contentStyle: { backgroundColor: colors.surface },
          presentation: "formSheet",
          sheetAllowedDetents: "fitToContents",
          sheetCornerRadius: 28,
          sheetGrabberVisible: true,
        }}
      />
    </FlowStack.Navigator>
  );
}

export default function NewOrderScreen() {
  const route = useRoute<NewOrderRoute>();
  const tutorial = route.params?.tutorialId
    ? findStaffTutorial(route.params.tutorialId)
    : null;

  return (
    <OrderDraftProvider tutorial={tutorial}>
      <NewOrderFlow />
    </OrderDraftProvider>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    boxShadow: "0 3px 14px rgba(20, 32, 51, 0.07)",
  },
  checkoutShadow: {
    boxShadow: "0 6px 24px rgba(20, 32, 51, 0.12)",
  },
  controlShadow: {
    boxShadow: "0 2px 10px rgba(20, 32, 51, 0.07)",
  },
  sheetSurface: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    boxShadow: `0 -4px 12px ${colors.shadow}`,
  },
});
