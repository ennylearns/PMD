import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/addresses — List addresses for authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST /api/addresses — Create a new address
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { street, city, state, country, zipCode, isDefault } = body;

    // Validate required fields
    if (!street || !city || !state) {
      return NextResponse.json(
        { error: "Street, city, and state are required" },
        { status: 400 }
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

      return tx.address.create({
        data: {
          userId,
          street,
          city,
          state,
          country: country || "NG",
          zipCode: zipCode || null,
          isDefault: isDefault ?? false,
        },
      });
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error("Failed to create address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
