import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// Shared Sections
function FeaturedProducts() {
  const mockProducts = [
    { title: "Chaos Heavyweight Tee", desc: "Oversized Fit", price: "₦35,000" },
    { title: "Diamond Core Joggers", desc: "Premium Fleece", price: "₦45,000" },
    { title: "Pressure Graphic Tee", desc: "Vintage Wash", price: "₦35,000" },
    { title: "Resilience Cargo", desc: "Tactical Build", price: "₦55,000" }
  ];

  return (
    <section className="py-32 px-6 md:px-16 bg-[#050505]">
      <div className="flex justify-between items-end mb-16 border-b border-[#222222] pb-6">
        <h2 className="font-display-xl text-3xl md:text-5xl text-white uppercase tracking-tighter">New Drops</h2>
        <Link className="font-accent-label text-xs text-gray-400 hover:text-error transition-colors uppercase flex items-center gap-2 tracking-[0.15em]" href="/shop">
          View All <span className="text-[16px] font-bold text-error">→</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {mockProducts.map((p, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="relative aspect-[3/4] bg-[#111111] mb-5 overflow-hidden group-hover:bg-[#1a1a1a] transition-colors border border-transparent group-hover:border-error/30">
               <div className="absolute inset-0 flex items-center justify-center text-[#333333] group-hover:text-error/20 font-accent-label text-2xl tracking-[0.2em] group-hover:scale-105 transition-all duration-700">PMD</div>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-accent-label text-[13px] text-white uppercase tracking-widest group-hover:text-error transition-colors">{p.title}</h3>
              <div className="flex justify-between items-center mt-1">
                <p className="font-body-sm text-[13px] text-gray-500">{p.desc}</p>
                <span className="font-body-sm text-[13px] text-white">{p.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="py-40 w-full bg-black relative overflow-hidden border-y border-[#222222] text-center px-6">
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="font-display-xl text-4xl md:text-7xl text-white mb-10 uppercase leading-[0.9] tracking-tighter">
          Pressure<br />Makes <span className="text-error">Diamonds.</span>
        </h2>
        <p className="font-body-md text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed">
          The ones who can relate to the street. Pushing through the struggle and the pressure until it creates something unbreakable. We don't just make clothes; we build a community for those who stand out.
        </p>
        <Link className="inline-block border-b border-error pb-1 font-accent-label text-xs text-error uppercase hover:text-white hover:border-white transition-colors tracking-[0.15em]" href="/about">
          Our Philosophy
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black">
      <Header />
      <main>
        {/* The Immersive Letterbox Hero */}
        <section className="relative w-full h-[90vh] flex items-center justify-center bg-black overflow-hidden border-b border-[#222222]">
          <div className="relative w-full h-full flex items-center justify-center">
             <video 
              autoPlay loop muted playsInline 
              className="w-full h-full object-contain grayscale opacity-60"
            >
              <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none"></div>
          </div>
          
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
            <h1 className="font-display-xl text-5xl md:text-[8rem] leading-[0.85] font-black text-white mb-8 uppercase tracking-tighter mix-blend-overlay opacity-90 drop-shadow-2xl">
              PRESSURE<br />MAKES<br /><span className="text-error mix-blend-normal">DIAMONDS</span>
            </h1>
            <div className="pointer-events-auto mt-4">
              <Link href="/shop" className="bg-error text-white font-accent-label text-[11px] font-bold px-12 py-5 uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors duration-200 ease-linear shadow-[4px_4px_0_0_rgba(255,180,171,0.2)] hover:shadow-none hover:translate-y-1 hover:translate-x-1">
                Shop The Collection
              </Link>
            </div>
          </div>
        </section>
        
        <FeaturedProducts />
        <BrandStory />
      </main>
      <Footer />
    </div>
  );
}
