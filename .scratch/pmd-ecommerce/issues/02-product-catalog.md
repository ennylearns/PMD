## Parent

[PRD.md](../PRD.md)

## What to build

Product catalog with variant-level inventory: database schema for products/categories/variants/inventory, API routes for CRUD operations, product listing page with category filtering, product detail page with color/size variant selection and real-time stock display.

## Acceptance criteria

- [x] Categories: T-Shirts, Joggers, New Drops with slug-based routing
- [x] Products: name, slug, description, price, images, category association
- [x] Variants: color + size combinations per product
- [x] VariantInventory: tracked per variant (color/size combo)
- [x] API: GET/POST/PUT/DELETE /api/products
- [x] API: GET/POST/PUT/DELETE /api/categories
- [x] API: GET/POST/PUT/DELETE /api/variants
- [x] Shop page: grid of products with category filter
- [x] Product detail: image gallery, variant selector (color swatches, size buttons), stock indicator

## Blocked by

- 01-foundation-setup

---

Status: done