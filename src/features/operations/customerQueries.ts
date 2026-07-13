import { useQuery } from "@tanstack/react-query";

import { getApiCustomers, getApiOrders } from "../../api/generated/sdk.gen";
import type {
  Customer as ApiCustomer,
  Order as ApiOrder,
} from "../../api/generated/types.gen";

export type CustomerSummary = {
  businessName: string | null;
  confirmed: boolean;
  contactName: string;
  detail: string;
  email: string | null;
  id: string;
  initials: string;
  name: string;
  phone: string | null;
  type: "Retail" | "Wholesale";
};

export type CustomerOrder = {
  id: string;
  number: string;
  status: "Cancelled" | "Draft" | "Fulfilled" | "Pending";
  total: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

function textValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeCustomer(customer: ApiCustomer): CustomerSummary | null {
  const attributes = customer.attributes;
  if (!attributes) return null;

  const businessName = textValue(attributes.business_name);
  const email = textValue(attributes.email);
  const phone = textValue(attributes.phone);
  const displayName = businessName ?? attributes.name;

  return {
    businessName,
    confirmed: Boolean(attributes.confirmed_at),
    contactName: attributes.name,
    detail: `${attributes.customer_type === "wholesale" ? "Wholesale" : "Retail"} · ${phone ?? email ?? "No contact"}`,
    email,
    id: customer.id,
    initials: displayName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(""),
    name: displayName,
    phone,
    type: attributes.customer_type === "wholesale" ? "Wholesale" : "Retail",
  };
}

function normalizeOrder(order: ApiOrder): CustomerOrder | null {
  const attributes = order.attributes;
  if (!attributes) return null;

  const totalCents =
    typeof attributes.total_cents === "number"
      ? attributes.total_cents
      : attributes.subtotal_cents - attributes.discount_cents;

  return {
    id: order.id,
    number: `#${attributes.order_number}`,
    status:
      `${attributes.status.charAt(0).toUpperCase()}${attributes.status.slice(1)}` as CustomerOrder["status"],
    total: currencyFormatter.format(totalCents / 100),
  };
}

export function useCustomerListQuery() {
  return useQuery({
    queryKey: ["operations", "customers"],
    queryFn: async () => {
      const response = await getApiCustomers({
        query: { page: { limit: 100 }, sort: "name" },
      });

      return (response.data.data ?? []).flatMap((customer) => {
        const normalized = normalizeCustomer(customer);
        return normalized ? [normalized] : [];
      });
    },
  });
}

export function useCustomerDetailQuery(customerId: string) {
  return useQuery({
    queryKey: ["operations", "customers", "detail", customerId],
    queryFn: async () => {
      const [customersResponse, ordersResponse] = await Promise.all([
        getApiCustomers({ query: { page: { limit: 100 }, sort: "name" } }),
        getApiOrders({
          query: { page: { limit: 100 }, sort: "-order_number" },
        }),
      ]);
      const customerResource = (customersResponse.data.data ?? []).find(
        (customer) => customer.id === customerId,
      );
      const customer = customerResource
        ? normalizeCustomer(customerResource)
        : null;

      if (!customer) throw new Error("Customer could not be found.");

      const orders = (ordersResponse.data.data ?? []).flatMap((order) => {
        const belongsToCustomer =
          order.attributes?.customer_id === customerId ||
          order.relationships?.customer?.data?.id === customerId;
        const normalized = belongsToCustomer ? normalizeOrder(order) : null;
        return normalized ? [normalized] : [];
      });

      return { customer, orders };
    },
  });
}
