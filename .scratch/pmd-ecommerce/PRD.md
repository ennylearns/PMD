# PMD Streetwear E-commerce Website - PRD

## Problem Statement

PMD (Pressure Makes Diamonds) is a growing streetwear brand that needs a fully functional e-commerce website to sell their clothing products online. The client wants a premium, dark-themed, minimal streetwear website that allows customers to browse products, select variants (color/size), add to cart, checkout with instant Paystack payment, and receive orders via GIG Logistics. The client also needs a comprehensive admin dashboard to manage products, orders, inventory, and sales.

Currently, PMD has no online store - they rely on social media (TikTok, Instagram) for sales. The website must look premium and visually strong to match the brand's ambition of becoming a globally recognized streetwear movement.

## Solution

A full-featured e-commerce website built with Next.js (App Router) deployed on Vercel, using Vercel Postgres for the database, Prisma as the ORM, Paystack for payment processing, GIG Logistics API for shipping and tracking, Posthog for analytics, and NextAuth.js for customer authentication. The solution includes:

- Customer-facing storefront with 11 pages (Homepage, Shop, Product Detail, Cart, Checkout, About, Contact, FAQ, Terms, Privacy, Order Tracking)
- Customer account system with registration/login, order history, and saved addresses
- Product catalog with variant-level inventory tracking (color + size combinations)
- Shopping cart with persistent session
- Instant checkout with Paystack payment (card, USSD, bank transfer, virtual account)
- GIG Logistics integration with location-based shipping calculation and API tracking
- Admin dashboard for managing orders, products, inventory, coupons, and sales analytics
- SEO optimization with meta tags, product schema, and auto-generated sitemap

## User Stories

### Product Management
1. As an admin, I want to add new products with images, descriptions, and pricing, so that customers can browse them on the store
2. As an admin, I want to create product variants (color + size combinations), so that customers can select their preferred options
3. As an admin, I want to set inventory levels for each variant, so that stock is accurately tracked
4. As an admin, I want to bulk upload products via CSV, so that I can quickly add large product catalogs
5. As an admin, I want to manually add products one-by-one, so that I can add new items easily
6. As an admin, I want to edit product details, so that I can update pricing, descriptions, and images
7. As an admin, I want to delete products, so that I can remove discontinued items
8. As an admin, I want to organize products into categories (T-Shirts, Joggers, New Drops), so that customers can filter by category
9. As an admin, I want to manage coupon codes with percentage and fixed discounts, so that I can run promotions

### Shopping Experience
10. As a customer, I want to browse products on the homepage, so that I can discover what's available
11. As a customer, I want to view products by category, so that I can find items I'm interested in
12. As a customer, I want to view detailed product information including images and description, so that I can make informed purchase decisions
13. As a customer, I want to select product color from available options, so that I can choose my preferred variant
14. As a customer, I want to select product size from available options, so that I can choose my fit
15. As a customer, I want to see real-time stock availability per variant, so that I know what's available
16. As a customer, I want to add products to shopping cart, so that I can purchase multiple items
17. As a customer, I want to view my shopping cart with all selected items, so that I can review my order
18. As a customer, I want to update quantities in cart, so that I can change order amounts
19. As a customer, I want to remove items from cart, so that I can adjust my order
20. As a customer, I want to see cart total with shipping calculated, so that I know the full cost

### Checkout & Payments
21. As a guest customer, I want to checkout without creating an account, so that I can purchase quickly
22. As a registered customer, I want to login to checkout, so that I can access saved information
23. As a customer, I want to enter shipping address, so that my order can be delivered
24. As a customer, I want shipping cost calculated based on my location, so that I know delivery charges
25. As a customer, I want to pay instantly via Paystack, so that I can complete purchase immediately
26. As a customer, I want to pay with card, USSD, bank transfer, or virtual account, so that I can use my preferred payment method
27. As a customer, I want to receive order confirmation via email, so that I know my order was received
28. As an admin, I want orders to automatically show as "paid" after successful payment, so that I don't need manual verification

### Shipping & Delivery
29. As a customer, I want to select GIG Logistics for delivery, so that my order is shipped via their service
30. As a customer, I want to receive shipping updates with tracking number, so that I can track my order
31. As a customer, I want to receive delivery notification when order arrives, so that I know when to expect it
32. As an admin, I want to integrate with GIG Logistics API for tracking, so that tracking information is accurate
33. As an admin, I want to process orders within 1-3 business days, so that fulfillment is timely

### Inventory Management
34. As an admin, I want inventory to automatically decrease when orders are placed, so that stock levels are accurate
35. As an admin, I want to manually add stock when needed, so that I can replenish inventory
36. As an admin, I want to view inventory levels per variant, so that I know what's in stock

### Customer Accounts
37. As a visitor, I want to create an account with email and password, so that I can shop faster next time
38. As a registered customer, I want to login to my account, so that I can access my profile
39. As a logged-in customer, I want to view my order history, so that I can see past purchases
40. As a logged-in customer, I want to track current orders, so that I know order status
41. As a logged-in customer, I want to save shipping addresses, so that I don't enter them every time

### Admin Dashboard
42. As an admin, I want to view all orders, so that I can manage customer orders
43. As an admin, I want to update order status (pending, shipped, delivered), so that customers receive updates
44. As an admin, I want to view sales analytics and reports, so that I can track business performance
45. As an admin, I want to manage product inventory from dashboard, so that I can track stock levels

