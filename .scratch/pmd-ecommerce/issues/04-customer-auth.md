## Parent

[PRD.md](../PRD.md)

## What to build

Customer authentication system: NextAuth.js setup with email/password credentials, registration page, login page, session management, user profile, saved addresses management.

## Acceptance criteria

- [x] Auth.js (NextAuth v5) configured with credentials provider (JWT sessions)
- [x] User registration: email, password, name (with "Confirm Email" UI field, register-and-go flow)
- [x] User login with email/password using `bcryptjs`
- [x] Cart merge logic: Transfer `guestId` cart items to `userId` on login/registration
- [x] Protected routes: Middleware-based protection for `/dashboard`, `/orders` (leaving `/checkout` public)
- [x] User dashboard: view profile, order history, saved addresses
- [x] Address management: add, edit, delete shipping addresses (ZipCode optional, Country defaulted to "NG" in DB; ZipCode hidden, Country read-only in UI)
- [x] Provider nesting: `<SessionProvider>` wrapping `<CartProvider>`

## Blocked by

- 01-foundation-setup

---

Status: done