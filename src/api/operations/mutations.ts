import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { operationQueryKeys } from "../../features/operations/queries";
import type { ProductDetail } from "../../features/operations/productQueries";
import {
  postApiCustomersStaff,
  postApiProducts,
  postApiProductVariants,
  postApiProductVariantsByProductVariantIdRestock,
} from "../generated/sdk.gen";
import {
  createMutationUuid,
  isDuplicateMutationError,
} from "../mutationReference";
import { type PosVariant, posQueryKeys } from "../pos/queries";

export type CreateCustomerInput = {
  businessName?: string;
  customerType: "retail" | "wholesale";
  email?: string;
  name: string;
  phone?: string;
};

export type CreateProductInput = {
  barcode?: string;
  category?: string;
  color: string;
  description?: string;
  name: string;
  openingStock: number;
  priceCents: number;
  size: string;
  sku: string;
};

export type RestockInput = {
  note?: string;
  quantity: number;
  variantId: string;
};

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCustomerInput) => {
      const response = await postApiCustomersStaff({
        body: {
          data: {
            attributes: {
              business_name: input.businessName || undefined,
              customer_type: input.customerType,
              email: input.email || undefined,
              name: input.name,
              phone: input.phone || undefined,
            },
            type: "customer",
          },
        },
      });

      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: operationQueryKeys.customers(),
        }),
        queryClient.invalidateQueries({ queryKey: posQueryKeys.customers() }),
      ]);
    },
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const productResponse = await postApiProducts({
        body: {
          data: {
            attributes: {
              category: input.category || undefined,
              description: input.description || undefined,
              name: input.name,
            },
            type: "product",
          },
        },
      });
      const product = productResponse.data.data;

      if (!product) throw new Error("The server did not return the product.");

      const variantResponse = await postApiProductVariants({
        body: {
          data: {
            attributes: {
              active: true,
              barcode: input.barcode || undefined,
              color: input.color,
              price_cents: input.priceCents,
              product_id: product.id,
              size: input.size,
              sku: input.sku,
            },
            type: "product_variant",
          },
        },
      });
      const variant = variantResponse.data.data;

      if (!variant) throw new Error("The server did not return the variant.");

      if (input.openingStock > 0) {
        await postApiProductVariantsByProductVariantIdRestock({
          body: {
            data: {
              attributes: {
                note: "Opening stock from product creation",
                quantity: input.openingStock,
              },
              type: "stock_movement",
            },
          },
          path: { product_variant_id: variant.id },
        });
      }

      return variant;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: operationQueryKeys.products(),
        }),
        queryClient.invalidateQueries({ queryKey: posQueryKeys.catalog() }),
      ]);
    },
  });
}

export function useRestockMutation() {
  const queryClient = useQueryClient();
  const mutationReference = useRef<
    | {
        fingerprint: string;
        uuid: string;
      }
    | undefined
  >(undefined);

  return useMutation({
    mutationFn: async (input: RestockInput) => {
      const fingerprint = JSON.stringify(input);
      const currentReference = mutationReference.current;
      const uuid =
        currentReference?.fingerprint === fingerprint
          ? currentReference.uuid
          : createMutationUuid();
      mutationReference.current = { fingerprint, uuid };

      try {
        const response = await postApiProductVariantsByProductVariantIdRestock({
          body: {
            data: {
              attributes: {
                note: input.note || undefined,
                quantity: input.quantity,
                reference_id: uuid,
                reference_type: "mobile",
              },
              type: "stock_movement",
            },
          },
          path: { product_variant_id: input.variantId },
        });

        return response.data.data;
      } catch (error) {
        if (!isDuplicateMutationError(error)) throw error;
      }
    },
    onMutate: async (input) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: posQueryKeys.catalog() }),
        queryClient.cancelQueries({
          queryKey: ["operations", "products", "detail"],
        }),
      ]);

      const previousCatalog = queryClient.getQueryData<PosVariant[]>(
        posQueryKeys.catalog(),
      );
      const previousDetails = queryClient.getQueriesData<ProductDetail>({
        queryKey: ["operations", "products", "detail"],
      });

      queryClient.setQueryData<PosVariant[]>(
        posQueryKeys.catalog(),
        (catalog) =>
          catalog?.map((variant) =>
            variant.id === input.variantId
              ? { ...variant, stock: variant.stock + input.quantity }
              : variant,
          ),
      );
      queryClient.setQueriesData<ProductDetail>(
        { queryKey: ["operations", "products", "detail"] },
        (product) =>
          product
            ? {
                ...product,
                variants: product.variants.map((variant) =>
                  variant.id === input.variantId
                    ? { ...variant, stock: variant.stock + input.quantity }
                    : variant,
                ),
              }
            : product,
      );

      return { previousCatalog, previousDetails };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(
        posQueryKeys.catalog(),
        context?.previousCatalog,
      );
      for (const [queryKey, product] of context?.previousDetails ?? []) {
        queryClient.setQueryData(queryKey, product);
      }
    },
    onSuccess: () => {
      mutationReference.current = undefined;
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: operationQueryKeys.products(),
        }),
        queryClient.invalidateQueries({ queryKey: posQueryKeys.catalog() }),
      ]);
    },
  });
}
