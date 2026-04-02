import { fetchPlayers } from '../lib/sheets';
import JugadoresClient from './JugadoresClient';

export const revalidate = 60;

export default async function JugadoresPage() {
  const players = await fetchPlayers();
  return <JugadoresClient players={players} />;
}
