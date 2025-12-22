import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlzheimerFairy | Care System",
  description: "AI-powered care tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}>
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}