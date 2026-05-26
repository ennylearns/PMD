## Parent

[08-order-management.md](08-order-management.md)
[07-owner-managed-fulfillment.md](07-owner-managed-fulfillment.md)

## What to build

Build the Admin UI to list all orders and change their status (`PROCESSING` → `SHIPPED` → `DELIVERED`). Build the Customer UI on the order details page to show a visual tracker of this status.

## Acceptance criteria

- [ ] Admin orders page lists all orders with filtering by status
- [ ] Admin can change an order's status (using the `OrderStatus` enum)
- [ ] Customer order tracking page displays a visual progression of the order's status
- [ ] No 3rd-party tracking numbers or external logistics integrations are used

## Blocked by

- 13-admin-auth-dashboard-layout
- 06-paystack-payment

---

Status: ready-for-agent
