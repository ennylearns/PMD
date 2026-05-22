# Handoff: PMD E-commerce — Issue #05 Checkout Flow
## Objective
Start and implement **Issue #05: Checkout Flow** for the PMD streetwear e-commerce platform.
## Project Context
**PMD (Pressure Makes Diamonds)** is a Nigerian streetwear brand e-commerce site.
- **Stack:** Next.js 16 (App Router), Tailwind CSS v4, Prisma 7, Vitest, NextAuth v5.
- **Issue tracker:** `.scratch/pmd-ecommerce/issues/`
- **Domain Docs:** `CONTEXT.md` at repo root.
- **PRD:** `.scratch/pmd-ecommerce/PRD.md`
## Current State
- **Issue #04 (Customer Auth)** is fully completed and verified. NextAuth v5 is successfully set up with a dedicated Edge-compatible `auth.config.ts` for the middleware and a Node-compatible `auth.ts` for the rest of the application.
- **Issue #03 (Shopping Cart)** is also complete. Cart state is managed globally and merges correctly from `guestId` to `userId` upon login/registration.
- **Tests:** The test suite is green with 74/74 Vitest integration tests passing.
## What to Focus on Next
Your goal is to tackle the implementation of **Issue #05** (`.scratch/pmd-ecommerce/issues/05-checkout-flow.md`). 
Key requirements to build:
1. **Checkout Page (`/checkout`)**: Must remain accessible to both guests and authenticated users.
2. **Address Collection**:
   - For guests: Collect email, name, phone, state, city, and address.
   - For authenticated users: Pre-fill from their saved addresses (implemented in Issue #04).
3. **Shipping Cost Calculation**: Implement logic to calculate shipping costs dynamically based on the selected delivery state.
4. **Order Summary**: Display cart items, quantities, unit prices, subtotal, shipping cost, and final total.
5. **Action**: Include a "Proceed to Payment" button (payment integration is likely a subsequent issue, check the PRD/issue tracker).
## Suggested Skills
- **tdd**: Use the vertical slice Test-Driven Development loop (`/tdd`) to implement the checkout API and state logic incrementally.
- **prototype**: Use `/prototype` if you need to quickly explore different UI layouts for the checkout form or order summary before committing to the final Next.js page structure.
