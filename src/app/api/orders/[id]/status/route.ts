import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const validStatuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    // Role validation will happen here in production
    
    const body = await request.json();
    const { status } = body;

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { id } = await params;

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    if (status === "SHIPPED" || status === "DELIVERED") {
      const populatedOrder = await prisma.order.findUnique({
        where: { id },
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
          await sendOrderNotification(populatedOrder as any, recipientEmail, status);
        }
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order status PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
