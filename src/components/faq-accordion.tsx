"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqData = [
  {
    question: "What is the delivery time?",
    answer: "Orders are processed within 1–3 business days. Delivery time depends on location."
  },
  {
    question: "What is your return policy?",
    answer: "Returns or exchanges are only accepted for damaged or incorrect items within 3 days after delivery."
  },
  {
    question: "What payment methods are accepted?",
    answer: "Payment is with only paystack."
  },
  {
    question: "How do I know my size?",
    answer: "Our clothes have an oversized/streetwear fit. Customers are advised to check the size chart before ordering."
  }
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-12 border-b pb-6 border-white/10">
        FAQ
      </h1>
      <div className="space-y-2">
        {faqData.map((faq, index) => (
          <div key={index} className="border-b border-white/10">
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex justify-between items-center py-6 text-left focus:outline-none"
            >
              <span className="text-lg md:text-xl font-medium tracking-wide">
                {faq.question}
              </span>
              <ChevronDown 
                className={`w-6 h-6 transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`} 
              />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? "max-h-[200px] opacity-100 mb-6" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
