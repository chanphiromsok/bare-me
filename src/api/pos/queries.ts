import { useQuery } from "@tanstack/react-query";

import { getApiCustomers, getApiProductVariants } from "../generated/sdk.gen";
import type { Customer, Product, ProductVariant } from "../generated/types.gen";

export type PosCustomer = {
  detail: string;
  id: string;
  name: string;
};

export type PosVariant = {
  color: string;
  id: string;
  name: string;
  priceCents: number;
  size: string;
  sku: string;
  stock: number;
};

export const posQueryKeys = {
  all: ["pos"] as const,
  catalog: () => [...posQueryKeys.all, "catalog"] as const,
  customers: () => [...posQueryKeys.all, "customers"] as const,
};

function normalizeCustomers(customers: Customer[]): PosCustomer[] {
  return customers.flatMap((customer) => {
    const attributes = customer.attributes;

    if (!attributes) return [];

    const contact =
      typeof attributes.phone === "string"
        ? attributes.phone
        : typeof attributes.email === "string"
          ? attributes.email
          : "No contact details";

    return [
      {
        detail: `${attributes.customer_type === "wholesale" ? "Wholesale" : "Retail"} · ${contact}`,
        id: customer.id,
        name: attributes.business_name
          ? String(attributes.business_name)
          : attributes.name,
      },
    ];
  });
}

function normalizeVariants(
  variants: ProductVariant[],
  included: (Product | unknown)[],
): PosVariant[] {
  const products = new Map(
    included
      .filter(
        (resource): resource is Product =>
          typeof resource === "object" &&
          resource !== null &&
          "type" in resource &&
          resource.type === "product",
      )
      .map((product) => [product.id, product.attributes?.name]),
  );

  return variants.flatMap((variant) => {
    const attributes = variant.attributes;

    if (!attributes || !attributes.active) return [];

    const productId = variant.relationships?.product?.data?.id;

    return [
      {
        color: attributes.color,
        id: variant.id,
        name:
          (productId ? products.get(productId) : undefined) ?? attributes.sku,
        priceCents: attributes.price_cents,
        size: attributes.size,
        sku: attributes.sku,
        stock: Math.max(
          attributes.quantity_on_hand - attributes.reserved_quantity,
          0,
        ),
      },
    ];
  });
}

export function usePosCustomersQuery() {
  return useQuery({
    queryKey: posQueryKeys.customers(),
    queryFn: async () => {
      const response = await getApiCustomers({
        query: { page: { limit: 100 }, sort: "name" },
      });

      return normalizeCustomers(response.data.data ?? []);
    },
  });
}

export function usePosCatalogQuery() {
  return useQuery({
    queryKey: posQueryKeys.catalog(),
    queryFn: async () => {
      const response = await getApiProductVariants({
        query: {
          include: "product",
          page: { limit: 100 },
          sort: "sku",
        },
      });

      return normalizeVariants(
        response.data.data ?? [],
        response.data.included ?? [],
      );
    },
  });
}
