import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/payment/verify?reference=<paystackRef>
 *
 * Called by the callback page after Paystack redirects the customer back.
 * Returns the orderId so the client can redirect to the confirmation page.
 * The actual payment verification happens in the webhook — this just looks up
 * the order state to determine where to send the customer.
 */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { paymentReference: reference },
    select: { id: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ orderId: order.id, status: order.status });
}
