import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { getApiErrorMessage } from "../../api/errorMessage";
import { useRestockMutation } from "../../api/operations/mutations";
import { type PosVariant, usePosCatalogQuery } from "../../api/pos/queries";
import TextController from "../../components/form/TextController";
import SearchField from "../../components/operations/SearchField";
import TaskHeader from "../../components/operations/TaskHeader";

type RestockFormValues = {
  note: string;
  quantity: string;
};

export default function RestockScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const catalogQuery = usePosCatalogQuery();
  const restock = useRestockMutation();
  const [search, setSearch] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const { control, handleSubmit, reset } = useForm<RestockFormValues>({
    defaultValues: { note: "", quantity: "" },
  });
  const variants = (() => {
    const term = search.trim().toLowerCase();
    if (!term) return catalogQuery.data ?? [];

    return (catalogQuery.data ?? []).filter((variant) =>
      [variant.name, variant.sku, variant.size, variant.color].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  })();
  const selectedVariant =
    catalogQuery.data?.find((variant) => variant.id === selectedVariantId) ??
    null;

  const submit = handleSubmit(async (values) => {
    if (!selectedVariant) return;

    try {
      await restock.mutateAsync({
        note: values.note.trim(),
        quantity: Number.parseInt(values.quantity, 10),
        variantId: selectedVariant.id,
      });
      reset();
      Keyboard.dismiss();
    } catch {
      // Mutation state renders the API error below.
    }
  });

  const renderVariant = ({ item }: LegendListRenderItemProps<PosVariant>) => {
    const selected = selectedVariantId === item.id;

    return (
      <Pressable
        accessibilityLabel={`${item.name}, ${item.sku}, ${item.stock} available`}
        accessibilityRole="button"
        className={
          selected
            ? "rounded-2xl border-2 border-primary bg-primary-soft p-4"
            : "rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
        }
        onPress={() => {
          restock.reset();
          setSelectedVariantId(item.id);
        }}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="font-bold text-foreground">{item.name}</Text>
            <Text className="mt-1 text-sm text-muted">
              {item.sku} · {item.size} · {item.color}
            </Text>
          </View>
          <Text className="font-semibold text-primary">{item.stock} stock</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <TaskHeader
        onBack={() => navigation.goBack()}
        subtitle="Choose a variant and enter the quantity received."
        title="Restock inventory"
      />
      <View className="flex-1 px-5 pt-4">
        <SearchField
          onChangeText={setSearch}
          placeholder="Search SKU or product"
          value={search}
        />
        <LegendList
          contentContainerStyle={{ paddingBottom: 16, paddingTop: 16 }}
          data={variants}
          estimatedItemSize={86}
          ItemSeparatorComponent={() => <View className="h-3" />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text className="py-8 text-center text-sm text-muted">
              {catalogQuery.isPending
                ? "Loading variants…"
                : catalogQuery.isError
                  ? "Variants could not be loaded."
                  : "No variants match your search."}
            </Text>
          }
          recycleItems
          renderItem={renderVariant}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View className="gap-4 border-t border-border bg-surface px-5 pb-safe-offset-5 pt-4">
        <Text className="font-bold text-foreground">
          {selectedVariant
            ? `Receiving ${selectedVariant.sku}`
            : "Select a variant above"}
        </Text>
        <View className="flex-row gap-3">
          <TextController
            control={control}
            keyboardType="number-pad"
            label="Quantity"
            name="quantity"
            placeholder="10"
            rules={{
              required: "Quantity is required",
              validate: (value) =>
                (Number.isInteger(Number(value)) && Number(value) > 0) ||
                "Enter a whole number greater than zero",
            }}
            wrapperStyle={{ flex: 1 }}
          />
          <TextController
            control={control}
            label="Note (optional)"
            name="note"
            placeholder="Supplier delivery"
            wrapperStyle={{ flex: 2 }}
          />
        </View>
        {restock.isError ? (
          <Text accessibilityRole="alert" className="text-sm text-danger">
            {getApiErrorMessage(restock.error, "Stock could not be updated.")}
          </Text>
        ) : null}
        {restock.isSuccess && selectedVariant ? (
          <Text accessibilityRole="alert" className="text-sm text-success">
            Stock updated. {selectedVariant.sku} now has {selectedVariant.stock}{" "}
            in stock.
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          className="min-h-13 items-center justify-center rounded-xl bg-primary active:bg-primary-pressed disabled:opacity-40"
          disabled={!selectedVariant || restock.isPending}
          onPress={submit}
        >
          <Text className="font-bold text-on-primary">
            {restock.isPending ? "Updating stock…" : "Confirm restock"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
