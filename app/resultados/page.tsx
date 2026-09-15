import { fetchResults, fetchConfig } from '../lib/sheets';
import ResultadosClient from './ResultadosClient';

// ISR: la página se regenera cada 15 s como mucho, y al instante
// cuando el Apps Script llama a /api/revalidate al editar una celda.
export const revalidate = 15;

export default async function ResultadosPage() {
  const [results, config] = await Promise.all([fetchResults(), fetchConfig()]);
  return <ResultadosClient results={results} config={config} />;
}
