import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

// Placeholder image - using the background aesthetic requested
const BG_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuDjmeRdRlfYsT-O4cGaCDSBah8r0waizoSiKzbO4JVwPkiYmL2KevMYw7Kma5zFDtlDopCI_kUeJgTFLfRkVMDHWYRKuQ_hVyvOo6DhjOjHJLkPEjUVL-cHDcciu6mE2Hat9YwvzjIfL-3My-Y47TcUxDna3iTXPCx3ssJaVenFa4d3appuyW_JfYsf-4hadAOJWh3HvlRhBwZ0Xpso8gDck-xTJ236SeAS469F9LQCaizMOVxHsukMy5xSyV6VE9F9mbqhgE8TJw";

// Reusable Background Component
function DistressedBackground() {
  return (
    <>
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center overflow-hidden">
        <Image src={BG_IMG} alt="Background Texture" fill className="object-cover grayscale mix-blend-overlay" unoptimized />
      </div>
      <div className="absolute inset-0 z-0 distress-overlay"></div>
    </>
  );
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <Header />
      <main className="flex-grow flex flex-col pb-24">
        <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center py-section-gap px-margin-mobile md:px-margin-desktop overflow-hidden">
          <DistressedBackground />
          <div className="relative z-10 w-full max-w-4xl flex flex-col gap-8">
             <div className="bg-surface-container-low p-8 md:p-12 border border-surface-container-highest relative group">
               <div className="absolute top-0 right-0 w-12 h-12 bg-error opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
               <h2 className="font-display-xl text-headline-lg md:text-display-xl text-on-background uppercase tracking-tighter mb-6">THE STORY</h2>
               <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  PMD (Pressure Makes Diamonds) is a streetwear brand built around ambition, resilience and self-belief. The brand represents people who keep pushing through pressure, struggle and challenges to become stronger and stand out.
               </p>
             </div>

             <div className="bg-surface-container-low p-8 md:p-12 border border-surface-container-highest relative group">
               <div className="absolute top-0 right-0 w-12 h-12 bg-error opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
               <h2 className="font-display-xl text-headline-lg md:text-display-xl text-on-background uppercase tracking-tighter mb-6">MISSION</h2>
               <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Our mission is to create bold, high-quality streetwear that inspires confidence and individuality.
               </p>
             </div>

             <div className="bg-surface-container-low p-8 md:p-12 border border-surface-container-highest relative group">
               <div className="absolute top-0 right-0 w-12 h-12 bg-error opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
               <h2 className="font-display-xl text-headline-lg md:text-display-xl text-on-background uppercase tracking-tighter mb-6">VISION</h2>
               <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Our vision is to grow PMD into a globally recognized streetwear movement known for strong identity, creativity and culture.
               </p>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
