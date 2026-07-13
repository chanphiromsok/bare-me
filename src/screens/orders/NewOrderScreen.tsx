import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { PosVariant } from "../../api/pos/queries";
import {
  usePosCatalogQuery,
  usePosCustomersQuery,
} from "../../api/pos/queries";
import {
  type PosPaymentMethod,
  usePosCheckoutMutation,
} from "../../api/pos/usePosCheckoutMutation";
import AppIcon from "../../components/icons/AppIcon";
import SearchField from "../../components/operations/SearchField";
import { colors } from "../../theme";

const paymentMethods: {
  label: string;
  value: PosPaymentMethod;
}[] = [
  { label: "Cash", value: "cash" },
  { label: "Bank transfer", value: "bank_transfer" },
  { label: "Manual card", value: "card_manual" },
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(cents / 100);
}

type ProductRowProps = LegendListRenderItemProps<PosVariant> & {
  onChangeQuantity: (variantId: string, nextQuantity: number) => void;
  quantity: number;
};

function ProductRow({ item, onChangeQuantity, quantity }: ProductRowProps) {
  const maximumQuantity = Math.max(item.stock, 0);

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
          {formatCurrency(item.priceCents)} · {item.stock} available
        </Text>
      </View>
      <View className="items-center gap-1.5">
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityLabel={`Remove one ${item.name}`}
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-muted disabled:opacity-40"
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
            className="h-9 w-9 items-center justify-center rounded-full bg-primary disabled:opacity-40"
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

export default function NewOrderScreen() {
  const navigation = useNavigation();
  const customersQuery = usePosCustomersQuery();
  const catalogQuery = usePosCatalogQuery();
  const checkoutMutation = usePosCheckoutMutation();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>("cash");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const variants = useMemo(() => {
    const query = search.trim().toLowerCase();
    const catalog = catalogQuery.data ?? [];

    if (!query) return catalog;

    return catalog.filter((variant) =>
      [variant.name, variant.sku, variant.color, variant.size].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [catalogQuery.data, search]);

  const cart = useMemo(
    () =>
      (catalogQuery.data ?? []).flatMap((variant) => {
        const quantity = quantities[variant.id] ?? 0;

        return quantity > 0 ? [{ quantity, variant }] : [];
      }),
    [catalogQuery.data, quantities],
  );
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCents = cart.reduce(
    (total, item) => total + item.quantity * item.variant.priceCents,
    0,
  );
  const canCheckout =
    Boolean(selectedCustomerId) && itemCount > 0 && !checkoutMutation.isPending;

  const changeQuantity = (variantId: string, nextQuantity: number) => {
    setQuantities((current) => ({
      ...current,
      [variantId]: Math.max(nextQuantity, 0),
    }));
  };

  const handleCheckout = async () => {
    if (!selectedCustomerId || itemCount === 0) return;

    try {
      await checkoutMutation.mutateAsync({
        customerId: selectedCustomerId,
        items: cart.map(({ quantity, variant }) => ({
          productVariantId: variant.id,
          quantity,
        })),
        paymentMethod,
        totalCents,
      });
      navigation.goBack();
    } catch {
      // The mutation state renders a safe, actionable error below.
    }
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <View className="flex-row items-center gap-3 px-5 pb-4 pt-3">
        <Pressable
          accessibilityLabel="Back to orders"
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface active:bg-surface-muted"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-2xl text-primary">‹</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">New sale</Text>
          <Text className="text-sm text-muted">
            Customer, items, and payment
          </Text>
        </View>
        <View className="rounded-full bg-primary-soft px-3 py-2">
          <Text className="text-sm font-bold text-primary">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Text>
        </View>
      </View>

      <LegendList
        contentContainerStyle={{ paddingBottom: 224, paddingHorizontal: 20 }}
        data={variants}
        estimatedItemSize={104}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(variant) => variant.id}
        ListEmptyComponent={
          <View className="rounded-2xl border border-border bg-surface p-6">
            <Text className="text-center text-sm text-muted">
              {catalogQuery.isPending
                ? "Loading products…"
                : "No in-stock variants match your search."}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <View>
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

            <View>
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
        recycleItems
        renderItem={(props) => (
          <ProductRow
            {...props}
            onChangeQuantity={changeQuantity}
            quantity={quantities[props.item.id] ?? 0}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface px-5 pb-safe-offset-4 pt-4">
        <Text className="mb-2 text-xs font-bold uppercase tracking-[1px] text-subtle">
          3 · Payment
        </Text>
        <View className="mb-3 flex-row gap-2">
          {paymentMethods.map((method) => {
            const selected = paymentMethod === method.value;

            return (
              <Pressable
                accessibilityRole="button"
                className={
                  selected
                    ? "min-h-10 flex-1 items-center justify-center rounded-xl bg-primary-soft px-2"
                    : "min-h-10 flex-1 items-center justify-center rounded-xl border border-border px-2"
                }
                key={method.value}
                onPress={() => setPaymentMethod(method.value)}
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
        {checkoutMutation.isError ? (
          <Text accessibilityRole="alert" className="mb-2 text-sm text-danger">
            Sale could not be completed. Check stock and connection, then try
            again.
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
              {checkoutMutation.isPending
                ? "Completing sale…"
                : "Complete sale"}
            </Text>
            <Text className="text-base font-bold text-on-primary">
              {selectedCustomerId
                ? `${itemCount} ${itemCount === 1 ? "item" : "items"}`
                : "Select a customer"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-on-primary">
            {formatCurrency(totalCents)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
