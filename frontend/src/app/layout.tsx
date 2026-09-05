import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Syne } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { NavBar } from "@/components/ui/NavBar";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ variable: "--font-space", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });
const syne = Syne({ variable: "--font-syne", subsets: ["latin"], weight: ["700", "800"] });

export const metadata: Metadata = {
  title: "Face-to-Web Discovery | HH Goa Task 3",
  description: "Detect faces from photos, find matching social media posts via reverse-image search, and anchor evidence on the Ethereum blockchain. Built for Hacker House Goa 2026.",
  keywords: ["face detection", "blockchain", "reverse image search", "evidence", "hacker house goa"],
  openGraph: {
    title: "Face-to-Web Discovery | HH Goa Task 3",
    description: "Blockchain-anchored visual evidence pipeline",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${syne.variable}`}>
      <body>
        <ToastProvider>
          <NavBar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
