## Parent

[PRD.md](../PRD.md)

## What to build

Order management and notifications: order status workflow, inventory decrement, email notifications for order confirmation, shipping updates, and delivery.

## Acceptance criteria

- [ ] Order statuses: pending → paid → shipped → delivered
- [ ] Inventory automatically decrements when order is placed
- [ ] API: PUT /api/orders/[id]/status (admin updates status)
- [ ] Email: order confirmation sent to customer
- [ ] Email: shipping notification with tracking number
- [ ] Email: delivery notification
- [ ] Customer order tracking page

## Blocked by

- 06-paystack-payment
- 07-gig-logistics

---

Status: needs-triage