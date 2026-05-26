export default function AdminDeliveryFeesPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-surface-container-highest pb-6">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
          Delivery Logistics
        </h1>
        <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
          Configure State & City Delivery Fees
        </p>
      </header>

      <div className="bg-surface border border-surface-container-highest min-h-[500px] flex flex-col items-center justify-center text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant/30 mb-6">
          <rect width="16" height="16" x="4" y="4" rx="2"/>
          <path d="M4 14h16"/>
          <path d="M4 10h16"/>
          <path d="M10 4v16"/>
        </svg>
        <h2 className="font-accent-label text-sm tracking-widest text-on-surface uppercase mb-2">Logistics Module Loading</h2>
        <p className="font-body-sm text-on-surface-variant max-w-md">
          This module is under construction. It will provide controls to manage delivery fees per Nigerian State and set specific City overrides.
        </p>
      </div>
    </div>
  );
}
