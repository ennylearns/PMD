export default function AdminDashboardOverview() {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-surface-container-highest pb-6">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
          Command Center
        </h1>
        <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
          System Overview & Analytics
        </p>
      </header>

      {/* Stats Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "TOTAL REVENUE", value: "₦0.00", icon: "₦" },
          { label: "ACTIVE ORDERS", value: "0", icon: "📦" },
          { label: "PRODUCTS", value: "0", icon: "🏷️" },
          { label: "PENDING SHIPMENTS", value: "0", icon: "🚚" },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-surface-container-highest p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-surface-container-lowest flex items-center justify-center opacity-50 group-hover:bg-error/10 transition-colors">
              <span className="text-2xl grayscale">{stat.icon}</span>
            </div>
            <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mb-2">
              {stat.label}
            </p>
            <p className="font-headline-lg text-2xl text-on-surface">
              {stat.value}
            </p>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-error group-hover:w-full transition-all duration-500"></div>
          </div>
        ))}
      </div>

      {/* Main Content Area Placeholder */}
      <div className="bg-surface border border-surface-container-highest min-h-[400px] flex items-center justify-center relative overflow-hidden mt-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface-container-lowest to-surface"></div>
        <div className="text-center relative z-10">
          <p className="font-accent-label text-[12px] tracking-widest text-on-surface-variant uppercase mb-4">
            Awaiting Data Feeds
          </p>
          <div className="w-16 h-16 border-2 border-dashed border-surface-container-highest rounded-full flex items-center justify-center mx-auto animate-[spin_10s_linear_infinite]">
            <div className="w-2 h-2 bg-error rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,0,1)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
