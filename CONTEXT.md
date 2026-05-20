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

**Address**:
A physical delivery location within Nigeria used for GIG Logistics integration. Consists of a free-text street, a highly structured State, and a City. Country defaults to Nigeria and Zip Code is safely ignored/defaulted.
_Avoid_: Location, destination
