import type { Metadata } from "next";
import { Montserrat, Hanken_Grotesk, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-hanken-grotesk",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PMD | High-Stakes Tactical Streetwear",
  description: "Engineered for the Unforgiving. Pressure Makes Diamonds - Premium Tactical Streetwear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${montserrat.variable} ${hankenGrotesk.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body-md text-on-background bg-background overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
