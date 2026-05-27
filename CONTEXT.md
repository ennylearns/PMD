# PMD E-commerce Context

Core domain language for the PMD streetwear e-commerce platform.

## Identity & Roles

**User**:
A person who can authenticate with the system. Has a role indicating their permissions.
_Avoid_: Account, member

**Customer**:
A specific role of a User (`Role.CUSTOMER`) who browses the catalog, manages their cart, and places orders.
_Avoid_: Buyer, shopper, client

**Admin**:
A specific role of a User (`Role.ADMIN`) who manages inventory, views orders, and updates site content.
_Avoid_: Staff, owner, employee

## Fulfillment & Checkout

**Checkout**:
The customer step where cart contents, contact details, Address, and delivery cost are confirmed before payment begins.
_Avoid_: Payment, order placement

**Delivery Contact**:
The person PMD can contact about a checkout or delivery, identified by name, phone, and email.
_Avoid_: Address, recipient

**Delivery Fee**:
The amount PMD charges to deliver an order to a specific destination under owner-managed fulfillment. It is determined by a default fee at the **Delivery State** level, which can optionally be overridden at the **Delivery City** level.
_Avoid_: Shipping fee, GIG rate, shipping provider fee

**Delivery State**:
A Nigerian State configured for owner-managed delivery, containing a default **Delivery Fee**.
_Avoid_: Region, province

**Delivery City**:
A specific city within a **Delivery State** that PMD currently accepts for owner-managed delivery. May optionally contain an override **Delivery Fee**.
_Avoid_: Free-text city, Supported City

**Fulfillment Origin**:
The Jos, Plateau State location where PMD starts owner-managed delivery from.
_Avoid_: Warehouse, logistics hub

**Address**:
A physical delivery location within Nigeria used for owner-managed fulfillment. Consists of a free-text street, a highly structured State, and a City. Country defaults to Nigeria and Zip Code is safely ignored/defaulted.
_Avoid_: Location, destination

## Relationships

- A **Checkout** confirms exactly one **Delivery Contact** and one **Address** before payment begins.
- A checkout **Delivery Contact** phone number is captured for that checkout and is not a saved profile field yet.
- A **Customer** can reuse a saved **Address** during **Checkout**, but can also enter a one-off **Address**.
- A **Customer** can optionally save a one-off checkout **Address** for future reuse.
- A **Delivery Fee** is determined by a **Delivery State** default, optionally overridden by a **Delivery City**.
- A checkout **Address** must use a configured **Delivery City**.
- An **Order** is created from a valid **Checkout** when payment initialization begins.
- Inventory is decremented only after an **Order** is paid.
- Cart items included in an **Order** are cleared only after successful payment.

## Order Lifecycle

An **Order** progresses through the following statuses, which also serve as the fulfillment status:
- **PENDING**: Payment initialized but not yet completed.
- **PAID**: Payment successful (via Paystack webhook). Stock is decremented and cart is cleared.
- **SHIPPED**: Order has left the Fulfillment Origin and is with the dispatcher. (Manual admin action)
- **DELIVERED**: Order has successfully reached the Customer. (Manual admin action)
- **CANCELLED**: Order was voided (e.g., oversell fallback, or manual cancellation).

## Flagged ambiguities

- The PRD and older issue text refer to GIG Logistics, but PMD will now use owner-managed fulfillment instead.
- Customer-facing checkout language should say "delivery"; "shipping" remains only where existing technical names already use it.
