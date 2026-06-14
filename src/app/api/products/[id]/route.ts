import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/products/:id - Get a single product (by id or slug)
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Try to find by slug first, then by id
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: id }, { id }],
      },
      include: {
        category: true,
        variants: {
          include: { inventory: true },
          orderBy: [{ color: "asc" }, { size: "asc" }],
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id - Update a product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, slug, price, categoryId, images, isFeatured } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(slug && { slug }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(categoryId && { categoryId }),
        ...(images && { images }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
      include: {
        category: true,
        variants: {
          include: { inventory: true },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error("Failed to update product:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/:id - Delete a product
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: unknown) {
    console.error("Failed to delete product:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error
    ) {
      const prismaError = error as { code: string };
      if (prismaError.code === "P2025") {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      if (prismaError.code === "P2003") {
        return NextResponse.json(
          { error: "Cannot delete this product because it is part of an existing order history. Consider archiving it or removing it from featured products instead." },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
