import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon?: string }> = {
  PENDING: {
    label: "PENDING",
    className: "bg-surface-container border-surface-container-highest text-on-surface-variant",
    icon: "schedule",
  },
  PROCESSING: {
    label: "PROCESSING",
    className: "bg-surface-container border-surface-container-highest text-on-surface",
    icon: "pulse",
  },
  SHIPPED: {
    label: "SHIPPED",
    className: "bg-surface-container border-surface-container-highest text-on-surface",
    icon: "local_shipping",
  },
  DELIVERED: {
    label: "DELIVERED",
    className: "bg-surface-container-high border-surface-container-highest text-on-surface-variant",
    icon: "check",
  },
  CANCELLED: {
    label: "CANCELLED",
    className: "bg-error/10 border-error/20 text-error",
    icon: "close",
  },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: { name: true, images: true, price: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <header className="flex justify-between items-end border-b border-surface-container-highest pb-4">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">
          ORDER HISTORY
        </h2>
        <span className="font-accent-label text-accent-label text-on-surface-variant">
          {orders.length} ORDER{orders.length !== 1 ? "S" : ""}
        </span>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="w-16 h-16 border border-surface-container-highest flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface-variant/40">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">No orders yet</p>
          <a
            href="/shop"
            className="bg-on-surface text-surface px-6 py-3 font-button-text text-button-text tracking-wider hover:bg-error hover:text-primary-container transition-all duration-200"
          >
            START SHOPPING
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const isCancelled = order.status === "CANCELLED";
            const firstItem = order.items[0];
            const variant = firstItem?.variant;
            const product = variant?.product;

            return (
              <article
                key={order.id}
                className={`border border-surface-container-highest p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:border-outline transition-colors duration-200 ${
                  isCancelled
                    ? "bg-surface opacity-50 hover:opacity-100 transition-opacity duration-200"
                    : order.status === "DELIVERED"
                    ? "bg-surface-container-low"
                    : "bg-surface-container"
                }`}
              >
                {/* Image Area */}
                <div className="w-full md:w-48 h-48 bg-surface-container-low border border-surface-container-highest flex-shrink-0 relative overflow-hidden">
                  {product?.images?.[0] ? (
                    <img
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                        isCancelled ? "grayscale mix-blend-luminosity" : "grayscale opacity-80 group-hover:grayscale-0"
                      }`}
                      src={product.images[0]}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                    </div>
                  )}
                  {/* Status Chip */}
                  <div className={`absolute top-2 left-2 border px-2 py-1 font-accent-label text-[10px] tracking-widest z-10 flex items-center gap-1 ${status.className}`}>
                    {order.status === "PROCESSING" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                    )}
                    {status.label}
                  </div>
                </div>

                {/* Details Area */}
                <div className={`flex flex-col justify-between w-full ${order.status === "DELIVERED" ? "opacity-80 group-hover:opacity-100 transition-opacity duration-200" : ""}`}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className={`font-accent-label text-accent-label mb-1 ${isCancelled ? "text-on-surface-variant line-through" : "text-on-background"}`}>
                          {product?.name?.toUpperCase() || "ORDER"}
                          {order.items.length > 1 && ` + ${order.items.length - 1} MORE`}
                        </h3>
                        {variant && (
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Color: {variant.color} / Size: {variant.size}
                          </p>
                        )}
                      </div>
                      <span className={`font-accent-label text-accent-label ${isCancelled ? "text-on-surface-variant line-through" : "text-on-background"}`}>
                        ₦{order.totalAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6 border-t border-surface-container-highest pt-4">
                      <div>
                        <p className="font-accent-label text-[10px] text-on-surface-variant mb-1">ORDER NUMBER</p>
                        <p className="font-body-sm text-body-sm text-on-surface">#{order.id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="font-accent-label text-[10px] text-on-surface-variant mb-1">DATE</p>
                        <p className="font-body-sm text-body-sm text-on-surface">
                          {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="flex justify-end mt-6 gap-4">
                      {order.status === "DELIVERED" ? (
                        <a
                          href="/shop"
                          className="bg-surface-container border border-surface-container-highest text-on-surface px-6 py-3 font-button-text text-button-text hover:bg-surface-container-high transition-colors duration-200"
                        >
                          BUY AGAIN
                        </a>
                      ) : (
                        <button className="bg-primary-container text-on-primary-container px-6 py-3 font-button-text text-button-text border border-surface-container-highest hover:bg-error hover:text-primary-container hover:border-error transition-colors duration-200">
                          TRACK ORDER
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
