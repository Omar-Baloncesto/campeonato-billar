import { fetchEliminationMatches, fetchConfig } from '../lib/sheets';
import EliminacionClient from './EliminacionClient';

// ISR: la página se regenera cada 15 s como mucho, y al instante
// cuando el Apps Script llama a /api/revalidate al editar una celda.
export const revalidate = 15;

export default async function EliminacionPage() {
  const [matches, config] = await Promise.all([fetchEliminationMatches(), fetchConfig()]);
  return <EliminacionClient matches={matches} config={config} />;
}
