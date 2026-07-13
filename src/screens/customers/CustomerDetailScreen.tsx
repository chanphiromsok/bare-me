import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import { Pressable, Text, View } from "react-native";

import StatusPill from "../../components/operations/StatusPill";
import TaskHeader from "../../components/operations/TaskHeader";
import {
  type CustomerOrder,
  useCustomerDetailQuery,
} from "../../features/operations/customerQueries";
import type { CustomersStackParamList } from "../../navigation/customersStack";

type DetailRoute = RouteProp<CustomersStackParamList, "CustomerDetail">;

function OrderCard({ item }: LegendListRenderItemProps<CustomerOrder>) {
  const navigation = useNavigation();

  return (
    <Pressable
      accessibilityLabel={`Open order ${item.number}`}
      accessibilityRole="button"
      className="flex-row items-center rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
      onPress={() =>
        navigation.getParent()?.navigate("Orders", {
          screen: "OrderDetail",
          params: { orderId: item.id },
          initial: false,
        })
      }
    >
      <View className="flex-1">
        <Text className="text-base font-bold text-foreground">
          Order {item.number}
        </Text>
        <Text className="mt-1 text-sm font-semibold text-muted">
          {item.total}
        </Text>
      </View>
      <StatusPill
        label={item.status}
        tone={
          item.status === "Fulfilled"
            ? "success"
            : item.status === "Cancelled"
              ? "neutral"
              : "warning"
        }
      />
    </Pressable>
  );
}

export default function CustomerDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<DetailRoute>();
  const detailQuery = useCustomerDetailQuery(route.params.customerId);
  const customer = detailQuery.data?.customer;

  return (
    <View className="flex-1 bg-background">
      <TaskHeader
        onBack={() => navigation.goBack()}
        subtitle="Contact information and order history."
        title={customer?.name ?? "Customer details"}
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 48, paddingHorizontal: 20 }}
        data={detailQuery.data?.orders ?? []}
        estimatedItemSize={84}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(order) => order.id}
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
          customer ? (
            <View className="mb-5 gap-4">
              <View className="rounded-2xl border border-border bg-surface p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-bold uppercase tracking-[1px] text-subtle">
                    {customer.type} customer
                  </Text>
                  <StatusPill
                    label={customer.confirmed ? "Confirmed" : "Needs approval"}
                    tone={customer.confirmed ? "success" : "warning"}
                  />
                </View>
                {customer.businessName ? (
                  <Text className="mt-4 text-sm text-muted">
                    Contact: {customer.contactName}
                  </Text>
                ) : null}
                <Text className="mt-3 text-sm text-muted">
                  Phone: {customer.phone ?? "Not provided"}
                </Text>
                <Text className="mt-2 text-sm text-muted">
                  Email: {customer.email ?? "Not provided"}
                </Text>
              </View>
              <Text className="text-base font-bold text-foreground">
                Order history
              </Text>
            </View>
          ) : null
        }
        recycleItems
        renderItem={(props) => <OrderCard {...props} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
