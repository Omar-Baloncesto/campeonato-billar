import { fetchProgramacion, fetchEliminationMatches } from '../lib/sheets';
import CalendarioClient from './CalendarioClient';

export const revalidate = 60;

export default async function CalendarioPage() {
  let programacion;
  let eliminacion;
  try {
    programacion = await fetchProgramacion();
  } catch {
    programacion = [];
  }
  try {
    eliminacion = await fetchEliminationMatches();
  } catch {
    eliminacion = null;
  }
  return <CalendarioClient programacion={programacion} eliminacion={eliminacion} />;
}
