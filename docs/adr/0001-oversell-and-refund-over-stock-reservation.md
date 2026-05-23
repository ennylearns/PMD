# ADR 0001: Oversell-and-Refund over Cron-Based Stock Reservation

## Status

Accepted

## Context

When a Customer clicks "Proceed to Payment", we create a pending Order and redirect them to Paystack. The Customer is off-site for a variable amount of time (typically 30 seconds to a few minutes). During this window, the same product could sell out to another Customer who also initialises payment and completes it first.

Two strategies were considered:

1. **Stock Reservation (cron-based):** Decrement stock when the pending Order is created. Run a scheduled job to release reserved stock if the Paystack session expires and the Order is never confirmed.
2. **Oversell-and-Refund (webhook-based):** Leave stock untouched at initialization. Recheck stock in the webhook handler when Paystack confirms payment. If an item can no longer be fulfilled, trigger a Paystack refund for the oversold quantity.

## Decision

We will use **Oversell-and-Refund**.

## Reasons

- **No cron infrastructure needed.** Next.js on a serverless host (Vercel) cannot run persistent background processes. A cron job would require an external trigger (Vercel Cron, Upstash QStash, etc.) and a separate expiry/release API route, adding non-trivial infrastructure and operational complexity for a low-volume store.
- **Inventory source-of-truth stays clean.** Stock numbers in the database always reflect what is truly available for purchase, not what is available minus soft-reserved quantities that may never convert.
- **PMD's inventory risk is low.** PMD is a small-batch streetwear brand. The probability of two Customers simultaneously initialising payment for the exact last unit of any item is low enough that a refund flow is an acceptable edge-case handler rather than a core path.

## Trade-offs Accepted

- In an extreme race condition, two Customers could both receive Paystack payment confirmation for the same last item. One would subsequently receive an automatic refund. This is a degraded but recoverable experience.
- The refund path must be implemented in the webhook handler; it cannot be deferred to a later issue.

## Consequences

- `POST /api/payment/webhook` must re-validate stock for each `OrderItem` after a `charge.success` event.
- If any item is oversold, the handler issues a partial or full Paystack refund and marks the Order accordingly.
- `CONTEXT.md` rule "Inventory is decremented only after an Order is paid" remains unchanged.
