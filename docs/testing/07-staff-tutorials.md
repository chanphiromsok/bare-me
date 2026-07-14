# 07 — Staff Tutorials

## Purpose

Verify that staff can learn workflows on the real application screens without creating orders, products, payments, customers, or inventory movements.

## Entry flow

| Step | Action          | Expected result                                                                  | Result |
| ---- | --------------- | -------------------------------------------------------------------------------- | ------ |
| 1    | Open More.      | `Learn how to use the system` is visible.                                        | Pass   |
| 2    | Open the guide. | Staff Guide lists the available lessons and explains that no data will be saved. | Pass   |
| 3    | Open a lesson.  | The corresponding real task screen opens in practice mode.                       | Pass   |

## Lesson coverage

| Lesson                        | Real screen | Steps tested                                                          | Result |
| ----------------------------- | ----------- | --------------------------------------------------------------------- | ------ |
| Create a sale order           | New Order   | Sale type, customer, product quantity, payment/final action           | Pass   |
| Create and fulfill a preorder | New Order   | Preorder type, customer, requested items, confirmation                | Pass   |
| Create a product              | New Product | Product information, variant information, opening stock, final action | Pass   |
| Restock a product             | Restock     | Find variant, select variant, quantity, final action                  | Pass   |

All four lessons were walked through from the first step to Done on the iPhone simulator. Preorder also opened with the correct order type selected, and Skip was verified.

## Data-safety checks

- The final mutation button is visibly marked as practice-only.
- Final mutation buttons are disabled during tutorials.
- Mutation handlers also guard against tutorial mode, providing a second protection layer.
- Exiting through Skip or Done returns to Staff Guide.
- No tutorial created an order or product, recorded a payment, or changed inventory.

## Spotlight and Teleport checks

After moving Spotlight into `react-native-teleport`, the sale tutorial was re-tested:

1. The real order-type target was highlighted.
2. The dim layer covered the status bar and native navigation header.
3. The tooltip remained above the dim layer.
4. Next moved the cutout from order type to customer selection.
5. Skip stopped the tour and returned to Staff Guide.
6. Real target refs remained on their screen controls.

The root `PortalHost` is explicitly transparent because the native host otherwise appeared opaque during initial simulator validation.

## Result

**Pass.** Tutorials use real screens, cover all current staff lessons, prevent data mutations, and render the Spotlight above native navigation through Teleport.
