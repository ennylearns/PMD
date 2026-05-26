## Parent

[PRD.md](../PRD.md)

## What to build

Paystack payment integration: initialize payment from the validated checkout payload, redirect to Paystack test/production checkout, webhook handler for payment verification, automatic order status update on successful payment.

## Acceptance criteria

- [x] Paystack inline checkout integration
- [x] Payment methods: card, USSD, bank transfer, virtual account
- [x] API: POST /api/payment/initialize (create payment reference)
- [x] Payment initialization consumes the checkout payload prepared by Issue #05
- [x] Payment initialization creates a pending Order before redirecting to Paystack
- [x] Stock is rechecked before payment initialization; unavailable items block redirect
- [x] Successful initialization redirects the customer to Paystack
- [x] API: POST /api/payment/webhook (handle Paystack callback)
- [x] Automatic order confirmation on successful payment
- [x] Order status changes from "pending" to "paid" automatically
- [x] Purchased cart items are cleared only after successful payment confirmation
- [x] Payment failure handling with error display

## Resolved design decisions

Do not reopen these unless the user explicitly asks.

### Stock reservation vs. oversell-and-refund

We will **not** reserve stock when a pending Order is created. Stock is decremented only after the Paystack webhook confirms a `charge.success` event. If two Customers both pay for the last unit, the webhook re-validates stock and issues a Paystack refund for the oversold quantity. See `docs/adr/0001-oversell-and-refund-over-stock-reservation.md`.

### Linking Paystack transactions to Orders

Add a `paymentReference` (unique, nullable string) field to the Prisma `Order` model. `POST /api/payment/initialize` generates or receives the Paystack reference and saves it to the Order. The webhook uses this field to look up the Order via `prisma.order.findUnique({ where: { paymentReference } })`. Additionally, pass the internal `order.id` in the Paystack `metadata` object as a backup.

### Cart clearing on payment success

At payment initialization, cart items are snapshotted into immutable `OrderItem` records linked to the pending Order. When the webhook marks the Order as paid, it uses the `userId` or `guestId` on the Order to delete all items in that customer's active cart.

### Abandoned pending Orders

Pending Orders where the customer closes the Paystack tab without paying are left in the database as `PENDING`. They do not block other buyers (no stock is reserved) and serve as a useful abandoned-checkout log. No cron-based cleanup is implemented for this issue.

## Blocked by

- 05-checkout-flow

---

Status: done
