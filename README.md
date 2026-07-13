# Bare

Bare is an Expo React Native app with native `ios/` and `android/` projects committed. It uses React Navigation, Uniwind/Tailwind-style classes, Lingui for translations, TanStack Query for server state, and Hey API for generated API clients.

## Staff Acceptance Review — 2026-07-14

The staff app was reviewed end to end against the local Phoenix API on an iPhone 17 Pro simulator (iOS 26.2). The review used Expo 57.0.4, React Native 0.86.0, Metro on port 8081, and the seeded `staff@example.com` account.

### Coverage

| Area                   | Result                | Notes                                                                                                                                                                   |
| ---------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication         | Passed after STAFF-01 | Sign-out works. The misleading account-like placeholder was replaced so an empty form can no longer look prefilled. Native autofill remains enabled.                    |
| Dashboard              | Passed after STAFF-02 | Date and greeting use the current device time and stored staff profile. Pending orders, today's fulfilled sales, and recent activity come from the API.                 |
| Dashboard navigation   | Passed after STAFF-03 | `View all` targets the order list, activity deep links preserve a list back path, and leaving Orders clears retained detail state.                                      |
| New order              | Passed                | A cash sale for an in-stock variant created fulfilled order `#8` and reduced stock from 289 to 288.                                                                     |
| Order list and filters | Passed after STAFF-04 | Status filters compose with a controlled order-number/customer-name search.                                                                                             |
| Order details          | Passed after STAFF-11 | Customer, items, payment, timeline, and state-valid confirm, cancel, cash-payment, fulfillment, and full-return actions work.                                           |
| Product list           | Passed after STAFF-06 | API data and search work. Product rows open a variant view with SKU, size, color, price, active state, and current stock.                                               |
| Restock                | Passed                | Restocking `DEV-714-TEE` by 2 changed stock from 7 to 9.                                                                                                                |
| Add product            | Passed after STAFF-07 | Required-field validation and creation work. Example-like placeholders are clearly labeled so empty inputs no longer look populated; native field focus was reverified. |
| Customer list          | Passed after STAFF-08 | API data, search, validation, and customer creation work. Customer rows open contact, approval, and API-backed order history details.                                   |
| More                   | Passed after STAFF-09 | Sign out works. Destinations without implemented workflows are visibly unavailable, are not interactive, and no longer display fabricated counts or disclosure arrows.  |
| Static checks          | Passed after STAFF-10 | Obsolete Petstore example hooks and their unused Explore screen were removed. `yarn lint` and `yarn typecheck` both pass.                                               |
| Phoenix API            | Passed baseline       | `mix test` passes with 49 tests. No server failure was observed during sale, customer, product, or restock requests.                                                    |

### Confirmed Tasks

- [x] **STAFF-01 — Fix sign-in form/autofill synchronization.** The apparent `staff@example.com` value was the placeholder while React Hook Form correctly held an empty string. The field now says `Enter your email`, while `autoComplete` and `textContentType` continue to synchronize genuine native autofill through `onChangeText`.
- [x] **STAFF-02 — Make dashboard data live.** Date and greeting are derived at render time, the staff name comes from MMKV, and one TanStack Query dashboard request supplies pending orders, today's fulfilled sales, and recent activity.
- [x] **STAFF-03 — Reset Orders navigation correctly.** Dashboard destinations now target nested screens explicitly, activity links preserve the nested stack's initial list route, and the Orders tab uses `popToTopOnBlur`.
- [x] **STAFF-04 — Implement order search.** The controlled search now filters the API-backed list by order number or customer name after applying the selected Jotai status filter.
- [x] **STAFF-05 — Add staff order workflow actions.** Draft orders can be confirmed or cancelled; pending orders can be paid, fulfilled after full payment, or cancelled. Mutations refresh all operation queries.
- [x] **STAFF-06 — Add product and variant details.** Products now use a nested stack and API-backed detail query; each row opens the product description and its SKU, size, color, price, active state, and stock per variant.
- [x] **STAFF-07 — Verify and harden Add Product input focus.** Native field discovery confirmed that focus and values remain isolated. The apparent populated fields were example placeholders, now prefixed with `e.g.` or replaced by explicit prompts.
- [x] **STAFF-08 — Add customer profile/history details.** Customers use a nested stack; each row opens contact information, confirmation state, and order history with links to order details.
- [x] **STAFF-09 — Implement or clearly disable More destinations.** Unimplemented destinations are non-interactive and labeled unavailable; fabricated approval counts and misleading disclosure affordances were removed.
- [x] **STAFF-10 — Restore a clean TypeScript check.** Obsolete Petstore/Explore template code was removed and the unused legacy carousel's incompatible gesture customization was dropped.
- [x] **STAFF-11 — Add auditable full-order returns.** Only fulfilled orders can transition to returned. The backend records the time/reason and creates referenced `return_restock` ledger entries for every line; the staff app exposes a destructive, confirmed full-return action and returned-order filter. Partial returns and payment-provider refunds remain future workflows.

