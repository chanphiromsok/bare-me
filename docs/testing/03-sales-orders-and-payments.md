# 03 — Sales Orders and Payments

## Purpose

Verify the complete staff flow for an in-stock POS sale, including customer selection, item quantity, payment, fulfillment, inventory reduction, order details, and invalid lifecycle protection.

## Start-to-finish sale test

| Step | Action                                            | Expected result                                                                                  | Observed result                                 |
| ---- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| 1    | Open New order and keep `In-stock sale` selected. | The form uses the normal stock-controlled sale path.                                             | Pass                                            |
| 2    | Select a customer.                                | The customer becomes part of the draft order input.                                              | Pass                                            |
| 3    | Search or browse variants.                        | Active API-backed variants show SKU, attributes, price, and availability.                        | Pass                                            |
| 4    | Increase an available variant quantity.           | Item count and total update without exceeding available stock.                                   | Pass                                            |
| 5    | Select Cash.                                      | Cash becomes the payment method.                                                                 | Pass                                            |
| 6    | Submit the sale.                                  | One order is created, payment is recorded, the order is fulfilled, and the app navigates safely. | Pass                                            |
| 7    | Open the created order.                           | Customer, line items, payment, totals, status, and timeline are visible.                         | Pass                                            |
| 8    | Re-open the product/variant.                      | Available stock is reduced once.                                                                 | Pass; order `#8` reduced stock from 289 to 288. |

## Order action matrix tested

| Starting state         | Action              | Expected result                                               | Result |
| ---------------------- | ------------------- | ------------------------------------------------------------- | ------ |
| Draft                  | Confirm             | Order becomes pending when valid.                             | Pass   |
| Draft                  | Cancel              | Order becomes cancelled.                                      | Pass   |
| Pending and unpaid     | Record cash payment | Payment state updates.                                        | Pass   |
| Pending and fully paid | Fulfill             | Order becomes fulfilled.                                      | Pass   |
| Pending                | Cancel              | Order becomes cancelled and allocated sale stock is restored. | Pass   |
| Fulfilled              | Cancel              | Action is unavailable/rejected.                               | Pass   |

## Failure and retry coverage

Backend automated tests verify:

- insufficient stock returns `422` without partial stock movement;
- illegal state transitions return `409`;
- simultaneous sales of the final unit allow exactly one sale;
- inactive variants and archived products cannot be ordered from stale results;
- client references prevent duplicate orders and duplicate stock changes after a retried request;
- payments require an open order and cannot be voided twice;
- discounts cannot make the order total negative.

## Result

**Pass.** The in-stock cash sale completed end to end and inventory changed exactly once. State-valid actions worked and invalid transitions were protected.
