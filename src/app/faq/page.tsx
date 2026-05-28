import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FaqAccordion } from "@/components/faq-accordion";

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <Header />
      <main className="flex-grow flex flex-col pb-24">
        <FaqAccordion />
      </main>
      <Footer />
    </div>
  );
}
