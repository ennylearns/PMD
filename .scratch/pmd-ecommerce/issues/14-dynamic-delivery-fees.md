## Parent

[07-owner-managed-fulfillment.md](07-owner-managed-fulfillment.md)
[09-admin-dashboard.md](09-admin-dashboard.md)

## What to build

Build the `DeliveryState` and `DeliveryCity` database schema, the Admin UI to view and update these fees, and update the customer checkout page to use this dynamic database instead of hardcoded values.

## Acceptance criteria

- [x] Prisma schema includes `DeliveryState` (default fee) and `DeliveryCity` (override fee)
- [x] Prisma seed migrates existing hardcoded states/cities into the DB
- [x] Admin dashboard page to list Delivery States and Cities
- [x] Admin can update a State's default fee and a City's override fee
- [x] Customer checkout calculates delivery fee using the database instead of hardcoded constants

## Blocked by

- 13-admin-auth-dashboard-layout

---

Status: done
