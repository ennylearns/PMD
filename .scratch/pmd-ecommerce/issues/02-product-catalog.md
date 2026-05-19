## Parent

[PRD.md](../PRD.md)

## What to build

Product catalog with variant-level inventory: database schema for products/categories/variants/inventory, API routes for CRUD operations, product listing page with category filtering, product detail page with color/size variant selection and real-time stock display.

## Acceptance criteria

- [ ] Categories: T-Shirts, Joggers, New Drops with slug-based routing
- [ ] Products: name, slug, description, price, images, category association
- [ ] Variants: color + size combinations per product
- [ ] VariantInventory: tracked per variant (color/size combo)
- [ ] API: GET/POST/PUT/DELETE /api/products
- [ ] API: GET/POST/PUT/DELETE /api/categories
- [ ] API: GET/POST/PUT/DELETE /api/variants
- [ ] Shop page: grid of products with category filter
- [ ] Product detail: image gallery, variant selector (color swatches, size buttons), stock indicator

## Blocked by

- 01-foundation-setup

---

Status: needs-triage