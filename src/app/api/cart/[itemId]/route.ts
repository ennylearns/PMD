import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

// PUT /api/cart/[itemId] — Update cart item quantity
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "quantity (>= 1) is required" },
        { status: 400 }
      );
    }

    // Find the cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Check stock for the variant
    const variant = await prisma.variant.findUnique({
      where: { id: cartItem.variantId },
      include: { inventory: true },
    });

    const availableStock = variant?.inventory?.stock ?? 0;

    if (quantity > availableStock) {
      return NextResponse.json(
        {
          error: `Only ${availableStock} in stock`,
          availableStock,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
              },
            },
            inventory: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/[itemId] — Remove cart item
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { itemId } = await context.params;

    // Check item exists
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Failed to remove cart item:", error);
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 }
    );
  }
}
