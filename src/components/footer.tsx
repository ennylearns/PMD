import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black border-t border-[#222222] w-full px-6 md:px-16 py-20 grid grid-cols-1 md:grid-cols-4 gap-12 mt-auto">
      <div className="col-span-1 flex flex-col justify-between">
        <div>
          <Link className="text-3xl font-black text-white block mb-6 tracking-tighter italic hover:text-error transition-colors" href="/">PMD.</Link>
          <p className="font-body-sm text-sm text-gray-400 max-w-[240px] leading-relaxed">
            Pressure Makes Diamonds. Streetwear built on ambition, resilience, and self-belief.
          </p>
        </div>
        <p className="font-accent-label text-[10px] text-gray-600 mt-12 md:mt-0 uppercase tracking-widest">
            © 2026 PMD. ALL RIGHTS RESERVED.
        </p>
      </div>
      <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-5">
          <h4 className="font-accent-label text-xs text-white mb-2 border-b border-error pb-3 uppercase tracking-[0.15em]">Store</h4>
          <Link className="font-body-sm text-sm text-gray-400 hover:text-error transition-colors" href="/shop">All Products</Link>
          <Link className="font-body-sm text-sm text-gray-400 hover:text-error transition-colors" href="/shop">T-Shirts</Link>
          <Link className="font-body-sm text-sm text-gray-400 hover:text-error transition-colors" href="/shop">Joggers</Link>
        </div>
        <div className="flex flex-col gap-5">
          <h4 className="font-accent-label text-xs text-white mb-2 border-b border-[#222222] pb-3 uppercase tracking-[0.15em]">Support</h4>
          <Link className="font-body-sm text-sm text-gray-400 hover:text-white transition-colors" href="/faq">FAQ</Link>
          <Link className="font-body-sm text-sm text-gray-400 hover:text-white transition-colors" href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
