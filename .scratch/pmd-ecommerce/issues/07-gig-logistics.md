## Parent

[PRD.md](../PRD.md)

## What to build

GIG Logistics integration: shipping rate calculation via API, order creation with GIG, tracking number retrieval and display.

## Acceptance criteria

- [ ] API: GET /api/shipping/rates (calculate shipping based on location)
- [ ] API: POST /api/shipping/create-order (create GIG shipment)
- [ ] Shipping rate calculation based on delivery state/city
- [ ] Order creation triggers GIG logistics order
- [ ] Tracking number stored with order
- [ ] Display shipping provider and tracking info to customer

## Blocked by

- 06-paystack-payment

---

Status: needs-triage