export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-surface-container-highest pb-6">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
          Order Management
        </h1>
        <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
          Monitor and Process Customer Orders
        </p>
      </header>

      <div className="bg-surface border border-surface-container-highest min-h-[500px] flex flex-col items-center justify-center text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant/30 mb-6">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" x2="21" y1="6" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h2 className="font-accent-label text-sm tracking-widest text-on-surface uppercase mb-2">Orders Module Loading</h2>
        <p className="font-body-sm text-on-surface-variant max-w-md">
          This module is under construction. It will display a comprehensive list of all customer orders, their payment statuses, and fulfillment tracking.
        </p>
      </div>
    </div>
  );
}
