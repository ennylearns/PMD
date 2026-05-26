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

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order status PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
