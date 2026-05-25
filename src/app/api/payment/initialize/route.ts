import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCartOwner } from "@/lib/cart-owner";
import { validateCartStock } from "@/lib/checkout";

const PAYSTACK_API = "https://api.paystack.co/transaction/initialize";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { contact, address, items: payloadItems, total, deliveryFee } = payload;

    // 1. Identify the cart owner
    const { userId, guestId } = await getCartOwner();

    // 2. Load current cart from DB to re-validate stock
    const where = userId ? { userId } : { guestId };
    const cartItems = await prisma.cartItem.findMany({
      where,
      include: {
        variant: {
          include: {
            inventory: true,
            product: { select: { price: true } },
          },
        },
      },
    });

    // 3. Re-validate stock — block if any item is unavailable
    const stockResult = validateCartStock(cartItems);
    if (!stockResult.valid) {
      return NextResponse.json(
        { error: stockResult.errors[0] ?? "Item out of stock" },
        { status: 409 }
      );
    }

    // 4. Create pending Order + OrderItems in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          ...(userId ? { userId } : {}),
          guestId: guestId ?? undefined,
          guestEmail: userId ? undefined : contact.email,
          status: "PENDING",
          totalAmount: total,
          shippingFee: deliveryFee,
          shippingAddress: address,
        },
      });

      await tx.orderItem.createMany({
        data: payloadItems.map(
          (item: { variantId: string; quantity: number; unitPrice: number }) => ({
            orderId: newOrder.id,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.unitPrice,
          })
        ),
      });

      return newOrder;
    });

    // 5. Call Paystack Initialize Transaction API
    const secret = process.env.PAYSTACK_SECRET_KEY ?? "";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const paystackRes = await fetch(PAYSTACK_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: contact.email,
        amount: Math.round(total * 100), // NGN → kobo
        callback_url: `${appUrl}/payment/callback`,
        metadata: { orderId: order.id },
      }),
    });

    if (!paystackRes.ok) {
      return NextResponse.json(
        { error: "Payment provider error. Please try again." },
        { status: 502 }
      );
    }

    const paystackData = await paystackRes.json();
    const { authorization_url: authorizationUrl, reference } = paystackData.data;

    // 6. Save the Paystack reference on the Order
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentReference: reference },
    });

    return NextResponse.json({ authorizationUrl });
  } catch (err) {
    console.error("Payment initialize error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
