# Handoff: Admin Product Catalog (Issue 17)

## Context & Recent Work
In the previous session, we successfully resolved a major data consistency bug in the order status lifecycle. We completely purged the `PROCESSING` state from the application domain, including removing it from the `OrderStatus` Prisma enum and migrating the database. We also locked down the API (`src/app/api/orders/[id]/status/route.ts`) and Admin UI (`src/app/admin/(dashboard)/orders/page.tsx`) so admins can strictly only trigger manual fulfillment statuses (`SHIPPED`, `DELIVERED`, `CANCELLED`). Automated statuses like `PENDING` and `PAID` are now strictly handled by the system and webhooks. All integration tests are passing.

*Note: The user attempted to log in to the Paystack CLI for local webhook forwarding, but it failed during the MFA step. The webhooks will continue to fail to reach `localhost:3000` until a tunnel (like ngrok or the CLI) is properly authenticated and running.*

## The Goal for the Next Session
Your immediate focus is to tackle **Issue 17: Admin Product Catalog** located at:
`[17-admin-product-catalog.md](file:///c:/Users/HP/Desktop/Jobs/PMD/.scratch/pmd-ecommerce/issues/17-admin-product-catalog.md)`

### Requirements to Build:
1. **Admin Product List**: A view to list all products with search and filtering.
2. **Product Management**: Ability for the admin to create, edit, and delete individual products.
3. **Variant Management**: Ability to manage variants (color, size, SKU, stock) for products.
4. **Bulk CSV Import**: An upload feature to bulk import products via CSV.

## Blockers Cleared
The prerequisites (`13-admin-auth-dashboard-layout` and `02-product-catalog`) are already completed. The underlying product and variant API schemas likely exist, but you will be responsible for tying them into the Admin dashboard UI and potentially adding the CSV parsing logic on the backend.

## Suggested Skills to Invoke
- `@[/tdd]` - Essential for building the CSV upload logic and product management forms. Make sure to write a failing API integration test before implementing the CSV parsing.
- `@[/prototype]` - Highly recommended to prototype the Bulk CSV Import UI and Variant management form first, as these are typically complex interfaces.
- `@[/diagnose]` - Use this if you run into any Prisma or API validation errors during the complex relational updates (Products -> Variants -> Inventory).

## Where to Start
1. Review the existing product and variant API routes in `src/app/api/products` and `src/app/api/variants`.
2. Inspect the admin layout structure in `src/app/admin/(dashboard)`.
3. Propose an implementation plan for the Product Listing UI and the CSV Bulk Import logic.
