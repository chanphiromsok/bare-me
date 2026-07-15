import type { OrderListOptions } from "./filters";

export const operationQueryKeys = {
  all: ["operations"] as const,
  activity: () => [...operationQueryKeys.all, "activity"] as const,
  customers: () => [...operationQueryKeys.all, "customers"] as const,
  customerDetail: (customerId: string) =>
    [...operationQueryKeys.customers(), "detail", customerId] as const,
  detail: (orderId: string) =>
    [...operationQueryKeys.all, "orders", "detail", orderId] as const,
  orders: (options: OrderListOptions) =>
    [...operationQueryKeys.all, "orders", "list", options] as const,
  products: () => [...operationQueryKeys.all, "products"] as const,
};
