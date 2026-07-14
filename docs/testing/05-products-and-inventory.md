# 05 — Products and Inventory

## Purpose

Verify product creation, product/variant browsing, stock visibility, restocking, optimistic UI behavior, and ledger safety.

## Product browsing test

| Step | Action                         | Expected result                                                       | Result |
| ---- | ------------------------------ | --------------------------------------------------------------------- | ------ |
| 1    | Open Products.                 | API-backed products render in the list.                               | Pass   |
| 2    | Search by product information. | The visible list narrows to matching products.                        | Pass   |
| 3    | Open a product row.            | Product description and variants are shown.                           | Pass   |
| 4    | Review each variant.           | SKU, size, color, price, active state, and current stock are visible. | Pass   |

## Product creation test

| Step | Action                                  | Expected result                                                                   | Result              |
| ---- | --------------------------------------- | --------------------------------------------------------------------------------- | ------------------- |
| 1    | Open Add product.                       | Product and first-variant inputs are visible.                                     | Pass                |
| 2    | Submit with required fields empty.      | Validation prevents the request and identifies missing input.                     | Pass                |
| 3    | Focus and edit each field.              | Keyboard focus stays on the selected field and values do not leak between inputs. | Pass after STAFF-07 |
| 4    | Enter valid product and variant values. | The create action becomes valid.                                                  | Pass                |
| 5    | Submit.                                 | Product and first variant are created and later appear in product data.           | Pass                |

Example-like placeholders were changed to explicit prompts or `e.g.` labels so empty fields no longer look populated.

## Restock test

| Step | Action                            | Expected result                                         | Result                                      |
| ---- | --------------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| 1    | Open Restock.                     | Staff can search or scan for a variant.                 | Pass                                        |
| 2    | Select `DEV-714-TEE`.             | Current stock and restock controls appear.              | Pass                                        |
| 3    | Enter quantity `2` and submit.    | A positive restock movement is created.                 | Pass                                        |
| 4    | Observe the screen after success. | Stock updates immediately without a full-screen reload. | Pass with optimistic TanStack Query update. |
| 5    | Re-open product/variant detail.   | Persisted stock agrees with the optimistic value.       | Pass; stock changed from 7 to 9.            |

## Inventory safety coverage

Automated backend tests verify:

- ledger movement sum remains equal to `quantity_on_hand`;
- overselling changes neither stock nor ledger;
- the inventory ledger is staff-only and insert-only;
- variant PATCH cannot write `quantity_on_hand` directly;
- database constraints reject negative stock;
- reservations cannot exceed physical stock;
- repeated restock requests with the same client reference add stock only once.

## Result

**Pass.** Product creation, variant details, restocking, optimistic updates, persisted stock, and ledger protections behaved as intended.
