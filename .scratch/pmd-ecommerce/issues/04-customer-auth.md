## Parent

[PRD.md](../PRD.md)

## What to build

Customer authentication system: NextAuth.js setup with email/password credentials, registration page, login page, session management, user profile, saved addresses management.

## Acceptance criteria

- [ ] Auth.js (NextAuth v5) configured with credentials provider (JWT sessions)
- [ ] User registration: email, password, name (with "Confirm Email" UI field, register-and-go flow)
- [ ] User login with email/password using `bcryptjs`
- [ ] Cart merge logic: Transfer `guestId` cart items to `userId` on login/registration
- [ ] Protected routes: Middleware-based protection for `/dashboard`, `/orders` (leaving `/checkout` public)
- [ ] User dashboard: view profile, order history, saved addresses
- [ ] Address management: add, edit, delete shipping addresses (ZipCode optional, Country defaulted to "NG" in DB; ZipCode hidden, Country read-only in UI)
- [ ] Provider nesting: `<SessionProvider>` wrapping `<CartProvider>`

## Blocked by

- 01-foundation-setup

---

Status: ready-for-agent