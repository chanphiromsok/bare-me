import { useQuery } from "@tanstack/react-query";

import { getApiOrdersById } from "../generated/sdk.gen";
import type {
  Customer,
  OrderLineItem,
  Payment,
  ProductVariant,
} from "../generated/types.gen";

export type OrderDetail = {
  cancelReason?: string;
  customer: {
    contact: string;
    name: string;
  };
  discountCents: number;
  fulfilledAt?: string;
  id: string;
  items: {
    color: string;
    id: string;
    quantity: number;
    size: string;
    sku: string;
    totalCents: number;
    unitPriceCents: number;
  }[];
  number: number;
  paymentState: "paid" | "partially_paid" | "unpaid";
  payments: {
    amountCents: number;
    id: string;
    method: "bank_transfer" | "card_manual" | "cash" | "other";
    voided: boolean;
  }[];
  placedAt?: string;
  status: "cancelled" | "draft" | "fulfilled" | "pending";
  subtotalCents: number;
  totalCents: number;
};

function isIncludedType<T extends { type: string }>(
  resource: unknown,
  type: string,
): resource is T {
  return (
    typeof resource === "object" &&
    resource !== null &&
    "type" in resource &&
    resource.type === type
  );
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function useOrderDetailQuery(orderId: string) {
  return useQuery({
    queryKey: ["operations", "orders", "detail", orderId],
    queryFn: async (): Promise<OrderDetail> => {
      const response = await getApiOrdersById({
        path: { id: orderId },
        query: { include: "customer,line_items.product_variant,payments" },
        querySerializer: { allowReserved: true },
      });
      const order = response.data.data;

      if (!order?.attributes)
        throw new Error("Order details were not returned.");

      const included = response.data.included ?? [];
      const customer = included.find((resource) =>
        isIncludedType<Customer>(resource, "customer"),
      ) as Customer | undefined;
      const variants = new Map(
        included
          .filter((resource): resource is ProductVariant =>
            isIncludedType<ProductVariant>(resource, "product_variant"),
          )
          .map((variant) => [variant.id, variant]),
      );
      const items = included
        .filter((resource): resource is OrderLineItem =>
          isIncludedType<OrderLineItem>(resource, "order_line_item"),
        )
        .map((item) => {
          const attributes = item.attributes;
          const variantId = item.relationships?.product_variant?.data?.id;
          const variant = variantId ? variants.get(variantId) : undefined;

          return {
            color: variant?.attributes?.color ?? "Unknown color",
            id: item.id,
            quantity: attributes?.quantity ?? 0,
            size: variant?.attributes?.size ?? "Unknown size",
            sku: variant?.attributes?.sku ?? "Unknown SKU",
            totalCents:
              typeof attributes?.line_total_cents === "number"
                ? attributes.line_total_cents
                : (attributes?.quantity ?? 0) *
                  (attributes?.unit_price_cents ?? 0),
            unitPriceCents: attributes?.unit_price_cents ?? 0,
          };
        });
      const payments = included
        .filter((resource): resource is Payment =>
          isIncludedType<Payment>(resource, "payment"),
        )
        .map((payment) => ({
          amountCents: payment.attributes?.amount_cents ?? 0,
          id: payment.id,
          method: payment.attributes?.method ?? "other",
          voided: Boolean(payment.attributes?.voided_at),
        }));
      const attributes = order.attributes;
      const customerAttributes = customer?.attributes;
      const customerName = customerAttributes
        ? (optionalString(customerAttributes.business_name) ??
          customerAttributes.name)
        : "Unknown customer";
      const contact = customerAttributes
        ? (optionalString(customerAttributes.phone) ??
          optionalString(customerAttributes.email) ??
          "No contact details")
        : "No contact details";
      const totalCents =
        typeof attributes.total_cents === "number"
          ? attributes.total_cents
          : attributes.subtotal_cents - attributes.discount_cents;

      return {
        cancelReason: optionalString(attributes.cancel_reason),
        customer: { contact, name: customerName },
        discountCents: attributes.discount_cents,
        fulfilledAt: optionalString(attributes.fulfilled_at),
        id: order.id,
        items,
        number: attributes.order_number,
        paymentState:
          attributes.payment_state === "paid" ||
          attributes.payment_state === "partially_paid"
            ? attributes.payment_state
            : "unpaid",
        payments,
        placedAt: optionalString(attributes.placed_at),
        status: attributes.status,
        subtotalCents: attributes.subtotal_cents,
        totalCents,
      };
    },
  });
}
