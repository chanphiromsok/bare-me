import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { operationQueryKeys } from "../../features/operations/queries";
import {
  patchApiOrdersByIdConfirmPreorder,
  patchApiOrdersByIdFulfill,
  patchApiOrdersByIdSubmit,
  getApiOrders,
  getApiOrdersById,
  postApiOrders,
  postApiOrdersByOrderIdLineItems,
  postApiOrdersByOrderIdPayments,
} from "../generated/sdk.gen";
import type { Order } from "../generated/types.gen";
import {
  createExternalReference,
  createMutationUuid,
  isDuplicateMutationError,
} from "../mutationReference";
import { posQueryKeys } from "./queries";

export type PosPaymentMethod = "bank_transfer" | "card_manual" | "cash";

export type PosCheckoutInput = {
  customerId: string;
  items: {
    productVariantId: string;
    quantity: number;
  }[];
  paymentMethod: PosPaymentMethod;
  saleType: "preorder" | "sale";
  totalCents: number;
};

type CheckoutReference = {
  fingerprint: string;
  uuid: string;
};

function checkoutFingerprint(input: PosCheckoutInput): string {
  return JSON.stringify({
    customerId: input.customerId,
    items: [...input.items].sort((left, right) =>
      left.productVariantId.localeCompare(right.productVariantId),
    ),
    paymentMethod: input.paymentMethod,
    saleType: input.saleType,
    totalCents: input.totalCents,
  });
}

async function findOrderByReference(reference: string): Promise<Order> {
  const response = await getApiOrders({
    query: {
      filter: { external_reference: { eq: reference } },
      page: { limit: 1 },
    },
  });
  const order = response.data.data?.[0];

  if (!order) throw new Error("The existing order could not be recovered.");
  return order;
}

async function loadOrder(orderId: string): Promise<Order> {
  const response = await getApiOrdersById({ path: { id: orderId } });
  const order = response.data.data;

  if (!order) throw new Error("The order could not be refreshed.");
  return order;
}

async function createOrRecoverOrder(
  input: PosCheckoutInput,
  externalReference: string,
): Promise<Order> {
  try {
    const response = await postApiOrders({
      body: {
        data: {
          attributes: {
            customer_id: input.customerId,
            external_reference: externalReference,
            order_kind: input.saleType,
            sales_channel: input.saleType === "preorder" ? "group_chat" : "pos",
          },
          type: "order",
        },
      },
    });
    const order = response.data.data;

    if (!order) throw new Error("The server did not return the new order.");
    return order;
  } catch (error) {
    if (!isDuplicateMutationError(error)) throw error;
    return findOrderByReference(externalReference);
  }
}

function orderStatus(order: Order) {
  return order.attributes?.status;
}

export function usePosCheckoutMutation() {
  const queryClient = useQueryClient();
  const checkoutReference = useRef<CheckoutReference | undefined>(undefined);

  return useMutation({
    mutationFn: async (input: PosCheckoutInput) => {
      const fingerprint = checkoutFingerprint(input);
      const reference = checkoutReference.current;
      const uuid =
        reference?.fingerprint === fingerprint
          ? reference.uuid
          : createMutationUuid();
      checkoutReference.current = { fingerprint, uuid };

      const externalReference = createExternalReference("order", uuid);
      const paymentReference = createExternalReference("payment", uuid);
      let order = await createOrRecoverOrder(input, externalReference);

      if (orderStatus(order) === "draft") {
        await Promise.all(
          input.items.map((item) =>
            postApiOrdersByOrderIdLineItems({
              body: {
                data: {
                  attributes: {
                    product_variant_id: item.productVariantId,
                    quantity: item.quantity,
                  },
                  type: "order_line_item",
                },
              },
              path: { order_id: order.id },
            }),
          ),
        );
      }

      order = await loadOrder(order.id);

      if (input.saleType === "preorder") {
        if (orderStatus(order) === "draft") {
          const confirmedResponse = await patchApiOrdersByIdConfirmPreorder({
            body: {
              data: { attributes: {}, id: order.id, type: "order" },
            },
            path: { id: order.id },
          });

          return confirmedResponse.data.data;
        }

        if (orderStatus(order) === "pending") return order;
        throw new Error("This preorder can no longer be confirmed.");
      }

      if (orderStatus(order) === "draft") {
        await patchApiOrdersByIdSubmit({
          body: {
            data: { attributes: {}, id: order.id, type: "order" },
          },
          path: { id: order.id },
        });
        order = await loadOrder(order.id);
      }

      if (orderStatus(order) === "fulfilled") return order;
      if (orderStatus(order) !== "pending") {
        throw new Error("This sale can no longer be completed.");
      }

      try {
        await postApiOrdersByOrderIdPayments({
          body: {
            data: {
              attributes: {
                amount_cents: input.totalCents,
                external_reference: paymentReference,
                method: input.paymentMethod,
                note: "Recorded from staff POS",
              },
              type: "payment",
            },
          },
          path: { order_id: order.id },
        });
      } catch (error) {
        if (!isDuplicateMutationError(error)) throw error;
      }

      try {
        const fulfilledResponse = await patchApiOrdersByIdFulfill({
          body: {
            data: { attributes: {}, id: order.id, type: "order" },
          },
          path: { id: order.id },
        });

        return fulfilledResponse.data.data;
      } catch (error) {
        const refreshedOrder = await loadOrder(order.id);
        if (orderStatus(refreshedOrder) === "fulfilled") return refreshedOrder;
        throw error;
      }
    },
    onSuccess: async () => {
      checkoutReference.current = undefined;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: operationQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: posQueryKeys.catalog() }),
      ]);
    },
  });
}
