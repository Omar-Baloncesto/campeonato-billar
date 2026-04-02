import { fetchGroupStandings } from '../lib/sheets';
import GruposClient from './GruposClient';

export const revalidate = 60;

export default async function GruposPage() {
  const groups = await fetchGroupStandings();
  return <GruposClient groups={groups} />;
}
