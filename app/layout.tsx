import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import AppShell from "./components/AppShell";

export const metadata: Metadata = {
  title: "Billar 3 Bandas - Club Tennis Cúcuta",
  description: "Campeonato de Billar a Tres Bandas - Club Tennis Cúcuta. Grupos, resultados, eliminación y ranking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('theme')==='light'){document.documentElement.setAttribute('data-theme','light')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AppShell>
          <main className="flex-1">
            {children}
          </main>
        </AppShell>
        <footer className="py-6 text-center border-t border-emerald-500/10">
          <nav className="flex justify-center gap-3 mb-3" aria-label="Enlaces rápidos">
            <Link href="/grupos" className="text-xs text-text-muted hover:text-emerald-400 transition">Grupos</Link>
            <span className="text-text-muted/70 text-xs">·</span>
            <Link href="/resultados" className="text-xs text-text-muted hover:text-emerald-400 transition">Resultados</Link>
            <span className="text-text-muted/70 text-xs">·</span>
            <Link href="/eliminacion" className="text-xs text-text-muted hover:text-emerald-400 transition">Eliminación</Link>
            <span className="text-text-muted/70 text-xs">·</span>
            <Link href="/ranking" className="text-xs text-text-muted hover:text-emerald-400 transition">Ranking</Link>
          </nav>
          <div className="text-[11px] text-text-muted tracking-[0.25em] uppercase">
            Billar 3 Bandas · Club Tennis · Cúcuta
          </div>
        </footer>
      </body>
    </html>
  );
}
