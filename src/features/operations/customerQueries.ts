import { useQuery } from "@tanstack/react-query";

import { getApiCustomers, getApiOrders } from "../../api/generated/sdk.gen";
import type {
  Customer as ApiCustomer,
  Order as ApiOrder,
} from "../../api/generated/types.gen";
import { operationQueryKeys } from "./queries";

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
  balance: string;
  balanceCents: number;
  date: string;
  id: string;
  number: string;
  paidCents: number;
  paymentState: "paid" | "partially_paid" | "unpaid";
  paymentTerms: "credit" | "immediate";
  placedAt: number;
  status: "Cancelled" | "Draft" | "Fulfilled" | "Pending" | "Returned";
  total: string;
  totalCents: number;
};

export type CustomerActivityPoint = {
  label: string;
  paidCents: number;
  purchasedCents: number;
  time: number;
};

export type CustomerDetail = {
  activity: CustomerActivityPoint[];
  customer: CustomerSummary;
  orders: CustomerOrder[];
  outstandingInvoices: CustomerOrder[];
  totalPaidCents: number;
  totalPurchasedCents: number;
  totalUnpaidCents: number;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const activityDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

const orderDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const activityDayCount = 30;
const pageSize = 100;
const maxCustomerOrderPages = 100;

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
  const extendedAttributes = attributes as typeof attributes & {
    inserted_at?: unknown;
    paid_cents?: unknown;
  };
  const paidCents =
    typeof extendedAttributes.paid_cents === "number"
      ? extendedAttributes.paid_cents
      : 0;
  const balanceCents =
    typeof attributes.balance_cents === "number"
      ? attributes.balance_cents
      : Math.max(totalCents - paidCents, 0);
  const placedAtValue =
    textValue(attributes.placed_at) ??
    textValue(extendedAttributes.inserted_at);
  const placedAtDate = placedAtValue ? new Date(placedAtValue) : new Date(0);
  const placedAt = Number.isNaN(placedAtDate.getTime())
    ? 0
    : placedAtDate.getTime();

  return {
    balance: currencyFormatter.format(balanceCents / 100),
    balanceCents,
    date: placedAt
      ? orderDateFormatter.format(new Date(placedAt))
      : "Not submitted",
    id: order.id,
    number: `#${attributes.order_number}`,
    paidCents,
    paymentState:
      attributes.payment_state === "paid" ||
      attributes.payment_state === "partially_paid"
        ? attributes.payment_state
        : "unpaid",
    paymentTerms:
      attributes.payment_terms === "credit" ? "credit" : "immediate",
    placedAt,
    status:
      `${attributes.status.charAt(0).toUpperCase()}${attributes.status.slice(1)}` as CustomerOrder["status"],
    total: currencyFormatter.format(totalCents / 100),
    totalCents,
  };
}

async function fetchCustomerOrders(customerId: string, signal: AbortSignal) {
  const orders: ApiOrder[] = [];

  for (let page = 0; page < maxCustomerOrderPages; page += 1) {
    const response = await getApiOrders({
      query: {
        filter: { customer_id: customerId },
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

  throw new Error("Customer order history is too large to load safely.");
}

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

function buildActivity(orders: CustomerOrder[]): CustomerActivityPoint[] {
  const end = startOfLocalDay(new Date());
  const start = addLocalDays(end, -(activityDayCount - 1));
  const points = Array.from({ length: activityDayCount }, (_, index) => {
    const date = addLocalDays(start, index);

    return {
      label: activityDateFormatter.format(date),
      paidCents: 0,
      purchasedCents: 0,
      time: Math.floor(date.getTime() / 1_000),
    };
  });

  for (const order of orders) {
    if (!order.placedAt) continue;
    if (order.status !== "Pending" && order.status !== "Fulfilled") continue;

    const orderDay = startOfLocalDay(new Date(order.placedAt));
    const index = Math.round(
      (orderDay.getTime() - start.getTime()) / (24 * 60 * 60 * 1_000),
    );
    const point = points[index];
    if (!point) continue;

    point.purchasedCents += order.totalCents;
    point.paidCents += order.paidCents;
  }

  return points;
}

export function useCustomerListQuery() {
  return useQuery({
    queryKey: operationQueryKeys.customers(),
    queryFn: async ({ signal }) => {
      const response = await getApiCustomers({
        query: { page: { limit: 100 }, sort: "name" },
        signal,
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
    queryKey: operationQueryKeys.customerDetail(customerId),
    queryFn: async ({ signal }): Promise<CustomerDetail> => {
      const [customersResponse, ordersResponse] = await Promise.all([
        getApiCustomers({
          query: { page: { limit: 100 }, sort: "name" },
          signal,
        }),
        fetchCustomerOrders(customerId, signal),
      ]);
      const customerResource = (customersResponse.data.data ?? []).find(
        (customer) => customer.id === customerId,
      );
      const customer = customerResource
        ? normalizeCustomer(customerResource)
        : null;

      if (!customer) throw new Error("Customer could not be found.");

      const orders = ordersResponse.flatMap((order) => {
        const normalized = normalizeOrder(order);
        return normalized ? [normalized] : [];
      });
      const outstandingInvoices = orders.filter(
        (order) =>
          order.balanceCents > 0 &&
          (order.status === "Pending" || order.status === "Fulfilled"),
      );
      const activeOrders = orders.filter(
        (order) => order.status === "Pending" || order.status === "Fulfilled",
      );

      return {
        activity: buildActivity(orders),
        customer,
        orders,
        outstandingInvoices,
        totalPaidCents: activeOrders.reduce(
          (total, order) => total + order.paidCents,
          0,
        ),
        totalPurchasedCents: activeOrders.reduce(
          (total, order) => total + order.totalCents,
          0,
        ),
        totalUnpaidCents: outstandingInvoices.reduce(
          (total, order) => total + order.balanceCents,
          0,
        ),
      };
    },
  });
}
