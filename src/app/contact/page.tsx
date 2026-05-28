import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const WHATSAPP_NUMBER = "2348061925420"; // Nigerian format: +234...
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
const EMAIL = "pmdwears@gmail.com";
const PHONE = "08061925420";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-black">
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-black text-white">
          <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#222]">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
              GET<br/>IN<br/>TOUCH.
            </h1>
          </div>
          <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center bg-[#050505]">
            <div className="space-y-16 max-w-lg">
              <a 
                href={WHATSAPP_LINK}
                target="_blank" 
                rel="noopener noreferrer" 
                className="group block"
              >
                <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Direct Line</h2>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-[#111] border border-[#333] flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                  </div>
                  <span className="text-3xl font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300">WhatsApp</span>
                </div>
              </a>

              <div>
                <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Email Address</h2>
                <a href={`mailto:${EMAIL}`} className="text-2xl hover:text-error transition-colors">{EMAIL}</a>
              </div>

              <div>
                 <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Customer Service</h2>
                 <a href={`tel:${PHONE}`} className="text-2xl hover:text-error transition-colors">{PHONE}</a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
