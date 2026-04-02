import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Navigation from "./components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Billar 3 Bandas - Club Tennis Cucuta",
  description: "Campeonato de Billar a Tres Bandas - Club Tennis Cucuta. Grupos, resultados, eliminacion y ranking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-5 text-center border-t border-border-subtle">
          <div className="text-[11px] text-text-muted/60 tracking-[0.25em] uppercase">
            Billar 3 Bandas · Club Tennis · Cucuta
          </div>
        </footer>
      </body>
    </html>
  );
}
