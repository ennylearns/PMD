import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackSignature } from "@/lib/payment";

const PAYSTACK_REFUND_API = "https://api.paystack.co/refund";

export async function POST(req: NextRequest) {
  // 1. Read raw body — must not parse first (HMAC is over the raw bytes)
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";

  // 2. Verify signature
  if (!verifyPaystackSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. Parse event
  let event: { event: string; data: { reference: string; amount: number } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // 4. Acknowledge everything that isn't charge.success — return 200 so Paystack stops retrying
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const { reference, amount } = event.data;

  // 5. Look up the Order by paymentReference
  const order = await prisma.order.findUnique({
    where: { paymentReference: reference },
  });

  if (!order) {
    // Unknown reference — acknowledge to stop Paystack retrying
    return NextResponse.json({ received: true });
  }

  // 6. Load OrderItems
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  });

  // 7. Happy path: decrement inventory, mark PAID, clear cart
  try {
    await prisma.$transaction(async (tx) => {
      // Decrement each variant's stock
      for (const item of orderItems) {
        await tx.variantInventory.update({
          where: { variantId: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Mark order as PAID
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID", paymentStatus: "PAID" },
      });

      // Clear the customer's active cart
      const cartWhere = order.userId
        ? { userId: order.userId }
        : order.guestId
        ? { guestId: order.guestId }
        : undefined;

      if (cartWhere) {
        await tx.cartItem.deleteMany({ where: cartWhere });
      }

      // Increment coupon usage if applied
      if (order.couponCode) {
        await tx.coupon.update({
          where: { code: order.couponCode },
          data: { usageCount: { increment: 1 } },
        });
      }
    });

    // 8. Send Order Notification
    const populatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        user: { select: { email: true } },
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true, images: true } } },
            },
          },
        },
      },
    });

    if (populatedOrder) {
      const recipientEmail = populatedOrder.guestEmail ?? populatedOrder.user?.email;
      if (recipientEmail) {
        const { sendOrderNotification } = await import("@/lib/email");
        await sendOrderNotification(populatedOrder as any, recipientEmail, "PAID");
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    // 8. Oversell path: transaction failed (stock went to 0) — issue a refund and cancel
    try {
      await fetch(PAYSTACK_REFUND_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction: reference,
          amount, // refund full amount in kobo
        }),
      });
    } catch (refundErr) {
      console.error("Paystack refund failed:", refundErr);
    }

    // Mark order as CANCELLED regardless of refund outcome
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", paymentStatus: "REFUND_ISSUED" },
    });

    return NextResponse.json({ received: true });
  }
}
