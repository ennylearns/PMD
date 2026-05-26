import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { overrideFee } = body;

    // overrideFee can be null (to clear) or a non-negative number
    if (overrideFee !== null && (typeof overrideFee !== "number" || overrideFee < 0)) {
      return NextResponse.json(
        { error: "Override fee must be null or a non-negative number" },
        { status: 400 }
      );
    }

    const existing = await prisma.deliveryCity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    const city = await prisma.deliveryCity.update({
      where: { id },
      data: { overrideFee },
    });

    return NextResponse.json({ city });
  } catch {
    return NextResponse.json(
      { error: "Failed to update delivery city" },
      { status: 500 }
    );
  }
}
