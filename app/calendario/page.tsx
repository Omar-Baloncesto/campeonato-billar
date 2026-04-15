import { fetchProgramacion } from '../lib/sheets';
import CalendarioClient from './CalendarioClient';

export const revalidate = 60;

export default async function CalendarioPage() {
  const programacion = await fetchProgramacion();
  return <CalendarioClient programacion={programacion} />;
}
