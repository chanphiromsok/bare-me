import { useQuery } from "@tanstack/react-query";

import { getApiOrders } from "../../api/generated/sdk.gen";
import type {
  Customer as ApiCustomer,
  Order as ApiOrder,
} from "../../api/generated/types.gen";

export type DashboardActivity = {
  detail: string;
  id: string;
  orderId: string;
  status: "Cancelled" | "Draft" | "Fulfilled" | "Pending";
  title: string;
};

export type DashboardSummary = {
  activity: DashboardActivity[];
  pendingOrders: number;
  salesTodayCents: number;
  salesTodayOrders: number;
};

const dashboardQueryKey = ["operations", "dashboard"] as const;

function dateIsToday(value: unknown, today: Date): boolean {
  if (typeof value !== "string") return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function orderTotalCents(order: ApiOrder): number {
  const attributes = order.attributes;
  if (!attributes) return 0;

  return typeof attributes.total_cents === "number"
    ? attributes.total_cents
    : attributes.subtotal_cents - attributes.discount_cents;
}

function buildActivity(
  orders: ApiOrder[],
  included: (ApiCustomer | unknown)[],
): DashboardActivity[] {
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

  return orders.slice(0, 5).flatMap((order) => {
    const attributes = order.attributes;
    if (!attributes) return [];

    const customerId = order.relationships?.customer?.data?.id;
    const customer =
      (customerId ? customers.get(customerId) : undefined) ??
      "Walk-in customer";
    const lineCount = order.relationships?.line_items?.data?.length ?? 0;
    const status =
      `${attributes.status.charAt(0).toUpperCase()}${attributes.status.slice(1)}` as DashboardActivity["status"];

    return [
      {
        detail: `${customer} · ${lineCount} ${lineCount === 1 ? "item" : "items"}`,
        id: `activity-${order.id}`,
        orderId: order.id,
        status,
        title: `Order #${attributes.order_number}`,
      },
    ];
  });
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: async (): Promise<DashboardSummary> => {
      const response = await getApiOrders({
        query: {
          include: "customer,line_items",
          page: { limit: 100 },
          sort: "-order_number",
        },
        querySerializer: { allowReserved: true },
      });
      const orders = response.data.data ?? [];
      const today = new Date();
      const fulfilledToday = orders.filter(
        (order) =>
          order.attributes?.status === "fulfilled" &&
          dateIsToday(order.attributes.fulfilled_at, today),
      );

      return {
        activity: buildActivity(orders, response.data.included ?? []),
        pendingOrders: orders.filter(
          (order) => order.attributes?.status === "pending",
        ).length,
        salesTodayCents: fulfilledToday.reduce(
          (total, order) => total + orderTotalCents(order),
          0,
        ),
        salesTodayOrders: fulfilledToday.length,
      };
    },
  });
}
