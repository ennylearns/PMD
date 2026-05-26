export default function AdminProductsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-surface-container-highest pb-6">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
          Product Catalog
        </h1>
        <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
          Manage Inventory and Collections
        </p>
      </header>

      <div className="bg-surface border border-surface-container-highest min-h-[500px] flex flex-col items-center justify-center text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant/30 mb-6">
          <path d="m7.5 4.27 9 5.15"/>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
        <h2 className="font-accent-label text-sm tracking-widest text-on-surface uppercase mb-2">Products Module Loading</h2>
        <p className="font-body-sm text-on-surface-variant max-w-md">
          This module is under construction. It will allow you to create products, manage inventory stock, and define variants.
        </p>
      </div>
    </div>
  );
}
