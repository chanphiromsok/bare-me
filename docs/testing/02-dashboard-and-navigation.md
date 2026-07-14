# 02 — Dashboard and Navigation

## Purpose

Verify that a signed-in staff member sees live operational data and can navigate from dashboard shortcuts and activity rows without becoming trapped in stale detail screens.

## Start-to-finish test

| Step | Action                                            | Expected result                                                              | Observed result                                             |
| ---- | ------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1    | Sign in and open Home.                            | The greeting uses the stored staff profile and the date uses device time.    | Pass; `Good morning, Demo` and the current date were shown. |
| 2    | Review Pending orders.                            | Count comes from API order data.                                             | Pass                                                        |
| 3    | Review Sales today.                               | Total and order count include today's fulfilled sales.                       | Pass                                                        |
| 4    | Review Recent activity.                           | Recent API-backed order activity is listed.                                  | Pass                                                        |
| 5    | Press New order.                                  | The live new-order workflow opens.                                           | Pass                                                        |
| 6    | Press Add customer.                               | The customer creation screen opens.                                          | Pass                                                        |
| 7    | Press Add product.                                | The product creation screen opens.                                           | Pass                                                        |
| 8    | Press Restock.                                    | The restock workflow opens.                                                  | Pass                                                        |
| 9    | Press View all in Recent activity.                | The Orders tab opens at the order list.                                      | Pass after STAFF-03                                         |
| 10   | Open a recent activity row.                       | The matching order detail opens and Back returns to the order list.          | Pass                                                        |
| 11   | Leave Orders while a detail is open, then return. | The Orders stack resets to its list instead of retaining stale detail state. | Pass with `popToTopOnBlur`.                                 |

## Order list checks

- Status filters update the API-backed list.
- Search is controlled and composes with the selected status filter.
- Order-number search works.
- Customer-name search works.
- Preorder and returned filters are available after those workflows were added.

## Result

**Pass.** Dashboard data was live, quick actions opened the intended screens, recent activity deep links worked, and nested navigation returned to predictable list states.
