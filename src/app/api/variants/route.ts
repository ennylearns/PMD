import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/variants - List variants, optionally filtered by productId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const where = productId ? { productId } : {};

    const variants = await prisma.variant.findMany({
      where,
      include: {
        inventory: true,
        product: {
          select: { name: true, slug: true },
        },
      },
      orderBy: [{ color: "asc" }, { size: "asc" }],
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error("Failed to fetch variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}

// POST /api/variants - Create a new variant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, color, size, sku, stock } = body;

    if (!productId || !color || !size || !sku) {
      return NextResponse.json(
        { error: "productId, color, size, and sku are required" },
        { status: 400 }
      );
    }

    const variant = await prisma.variant.create({
      data: {
        productId,
        color,
        size,
        sku,
        inventory: {
          create: {
            stock: stock || 0,
          },
        },
      },
      include: {
        inventory: true,
        product: {
          select: { name: true, slug: true },
        },
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create variant:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A variant with this SKU or color/size combination already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 }
    );
  }
}
