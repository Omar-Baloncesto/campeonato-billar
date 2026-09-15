'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/* ==================================================================
 *  Pantalla de error.
 *
 *  Antes, si Google Sheets no respondía, la web se quedaba en blanco
 *  y no había manera de saber qué pasaba. Ahora se explica y se ofrece
 *  reintentar sin recargar toda la página.
 * ================================================================== */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[campeonato-billar]', error);
  }, [error]);

  return (
    <div className="animate-fade-in px-4 py-16 md:px-8">
      <div className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>

        <h2 className="text-lg font-black tracking-wider uppercase text-text-primary mb-2">
          No se pudieron cargar los datos
        </h2>
        <p className="text-sm text-text-muted leading-relaxed mb-6">
          Puede que Google Sheets esté tardando o que la hoja del torneo no esté disponible
          en este momento. Los datos no se han perdido: están en el Sheet.
        </p>

        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg text-xs font-semibold text-text-muted border border-border-light hover:text-text-primary transition-colors no-underline"
          >
            Volver al inicio
          </Link>
        </div>

        {error.digest && (
          <p className="text-[10px] text-text-muted/50 mt-6 font-mono">ref {error.digest}</p>
        )}
      </div>
    </div>
  );
}
