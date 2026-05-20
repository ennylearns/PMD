import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCartOwner } from "@/lib/cart-owner";
import { setGuestIdCookie } from "@/lib/guest-id";

// GET /api/cart — List cart items for current guest/user
export async function GET() {
  try {
    const { userId, guestId, isNew } = await getCartOwner();

    const whereClause = userId ? { userId } : { guestId };

    const items = await prisma.cartItem.findMany({
      where: whereClause,
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
      orderBy: { createdAt: "desc" },
    });

    const response = NextResponse.json({ items });
    if (isNew && guestId) setGuestIdCookie(response, guestId);
    return response;
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST /api/cart — Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, quantity } = body;

    // Validate required fields
    if (!variantId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "variantId and quantity (>= 1) are required" },
        { status: 400 }
      );
    }

    // Check variant exists and has stock
    const variant = await prisma.variant.findUnique({
      where: { id: variantId },
      include: { inventory: true },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    const availableStock = variant.inventory?.stock ?? 0;

    // Get cart owner
    const { userId, guestId, isNew } = await getCartOwner();

    const ownerClause = userId
      ? { userId, variantId }
      : { guestId, variantId };

    // Check if this variant is already in the cart
    const existingItem = await prisma.cartItem.findFirst({
      where: ownerClause,
    });

    const currentQty = existingItem?.quantity ?? 0;
    const newTotalQty = currentQty + quantity;

    // Stock validation: total quantity can't exceed available stock
    if (newTotalQty > availableStock) {
      return NextResponse.json(
        {
          error: `Only ${availableStock} in stock${currentQty > 0 ? ` (${currentQty} already in cart)` : ""}`,
          availableStock,
          currentCartQty: currentQty,
        },
        { status: 400 }
      );
    }

    const ownerData = userId ? { userId } : { guestId };

    let cartItem;

    if (existingItem) {
      // Upsert: increment quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newTotalQty },
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

      const response = NextResponse.json(cartItem, { status: 200 });
      if (isNew && guestId) setGuestIdCookie(response, guestId);
      return response;
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          ...ownerData,
          variantId,
          quantity,
        },
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

      const response = NextResponse.json(cartItem, { status: 201 });
      if (isNew && guestId) setGuestIdCookie(response, guestId);
      return response;
    }
  } catch (error) {
    console.error("Failed to add to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}
