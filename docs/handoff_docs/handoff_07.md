# Handoff: PMD E-commerce — Issue #06 Paystack Payment

## Objective

Implement **Issue #06: Paystack Payment Integration** for the PMD streetwear e-commerce platform. All design decisions for this issue have been fully resolved in a prior grilling session. Do not reopen resolved decisions unless the user explicitly asks.

## Project Context

**PMD (Pressure Makes Diamonds)** is a Nigerian streetwear brand e-commerce site.

- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma 7, NextAuth v5, Vitest.
- **Issue tracker:** `.scratch/pmd-ecommerce/issues/`
- **Domain docs:** `CONTEXT.md` at repo root.
- **PRD:** `.scratch/pmd-ecommerce/PRD.md`

## Current Codebase State

- **Issue #05 (Checkout Flow)** is fully implemented. It delivers:
  - A `/checkout` page (accessible to guests and authenticated users).
  - A validated checkout payload ready to be consumed by `POST /api/payment/initialize`.
  - Delivery fee calculation, supported state/city dropdowns, and cart stock revalidation.
- **Issue #04 (Customer Auth):** Complete. NextAuth v5 with `auth.config.ts` (Edge) and `auth.ts` (Node).
- **Issue #03 (Shopping Cart):** Complete. Cart managed via `src/lib/cart-context.tsx` and `/api/cart`. Merges from `guestId` to `userId` on login.
- **Tests:** Suite was green at 74/74 Vitest integration tests before Issue #05. Run `npm test` to verify current state.

## Resolved Design Decisions

See `.scratch/pmd-ecommerce/issues/06-paystack-payment.md` for the full, authoritative list. Summary below.

### 1. Stock: Oversell-and-Refund (not cron-based reservation)

Stock is **not** decremented or reserved when the pending Order is created. Inventory is decremented only after the Paystack webhook confirms `charge.success`. If two customers both pay for the last unit, the webhook re-validates stock and issues a Paystack refund for the oversold quantity. See `docs/adr/0001-oversell-and-refund-over-stock-reservation.md` for the full rationale.

### 2. Linking Paystack Transactions to Orders: `paymentReference`

Add a `paymentReference String? @unique` field to the Prisma `Order` model.

- `POST /api/payment/initialize` saves the Paystack reference to this field on the pending Order.
- The webhook uses `prisma.order.findUnique({ where: { paymentReference } })` to locate the Order.
- Also pass the internal `order.id` in the Paystack `metadata` object as a backup lookup.

### 3. Cart Clearing

At initialization, cart items are already snapshotted into immutable `OrderItem` records (linked to the Order). When the webhook marks the Order as paid, it uses the `userId` or `guestId` on the Order to delete all items in that customer's active cart.

### 4. Abandoned Pending Orders

Pending Orders where the customer abandons the Paystack tab are left as `PENDING` in the database. No cron-based cleanup is in scope for this issue. They serve as an abandoned-checkout log.

## What To Build

All acceptance criteria live in `.scratch/pmd-ecommerce/issues/06-paystack-payment.md`. High-level build order:

1. **Prisma schema update:** Add `paymentReference String? @unique` to the `Order` model. Run migration.
2. **`POST /api/payment/initialize`:**
   - Consume the validated checkout payload from Issue #05.
   - Recheck stock for all cart items; block and return an error if any item is unavailable.
   - Create a `PENDING` Order with `OrderItem` records in a Prisma transaction.
   - Call the Paystack Initialize Transaction API (`https://api.paystack.co/transaction/initialize`).
   - Save the returned `reference` to `Order.paymentReference`.
   - Return the Paystack `authorization_url` for client-side redirect.
3. **Client-side redirect:** After a successful initialization response, redirect the browser to the Paystack `authorization_url`.
4. **`POST /api/payment/webhook`:**
   - Verify the Paystack HMAC-SHA512 signature using `PAYSTACK_SECRET_KEY` from env.
   - On `charge.success`, find the Order via `paymentReference`.
   - Re-validate stock for each `OrderItem`.
   - If stock is sufficient: decrement inventory, mark Order as `PAID`, clear the customer's active cart.
   - If oversold: issue a Paystack refund for the oversold quantity, mark Order appropriately.
5. **Success/failure pages or redirects:** After Paystack redirects the customer back, show order confirmation or failure messaging.
6. **Tests:** Focus on `POST /api/payment/initialize` (stock check blocking, Order creation) and the webhook handler (signature verification, status transitions, cart clearing).

## Environment Variables Needed

> ⚠️ Do not hardcode these. Add them to `.env.local` and document them in `.env.example`.

- `PAYSTACK_SECRET_KEY` — your Paystack secret key (test key for development)
- `PAYSTACK_PUBLIC_KEY` — your Paystack public key (for Inline JS if used)
- `NEXT_PUBLIC_APP_URL` — the base URL of the app, used to build the callback URL passed to Paystack

## Suggested Skills

- **tdd** (`/tdd`): Use the red-green-refactor loop for `POST /api/payment/initialize` (stock check, Order creation) and the webhook handler (signature verification, state transitions). These are the highest-risk units.
- **diagnose** (`/diagnose`): If Paystack webhook signature verification is failing or Order state transitions are behaving unexpectedly, invoke this to debug methodically.

## Notes

- Paystack test credentials are available at [https://dashboard.paystack.com](https://dashboard.paystack.com) under your test environment.
- Paystack webhook docs: [https://paystack.com/docs/payments/webhooks](https://paystack.com/docs/payments/webhooks).
- Run `git status --short` before starting to see any uncommitted changes from Issue #05.
- The CONTEXT.md rule "Inventory is decremented only after an Order is paid" remains unchanged and must not be violated.
