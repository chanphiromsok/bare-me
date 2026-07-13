import {
  LegendList,
  type LegendListRenderItemProps,
} from "@legendapp/list/react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import { Text, View } from "react-native";

import AppIcon from "../../components/icons/AppIcon";
import StatusPill from "../../components/operations/StatusPill";
import TaskHeader from "../../components/operations/TaskHeader";
import {
  type ProductDetail,
  useProductDetailQuery,
} from "../../features/operations/productQueries";
import type { ProductsStackParamList } from "../../navigation/productsStack";
import { colors } from "../../theme/colors";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

type DetailRoute = RouteProp<ProductsStackParamList, "ProductDetail">;
type Variant = ProductDetail["variants"][number];

function VariantCard({ item }: LegendListRenderItemProps<Variant>) {
  return (
    <View className="rounded-2xl border border-border bg-surface p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
          <AppIcon name="parcel" color={colors.primary} size={21} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">
            {item.sku}
          </Text>
          <Text className="mt-1 text-sm text-muted">
            {item.size} · {item.color}
          </Text>
        </View>
        <Text className="text-base font-bold text-foreground">
          {currencyFormatter.format(item.priceCents / 100)}
        </Text>
      </View>
      <View className="mt-4 flex-row items-center justify-between border-t border-border pt-3">
        <StatusPill
          label={item.active ? "Active" : "Inactive"}
          tone={item.active ? "success" : "neutral"}
        />
        <Text className="text-sm font-semibold text-subtle">
          {item.stock} in stock
        </Text>
      </View>
    </View>
  );
}

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<DetailRoute>();
  const productQuery = useProductDetailQuery(route.params.productId);
  const product = productQuery.data;

  return (
    <View className="flex-1 bg-background">
      <TaskHeader
        onBack={() => navigation.goBack()}
        subtitle="Variants, pricing, and current stock."
        title={product?.name ?? "Product details"}
      />
      <LegendList
        contentContainerStyle={{ paddingBottom: 48, paddingHorizontal: 20 }}
        data={product?.variants ?? []}
        estimatedItemSize={116}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(variant) => variant.id}
        ListEmptyComponent={
          <Text className="py-8 text-center text-sm text-muted">
            {productQuery.isPending
              ? "Loading product…"
              : productQuery.isError
                ? productQuery.error.message
                : "This product has no variants."}
          </Text>
        }
        ListHeaderComponent={
          product ? (
            <View className="mb-5 rounded-2xl border border-border bg-surface p-4">
              <Text className="text-xs font-bold uppercase tracking-[1px] text-subtle">
                {product.category}
              </Text>
              <Text className="mt-2 text-sm leading-5 text-muted">
                {product.description || "No product description."}
              </Text>
              <Text className="mt-4 text-sm font-bold text-foreground">
                {product.variants.length}{" "}
                {product.variants.length === 1 ? "variant" : "variants"}
              </Text>
            </View>
          ) : null
        }
        recycleItems
        renderItem={(props) => <VariantCard {...props} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
