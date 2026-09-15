import { fetchFixture, fetchResults } from '../lib/sheets';
import CalendarioClient from './CalendarioClient';

// ISR: la página se regenera cada 15 s como mucho, y al instante
// cuando el Apps Script llama a /api/revalidate al editar una celda.
export const revalidate = 15;

export default async function CalendarioPage() {
  const [fixture, results] = await Promise.all([
    fetchFixture().catch(() => []),
    fetchResults().catch(() => []),
  ]);
  return <CalendarioClient fixture={fixture} results={results} />;
}
