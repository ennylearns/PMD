import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PUT /api/addresses/[id] — Update an address
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { street, city, state, country, zipCode, isDefault } = body;

    // Verify address belongs to user
    const existing = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    const userId = session.user.id;

    const address = await prisma.$transaction(async (tx: typeof prisma) => {
      // If setting as default, un-default existing addresses
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          ...(street !== undefined && { street }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(country !== undefined && { country }),
          ...(zipCode !== undefined && { zipCode }),
          ...(isDefault !== undefined && { isDefault }),
        },
      });
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Failed to update address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses/[id] — Delete an address
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Verify address belongs to user
    const existing = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ message: "Address deleted" });
  } catch (error) {
    console.error("Failed to delete address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
