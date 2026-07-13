import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  patchApiOrdersByIdCancel,
  patchApiOrdersByIdFulfill,
  patchApiOrdersByIdSubmit,
  postApiOrdersByOrderIdPayments,
} from "../generated/sdk.gen";

const orderDocument = (orderId: string) => ({
  data: { attributes: {}, id: orderId, type: "order" as const },
});

export function useOrderWorkflowMutations(orderId: string) {
  const queryClient = useQueryClient();
  const refreshOrders = async () => {
    await queryClient.invalidateQueries({ queryKey: ["operations"] });
  };

  const submit = useMutation({
    mutationFn: () =>
      patchApiOrdersByIdSubmit({
        body: orderDocument(orderId),
        path: { id: orderId },
      }),
    onSuccess: refreshOrders,
  });
  const cancel = useMutation({
    mutationFn: (reason: string) =>
      patchApiOrdersByIdCancel({
        body: {
          data: {
            attributes: { cancel_reason: reason },
            id: orderId,
            type: "order",
          },
        },
        path: { id: orderId },
      }),
    onSuccess: refreshOrders,
  });
  const recordPayment = useMutation({
    mutationFn: (amountCents: number) =>
      postApiOrdersByOrderIdPayments({
        body: {
          data: {
            attributes: {
              amount_cents: amountCents,
              method: "cash",
              note: "Full balance recorded by staff app",
            },
            type: "payment",
          },
        },
        path: { order_id: orderId },
      }),
    onSuccess: refreshOrders,
  });
  const fulfill = useMutation({
    mutationFn: () =>
      patchApiOrdersByIdFulfill({
        body: orderDocument(orderId),
        path: { id: orderId },
      }),
    onSuccess: refreshOrders,
  });

  return { cancel, fulfill, recordPayment, submit };
}
