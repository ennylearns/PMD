export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-surface-container-lowest">
          <div className="w-full h-full bg-surface-container-lowest mix-blend-luminosity opacity-60"></div>
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none distress-overlay mix-blend-overlay"></div>
        <div className="relative z-20 text-center px-margin-mobile md:px-margin-desktop flex flex-col items-center">
          <h1 className="font-display-xl text-headline-lg-mobile md:text-display-xl text-on-background mb-4 uppercase mix-blend-difference drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
            PMD: PRESSURE MAKES DIAMONDS
          </h1>
          <p className="font-accent-label text-accent-label text-on-surface-variant mb-12 tracking-widest uppercase">
            The New Standard in Tactical Streetwear.
          </p>
          <button className="bg-[#F5F5F5] text-primary-container font-button-text text-button-text px-12 py-5 uppercase tracking-widest hover:bg-error hover:text-on-error transition-colors duration-150 ease-linear border-0 group relative overflow-hidden">
            <span className="relative z-10">Shop Now</span>
          </button>
        </div>
      </section>
    </main>
  );
}