### Marketing & Engagement
46. As a customer, I want to apply coupon codes at checkout, so that I can get discounts
47. As a customer, I want to contact store via WhatsApp, so that I can get support quickly
48. As an admin, I want to display promotional video on homepage, so that I can showcase brand content
49. As an admin, I want to include brand story on About page, so that customers understand the brand

### Analytics & SEO
50. As an admin, I want to track page views and visitor behavior via Posthog, so that I can understand customer patterns
51. As an admin, I want product schema for Google Shopping, so that products appear in search results
52. As an admin, I want auto-generated sitemap for Google indexing, so that pages are discoverable
53. As an admin, I want meta titles and descriptions for all pages, so that SEO is optimized

### Content & Policies
54. As a customer, I want to read FAQ about delivery, returns, and sizing, so that I can make informed decisions
55. As a customer, I want to read Terms of Service, so that I understand purchase terms
56. As a customer, I want to read Privacy Policy, so that I know how my data is handled
57. As a customer, I want to view size guide, so that I can choose the right fit

## Implementation Decisions

### Architecture
- **Framework:** Next.js 14+ with App Router
- **Frontend:** React with Tailwind CSS for styling
- **Database:** Vercel Postgres (PostgreSQL)
- **ORM:** Prisma
- **Authentication:** NextAuth.js for customer accounts
- **Deployment:** Vercel (Vercel Blob for image storage)

### Key Modules

**1. Product Module**
- Schema: Products, Categories, Variants, VariantInventory
- Product CRUD operations via API routes
- CSV bulk import functionality
- Variant-level inventory tracking

**2. Cart Module**
- Cart session stored in cookies/localStorage
- Cart items with variant ID, quantity
- Real-time stock validation at add-to-cart

**3. Checkout Module**
- Guest checkout + authenticated checkout flows
- Address collection with location-based shipping calculation
- Integration with GIG Logistics API for shipping rates

**4. Payment Module**
- Paystack integration with inline checkout
- Webhook handler for payment verification
- Automatic order confirmation on successful payment

**5. Order Module**
- Order creation with items, shipping info, payment status
- Order status workflow: pending → paid → shipped → delivered
- GIG Logistics tracking integration

**6. Customer Auth Module**
- Email/password registration and login
- Session management with NextAuth.js
- Order history access
- Saved addresses management

**7. Admin Module**
- Protected routes with admin authentication
- Product management (CRUD)
- Order management with status updates
- Inventory management with manual stock adjustment
- Coupon management
- Sales analytics dashboard

### Schema

```
User (id, email, password, name, phone, createdAt)
Address (id, userId, name, phone, state, city, address, isDefault)
Category (id, name, slug, description)
Product (id, name, slug, description, price, categoryId, images, createdAt)
Variant (id, productId, color, size, sku)
VariantInventory (id, variantId, quantity)
CartItem (sessionId, variantId, quantity)
Order (id, userId/guestEmail, status, totalAmount, shippingFee, shippingAddress, trackingNumber, gigOrderId, createdAt)
OrderItem (id, orderId, variantId, price, quantity)
Coupon (id, code, type, value, expiryDate, usageLimit, usedCount)
```

## Testing Decisions

### Test Strategy
- Focus on external behavior, not implementation details
- Use integration tests for critical user flows
- Unit tests for utility functions and business logic

### Modules to Test

**1. Cart Module**
- Add item to cart with variant validation
- Update quantity within stock limits
- Remove item from cart
- Cart total calculation

**2. Checkout Module**
- Guest checkout flow
- Authenticated checkout flow
- Shipping cost calculation
- Order creation with all required fields

**3. Payment Module**
- Paystack payment initialization
- Webhook payment verification
- Order status update on successful payment

**4. Inventory Module**
- Stock decrement on order placement
- Stock validation at checkout
- Manual stock addition by admin

**5. Coupon Module**
- Percentage discount calculation
- Fixed discount calculation
- Expiry date validation
- Usage limit validation

## Out of Scope

- Mobile app development
- Multi-vendor/marketplace functionality
- Subscription/repeat order features
- Loyalty program
- Blog or content marketing pages
- Advanced recommendation engine
- A/B testing beyond basic Posthog features
- Google Search Console setup (client to handle later)
- User-to-admin messaging system
- Product reviews/ratings system
- Wishlist functionality
- Multi-language support

## Further Notes

### Timeline & Budget
- **Timeline:** 2-3 weeks
- **Budget:** ₦200,000

### Client Provided Assets
- Logo (multiple versions)
- Product images for 70 products
- Brand videos (promotional, 16:9)
- Website text/content
- Policies (privacy, refund, terms)
- FAQ content (delivery, returns, payment, sizing)

### Brand Requirements
- Primary: Black, Secondary: White/Off-white, Accent: Silver/Dark Grey/Red
- Typography: Bold sans-serif + gothic/streetwear fonts
- Aesthetic: Bold, dark, minimal, premium streetwear
- Reference brands: Corteiz, Hellstar, Broken Planet, Represent Clothing, Denim Tears

### Success Criteria
1. Look premium and visually strong for the PMD brand
2. Be fast, smooth and mobile-friendly
3. Make shopping and checkout easy for customers

---

Status: superseded-by-issues