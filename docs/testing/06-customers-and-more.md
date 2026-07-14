# 06 — Customers and More

## Purpose

Verify customer creation and lookup, customer order history, staff profile access, unavailable More destinations, and sign-out behavior.

## Customer start-to-finish test

| Step | Action                                           | Expected result                                               | Result |
| ---- | ------------------------------------------------ | ------------------------------------------------------------- | ------ |
| 1    | Open Customers.                                  | API-backed customer rows load.                                | Pass   |
| 2    | Search by customer information.                  | The list narrows to matching customers.                       | Pass   |
| 3    | Open Add customer and submit empty/invalid data. | Form validation blocks invalid creation.                      | Pass   |
| 4    | Enter valid customer details and submit.         | A customer is created and becomes selectable for staff sales. | Pass   |
| 5    | Open the customer row.                           | Contact information and confirmation state are visible.       | Pass   |
| 6    | Review order history.                            | API-backed orders for that customer appear.                   | Pass   |
| 7    | Open an order-history row.                       | The matching order detail opens.                              | Pass   |

The staff customer creation flow supports password-less walk-in customers. Customer self-registration remains pending until an admin confirms the customer because outbound confirmation email is intentionally disabled.

## More screen test

| Step | Action                              | Expected result                                                                | Result              |
| ---- | ----------------------------------- | ------------------------------------------------------------------------------ | ------------------- |
| 1    | Open More.                          | Stored staff identity and role are visible.                                    | Pass                |
| 2    | Inspect unfinished destinations.    | They are labeled unavailable, have no fabricated counts, and cannot be opened. | Pass after STAFF-09 |
| 3    | Open `Learn how to use the system`. | Staff Guide opens.                                                             | Pass                |
| 4    | Press Sign out.                     | Secure session data clears and Login returns.                                  | Pass                |

Unavailable workflows currently include inventory movement browsing, customer approval administration, staff management, settings, and help/support. They are deliberately disabled rather than presented as working screens.

## Result

**Pass.** Customer creation, lookup, details, history navigation, profile display, unavailable-state communication, tutorial entry, and sign-out were verified.
