import type { ScheduleMatch } from './types';

// Schedule built from group stage results and elimination rounds
// Dates are approximate based on tournament structure
export const SCHEDULE: ScheduleMatch[] = [
  // Day 1 - Grupos (Jornada 1)
  { date: '2026-03-15', time: '09:00', table: 1, round: 'Grupos', group: 1, playerA: 'Hugo Portilla', playerB: 'Victor Manuel Oviedo', scoreA: 20, scoreB: 10, winner: 'Hugo Portilla', status: 'ended' },
  { date: '2026-03-15', time: '09:00', table: 2, round: 'Grupos', group: 2, playerA: 'Henry Pardo', playerB: 'David Varón', scoreA: 20, scoreB: 12, winner: 'Henry Pardo', status: 'ended' },
  { date: '2026-03-15', time: '09:00', table: 3, round: 'Grupos', group: 3, playerA: 'Luis Miguel Salguero', playerB: 'Pedro J. Pezzoti', scoreA: 20, scoreB: 15, winner: 'Luis Miguel Salguero', status: 'ended' },
  { date: '2026-03-15', time: '10:30', table: 1, round: 'Grupos', group: 4, playerA: 'Javier García', playerB: 'Tulio Rivera', scoreA: 20, scoreB: 8, winner: 'Javier García', status: 'ended' },
  { date: '2026-03-15', time: '10:30', table: 2, round: 'Grupos', group: 5, playerA: 'Victoriano Toloza', playerB: 'Nicolás Carrero', scoreA: 20, scoreB: 14, winner: 'Victoriano Toloza', status: 'ended' },
  { date: '2026-03-15', time: '10:30', table: 3, round: 'Grupos', group: 6, playerA: 'Genaro Villamizar', playerB: 'Ruben Estrada', scoreA: 20, scoreB: 9, winner: 'Genaro Villamizar', status: 'ended' },

  // Day 2 - Grupos (Jornada 2)
  { date: '2026-03-16', time: '09:00', table: 1, round: 'Grupos', group: 7, playerA: 'Argemiro Aguirre', playerB: 'German Vivas', scoreA: 20, scoreB: 7, winner: 'Argemiro Aguirre', status: 'ended' },
  { date: '2026-03-16', time: '09:00', table: 2, round: 'Grupos', group: 8, playerA: 'Roberto Fuentes', playerB: 'Ruben Velez', scoreA: 20, scoreB: 4, winner: 'Roberto Fuentes', status: 'ended' },
  { date: '2026-03-16', time: '09:00', table: 3, round: 'Grupos', group: 9, playerA: 'Antonio Osorio', playerB: 'Elkin Florez', scoreA: 20, scoreB: 10, winner: 'Antonio Osorio', status: 'ended' },
  { date: '2026-03-16', time: '10:30', table: 1, round: 'Grupos', group: 10, playerA: 'Daniel Mejia', playerB: 'Anibal Ortiz', scoreA: 20, scoreB: 6, winner: 'Daniel Mejia', status: 'ended' },
  { date: '2026-03-16', time: '10:30', table: 2, round: 'Grupos', group: 11, playerA: 'Juan Bueno', playerB: 'Eduardo Rodríguez', scoreA: 20, scoreB: 11, winner: 'Juan Bueno', status: 'ended' },

  // Day 3 - Eliminacion Ronda 1
  { date: '2026-03-22', time: '09:00', table: 1, round: '1ra Ronda', playerA: 'José Manuel Ardila', playerB: 'Elkin Florez', scoreA: 15, scoreB: 0, winner: 'José Manuel Ardila', status: 'ended' },
  { date: '2026-03-22', time: '09:00', table: 2, round: '1ra Ronda', playerA: 'David Varón', playerB: 'Gabriel Monsalve', scoreA: 11, scoreB: 14, winner: 'Gabriel Monsalve', status: 'ended' },
  { date: '2026-03-22', time: '10:30', table: 1, round: '1ra Ronda', playerA: 'Pedro Vasquez', playerB: 'German Vivas', scoreA: 15, scoreB: 7, winner: 'Pedro Vasquez', status: 'ended' },
  { date: '2026-03-22', time: '10:30', table: 2, round: '1ra Ronda', playerA: 'Pedro J. Pezzoti', playerB: 'Oscar Ramirez', scoreA: 12, scoreB: 15, winner: 'Oscar Ramirez', status: 'ended' },

  // Day 4 - Eliminacion Ronda 2
  { date: '2026-03-23', time: '09:00', table: 1, round: '2da Ronda', playerA: 'Hugo Portilla', playerB: 'Henry Pacheco', scoreA: 13, scoreB: 12, winner: 'Hugo Portilla', status: 'ended' },
  { date: '2026-03-23', time: '09:00', table: 2, round: '2da Ronda', playerA: 'Henry Pardo', playerB: 'Nicolás Carrero', scoreA: 15, scoreB: 4, winner: 'Henry Pardo', status: 'ended' },
  { date: '2026-03-23', time: '10:30', table: 1, round: '2da Ronda', playerA: 'Daniel Mejia', playerB: 'Omar Alvarez', scoreA: 15, scoreB: 10, winner: 'Daniel Mejia', status: 'ended' },

  // Day 5 - Octavos de Final
  { date: '2026-03-29', time: '09:00', table: 1, round: 'Octavos', playerA: 'Hugo Portilla', playerB: 'William Abreo', scoreA: 12, scoreB: 10, winner: 'Hugo Portilla', status: 'ended' },
  { date: '2026-03-29', time: '09:00', table: 2, round: 'Octavos', playerA: 'Henry Pardo', playerB: 'Eugenio Sánchez', scoreA: 8, scoreB: 15, winner: 'Eugenio Sánchez', status: 'ended' },
  { date: '2026-03-29', time: '10:30', table: 1, round: 'Octavos', playerA: 'Luis Miguel Salguero', playerB: 'Alvaro Ortega Sierra', scoreA: 15, scoreB: 4, winner: 'Luis Miguel Salguero', status: 'ended' },
  { date: '2026-03-29', time: '10:30', table: 2, round: 'Octavos', playerA: 'Javier García', playerB: 'Jorge Leal', scoreA: 14, scoreB: 8, winner: 'Javier García', status: 'ended' },

  // Day 6 - Cuartos de Final
  { date: '2026-04-05', time: '09:00', table: 1, round: 'Cuartos', playerA: 'Hugo Portilla', playerB: 'Gabriel Monsalve', scoreA: 15, scoreB: 12, winner: 'Hugo Portilla', status: 'ended' },
  { date: '2026-04-05', time: '09:00', table: 2, round: 'Cuartos', playerA: 'Eugenio Sánchez', playerB: 'Argemiro Aguirre', scoreA: 8, scoreB: 15, winner: 'Argemiro Aguirre', status: 'ended' },
  { date: '2026-04-05', time: '10:30', table: 1, round: 'Cuartos', playerA: 'Luis Miguel Salguero', playerB: 'Daniel Mejia', scoreA: 15, scoreB: 11, winner: 'Luis Miguel Salguero', status: 'ended' },
  { date: '2026-04-05', time: '10:30', table: 2, round: 'Cuartos', playerA: 'Javier García', playerB: 'Fernando Moreno', scoreA: 9, scoreB: 8, winner: 'Javier García', status: 'ended' },

  // Day 7 - Semifinales
  { date: '2026-04-12', time: '10:00', table: 1, round: 'Semifinal', playerA: 'Hugo Portilla', playerB: 'Javier García', scoreA: 6, scoreB: 8, winner: 'Javier García', status: 'ended' },
  { date: '2026-04-12', time: '10:00', table: 2, round: 'Semifinal', playerA: 'Argemiro Aguirre', playerB: 'Luis Miguel Salguero', scoreA: 7, scoreB: 15, winner: 'Luis Miguel Salguero', status: 'ended' },

  // Day 7 - Final
  { date: '2026-04-12', time: '15:00', table: 1, round: 'Final', playerA: 'Javier García', playerB: 'Luis Miguel Salguero', scoreA: 20, scoreB: 18, winner: 'Javier García', status: 'ended' },
];

export function getScheduleDates(): string[] {
  return [...new Set(SCHEDULE.map(m => m.date))].sort();
}

export function getMatchesByDate(date: string): ScheduleMatch[] {
  return SCHEDULE.filter(m => m.date === date);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${month}/${day}`;
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
}
