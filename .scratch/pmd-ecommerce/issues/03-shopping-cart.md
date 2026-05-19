## Parent

[PRD.md](../PRD.md)

## What to build

Shopping cart functionality: cart API for managing items, cart page to view/update/remove items, session-based cart persistence, real-time stock validation when adding items.

## Acceptance criteria

- [x] API: POST /api/cart (add item with variantId, quantity)
- [x] API: GET /api/cart (list cart items)
- [x] API: PUT /api/cart/[itemId] (update quantity)
- [x] API: DELETE /api/cart/[itemId] (remove item)
- [x] Cart stored in cookies/localStorage for session persistence
- [x] Stock validation: prevent adding more than available
- [x] Cart page: product image, name, variant info, quantity controls, remove button, subtotal per item, cart total
- [x] "Continue Shopping" and "Checkout" buttons

## Blocked by

- 02-product-catalog

---

Status: done