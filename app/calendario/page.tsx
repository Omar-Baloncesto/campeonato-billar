import { fetchFixture, fetchResults, fetchEliminationMatches, fetchConfig } from '../lib/sheets';
import { construirCalendario } from '../lib/calendar';
import CalendarioClient from './CalendarioClient';

// ISR: la página se regenera cada 15 s como mucho, y al instante
// cuando el Apps Script llama a /api/revalidate al editar una celda.
export const revalidate = 15;

export default async function CalendarioPage() {
  const [fixture, results, elimination, config] = await Promise.all([
    fetchFixture().catch(() => []),
    fetchResults().catch(() => []),
    fetchEliminationMatches().catch(() => []),
    fetchConfig(),
  ]);

  return (
    <CalendarioClient
      partidos={construirCalendario(fixture, results, elimination)}
      config={config}
    />
  );
}
