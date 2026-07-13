import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import { Pressable, Text, View } from "react-native";

import AppIcon from "../../components/icons/AppIcon";
import OperationsHeader from "../../components/operations/OperationsHeader";
import SearchField from "../../components/operations/SearchField";
import StatusPill from "../../components/operations/StatusPill";
import {
  type Customer,
  useCustomersQuery,
} from "../../features/operations/queries";
import { colors } from "../../theme";

function CustomerCard({ item: customer }: LegendListRenderItemProps<Customer>) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
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
        label={customer.state}
        tone={customer.state === "Active" ? "success" : "warning"}
      />
    </Pressable>
  );
}

export default function CustomersScreen() {
  const customersQuery = useCustomersQuery();

  return (
    <View className="flex-1 bg-background pt-safe">
      <OperationsHeader
        title="Customers"
        subtitle="Create profiles and review customer history."
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20 }}
        data={customersQuery.data ?? []}
        estimatedItemSize={88}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(customer) => customer.name}
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <SearchField placeholder="Search name, phone, or email" />
            <Pressable
              accessibilityRole="button"
              className="min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:bg-primary-pressed"
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
            <View className="rounded-2xl border border-warning/30 bg-warning-soft p-4">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
                  <AppIcon
                    name="notification"
                    color={colors.warning}
                    size={19}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">
                    3 customers need approval
                  </Text>
                  <Text className="mt-0.5 text-xs leading-4 text-muted">
                    Review web registrations before they can sign in.
                  </Text>
                </View>
                <Text className="text-sm font-bold text-warning">Review</Text>
              </View>
            </View>
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
