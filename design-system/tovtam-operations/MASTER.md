# Tovtam Operations Design System

This document is the source of truth for the internal staff and administrator
mobile app. Customers use a separate web storefront.

## Product principles

- Optimize for fast, interrupted store-floor tasks.
- Show one primary action per screen.
- Keep inventory and order mutations online and server-confirmed.
- Cached data may be viewed offline, but never imply that a mutation succeeded.
- Use familiar iOS and Android behavior for navigation, sheets, dialogs, and back.

## Visual language

- Style: quiet operational clarity; flat grouped surfaces with restrained borders.
- Typography: native system font, Dynamic Type/font scaling enabled.
- Icons: the existing Tovtam outline icon family, 24pt standard size.
- Spacing: 4pt base; primary rhythm 8, 12, 16, 24, and 32.
- Corners: 12 for controls, 16 for cards, continuous corners on iOS.
- Elevation: borders for normal cards; shadow only for floating sheets and menus.
- Motion: 150–250ms, transform/opacity only, disabled under reduced motion.

## Semantic colors

| Role            | Light     |
| --------------- | --------- |
| Primary         | `#203F78` |
| Primary pressed | `#17315F` |
| Accent          | `#F05A2A` |
| Background      | `#F5F7FA` |
| Surface         | `#FFFFFF` |
| Surface subtle  | `#EEF2F7` |
| Text            | `#142033` |
| Text secondary  | `#5E6B7D` |
| Border          | `#DCE3EC` |
| Success         | `#18794E` |
| Warning         | `#A15C00` |
| Danger          | `#B42318` |
| Information     | `#1769AA` |

Color never communicates state alone. Pair it with a label and, when useful,
an icon.

## Navigation

Phone navigation has five labeled destinations: Home, Orders, Products,
Customers, and More. Detail and creation flows are pushed onto a native stack.
On tablets, the same destinations may become a navigation rail with list-detail
layouts.

## Components

- Buttons: 48pt minimum height; filled primary, tonal secondary, plain tertiary.
- Inputs: always-visible labels, 48–56pt field height, errors directly below.
- List rows: 64pt minimum with a clear title, supporting text, and trailing state.
- Status pills: label plus semantic tint; never color-only dots.
- Cards: 16pt padding, 16pt radius, subtle border.
- Destructive actions: visually separated and always confirmed.
- Loading: skeleton for page content, progress state inside mutation buttons.
- Empty/error/offline: explain the state and provide one recovery action.

## Accessibility and QA

- Touch targets: at least 44pt on iOS and 48dp on Android.
- Text contrast: WCAG AA, 4.5:1 for normal text.
- Support 200% Android font scale and iOS accessibility Dynamic Type sizes.
- Every icon-only control has an accessibility label and role.
- Validate at 375pt width and on both platform back behaviors.
