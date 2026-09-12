import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerBridge",
  description: "Connect students, industry, academicians, and institutions for skill mapping and placements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#030303] text-slate-200`}>
        <div className="ambient-glow" />
        {children}
      </body>
    </html>
  );
}
