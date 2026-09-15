import { fetchPlayers } from '../lib/sheets';
import JugadoresClient from './JugadoresClient';

// ISR: la página se regenera cada 15 s como mucho, y al instante
// cuando el Apps Script llama a /api/revalidate al editar una celda.
export const revalidate = 15;

export default async function JugadoresPage() {
  const players = await fetchPlayers();
  return <JugadoresClient players={players} />;
}
