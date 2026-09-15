'use client';

/* Red de seguridad: se usa si el error ocurre en el layout raíz,
 * donde ya no existe el resto de la interfaz. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f14', color: '#e6edf3', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 380 }}>
          <h2 style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Algo falló al cargar la página
          </h2>
          <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.6, marginBottom: 20 }}>
            Vuelve a intentarlo. Los datos del torneo están guardados en el Google Sheets.
          </p>
          <button
            onClick={reset}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer' }}
          >
            Reintentar
          </button>
          {error.digest && (
            <p style={{ fontSize: 10, opacity: 0.4, marginTop: 24, fontFamily: 'monospace' }}>ref {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
