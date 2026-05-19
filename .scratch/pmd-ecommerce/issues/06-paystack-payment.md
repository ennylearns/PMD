## Parent

[PRD.md](../PRD.md)

## What to build

Paystack payment integration: initialize payment, inline checkout UI, webhook handler for payment verification, automatic order status update on successful payment.

## Acceptance criteria

- [ ] Paystack inline checkout integration
- [ ] Payment methods: card, USSD, bank transfer, virtual account
- [ ] API: POST /api/payment/initialize (create payment reference)
- [ ] API: POST /api/payment/webhook (handle Paystack callback)
- [ ] Automatic order confirmation on successful payment
- [ ] Order status changes from "pending" to "paid" automatically
- [ ] Payment failure handling with error display

## Blocked by

- 05-checkout-flow

---

Status: needs-triage