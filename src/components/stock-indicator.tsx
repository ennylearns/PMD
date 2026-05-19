type StockIndicatorProps = {
  stock: number;
};

export default function StockIndicator({ stock }: StockIndicatorProps) {
  if (stock <= 0) {
    return (
      <div className="flex items-center gap-2" id="stock-indicator-oos">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-surface-container-high" />
        </span>
        <span className="text-xs font-accent-label text-on-surface-variant/50 uppercase tracking-[0.15em]">
          Out of Stock
        </span>
      </div>
    );
  }

  if (stock <= 5) {
    return (
      <div className="flex items-center gap-2" id="stock-indicator-critical">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error" />
        </span>
        <span className="text-xs font-accent-label text-error uppercase tracking-[0.15em]">
          Only {stock} left — moves fast
        </span>
      </div>
    );
  }

  if (stock <= 15) {
    return (
      <div className="flex items-center gap-2" id="stock-indicator-low">
        <span className="relative flex h-2.5 w-2.5">
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ffb86c]" />
        </span>
        <span className="text-xs font-accent-label text-[#ffb86c] uppercase tracking-[0.15em]">
          Low stock — {stock} remaining
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" id="stock-indicator-available">
      <span className="relative flex h-2.5 w-2.5">
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#50fa7b]" />
      </span>
      <span className="text-xs font-accent-label text-[#50fa7b]/80 uppercase tracking-[0.15em]">
        In Stock
      </span>
    </div>
  );
}
