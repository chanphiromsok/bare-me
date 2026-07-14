import { useAtomValue, useSetAtom } from "jotai";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  defaultOrderListOptions,
  orderListOptionsAtom,
  type OrderCreatedSort,
  type OrderListOptions,
  type OrderStatusFilter,
} from "../../features/operations/filters";
import type { OrdersStackParamList } from "../../navigation/ordersStack";

type FilterNavigation = NativeStackNavigationProp<
  OrdersStackParamList,
  "OrderFilters"
>;

type FilterOption<T extends string> = {
  label: string;
  value: T;
};

const statusOptions: FilterOption<OrderStatusFilter>[] = [
  { label: "All orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Fulfilled", value: "fulfilled" },
];

const sortOptions: FilterOption<OrderCreatedSort>[] = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
];

type OptionGroupProps<T extends string> = {
  onChange: (value: T) => void;
  options: FilterOption<T>[];
  value: T;
};

function OptionGroup<T extends string>({
  onChange,
  options,
  value,
}: OptionGroupProps<T>) {
  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-surface">
      {options.map((option, index) => {
        const selected = option.value === value;

        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            className={[
              "min-h-14 flex-row items-center justify-between px-4 active:bg-surface-muted",
              index > 0 ? "border-t border-border" : "",
            ].join(" ")}
            key={option.value}
            onPress={() => onChange(option.value)}
          >
            <Text
              className={
                selected
                  ? "text-[15px] font-bold text-foreground"
                  : "text-[15px] font-medium text-subtle"
              }
            >
              {option.label}
            </Text>
            <View
              className={
                selected
                  ? "h-6 w-6 items-center justify-center rounded-full border-2 border-primary"
                  : "h-6 w-6 rounded-full border-2 border-border"
              }
            >
              {selected ? (
                <View className="h-3 w-3 rounded-full bg-primary" />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function OrderFiltersScreen() {
  const navigation = useNavigation<FilterNavigation>();
  const appliedOptions = useAtomValue(orderListOptionsAtom);
  const setAppliedOptions = useSetAtom(orderListOptionsAtom);
  const [draftOptions, setDraftOptions] =
    useState<OrderListOptions>(appliedOptions);

  const applyFilters = () => {
    setAppliedOptions(draftOptions);
    navigation.goBack();
  };

  return (
    <View className="bg-surface px-5 pb-6 pt-2">
      <View className="mb-5 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          className="min-h-11 justify-center pr-4"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-[15px] font-semibold text-primary">Cancel</Text>
        </Pressable>
        <Text className="text-lg font-bold text-foreground">Filter orders</Text>
        <Pressable
          accessibilityRole="button"
          className="min-h-11 justify-center pl-4"
          onPress={() => setDraftOptions(defaultOrderListOptions)}
        >
          <Text className="text-[15px] font-semibold text-primary">Reset</Text>
        </Pressable>
      </View>

      <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
        Status
      </Text>
      <OptionGroup
        onChange={(status) =>
          setDraftOptions((current) => ({ ...current, status }))
        }
        options={statusOptions}
        value={draftOptions.status}
      />

      <Text className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-muted">
        Created date
      </Text>
      <OptionGroup
        onChange={(sort) =>
          setDraftOptions((current) => ({ ...current, sort }))
        }
        options={sortOptions}
        value={draftOptions.sort}
      />

      <Pressable
        accessibilityRole="button"
        className="mt-6 min-h-13 items-center justify-center rounded-2xl bg-primary px-5 active:bg-primary-pressed"
        onPress={applyFilters}
      >
        <Text className="text-base font-bold text-on-primary">Show orders</Text>
      </Pressable>
    </View>
  );
}
