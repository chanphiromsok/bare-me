import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getApiOrders, getApiReceivables } from "../../api/generated/sdk.gen";
import type {
  Customer as ApiCustomer,
  Order as ApiOrder,
} from "../../api/generated/types.gen";

export const dashboardRanges = [
  { days: 7, key: "7d", label: "7 days", shortLabel: "7D" },
  { days: 30, key: "30d", label: "30 days", shortLabel: "30D" },
  { days: 90, key: "90d", label: "90 days", shortLabel: "90D" },
] as const;

export type DashboardRange = (typeof dashboardRanges)[number]["key"];

export type DashboardActivity = {
  detail: string;
  id: string;
  orderId: string;
  status: "Cancelled" | "Draft" | "Fulfilled" | "Pending" | "Returned";
  title: string;
};

export type DashboardSalesPoint = {
  label: string;
  time: number;
  value: number;
};

export type DashboardSummary = {
  activity: DashboardActivity[];
  averageOrderCents: number;
  fulfilledOrders: number;
  outstandingCents: number;
  pendingOrders: number;
  previousSalesCents: number;
  salesCents: number;
  salesPoints: DashboardSalesPoint[];
};

const dashboardQueryKey = ["operations", "dashboard"] as const;
const dayMilliseconds = 24 * 60 * 60 * 1_000;
const pageSize = 100;
const maxDashboardPages = 100;

function startOfLocalDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addLocalDays(value: Date, days: number): Date {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function dateFrom(value: unknown): Date | undefined {
  if (typeof value !== "string") return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function orderTotalCents(order: ApiOrder): number {
  const attributes = order.attributes;
  if (!attributes) return 0;

  return typeof attributes.total_cents === "number"
    ? attributes.total_cents
    : attributes.subtotal_cents - attributes.discount_cents;
}

function rangeConfig(range: DashboardRange) {
  return (
    dashboardRanges.find((candidate) => candidate.key === range) ??
    dashboardRanges[0]
  );
}

async function fetchAllOrders(signal: AbortSignal): Promise<ApiOrder[]> {
  const orders: ApiOrder[] = [];

  for (let page = 0; page < maxDashboardPages; page += 1) {
    const response = await getApiOrders({
      query: {
        page: { limit: pageSize, offset: page * pageSize },
        sort: "-order_number",
      },
      querySerializer: { allowReserved: true },
      signal,
    });
    const nextOrders = response.data.data ?? [];
    orders.push(...nextOrders);

    if (nextOrders.length < pageSize) return orders;
  }

  throw new Error("Dashboard sales range is too large to load safely.");
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

  return orders.flatMap((order) => {
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

function buildSalesPoints(
  orders: ApiOrder[],
  currentStart: Date,
  days: number,
): DashboardSalesPoint[] {
  const bucketDays = days === 90 ? 7 : 1;
  const bucketCount = Math.ceil(days / bucketDays);
  const values = Array.from({ length: bucketCount }, () => 0);

  for (const order of orders) {
    const fulfilledAt = dateFrom(order.attributes?.fulfilled_at);
    if (!fulfilledAt) continue;

    const dayOffset = Math.floor(
      (startOfLocalDay(fulfilledAt).getTime() - currentStart.getTime()) /
        dayMilliseconds,
    );
    const bucketIndex = Math.floor(dayOffset / bucketDays);

    if (bucketIndex >= 0 && bucketIndex < values.length) {
      values[bucketIndex] += orderTotalCents(order);
    }
  }

  return values.map((valueCents, index) => {
    const bucketDate = addLocalDays(currentStart, index * bucketDays);

    return {
      label: bucketDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
      time: bucketDate.getTime() / 1_000,
      value: valueCents / 100,
    };
  });
}

export function useDashboardQuery(range: DashboardRange) {
  const { days } = rangeConfig(range);

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [...dashboardQueryKey, range],
    queryFn: async ({ signal }): Promise<DashboardSummary> => {
      const today = startOfLocalDay(new Date());
      const currentStart = addLocalDays(today, -(days - 1));
      const previousStart = addLocalDays(currentStart, -days);

      const [orders, recentResponse, receivableResponse] = await Promise.all([
        fetchAllOrders(signal),
        getApiOrders({
          query: {
            include: "customer,line_items",
            page: { limit: 5 },
            sort: "-order_number",
          },
          querySerializer: { allowReserved: true },
          signal,
        }),
        getApiReceivables({
          query: { page: { limit: 1 } },
          querySerializer: { allowReserved: true },
          signal,
        }),
      ]);

      const fulfilledOrders = orders.filter(
        (order) => order.attributes?.status === "fulfilled",
      );
      const currentOrders = fulfilledOrders.filter((order) => {
        const fulfilledAt = dateFrom(order.attributes?.fulfilled_at);
        return fulfilledAt ? fulfilledAt >= currentStart : false;
      });
      const previousOrders = fulfilledOrders.filter((order) => {
        const fulfilledAt = dateFrom(order.attributes?.fulfilled_at);
        return fulfilledAt
          ? fulfilledAt >= previousStart && fulfilledAt < currentStart
          : false;
      });
      const salesCents = currentOrders.reduce(
        (total, order) => total + orderTotalCents(order),
        0,
      );
      const previousSalesCents = previousOrders.reduce(
        (total, order) => total + orderTotalCents(order),
        0,
      );
      const pendingOrders = orders.filter(
        (order) => order.attributes?.status === "pending",
      ).length;
      const outstandingCents =
        receivableResponse.data.data?.[0]?.attributes
          ?.portfolio_balance_cents ?? 0;

      return {
        activity: buildActivity(
          recentResponse.data.data ?? [],
          recentResponse.data.included ?? [],
        ),
        averageOrderCents:
          currentOrders.length === 0
            ? 0
            : Math.round(salesCents / currentOrders.length),
        fulfilledOrders: currentOrders.length,
        outstandingCents,
        pendingOrders,
        previousSalesCents,
        salesCents,
        salesPoints: buildSalesPoints(currentOrders, currentStart, days),
      };
    },
  });
}
