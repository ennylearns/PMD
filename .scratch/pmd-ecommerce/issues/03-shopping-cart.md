## Parent

[PRD.md](../PRD.md)

## What to build

Shopping cart functionality: cart API for managing items, cart page to view/update/remove items, session-based cart persistence, real-time stock validation when adding items.

## Acceptance criteria

- [ ] API: POST /api/cart (add item with variantId, quantity)
- [ ] API: GET /api/cart (list cart items)
- [ ] API: PUT /api/cart/[itemId] (update quantity)
- [ ] API: DELETE /api/cart/[itemId] (remove item)
- [ ] Cart stored in cookies/localStorage for session persistence
- [ ] Stock validation: prevent adding more than available
- [ ] Cart page: product image, name, variant info, quantity controls, remove button, subtotal per item, cart total
- [ ] "Continue Shopping" and "Checkout" buttons

## Blocked by

- 02-product-catalog

---

Status: needs-triage