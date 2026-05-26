import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { defaultFee } = body;

    if (typeof defaultFee !== "number" || defaultFee < 0) {
      return NextResponse.json(
        { error: "Default fee must be a non-negative number" },
        { status: 400 }
      );
    }

    const existing = await prisma.deliveryState.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    const state = await prisma.deliveryState.update({
      where: { id },
      data: { defaultFee },
    });

    return NextResponse.json({ state });
  } catch {
    return NextResponse.json(
      { error: "Failed to update delivery state" },
      { status: 500 }
    );
  }
}
