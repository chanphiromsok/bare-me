import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import {
  patchApiOrdersByIdAllocateStock,
  patchApiOrdersByIdCancel,
  patchApiOrdersByIdFulfill,
  patchApiOrdersByIdReturn,
  patchApiOrdersByIdSubmit,
  postApiOrdersByOrderIdPayments,
} from "../generated/sdk.gen";
import {
  createExternalReference,
  createMutationUuid,
  isDuplicateMutationError,
} from "../mutationReference";

const orderDocument = (orderId: string) => ({
  data: { attributes: {}, id: orderId, type: "order" as const },
});

export function useOrderWorkflowMutations(orderId: string) {
  const queryClient = useQueryClient();
  const paymentReference = useRef<
    { amountCents: number; uuid: string } | undefined
  >(undefined);
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
  const allocateStock = useMutation({
    mutationFn: () =>
      patchApiOrdersByIdAllocateStock({
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
    mutationFn: async (amountCents: number) => {
      const currentReference = paymentReference.current;
      const uuid =
        currentReference?.amountCents === amountCents
          ? currentReference.uuid
          : createMutationUuid();
      paymentReference.current = { amountCents, uuid };

      try {
        return await postApiOrdersByOrderIdPayments({
          body: {
            data: {
              attributes: {
                amount_cents: amountCents,
                external_reference: createExternalReference("payment", uuid),
                method: "cash",
                note: "Full balance recorded by staff app",
              },
              type: "payment",
            },
          },
          path: { order_id: orderId },
        });
      } catch (error) {
        if (!isDuplicateMutationError(error)) throw error;
      }
    },
    onSuccess: async () => {
      paymentReference.current = undefined;
      await refreshOrders();
    },
  });
  const fulfill = useMutation({
    mutationFn: () =>
      patchApiOrdersByIdFulfill({
        body: orderDocument(orderId),
        path: { id: orderId },
      }),
    onSuccess: refreshOrders,
  });
  const returnOrder = useMutation({
    mutationFn: (reason: string) =>
      patchApiOrdersByIdReturn({
        body: {
          data: {
            attributes: { return_reason: reason },
            id: orderId,
            type: "order",
          },
        },
        path: { id: orderId },
      }),
    onSuccess: refreshOrders,
  });

  return {
    allocateStock,
    cancel,
    fulfill,
    recordPayment,
    returnOrder,
    submit,
  };
}
