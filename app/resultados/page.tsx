import { fetchResults } from '../lib/sheets';
import ResultadosClient from './ResultadosClient';

export const dynamic = 'force-dynamic';

export default async function ResultadosPage() {
  const results = await fetchResults();
  return <ResultadosClient results={results} />;
}
