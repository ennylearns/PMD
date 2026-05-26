## Parent

[08-order-management.md](08-order-management.md)

## What to build

Implement the email system using Resend and react-email to automatically email the customer when their order status changes to PAID, SHIPPED, or DELIVERED. The emails should have a premium dark-mode aesthetic matching the streetwear brand.

## Acceptance criteria

- [ ] Email sent to customer upon order confirmation (PAID status triggered via Paystack webhook)
- [ ] Email sent to customer when order status is changed to SHIPPED (triggered via admin API)
- [ ] Email sent to customer when order status is changed to DELIVERED (triggered via admin API)
- [ ] Email templates are responsive, styled with Tailwind, and include an order summary plus a "Track Your Order" CTA.
- [ ] Recipient is determined by `order.guestEmail ?? order.user?.email`.
- [ ] Email failures do not block the underlying order status transition ("fire, log, and forget").
- [ ] Resend client wrapper is mocked in Vitest to prevent real network requests during integration tests.

## Blocked by

- 15-order-status-management

---

Status: ready-for-agent
