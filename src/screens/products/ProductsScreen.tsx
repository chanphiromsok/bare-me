import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import AppIcon from "../../components/icons/AppIcon";
import OperationsHeader from "../../components/operations/OperationsHeader";
import SearchField from "../../components/operations/SearchField";
import StatusPill from "../../components/operations/StatusPill";
import {
  type ProductSummary,
  useProductListQuery,
} from "../../features/operations/productQueries";
import type { ProductsStackParamList } from "../../navigation/productsStack";
import { colors } from "../../theme/colors";

type ProductsNavigation = NativeStackNavigationProp<
  ProductsStackParamList,
  "ProductList"
>;

type ProductCardProps = LegendListRenderItemProps<ProductSummary> & {
  onPress: (productId: string) => void;
};

function ProductCard({ item: product, onPress }: ProductCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Open ${product.name}`}
      accessibilityRole="button"
      className="flex-row items-center gap-4 rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
      onPress={() => onPress(product.id)}
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
  const navigation = useNavigation<ProductsNavigation>();
  const productsQuery = useProductListQuery();
  const [search, setSearch] = useState("");
  const products = (() => {
    const term = search.trim().toLowerCase();
    if (!term) return productsQuery.data ?? [];

    return (productsQuery.data ?? []).filter((product) =>
      `${product.name} ${product.category}`.toLowerCase().includes(term),
    );
  })();

  return (
    <View className="flex-1 bg-background pt-safe">
      <OperationsHeader
        title="Products"
        subtitle="Manage products, variants, pricing, and stock."
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20 }}
        data={products}
        estimatedItemSize={104}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(product) => product.id}
        ListEmptyComponent={
          <Text className="py-8 text-center text-sm text-muted">
            {productsQuery.isPending
              ? "Loading products…"
              : productsQuery.isError
                ? "Products could not be loaded."
                : "No products match your search."}
          </Text>
        }
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <SearchField
              onChangeText={setSearch}
              placeholder="Search product or category"
              value={search}
            />
            <View className="flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:bg-primary-pressed"
                onPress={() => navigation.navigate("NewProduct")}
              >
                <AppIcon name="parcel" color={colors.textOnPrimary} size={20} />
                <Text className="text-sm font-bold text-on-primary">
                  Add product
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-surface active:bg-surface-muted"
                onPress={() => navigation.navigate("Restock")}
              >
                <AppIcon name="scan" color={colors.primary} size={20} />
                <Text className="text-sm font-bold text-primary">Restock</Text>
              </Pressable>
            </View>
          </View>
        }
        maintainVisibleContentPosition
        recycleItems
        renderItem={(props) => (
          <ProductCard
            {...props}
            onPress={(productId) =>
              navigation.navigate("ProductDetail", { productId })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
