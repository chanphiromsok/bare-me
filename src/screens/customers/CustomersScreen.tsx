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
import { Pressable, Text, View } from "react-native";

import AppIcon from "../../components/icons/AppIcon";
import OperationsHeader from "../../components/operations/OperationsHeader";
import SearchField from "../../components/operations/SearchField";
import StatusPill from "../../components/operations/StatusPill";
import {
  type CustomerSummary,
  useCustomerListQuery,
} from "../../features/operations/customerQueries";
import { colors } from "../../theme/colors";

function CustomerCard({
  item: customer,
}: LegendListRenderItemProps<CustomerSummary>) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <Pressable
      accessibilityLabel={`Open ${customer.name}`}
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
      onPress={() =>
        navigation.navigate("CustomerDetail", { customerId: customer.id })
      }
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
        <Text className="text-sm font-bold text-primary">
          {customer.initials}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-foreground">
          {customer.name}
        </Text>
        <Text className="mt-1 text-sm text-muted">{customer.detail}</Text>
      </View>
      <StatusPill
        label={customer.confirmed ? "Confirmed" : "Needs approval"}
        tone={customer.confirmed ? "success" : "warning"}
      />
    </Pressable>
  );
}

export default function CustomersScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const customersQuery = useCustomerListQuery();
  const [search, setSearch] = useState("");
  const customers = (() => {
    const term = search.trim().toLowerCase();
    if (!term) return customersQuery.data ?? [];

    return (customersQuery.data ?? []).filter((customer) =>
      `${customer.name} ${customer.detail}`.toLowerCase().includes(term),
    );
  })();

  return (
    <View className="flex-1 bg-background pt-safe">
      <OperationsHeader
        title="Customers"
        subtitle="Create profiles and review customer history."
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20 }}
        data={customers}
        estimatedItemSize={88}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(customer) => customer.id}
        ListEmptyComponent={
          <Text className="py-8 text-center text-sm text-muted">
            {customersQuery.isPending
              ? "Loading customers…"
              : customersQuery.isError
                ? "Customers could not be loaded."
                : "No customers match your search."}
          </Text>
        }
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <SearchField
              onChangeText={setSearch}
              placeholder="Search name, phone, or email"
              value={search}
            />
            <Pressable
              accessibilityRole="button"
              className="min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:bg-primary-pressed"
              onPress={() => navigation.navigate("NewCustomer")}
            >
              <AppIcon
                name="self-service"
                color={colors.textOnPrimary}
                size={20}
              />
              <Text className="text-sm font-bold text-on-primary">
                Create customer
              </Text>
            </Pressable>
          </View>
        }
        maintainVisibleContentPosition
        recycleItems
        renderItem={(props) => <CustomerCard {...props} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
