# 04 — Preorders and Returns

## Purpose

Verify workflows that do not follow a normal immediate in-stock sale: reserving customer demand before goods arrive, allocating arriving stock, fulfilling a preorder, cancelling safely, and returning a fulfilled order.

## Preorder start-to-finish test

| Step | Action                                      | Expected result                                                                             | Result |
| ---- | ------------------------------------------- | ------------------------------------------------------------------------------------------- | ------ |
| 1    | Open New order and select Preorder.         | The screen explains that current stock is not required at order creation.                   | Pass   |
| 2    | Select the customer and requested variants. | Staff can enter requested quantities even when no stock is currently on hand.               | Pass   |
| 3    | Confirm the preorder.                       | Demand is recorded as a preorder without creating a sale stock movement.                    | Pass   |
| 4    | Open the preorder detail.                   | Preorder type, customer, items, payment state, fulfillment state, and timeline are visible. | Pass   |
| 5    | Restock when the products arrive.           | Physical quantity increases through a restock ledger movement.                              | Pass   |
| 6    | Allocate available preorder stock.          | Stock is reserved for the preorder without counting it as a completed sale.                 | Pass   |
| 7    | Record/confirm payment as required.         | Payment state is visible and only valid payment actions are available.                      | Pass   |
| 8    | Fulfill the allocated preorder.             | Reserved inventory is consumed and the order becomes fulfilled.                             | Pass   |

## Preorder edge cases verified by automated tests

- Confirming a preorder records demand without changing physical stock.
- A preorder cannot be fulfilled before stock allocation.
- Allocation is all-or-nothing for multi-line preorders.
- Reserved units cannot also be sold as available stock.
- Competing preorders cannot reserve the same unit.
- Cancelling an allocated preorder releases its reservation.
- Cancelling a preorder still awaiting stock creates no inventory activity.
- Repeated or out-of-order API lifecycle requests do not duplicate stock movements.
- Released stock becomes available for a later preorder.

## Full return start-to-finish test

| Step | Action                              | Expected result                                                                        | Result                           |
| ---- | ----------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------- |
| 1    | Open a fulfilled order.             | `Return full order` is available only for a returnable fulfilled order.                | Pass                             |
| 2    | Press the return action.            | A destructive confirmation explains that every item will return to stock.              | Pass                             |
| 3    | Confirm the return.                 | The order becomes returned and records return time and reason.                         | Pass                             |
| 4    | Review inventory.                   | Each line is restored exactly once using referenced `return_restock` ledger movements. | Pass                             |
| 5    | Review the order list.              | The returned filter includes the returned order.                                       | Pass                             |
| 6    | Attempt an invalid repeated return. | The lifecycle prevents a second stock restoration.                                     | Pass through automated coverage. |

## Known limits

- Partial line-item returns are not implemented.
- Exchanges are not implemented.
- Payment-provider refunds are not implemented; the current return is an inventory and order-state workflow.

## Result

**Pass for the implemented scope.** Preorder demand, later allocation, fulfillment, cancellation, and full-order return behavior are covered by mobile QA and backend lifecycle tests.
