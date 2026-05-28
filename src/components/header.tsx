import Link from "next/link";

export function Header() {
  return (
    <header className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#222222] w-full flex justify-between items-center px-6 md:px-16 py-5">
      <Link className="font-display-xl text-3xl md:text-4xl font-black text-white tracking-tighter hover:text-error transition-colors italic" href="/">
        PMD.
      </Link>
      <nav className="hidden md:flex gap-10 items-center">
        <Link className="text-white font-accent-label text-xs font-bold border-b-2 border-error pb-1 hover:text-error transition-colors uppercase tracking-[0.15em]" href="/shop">Shop</Link>
        <Link className="text-gray-400 font-accent-label text-xs hover:text-white transition-colors duration-200 uppercase tracking-[0.15em]" href="/about">About</Link>
        <Link className="text-gray-400 font-accent-label text-xs hover:text-white transition-colors duration-200 uppercase tracking-[0.15em]" href="/contact">Contact</Link>
      </nav>
      <div className="flex items-center gap-6">
        <Link href="/dashboard" aria-label="user_dashboard" className="text-white hover:text-error transition-colors duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </Link>
        <Link href="/cart" aria-label="shopping_bag" className="text-white hover:text-error transition-colors duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </Link>
      </div>
    </header>
  );
}
