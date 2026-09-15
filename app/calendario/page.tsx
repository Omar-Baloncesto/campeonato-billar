import { fetchFixture, fetchResults, fetchConfig } from '../lib/sheets';
import CalendarioClient from './CalendarioClient';

// ISR: la página se regenera cada 15 s como mucho, y al instante
// cuando el Apps Script llama a /api/revalidate al editar una celda.
export const revalidate = 15;

export default async function CalendarioPage() {
  const [fixture, results, config] = await Promise.all([
    fetchFixture().catch(() => []),
    fetchResults().catch(() => []),
    fetchConfig(),
  ]);
  return <CalendarioClient fixture={fixture} results={results} config={config} />;
}
