import { useQuery } from "@tanstack/react-query";

import {
  getApiProductsById,
  getApiProductVariants,
} from "../../api/generated/sdk.gen";
import type {
  Product as ApiProduct,
  ProductVariant as ApiProductVariant,
} from "../../api/generated/types.gen";

export type ProductSummary = {
  category: string;
  id: string;
  low: boolean;
  name: string;
  stock: string;
  variants: string;
};

export type ProductDetail = {
  category: string;
  description?: string;
  id: string;
  name: string;
  variants: {
    active: boolean;
    color: string;
    id: string;
    priceCents: number;
    size: string;
    sku: string;
    stock: number;
  }[];
};

async function loadVariants(): Promise<ApiProductVariant[]> {
  const response = await getApiProductVariants({
    query: { page: { limit: 100 }, sort: "sku" },
  });

  return response.data.data ?? [];
}

export function useProductListQuery() {
  return useQuery({
    queryKey: ["operations", "products"],
    queryFn: async (): Promise<ProductSummary[]> => {
      const response = await getApiProductVariants({
        query: {
          include: "product",
          page: { limit: 100 },
          sort: "sku",
        },
      });
      const products = new Map(
        (response.data.included ?? [])
          .filter(
            (resource): resource is ApiProduct =>
              typeof resource === "object" &&
              resource !== null &&
              "type" in resource &&
              resource.type === "product",
          )
          .map((product) => [product.id, product]),
      );
      const grouped = new Map<
        string,
        { category: string; name: string; stock: number; variants: number }
      >();

      for (const variant of response.data.data ?? []) {
        const attributes = variant.attributes;
        const productId = variant.relationships?.product?.data?.id;
        if (!attributes || !productId || !attributes.active) continue;

        const product = products.get(productId);
        const current = grouped.get(productId);
        grouped.set(productId, {
          category:
            (typeof product?.attributes?.category === "string" &&
              product.attributes.category) ||
            "Uncategorized",
          name: product?.attributes?.name ?? attributes.sku,
          stock: (current?.stock ?? 0) + attributes.quantity_on_hand,
          variants: (current?.variants ?? 0) + 1,
        });
      }

      return Array.from(grouped.entries()).map(([id, product]) => ({
        category: product.category,
        id,
        low: product.stock <= 5,
        name: product.name,
        stock: `${product.stock} in stock`,
        variants: `${product.variants} ${product.variants === 1 ? "variant" : "variants"}`,
      }));
    },
  });
}

export function useProductDetailQuery(productId: string) {
  return useQuery({
    queryKey: ["operations", "products", "detail", productId],
    queryFn: async (): Promise<ProductDetail> => {
      const [productResponse, variants] = await Promise.all([
        getApiProductsById({ path: { id: productId } }),
        loadVariants(),
      ]);
      const product = productResponse.data.data;
      if (!product?.attributes)
        throw new Error("Product details were not returned.");

      return {
        category:
          (typeof product.attributes.category === "string" &&
            product.attributes.category) ||
          "Uncategorized",
        description:
          typeof product.attributes.description === "string"
            ? product.attributes.description
            : undefined,
        id: product.id,
        name: product.attributes.name,
        variants: variants.flatMap((variant) => {
          const attributes = variant.attributes;
          if (
            !attributes ||
            attributes.product_id !== productId
          ) {
            return [];
          }

          return [
            {
              active: attributes.active,
              color: attributes.color,
              id: variant.id,
              priceCents: attributes.price_cents,
              size: attributes.size,
              sku: attributes.sku,
              stock: attributes.quantity_on_hand,
            },
          ];
        }),
      };
    },
  });
}
