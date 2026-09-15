import { fetchGroups, fetchConfig } from '../lib/sheets';
import GruposClient from './GruposClient';

// ISR: la página se regenera cada 15 s como mucho, y al instante
// cuando el Apps Script llama a /api/revalidate al editar una celda.
export const revalidate = 15;

export default async function GruposPage() {
  const [{ groups, ranking }, config] = await Promise.all([
    fetchGroups(),
    fetchConfig(),
  ]);
  return <GruposClient groups={groups} ranking={ranking} config={config} />;
}
