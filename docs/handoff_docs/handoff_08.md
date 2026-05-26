# PMD E-commerce Session Handoff: Paystack Payment → Owner-Managed Fulfillment

## 1. Context & Completed Work (Issue #06)
We successfully completed **Issue #06: Paystack Payment Integration** using strict TDD vertical slices. All tests are verified and passing (**95/95 green**).

### Completed Features & Files
*   **Database Schema**: Updated `prisma/schema.prisma` with `paymentReference` (unique, nullable), `guestEmail`, `guestId`, `shippingAddress` (Json), and added `PAID` to `OrderStatus`.
*   **Database Sync & Seed**: Run `npx prisma db push --accept-data-loss` and `npm run db:seed` to repopulate baseline products, variants, and categories after Postgres drops.
*   **Backend Payment APIs**:
    *   `src/lib/payment.ts` / `.test.ts`: Pure HMAC-SHA512 verification for Paystack callbacks.
    *   `src/app/api/payment/initialize/route.ts` / `.test.ts`: Creates a `PENDING` order, checks active stock, requests Paystack checkout session, and returns `authorizationUrl`.
    *   `src/app/api/payment/webhook/route.ts` / `.test.ts`: Signature-verified listener. Decrements stock, sets `PAID`, and clears cart. Triggers **Oversell Fallback** (Paystack Refund API call + marks order `CANCELLED`) if stock exhaustion is hit during processing.
    *   `src/app/api/payment/verify/route.ts`: Light endpoint to map a Paystack reference to an internal Order ID.
*   **Frontend Interfaces**:
    *   `src/app/checkout/page.tsx`: Redirects users directly to Paystack's hosted page.
    *   `src/app/payment/callback/page.tsx`: A waiting page that polls verification API and redirects to order confirmation.
    *   `src/app/order/[id]/page.tsx`: Confirmation view detailing purchased items, totals, delivery address, and order badge status.

---

## 2. Next Session Focus: Issue #07 (Owner-Managed Fulfillment)
The objective of the next session is to implement **Issue #07: Owner-Managed Fulfillment**. PMD uses its own manual Plateau-based delivery fee calculations and self-fulfillment workflows rather than third-party logistics APIs.

### Scope & Goals
1.  **Fulfillment Fee Policy**: Deliveries are priced based on the destination state/city relative to Jos, Plateau. Set up a default curated list of major cities/state capitals with Plateau.
2.  **Admin Manageability**: Admin should be able to view and override delivery fees for states/cities from the admin dashboard.
3.  **Fulfillment Reference & Status**:
    *   Admin dashboard tools to input manual fulfillment/waybill reference numbers.
    *   Admin dashboard actions to update order shipping status (`PROCESSING` → `SHIPPED` → `DELIVERED`).
4.  **Customer Tracking**: Update the customer-facing order detail page (`src/app/order/[id]/page.tsx`) to show waybill details and live tracking badges (`OrderStatus`).

---

## 3. Recommended Skills & Actions for the Next Agent

The following skills are recommended for the next agent:
- **`tdd`**: Run test-driven iterations for building the Plateau fee engine and status update APIs.
- **`improve-codebase-architecture`**: Deepen delivery models in `src/lib/delivery.ts` and consolidate the admin status actions.
- **`view_file`**: Read `src/lib/delivery.ts` and `src/app/order/[id]/page.tsx` first.

### Key References
*   PRD: [.scratch/pmd-ecommerce/PRD.md](../../.scratch/pmd-ecommerce/PRD.md)
*   Issue #07 Ticket: [.scratch/pmd-ecommerce/issues/07-owner-managed-fulfillment.md](../../.scratch/pmd-ecommerce/issues/07-owner-managed-fulfillment.md)
*   ADR 0001 (Oversell-and-refund): [docs/adr/0001-oversell-and-refund-over-stock-reservation.md](../../docs/adr/0001-oversell-and-refund-over-stock-reservation.md)
