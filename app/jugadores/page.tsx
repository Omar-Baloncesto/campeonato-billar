import { fetchPlayers } from '../lib/sheets';
import JugadoresClient from './JugadoresClient';

export const dynamic = 'force-dynamic';

export default async function JugadoresPage() {
  const players = await fetchPlayers();
  return <JugadoresClient players={players} />;
}
