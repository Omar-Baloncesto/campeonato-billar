import { fetchProgramacion, fetchEliminationMatches } from '../lib/sheets';
import CalendarioClient from './CalendarioClient';

export const revalidate = 60;

export default async function CalendarioPage() {
  let programacion;
  let eliminacion;
  try {
    programacion = await fetchProgramacion();
  } catch (_e) {
    programacion = [];
  }
  try {
    eliminacion = await fetchEliminationMatches();
  } catch (_e) {
    eliminacion = null;
  }
  return <CalendarioClient programacion={programacion} eliminacion={eliminacion} />;
}
