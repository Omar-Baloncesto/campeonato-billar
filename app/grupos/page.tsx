import { fetchGroupStandings } from '../lib/sheets';
import GruposClient from './GruposClient';

export const dynamic = 'force-dynamic';

export default async function GruposPage() {
  const groups = await fetchGroupStandings();
  return <GruposClient groups={groups} />;
}
