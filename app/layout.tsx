import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import AppShell from "./components/AppShell";

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
        <AppShell>
          <main className="flex-1">
            {children}
          </main>
        </AppShell>
        <footer className="py-6 text-center border-t border-emerald-500/10">
          <nav className="flex justify-center gap-3 mb-3" aria-label="Enlaces rapidos">
            <Link href="/grupos" className="text-xs text-text-muted hover:text-emerald-400 transition">Grupos</Link>
            <span className="text-text-muted/40 text-xs">·</span>
            <Link href="/resultados" className="text-xs text-text-muted hover:text-emerald-400 transition">Resultados</Link>
            <span className="text-text-muted/40 text-xs">·</span>
            <Link href="/eliminacion" className="text-xs text-text-muted hover:text-emerald-400 transition">Eliminacion</Link>
            <span className="text-text-muted/40 text-xs">·</span>
            <Link href="/ranking" className="text-xs text-text-muted hover:text-emerald-400 transition">Ranking</Link>
          </nav>
          <div className="text-[11px] text-text-muted/60 tracking-[0.25em] uppercase">
            Billar 3 Bandas · Club Tennis · Cucuta
          </div>
        </footer>
      </body>
    </html>
  );
}
