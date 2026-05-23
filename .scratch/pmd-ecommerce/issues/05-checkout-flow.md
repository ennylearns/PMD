## Parent

[PRD.md](../PRD.md)

## What to build

Checkout flow: guest checkout and authenticated checkout, address collection form, owner-managed delivery fee calculation from Jos, Plateau, and order summary display.

## Acceptance criteria

- [ ] Checkout page accessible via /checkout only when the cart has items
- [ ] Empty carts are blocked from checkout and redirected to /cart
- [ ] Guest checkout: collect email, name, phone, state, city, and street address
- [ ] Authenticated checkout: use User email/name from the database, collecting name only if missing
- [ ] Authenticated checkout: pre-filled from saved addresses
- [ ] State and city are selected from dropdowns, not entered as free text
- [ ] City dropdown is limited to an initial curated list of PMD-supported major cities/state capitals for the selected state
- [ ] Saved addresses with unsupported state/city cannot proceed until changed to a supported city
- [ ] Unsupported saved addresses are shown as unavailable rather than hidden
- [ ] Dashboard saved-address form uses the same supported State/City dropdown data as checkout
- [ ] Phone is required at checkout for both guests and authenticated Customers
- [ ] Phone is captured as checkout Delivery Contact data and is not saved to the User profile in this issue
- [ ] Authenticated checkout can optionally save a one-off checkout address for future reuse
- [ ] Delivery fee calculated based on delivery state using the current PMD delivery fee policy
- [ ] Delivery fee lookup uses a helper/source that can later be backed by admin-editable database settings and city-specific overrides
- [ ] Order summary: items, quantities, prices, subtotal, shipping, total
- [ ] Checkout prices, delivery fee, and total are formatted in NGN/naira
- [ ] Coupon entry/discounts are out of scope for this issue
- [ ] Checkout revalidates cart item stock and blocks payment preparation if items are unavailable or exceed stock
- [ ] "Proceed to Payment" button validates checkout details and prepares the payload needed by Paystack initialization
- [ ] Checkout payload stays in page state and is submitted directly to Issue #06's future `/api/payment/initialize` endpoint
- [ ] Paystack redirect is not implemented in this issue; Issue #06 owns payment initialization and redirect
- [ ] No database schema changes are required for this issue
- [ ] No dedicated checkout API endpoint is required unless implementation reveals a server-only validation need
- [ ] Delivery fee, supported city, form validation, and checkout payload preparation are implemented through reusable helpers
- [ ] Checkout UI follows the visual direction in `mockups/stitch_premium_streetwear_e_commerce_store/checkout/`
- [ ] Do not include a payment method selector; Paystack is the only payment method and Issue #06 owns the redirect
- [ ] Customer-facing UI uses "Delivery" language rather than "Shipping"

## Blocked by

- 03-shopping-cart
- 04-customer-auth

---

Status: needs-triage
