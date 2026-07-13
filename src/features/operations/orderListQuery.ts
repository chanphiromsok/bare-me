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

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

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

    const customerId = order.relationships?.customer?.data?.id;
    const lineCount = order.relationships?.line_items?.data?.length ?? 0;
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
        total: currencyFormatter.format(totalCents / 100),
      },
    ];
  });
}

export function useOrderListQuery(filter: OrderFilter) {
  return useQuery({
    queryKey: ["operations", "orders", { filter }],
    queryFn: async () => {
      const response = await getApiOrders({
        query: {
          include: "customer,line_items",
          page: { limit: 100 },
          sort: "-order_number",
        },
        querySerializer: { allowReserved: true },
      });
      const orders = normalizeOrders(
        response.data.data ?? [],
        response.data.included ?? [],
      );

      return filter === "all"
        ? orders
        : orders.filter((order) => order.status.toLowerCase() === filter);
    },
  });
}
