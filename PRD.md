# PMD Streetwear E-commerce Website - PRD

## 1. Project Overview

**Project Name:** PMD (Pressure Makes Diamonds) E-commerce Website

**Project Type:** Full-featured e-commerce web application

**Core Functionality:** A fully functional online store for a streetwear brand, featuring product browsing, shopping cart, instant checkout with Paystack payments, owner-managed fulfillment, and a comprehensive admin dashboard.

**Target Users:**
- Customers: Streetwear enthusiasts who can relate to the "Pressure Makes Diamonds" brand story
- Admin: Store owner (Samuel Ayomide) managing products, orders, and inventory

---

## 2. Business Information

- **Business Name:** PRESSURE MAKES DIAMONDS-PMD
- **Business Description:** Clothing brand - streetwear focused on ambition, resilience, and self-belief
- **Business Email:** pmdwears@gmail.com
- **Admin Name:** Samuel Ayomide
- **Admin Phone:** 08061925420

---

## 3. Brand Identity

### Colors
- **Primary:** Black
- **Secondary:** White / Off-white
- **Accent:** Silver, Dark Grey, Red (occasionally)

### Typography
- Bold sans-serif fonts
- Gothic/streetwear-inspired typography

### Aesthetic
- Bold, dark, minimal, premium
- Clean layouts with large visuals/mockups
- Smooth animations and transitions
- Strong branding and typography
- Mobile-friendly design
- Fast and simple checkout

### References
- Corteiz, Hellstar, Broken Planet, Represent Clothing, Denim Tears

### Exclusions
- No overly colorful, playful, or cartoon-style designs
- No bright neon colors
- No childish layouts
- No cluttered pages
- No overly complicated designs

---

## 4. Functional Requirements

### 4.1 Product Management

- **Product Categories:** T-Shirts, Joggers, New Drops
- **Initial Products:** 50 tees + 20 joggers (70 total), with potential for more
- **Product Variants:** Each variant tracked separately (color + size combinations)
  - Example: Black-S, Black-M, Black-L, Black-XL, White-S, White-M, etc.
  - Each combination has independent inventory count
- **Product Attributes:** Sizes, Colors
- **Product Data:** Images, descriptions, pricing, stock per variant
- **Upload Methods:** Bulk CSV upload AND manual one-by-one in admin

### 4.2 Shopping Experience

- **Homepage:** Promotional video content (16:9 aspect ratio), featured products, brand story
- **Shop/Products Page:** Product grid with filtering by category
- **Product Detail Page:** Product images, description, size selection, color selection, add to cart
- **Shopping Cart:** View cart, update quantities, remove items
- **Checkout:** Guest checkout + Customer accounts (both supported)

### 4.3 Payment Integration

- **Provider:** Paystack (recommended)
- **Payment Methods:**
  - Card payments
  - USSD
  - Bank transfers
  - Virtual accounts
- **Flow:** Instant checkout - customer pays immediately on site
- **Automatic Confirmation:** Orders automatically show as "paid" after successful payment
- **Webhooks:** Handle payment verification callbacks

### 4.4 Delivery & Fulfillment

- **Provider:** Owner-managed fulfillment by PMD
- **Delivery Fee Calculation:** Based on customer location at checkout
- **Order Tracking:** Customer-visible order status updates managed by PMD
- **Order Processing:** 1-3 business days

### 4.5 Inventory Management

- **Automatic Stock Decrement:** Stock decreases automatically when order is placed
- **Manual Stock Addition:** Admin can manually add stock when needed
- **Variant Tracking:** Each color/size combination tracked independently

### 4.6 Coupon/Discount System

- **Discount Types:** Percentage and fixed amount
- **Expiry Dates:** Coupons have expiration dates
- **Management:** Create, edit, delete coupons in admin

### 4.7 Notifications

- **Email Notifications:**
  1. Order confirmation (sent to customer when payment completes)
  2. Order status updates (sent when order ships, with fulfillment reference when available)
  3. Order delivered notification
- **WhatsApp Integration:** Button redirects to WhatsApp chat with store owner

### 4.8 Customer Accounts

- **Registration/Login:** Customers can create accounts and log in
- **Features:**
  - View order history
  - Track orders
  - Save addresses

### 4.9 Analytics

- **Provider:** Posthog
- **Implementation:** JavaScript SDK integration
- **Features:** Page views, session recordings, funnels, product analytics

### 4.10 SEO

- **Meta Tags:** Title and description for all pages
- **Product Schema:** Structured data for Google Shopping
- **Sitemap:** Auto-generated for Google indexing

### 4.11 Admin Dashboard

**Features:**
- Manage orders (view, update status)
- Track sales
- Manage inventory (view stock, manual addition)
- Add/edit/delete products
- Manage coupons
- Manage delivery fees
- View reports/dashboards
- Update order status

---

## 5. Page Structure

1. **Homepage** - Brand introduction, promotional video, featured products
2. **Shop/Products Page** - Product listing with category filtering
3. **Product Detail Page** - Individual product with variant selection
4. **Cart** - Shopping cart management
5. **Checkout** - Payment and shipping details
6. **About Page** - Brand story, mission, vision
7. **Contact Page** - Contact information, WhatsApp integration
8. **FAQ Page** - Common questions and answers
9. **Terms of Service** - Legal terms
10. **Privacy Policy** - Privacy information

---

## 6. Technical Stack

- **Framework:** Next.js (App Router)
- **Frontend:** React with Tailwind CSS
- **Deployment:** Vercel
- **Database:** Vercel Postgres (PostgreSQL)
- **ORM:** Prisma or Drizzle
- **Payment:** Paystack API
- **Fulfillment:** Owner-managed delivery
- **Analytics:** Posthog
- **Authentication:** NextAuth.js (for customer accounts)
- **Image Storage:** Cloudinary or Vercel Blob

---

## 7. Content Provided by Client

- **Logo:** Uploaded (multiple versions available)
- **Product Images:** Provided
- **Website Text/Content:** Provided
- **Policies:** Privacy, refund, terms - provided
- **Brand Videos:** Provided (promotional videos in 16:9)
- **FAQ Content:** Delivery time, return policy, payment methods, sizing guide

---

## 8. Project Constraints

- **Timeline:** 2-3 weeks
- **Budget:** ₦200,000

---

## 9. Success Criteria

1. Look premium and visually strong for the PMD brand
2. Be fast, smooth and mobile-friendly
3. Make shopping and checkout easy for customers

---

## 10. Potential Disappointments (to avoid)

- Poor communication
- Slow loading speed
- Low-quality design execution
- Website that does not match the PMD brand aesthetic

---

## 11. Notes

- This is the client's first major website project
- PMD is a growing streetwear brand focused on strong branding, premium presentation and community building
- Client wants the website to feel modern, clean and unique while still being easy to manage and update in the future
