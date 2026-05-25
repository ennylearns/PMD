import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CheckCircle, Clock, Package, Truck } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { select: { name: true, images: true, price: true } },
            },
          },
        },
      },
    },
  });
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    PAID: {
      icon: <CheckCircle className="w-5 h-5" />,
      label: "Payment confirmed",
      color: "text-emerald-400",
    },
    PENDING: {
      icon: <Clock className="w-5 h-5" />,
      label: "Awaiting payment confirmation",
      color: "text-yellow-400",
    },
    PROCESSING: {
      icon: <Package className="w-5 h-5" />,
      label: "Order is being processed",
      color: "text-blue-400",
    },
    SHIPPED: {
      icon: <Truck className="w-5 h-5" />,
      label: "Order shipped",
      color: "text-purple-400",
    },
    DELIVERED: {
      icon: <CheckCircle className="w-5 h-5" />,
      label: "Delivered",
      color: "text-emerald-400",
    },
    CANCELLED: {
      icon: <Clock className="w-5 h-5" />,
      label: "Order cancelled",
      color: "text-error",
    },
  };

  const { icon, label, color } = config[status] ?? config.PENDING;

  return (
    <div className={`flex items-center gap-2 font-accent-label text-xs uppercase tracking-[0.18em] ${color}`}>
      {icon}
      {label}
    </div>
  );
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  const shippingAddress = order.shippingAddress as {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  } | null;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-surface-container-highest bg-surface-container-lowest/95 backdrop-blur px-6 md:px-16 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-headline-lg-mobile text-headline-lg-mobile font-black text-error italic tracking-normal"
          >
            PMD
          </Link>
          <Link
            href="/shop"
            className="font-accent-label text-xs uppercase tracking-[0.18em] text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-16 py-12 md:py-20 space-y-12">
        {/* Status */}
        <section className="space-y-4">
          <StatusBadge status={order.status} />
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
            {order.status === "PAID" ? "Order confirmed" : "Order placed"}
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant">
            Order reference:{" "}
            <span className="text-on-surface font-mono text-xs">{order.id}</span>
          </p>
        </section>

        {/* Items */}
        <section className="space-y-4">
          <h2 className="font-accent-label text-xs uppercase tracking-[0.2em] text-on-surface-variant border-b border-surface-container-highest pb-4">
            Items ordered
          </h2>
          <div className="space-y-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-24 bg-surface-container shrink-0 overflow-hidden">
                  {item.variant.product.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.variant.product.images[0]}
                      alt={item.variant.product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-headline-lg text-sm text-on-surface uppercase tracking-normal">
                    {item.variant.product.name}
                  </p>
                  <p className="mt-1 font-body-sm text-sm text-on-surface-variant">
                    {item.variant.size} / {item.variant.color}
                  </p>
                  <div className="mt-4 flex justify-between font-accent-label text-xs uppercase tracking-[0.14em] text-on-surface">
                    <span>Qty: {item.quantity}</span>
                    <span>{formatNaira(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Totals + Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section className="space-y-4">
            <h2 className="font-accent-label text-xs uppercase tracking-[0.2em] text-on-surface-variant border-b border-surface-container-highest pb-4">
              Payment summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between font-body-sm text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span className="text-on-surface">{formatNaira(order.totalAmount - order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-body-sm text-sm text-on-surface-variant">
                <span>Delivery fee</span>
                <span className="text-on-surface">{formatNaira(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-headline-lg text-base text-error pt-4 border-t border-surface-container-highest">
                <span>Total</span>
                <span>{formatNaira(order.totalAmount)}</span>
              </div>
            </div>
          </section>

          {shippingAddress && (
            <section className="space-y-4">
              <h2 className="font-accent-label text-xs uppercase tracking-[0.2em] text-on-surface-variant border-b border-surface-container-highest pb-4">
                Delivery address
              </h2>
              <div className="font-body-sm text-sm text-on-surface-variant space-y-1">
                {shippingAddress.street && <p>{shippingAddress.street}</p>}
                {shippingAddress.city && shippingAddress.state && (
                  <p>{shippingAddress.city}, {shippingAddress.state}</p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* CTA */}
        <div className="pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#f5f5f5] text-[#131313] font-accent-label text-xs uppercase tracking-[0.2em] hover:bg-error hover:text-on-error transition-all duration-200"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
