'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Refresca los datos del torneo automáticamente sin que el usuario
 * tenga que recargar la página.
 *
 * - Cada `intervalMs` milisegundos, si la pestaña está visible:
 *     1. llama router.refresh() para re-renderizar Server Components
 *        (home, grupos, jugadores, resultados, ranking)
 *     2. dispara el evento "sheet-refresh" en window para que las
 *        páginas 100% cliente (configuración, calendario, eliminación)
 *        re-hagan sus fetch a Google Sheets
 *
 * - Cuando la pestaña vuelve a estar visible (por ejemplo en móvil
 *   tras minimizar el navegador) fuerza un refresco inmediato.
 */
export const SHEET_REFRESH_EVENT = 'sheet-refresh';

interface AutoRefreshProps {
  intervalMs?: number;
}

export default function AutoRefresh({ intervalMs = 30_000 }: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      router.refresh();
      window.dispatchEvent(new Event(SHEET_REFRESH_EVENT));
    };

    const interval = window.setInterval(refresh, intervalMs);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [router, intervalMs]);

  return null;
}
