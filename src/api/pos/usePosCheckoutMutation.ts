import { useMutation, useQueryClient } from "@tanstack/react-query";

import { operationQueryKeys } from "../../features/operations/queries";
import {
  patchApiOrdersByIdConfirmPreorder,
  patchApiOrdersByIdFulfill,
  patchApiOrdersByIdSubmit,
  postApiOrders,
  postApiOrdersByOrderIdLineItems,
  postApiOrdersByOrderIdPayments,
} from "../generated/sdk.gen";
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

export function usePosCheckoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      items,
      paymentMethod,
      saleType,
      totalCents,
    }: PosCheckoutInput) => {
      const orderResponse = await postApiOrders({
        body: {
          data: {
            attributes: {
              customer_id: customerId,
              order_kind: saleType,
              sales_channel: saleType === "preorder" ? "group_chat" : "pos",
            },
            type: "order",
          },
        },
      });
      const order = orderResponse.data.data;

      if (!order) {
        throw new Error("The server did not return the new order.");
      }

      await Promise.all(
        items.map((item) =>
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

      if (saleType === "preorder") {
        const confirmedResponse = await patchApiOrdersByIdConfirmPreorder({
          body: {
            data: { attributes: {}, id: order.id, type: "order" },
          },
          path: { id: order.id },
        });

        return confirmedResponse.data.data;
      }

      await patchApiOrdersByIdSubmit({
        body: {
          data: { attributes: {}, id: order.id, type: "order" },
        },
        path: { id: order.id },
      });

      await postApiOrdersByOrderIdPayments({
        body: {
          data: {
            attributes: {
              amount_cents: totalCents,
              method: paymentMethod,
              note: "Recorded from staff POS",
            },
            type: "payment",
          },
        },
        path: { order_id: order.id },
      });

      const fulfilledResponse = await patchApiOrdersByIdFulfill({
        body: {
          data: { attributes: {}, id: order.id, type: "order" },
        },
        path: { id: order.id },
      });

      return fulfilledResponse.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: operationQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: posQueryKeys.catalog() }),
      ]);
    },
  });
}
