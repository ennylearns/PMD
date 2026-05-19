import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/variants/:id - Get a single variant
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const variant = await prisma.variant.findUnique({
      where: { id },
      include: {
        inventory: true,
        product: {
          select: { name: true, slug: true, price: true },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error("Failed to fetch variant:", error);
    return NextResponse.json(
      { error: "Failed to fetch variant" },
      { status: 500 }
    );
  }
}

// PUT /api/variants/:id - Update a variant (including stock)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { color, size, sku, stock } = body;

    const variant = await prisma.variant.update({
      where: { id },
      data: {
        ...(color && { color }),
        ...(size && { size }),
        ...(sku && { sku }),
        ...(stock !== undefined && {
          inventory: {
            upsert: {
              create: { stock },
              update: { stock },
            },
          },
        }),
      },
      include: {
        inventory: true,
        product: {
          select: { name: true, slug: true },
        },
      },
    });

    return NextResponse.json(variant);
  } catch (error: unknown) {
    console.error("Failed to update variant:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update variant" },
      { status: 500 }
    );
  }
}

// DELETE /api/variants/:id - Delete a variant
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.variant.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Variant deleted successfully" });
  } catch (error: unknown) {
    console.error("Failed to delete variant:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 }
    );
  }
}
