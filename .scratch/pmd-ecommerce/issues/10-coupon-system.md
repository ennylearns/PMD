## Parent

[PRD.md](../PRD.md)

## What to build

Coupon/discount system: create/edit/delete coupons, percentage and fixed amount discounts, expiry date validation, usage limit enforcement, application at checkout.

## Acceptance criteria

- [x] API: POST /api/coupons (create coupon)
- [x] API: GET /api/coupons (list coupons)
- [x] API: PUT /api/coupons/[id] (update coupon)
- [x] API: DELETE /api/coupons/[id] (delete coupon)
- [x] Coupon types: percentage (%) and fixed amount (₦)
- [x] Expiry date validation at checkout
- [x] Usage limit enforcement (if set)
- [x] Apply coupon at checkout with validation
- [x] Display discount in order summary

## Blocked by

- 06-paystack-payment

---

Status: needs-triage