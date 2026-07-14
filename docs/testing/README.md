# Staff App Test Reports

This folder records the staff application testing performed on 2026-07-14. The reports are ordered from app launch through daily POS workflows and finish with automated regression coverage and known gaps.

## Test environment

- Mobile app: Expo 57.0.4 and React Native 0.86.0
- Device: iPhone 17 Pro simulator running iOS 26.2
- API: local Phoenix/Ash application in `/Users/phirom/Desktop/me`
- Metro: port 8081
- Staff account: seeded `staff@example.com`
- API media type: `application/vnd.api+json`

## Reports

1. [Environment and authentication](01-environment-and-authentication.md)
2. [Dashboard and navigation](02-dashboard-and-navigation.md)
3. [Sales orders and payments](03-sales-orders-and-payments.md)
4. [Preorders and returns](04-preorders-and-returns.md)
5. [Products and inventory](05-products-and-inventory.md)
6. [Customers and More](06-customers-and-more.md)
7. [Staff tutorials](07-staff-tutorials.md)
8. [Automated checks and known gaps](08-automated-checks-and-known-gaps.md)

## Result summary

| Area                                   | Result | Evidence                                    |
| -------------------------------------- | ------ | ------------------------------------------- |
| Authentication and session restoration | Pass   | Manual simulator QA                         |
| Dashboard and navigation               | Pass   | Manual simulator QA                         |
| In-stock sale and payment              | Pass   | Manual simulator QA and API tests           |
| Order lifecycle                        | Pass   | Manual simulator QA and API tests           |
| Preorder lifecycle                     | Pass   | Manual simulator QA and API edge-case tests |
| Full returns                           | Pass   | Manual simulator QA and API tests           |
| Products and variants                  | Pass   | Manual simulator QA                         |
| Restock                                | Pass   | Manual simulator QA and API tests           |
| Customers                              | Pass   | Manual simulator QA                         |
| Staff tutorials                        | Pass   | Manual simulator QA                         |
| Static mobile checks                   | Pass   | TypeScript, ESLint, React Doctor            |
| Phoenix API suite                      | Pass   | 67 ExUnit tests                             |

## Evidence rules

Each report distinguishes among:

- **Manual simulator QA**: the feature was used through the visible application.
- **API integration observation**: the mobile action reached the local API and the resulting data was observed in the app.
- **Automated backend test**: an ExUnit test verifies the domain or JSON:API behavior.
- **Static validation**: the code passed TypeScript, lint, formatting, or React diagnostics.

These reports do not treat code presence alone as proof that a workflow passed.
