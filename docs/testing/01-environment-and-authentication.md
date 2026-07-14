# 01 — Environment and Authentication

## Purpose

Verify that a staff member can launch the app, authenticate, retain the session, and sign out safely.

## Preconditions

- Local Phoenix API is running and reachable from the simulator.
- The seeded staff account is active.
- The generated Hey API client is configured before protected requests run.

## Start-to-finish test

| Step | Action                                                  | Expected result                                                                           | Observed result                                               |
| ---- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1    | Launch the app without an authenticated session.        | The login screen is shown instead of protected tabs.                                      | Pass                                                          |
| 2    | Inspect the empty email and password fields.            | Empty fields look empty and do not appear prefilled by example text.                      | Pass after STAFF-01; email placeholder is `Enter your email`. |
| 3    | Enter the seeded staff credentials and submit.          | A staff token is returned and the protected application opens.                            | Pass                                                          |
| 4    | Confirm the signed-in profile is visible.               | The stored staff identity is available to the dashboard and More screen.                  | Pass; `Demo Staff` was displayed.                             |
| 5    | Restart/reload the application with the stored session. | The protected route remains available and authenticated API calls carry the bearer token. | Pass                                                          |
| 6    | Open More and press Sign out.                           | User data and the secure token are cleared, then the login screen returns.                | Pass                                                          |

## Storage and client checks

- Staff profile data is stored through MMKV.
- The access token is stored through Expo Secure Store.
- Navigation readiness configures the Hey API client with the current authorization header before protected requests.
- Native autofill remains enabled and updates React Hook Form through `onChangeText`.

## Backend security coverage

Automated API tests also verify:

- valid staff JWT authentication;
- tampered and expired bearer tokens return JSON:API `401` responses;
- an existing token is rejected after staff deactivation;
- staff and customer tokens resolve to the correct Ash actor;
- anonymous requests remain anonymous.

## Result

**Pass.** Login, restored authentication, protected routing, and sign-out behaved correctly in simulator QA.
