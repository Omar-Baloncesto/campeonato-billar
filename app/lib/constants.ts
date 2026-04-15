export interface CityConfig {
  color: string;
  safeColor: string;
}

export const CITIES: Record<string, CityConfig> = {
  'CUCUTA-CAZADORES': { color: '#10b981', safeColor: '#34d399' },
  'CUCUTA-TENNIS': { color: '#059669', safeColor: '#6ee7b7' },
  'BUCARAMANGA': { color: '#f59e0b', safeColor: '#fbbf24' },
  'MEDELLIN': { color: '#ef4444', safeColor: '#f87171' },
  'BOGOTA': { color: '#3b82f6', safeColor: '#60a5fa' },
  'VENECIA': { color: '#8b5cf6', safeColor: '#a78bfa' },
  'MANIZALES': { color: '#ec4899', safeColor: '#f472b6' },
  'IBAGUE': { color: '#14b8a6', safeColor: '#2dd4bf' },
  'PEREIRA': { color: '#f97316', safeColor: '#fb923c' },
  'OCAÑA': { color: '#06b6d4', safeColor: '#22d3ee' },
};

export function getCityColor(city: string): string {
  return CITIES[city]?.safeColor || '#888888';
}

export const NAV_ITEMS = [
  { label: 'Inicio', href: '/', icon: '🎱' },
  { label: 'Calendario', href: '/calendario', icon: '📅' },
  { label: 'Grupos', href: '/grupos', icon: '📋' },
  { label: 'Resultados', href: '/resultados', icon: '📊' },
  { label: 'Eliminación', href: '/eliminacion', icon: '🏆' },
  { label: 'Ranking', href: '/ranking', icon: '🥇' },
  { label: 'Jugadores', href: '/jugadores', icon: '👤' },
  { label: 'Config', href: '/configuracion', icon: '⚙️' },
];

export const APP_CONFIG = {
  title: 'BILLAR 3 BANDAS',
  subtitle: 'CLUB TENNIS · CUCUTA',
  year: 2026,
};
