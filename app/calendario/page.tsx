import CalendarioClient from './CalendarioClient';

export const revalidate = 0; // No cache — always fresh

export default async function CalendarioPage() {
  return <CalendarioClient />;
}
