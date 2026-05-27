## Parent

[08-order-management.md](08-order-management.md)

## What to build

Implement the email system using Resend and react-email to automatically email the customer when their order status changes to PAID, SHIPPED, or DELIVERED. The emails should have a premium dark-mode aesthetic matching the streetwear brand.

## Acceptance criteria

- [x] Email sent to customer upon order confirmation (PAID status triggered via Paystack webhook)
- [x] Email sent to customer when order status is changed to SHIPPED (triggered via admin API)
- [x] Email sent to customer when order status is changed to DELIVERED (triggered via admin API)
- [x] Email templates are responsive, styled with Tailwind, and include an order summary plus a "Track Your Order" CTA.
- [x] Recipient is determined by `order.guestEmail ?? order.user?.email`.
- [x] Email failures do not block the underlying order status transition ("fire, log, and forget").
- [x] Resend client wrapper is mocked in Vitest to prevent real network requests during integration tests.

## Blocked by

- 15-order-status-management

---

Status: done
