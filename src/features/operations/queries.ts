import type { OrderFilter } from "./filters";

export const operationQueryKeys = {
  all: ["operations"] as const,
  activity: () => [...operationQueryKeys.all, "activity"] as const,
  customers: () => [...operationQueryKeys.all, "customers"] as const,
  detail: (orderId: string) =>
    [...operationQueryKeys.all, "orders", "detail", orderId] as const,
  orders: (filter: OrderFilter) =>
    [...operationQueryKeys.all, "orders", { filter }] as const,
  products: () => [...operationQueryKeys.all, "products"] as const,
};