This checklist is the implementation queue. Complete and verify one task per commit so regressions and backend/mobile changes remain reviewable.

## Requirements

- Node.js compatible with the Expo SDK used by this repo.
- Yarn 4. This repo is configured with `packageManager: yarn@4.12.0`.
- Xcode for iOS builds.
- Android Studio and an Android SDK/emulator for Android builds.

## Environment Installation

Follow the official setup pages instead of copying machine-specific steps into this repo:

- [Expo environment setup](https://docs.expo.dev/get-started/set-up-your-environment/)
- [Node.js downloads](https://nodejs.org/en/download)
- [Yarn installation](https://yarnpkg.com/getting-started/install)
- [Xcode](https://developer.apple.com/xcode/)
- [Android Studio](https://developer.android.com/studio)

## First Setup

```sh
yarn install
yarn typecheck
```

Start the app with one of these:

```sh
yarn start
yarn ios
yarn android
yarn web
```

Use `yarn start` when you want Expo Dev Tools and QR/device options. Use `yarn ios` or `yarn android` when you need a native build.

## Useful Scripts

| Command                | What it does                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `yarn start`           | Starts Expo Metro.                                                                                 |
| `yarn ios`             | Builds and runs the iOS app.                                                                       |
| `yarn android`         | Builds and runs the Android app.                                                                   |
| `yarn web`             | Starts the web target.                                                                             |
| `yarn lint`            | Runs Expo's official ESLint setup.                                                                 |
| `yarn typecheck`       | Runs TypeScript without emitting files.                                                            |
| `yarn extract`         | Extracts Lingui translation messages.                                                              |
| `yarn env:dev`         | Copies `.env.development` to `.env` and generates SuperConfig files.                               |
| `yarn env:prod`        | Copies `.env.production` to `.env` and generates SuperConfig files.                                |
| `yarn generate-config` | Regenerates SuperConfig from the current `.env`.                                                   |
| `yarn openapi-ts`      | Regenerates API types, client, SDK, and query helpers.                                             |
| `yarn prebuild`        | Regenerates native projects from Expo config. Use carefully because this can rewrite native files. |

## Pre-Commit

Husky runs before each commit. It formats/lints staged files with `lint-staged`, runs `yarn extract`, and stops the commit if Lingui `.po` files changed. When that happens, review and stage the updated locale files, then commit again.

## Project Map

```text
src/
  api/          API config, generated client code, and query hooks
  components/   Shared UI building blocks
  constant/     App constants and environment-style config
  i18n/         Lingui setup and language helpers
  locales/      Translation catalogs
  navigation/   Root stack and bottom tabs
  screens/      App screens and screen-local components
  theme/        Colors and navigation theme
  utils/        Shared pure helpers
```

Top-level files to know:

- `App.tsx` wires providers together: gestures, keyboard, React Query, portals, i18n, navigation, and status bar.
- `app.json` holds Expo app config, native package identifiers, plugins, and app assets.
- `global.css` defines Uniwind theme tokens used by `className`.
- `openapi-ts.config.ts` controls generated API code.
- `AGENTS.md` contains repo-specific coding instructions.

## Where To Put New Code

- New screen: add it under `src/screens/`, then register it in `src/navigation/`.
- Screen-only component: put it beside the screen or in `src/screens/components/`.
- Shared component: put it under `src/components/`.
- API query hook: prefer `src/api/query/` and reuse the generated API helpers.
- API mutation hook: prefer `src/api/mutate/` and keep one hook per file.
- Theme color: add it to `src/theme/colors.ts` and mirror class tokens in `global.css` if the color is used with `className`.
- Translation text: use Lingui, then run `yarn extract`.

## API Code

Generated API files live in `src/api/generated/`. Do not edit those files by hand. Change `openapi-ts.config.ts` or the OpenAPI source, then run:

```sh
yarn openapi-ts
```

The runtime API base URL is configured in `src/constant/config.ts` and consumed by `src/api/hey-api.ts`.

Environment values come from `react-native-superconfig`. Copy `.env.example` to `.env.development`, fill values, then run:

```sh
yarn env:dev
```

Use app-owned hooks from `src/api/query/{feature}/` and `src/api/mutate/{feature}/` in screens. These wrap the generated Hey API helpers with TanStack Query. Keep query filter atoms beside the query they control.

Normal query:

```ts
import useQueryPetsByStatus from "../api/query/pet/useQueryPetsByStatus";

const pets = useQueryPetsByStatus();
```

Mutation:

```ts
import useMutateAddPet from "../api/mutate/pet/useMutateAddPet";

const addPet = useMutateAddPet();

addPet.mutate({
  body: {
    name: "Lucky",
    photoUrls: [],
    status: "available",
  },
});
```

Infinite query:

```ts
import { flattenPetPages } from "../api/query/pet/useInfiniteQueryPetsByStatus";
import useInfiniteQueryPetsByStatus from "../api/query/pet/useInfiniteQueryPetsByStatus";

const petsQuery = useInfiniteQueryPetsByStatus({
  pageSize: 20,
});
const pets = flattenPetPages(petsQuery.data);
```

Filter state that is shared between a filter screen and a query hook can use a colocated Jotai atom:

```ts
import { useAtom } from "jotai";

import { petFiltersAtom } from "../api/query/pet/petFiltersAtom";

const [filters, setFilters] = useAtom(petFiltersAtom);

setFilters({ ...filters, status: "pending" });
navigation.goBack();
```

When adding new generated endpoints, keep the same pattern: create a small app hook in `src/api/query/{feature}/` for reads or `src/api/mutate/{feature}/` for writes, import generated `*Options` or `*Mutation`, and invalidate related queries after successful mutations.

## Forms And Validation

Use `src/components/form/TextController.tsx` with React Hook Form. For simple one-off validation, pass `rules` directly to the controller. For reusable form schemas, use ArkType with `@hookform/resolvers`.

See `src/screens/LoginScreen.tsx` and `src/screens/LoginScreen.validation.ts` for the working app example.

```tsx
import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import type { Resolver } from "react-hook-form";

// LoginScreen.validation.ts
export const loginSchema = type({
  email: "string.email",
  password: "string >= 8",
});

export type LoginFormValues = typeof loginSchema.infer;

export const loginDefaultValues: LoginFormValues = {
  email: "",
  password: "",
};

export const loginResolver: Resolver<
  LoginFormValues,
  unknown,
  LoginFormValues
> = arktypeResolver(loginSchema);
```

```tsx
// LoginScreen.tsx
import { useForm } from "react-hook-form";
import { Button, View } from "react-native";

import TextController from "../components/form/TextController";
import {
  loginDefaultValues,
  type LoginFormValues,
  loginResolver,
} from "./LoginScreen.validation";

export default function LoginForm() {
  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: loginDefaultValues,
    resolver: loginResolver,
  });

  const onSubmit = (values: LoginFormValues) => {
    console.log(values);
  };

  return (
    <View>
      <TextController
        autoCapitalize="none"
        control={control}
        keyboardType="email-address"
        label="Email"
        name="email"
        placeholder="Email"
      />
      <TextController
        control={control}
        label="Password"
        name="password"
        placeholder="Password"
        secureTextEntry
      />
      <Button onPress={handleSubmit(onSubmit)} title="Login" />
    </View>
  );
}
```

## Dates

Use `src/utils/dateFormat.ts` for date display and API date strings.

```ts
import { formatDate } from "../utils/dateFormat";

formatDate(order.shipDate, { preset: "mediumDate" });
formatDate(order.shipDate, { preset: "dateTime", locale: "km-KH" });
formatDate(new Date(), { preset: "apiDate" });
```

## Storage And Permissions

- Sensitive values such as access tokens: use `src/storage/secureStore.ts`.
- Encrypted app preferences such as locale, theme, or cached user info: use `src/storage/appPreferences.ts`.
- One-time location reads: use `src/services/geolocation.ts` or `src/hooks/useCurrentLocation.ts`.
- Permission hooks live in `src/hooks/`.

Examples:

```ts
import { AuthTokenStore } from "./src/storage/secureStore";

await AuthTokenStore.setAccessToken(token);
```

```ts
import { usePersistedTheme } from "./src/storage/appPreferences";

const { theme, setTheme } = usePersistedTheme();
```

```ts
import { useCurrentLocation, useLocationPermission } from "./src/hooks";

const permission = useLocationPermission();
const location = useCurrentLocation();
```

## Styling

The app uses Uniwind so React Native components can use `className`. Use normal `style` objects for third-party components that do not support `className` directly.

## Before Opening A PR

Run:

```sh
yarn typecheck
```

Also run the app target you touched (`yarn ios`, `yarn android`, or `yarn web`) and click through the changed screen.
