# 08 — Automated Checks and Known Gaps

## Mobile validation

The following checks passed after the latest tutorial/Teleport change:

```sh
yarn typecheck
yarn lint
git diff --check
npx react-doctor@latest --verbose --scope changed
```

React Doctor reported **100/100 with no issues**.

## Phoenix API validation

The backend suite was run from `/Users/phirom/Desktop/me` on 2026-07-14:

```text
67 tests, 0 failures
```

The suite covers accounts and actors, catalog constraints, inventory ledger rules and concurrency, sale/payment state transitions, preorder allocation edge cases, full returns, retry idempotency, authorization boundaries, JSON:API behavior, and OpenAPI/Swagger routes.

## Test data changed during manual QA

Manual acceptance testing intentionally changed local development data:

- fulfilled order `#8` was created;
- one tested variant decreased from 289 to 288 after the sale;
- `DEV-714-TEE` increased from 7 to 9 after a restock;
- test customers and products were created during their form validations.

Tutorial testing did **not** change store data.

## Not yet covered

| Gap                                            | Current status                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| Android emulator                               | Not included in this acceptance run.                                     |
| Physical iOS/Android device                    | Not included.                                                            |
| Web customer application                       | Outside the staff mobile test scope.                                     |
| Partial returns                                | Not implemented.                                                         |
| Exchanges                                      | Not implemented.                                                         |
| Payment-provider refunds                       | Not implemented.                                                         |
| Offline creation and later synchronization     | Not tested.                                                              |
| Push notifications                             | Not implemented/tested.                                                  |
| Barcode camera permission on physical hardware | Simulator-only coverage is insufficient.                                 |
| Admin customer confirmation UI                 | Backend route exists; staff mobile administration screen is unavailable. |
| Email confirmation delivery                    | Intentionally disabled because no email provider is configured.          |
| Load/stress testing                            | Not performed.                                                           |

## Recommended next test run

1. Repeat the staff acceptance flow on the configured Android emulator.
2. Test camera scanning and secure storage on at least one physical device.
3. Add an automated mobile E2E suite for login, sale, preorder, restock, return, and tutorial no-mutation behavior.
4. Add network interruption tests around idempotent mutations.
5. Test the separate customer web application when its end-to-end flow is ready.
