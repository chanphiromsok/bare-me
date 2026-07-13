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
  type Product,
  useProductsQuery,
} from "../../features/operations/queries";
import { colors } from "../../theme";

function ProductCard({ item: product }: LegendListRenderItemProps<Product>) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center gap-4 rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
    >
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
        <AppIcon name="parcel" color={colors.primary} size={25} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-foreground">
          {product.name}
        </Text>
        <Text className="mt-1 text-sm text-muted">
          {product.category} · {product.variants}
        </Text>
        <View className="mt-2 self-start">
          <StatusPill
            label={product.stock}
            tone={product.low ? "warning" : "success"}
          />
        </View>
      </View>
      <AppIcon name="arrow-range" color={colors.iconMuted} size={18} />
    </Pressable>
  );
}

export default function ProductsScreen() {
  const productsQuery = useProductsQuery();

  return (
    <View className="flex-1 bg-background pt-safe">
      <OperationsHeader
        title="Products"
        subtitle="Manage products, variants, pricing, and stock."
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20 }}
        data={productsQuery.data ?? []}
        estimatedItemSize={104}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(product) => product.name}
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <SearchField placeholder="Search SKU, barcode, or product" />
            <View className="flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:bg-primary-pressed"
              >
                <AppIcon name="parcel" color={colors.textOnPrimary} size={20} />
                <Text className="text-sm font-bold text-on-primary">
                  Add product
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-surface active:bg-surface-muted"
              >
                <AppIcon name="scan" color={colors.primary} size={20} />
                <Text className="text-sm font-bold text-primary">Restock</Text>
              </Pressable>
            </View>
          </View>
        }
        maintainVisibleContentPosition
        recycleItems
        renderItem={(props) => <ProductCard {...props} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
