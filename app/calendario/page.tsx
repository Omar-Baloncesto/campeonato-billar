import { fetchProgramacion } from '../lib/sheets';
import CalendarioClient from './CalendarioClient';

export const revalidate = 60;

export default async function CalendarioPage() {
  let programacion;
  try {
    programacion = await fetchProgramacion();
  } catch {
    programacion = [];
  }
  return <CalendarioClient programacion={programacion} />;
}
