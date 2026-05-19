## Parent

[PRD.md](../PRD.md)

## What to build

Coupon/discount system: create/edit/delete coupons, percentage and fixed amount discounts, expiry date validation, usage limit enforcement, application at checkout.

## Acceptance criteria

- [ ] API: POST /api/coupons (create coupon)
- [ ] API: GET /api/coupons (list coupons)
- [ ] API: PUT /api/coupons/[id] (update coupon)
- [ ] API: DELETE /api/coupons/[id] (delete coupon)
- [ ] Coupon types: percentage (%) and fixed amount (₦)
- [ ] Expiry date validation at checkout
- [ ] Usage limit enforcement (if set)
- [ ] Apply coupon at checkout with validation
- [ ] Display discount in order summary

## Blocked by

- 06-paystack-payment

---

Status: needs-triage