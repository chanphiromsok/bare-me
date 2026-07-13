import { useQuery } from "@tanstack/react-query";

import { getApiOrders } from "../../api/generated/sdk.gen";
import type {
  Customer as ApiCustomer,
  Order as ApiOrder,
} from "../../api/generated/types.gen";
import type { OrderFilter } from "./filters";

export type Order = {
  customer: string;
  id: string;
  items: string;
  number: string;
  status: "Cancelled" | "Draft" | "Fulfilled" | "Pending";
  total: string;
};

export type Product = {
  category: string;
  low: boolean;
  name: string;
  stock: string;
  variants: string;
};

export type Customer = {
  detail: string;
  initials: string;
  name: string;
  state: "Active" | "Needs approval";
};

export type Activity = {
  detail: string;
  id: string;
  status: "Pending" | "Restocked" | "Review";
  title: string;
};

const products: Product[] = [
  {
    name: "Classic Cotton Tee",
    category: "Tops",
    variants: "3 variants",
    stock: "36 in stock",
    low: false,
  },
  {
    name: "Weekend Dress",
    category: "Dresses",
    variants: "3 variants",
    stock: "25 in stock",
    low: false,
  },
  {
    name: "Cozy Zip Hoodie",
    category: "Outerwear",
    variants: "3 variants",
    stock: "6 low stock",
    low: true,
  },
];

const customers: Customer[] = [
  {
    initials: "SC",
    name: "Sophea Chan",
    detail: "Retail · 8 orders",
    state: "Active",
  },
  {
    initials: "MK",
    name: "Malis Kids Shop",
    detail: "Wholesale · 14 orders",
    state: "Active",
  },
  {
    initials: "DP",
    name: "Dara Phan",
    detail: "Web registration",
    state: "Needs approval",
  },
];

const activity: Activity[] = [
  {
    id: "order-1048",
    title: "Order #1048 submitted",
    detail: "Sophea Retail · 3 items",
    status: "Pending",
  },
  {
    id: "stock-cct-4t-sky",
    title: "Stock adjusted",
    detail: "CCT-4T-SKY · +12 units",
    status: "Restocked",
  },
  {
    id: "customer-dara-chan",
    title: "Customer awaiting approval",
    detail: "Dara Chan · Web registration",
    status: "Review",
  },
];

export const operationQueryKeys = {
  all: ["operations"] as const,
  activity: () => [...operationQueryKeys.all, "activity"] as const,
  customers: () => [...operationQueryKeys.all, "customers"] as const,
  orders: (filter: OrderFilter) =>
    [...operationQueryKeys.all, "orders", { filter }] as const,
  products: () => [...operationQueryKeys.all, "products"] as const,
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(cents / 100);
}

function normalizeOrders(
  orders: ApiOrder[],
  included: (ApiCustomer | unknown)[],
): Order[] {
  const customers = new Map(
    included
      .filter(
        (resource): resource is ApiCustomer =>
          typeof resource === "object" &&
          resource !== null &&
          "type" in resource &&
          resource.type === "customer",
      )
      .map((customer) => [customer.id, customer.attributes?.name]),
  );

  return orders.flatMap((order) => {
    const attributes = order.attributes;

    if (!attributes) return [];

    const lineCount = order.relationships?.line_items?.data?.length ?? 0;
    const customerId = order.relationships?.customer?.data?.id;
    const status =
      `${attributes.status.charAt(0).toUpperCase()}${attributes.status.slice(1)}` as Order["status"];
    const totalCents =
      typeof attributes.total_cents === "number"
        ? attributes.total_cents
        : attributes.subtotal_cents - attributes.discount_cents;

    return [
      {
        customer:
          (customerId ? customers.get(customerId) : undefined) ??
          "Walk-in customer",
        id: order.id,
        items: `${lineCount} ${lineCount === 1 ? "item" : "items"}`,
        number: `#${attributes.order_number}`,
        status,
        total: formatCurrency(totalCents),
      },
    ];
  });
}

function filterOrders(orders: Order[], filter: OrderFilter) {
  if (filter === "all") return orders;

  return orders.filter((order) => order.status.toLowerCase() === filter);
}

export function useOrdersQuery(filter: OrderFilter) {
  return useQuery({
    queryKey: operationQueryKeys.orders(filter),
    queryFn: async () => {
      const response = await getApiOrders({
        query: {
          include: "customer,line_items",
          page: { limit: 100 },
          sort: "-order_number",
        },
        querySerializer: { allowReserved: true },
      });
      const document = response.data;
      const orders = normalizeOrders(
        document.data ?? [],
        document.included ?? [],
      );

      return filterOrders(orders, filter);
    },
  });
}

export function useProductsQuery() {
  return useQuery({
    queryKey: operationQueryKeys.products(),
    queryFn: () => Promise.resolve(products),
  });
}

export function useCustomersQuery() {
  return useQuery({
    queryKey: operationQueryKeys.customers(),
    queryFn: () => Promise.resolve(customers),
  });
}

export function useActivityQuery() {
  return useQuery({
    queryKey: operationQueryKeys.activity(),
    queryFn: () => Promise.resolve(activity),
  });
}
