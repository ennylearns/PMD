# Handoff: PMD E-commerce - Issue #05 Checkout Flow

## Objective

Implement **Issue #05: Checkout Flow** for PMD, using the clarified domain decisions captured in:

- `.scratch/pmd-ecommerce/issues/05-checkout-flow.md`
- `CONTEXT.md`
- `.scratch/pmd-ecommerce/PRD.md`
- `PRD.md`

## Current Codebase State

- Stack: Next.js 16 App Router, React 19, Tailwind CSS v4, Prisma 7, NextAuth v5, Vitest.
- Cart is complete and exposed through `src/lib/cart-context.tsx` plus `/api/cart`.
- Cart page exists at `src/app/cart/page.tsx`; it formats prices in NGN and links to `/checkout`.
- Customer auth is complete. `/checkout` is intentionally public; `/dashboard` is protected.
- Saved address CRUD exists at `/api/addresses` and `src/app/dashboard/addresses/page.tsx`.
- Saved address form currently uses a State dropdown but City is still free text.
- Prisma already has `User`, `Address`, `CartItem`, `Order`, and `OrderItem`, but Issue #05 should not add schema changes.
- There is no checkout page yet.
- The checkout visual reference is `mockups/stitch_premium_streetwear_e_commerce_store/checkout/`.

## Decisions Already Resolved

Do not reopen these unless the user explicitly asks:

- PMD will **not** use GIG Logistics. Fulfillment is owner-managed from Jos, Plateau State.
- Customer-facing copy should say **Delivery**, not Shipping, except where current technical names already use shipping.
- Issue #05 prepares checkout only. It does not create orders, initialize Paystack, redirect to Paystack, decrement inventory, or clear cart items.
- Issue #06 creates the pending order, initializes Paystack, redirects to Paystack, handles webhook success, decrements inventory after payment, and clears purchased cart items only after payment confirmation.
- Delivery fees are PMD-owned. Use code defaults now; admin-editable settings come later.
- Delivery fee is state-based for Issue #05, but helper design should allow future city-specific overrides.
- State and City are dropdowns. City is limited to PMD-supported cities.
- Start with a curated major-city/state-capital supported-city list, not exhaustive nationwide city coverage.
- Empty carts are blocked from `/checkout` and redirected to `/cart`.
- Guests enter email, name, phone, State, City, and street address.
- Authenticated Customers use `User.email` and `User.name`; collect name only if missing. Phone is still collected at checkout only and is not saved to the profile in Issue #05.
- Authenticated Customers can reuse saved addresses, enter a one-off address, and optionally save that one-off address.
- Saved addresses with unsupported State/City should be visible but unavailable for checkout.
- Coupons are out of scope for Issue #05.
- Paystack is the only payment method, so do not include a payment method selector.

## What To Build Next

1. Add shared delivery/location helpers.
   - Suggested location: `src/lib/delivery.ts` or similar.
   - Include Nigerian States, supported cities by State, delivery fee bands from Jos/Plateau, NGN formatter if not already shared, and helper functions for validation/fee lookup.
   - Keep this source swappable later for admin-editable database settings.

2. Update saved address UI.
   - Change `src/app/dashboard/addresses/page.tsx` so City becomes a dropdown driven by selected State.
   - Reset City when State changes.
   - Prevent saving unsupported State/City combinations.

3. Build `/checkout`.
   - Use the mockup visual direction: premium dark checkout surface, delivery form, sticky order summary.
   - Omit the mockup payment selector.
   - Redirect to `/cart` when cart is empty.
   - For authenticated users, fetch saved addresses and prefill default address where possible.
   - Show unsupported saved addresses as unavailable.
   - Validate Delivery Contact and Address before enabling/preparing payment.
   - Revalidate cart stock from current cart item inventory and block if quantity exceeds stock.
   - Keep checkout payload in page state and prepare it for the future `/api/payment/initialize`.

4. Clean up stale UI copy while touching checkout/cart surfaces.
   - `src/app/cart/page.tsx` still has a trust badge reading `GIG Logistics delivery`; change it to owner-managed/PMD delivery language.
   - Use "Delivery Fee" in checkout-facing UI.

5. Add focused tests.
   - Unit tests for delivery fee lookup, supported city validation, and state/city dropdown behavior if practical.
   - Component/API tests should stay focused on observable behavior. Existing test command: `npm test`.

## Suggested Skills

- `tdd`: useful for delivery helper behavior and checkout validation before UI wiring.
- `diagnose`: only if existing cart/auth/address behavior breaks during implementation.

## Notes

- Docs were updated during the grilling session and are currently uncommitted.
- Issue #07 was renamed from `07-gig-logistics.md` to `07-owner-managed-fulfillment.md`.
- Run `git status --short` before starting; do not revert unrelated changes.
