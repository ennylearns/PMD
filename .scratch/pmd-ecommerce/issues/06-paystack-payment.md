## Parent

[PRD.md](../PRD.md)

## What to build

Paystack payment integration: initialize payment from the validated checkout payload, redirect to Paystack test/production checkout, webhook handler for payment verification, automatic order status update on successful payment.

## Acceptance criteria

- [ ] Paystack inline checkout integration
- [ ] Payment methods: card, USSD, bank transfer, virtual account
- [ ] API: POST /api/payment/initialize (create payment reference)
- [ ] Payment initialization consumes the checkout payload prepared by Issue #05
- [ ] Payment initialization creates a pending Order before redirecting to Paystack
- [ ] Stock is rechecked before payment initialization; unavailable items block redirect
- [ ] Successful initialization redirects the customer to Paystack
- [ ] API: POST /api/payment/webhook (handle Paystack callback)
- [ ] Automatic order confirmation on successful payment
- [ ] Order status changes from "pending" to "paid" automatically
- [ ] Purchased cart items are cleared only after successful payment confirmation
- [ ] Payment failure handling with error display

## Blocked by

- 05-checkout-flow

---

Status: needs-triage
