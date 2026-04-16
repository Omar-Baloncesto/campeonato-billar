import type { ScheduleMatch } from './types';

// ================================================================
//  Programación oficial del campeonato
//  Fuente: hoja "Programación" de Google Sheets
// ================================================================

export const SCHEDULE: ScheduleMatch[] = [
  // ============================================================
  //  VIERNES 30 ENERO 2026 – Fase de Grupos (36 partidos)
  // ============================================================

  // 9:00 a.m.
  { date: '2026-01-30', time: '09:00', table: 1, round: 'Grupos', group: 1, playerA: 'William Abreo', playerB: 'David Varón', status: 'ended' },
  { date: '2026-01-30', time: '09:00', table: 2, round: 'Grupos', group: 2, playerA: 'Victoriano Toloza', playerB: 'Omar Alvarez', status: 'ended' },
  { date: '2026-01-30', time: '09:00', table: 3, round: 'Grupos', group: 3, playerA: 'José Manuel Ardila', playerB: 'Jorge Leal', status: 'ended' },
  { date: '2026-01-30', time: '09:00', table: 4, round: 'Grupos', group: 4, playerA: 'Luis Miguel Salguero', playerB: 'Gabriel Monsalve', status: 'ended' },

  // 10:00 a.m.
  { date: '2026-01-30', time: '10:00', table: 1, round: 'Grupos', group: 5, playerA: 'Alvaro Ortega Sierra', playerB: 'Javier García', status: 'ended' },
  { date: '2026-01-30', time: '10:00', table: 2, round: 'Grupos', group: 6, playerA: 'Genaro Villamizar', playerB: 'Eugenio Sánchez', status: 'ended' },
  { date: '2026-01-30', time: '10:00', table: 3, round: 'Grupos', group: 7, playerA: 'Roberto Fuentes', playerB: 'Carlos Pérez Jr.', status: 'ended' },
  { date: '2026-01-30', time: '10:00', table: 4, round: 'Grupos', group: 8, playerA: 'Pedro J. Pezzoti', playerB: 'Elkin Florez', status: 'ended' },

  // 11:00 a.m.
  { date: '2026-01-30', time: '11:00', table: 1, round: 'Grupos', group: 1, playerA: 'Oscar Ramirez', playerB: 'Argemiro Aguirre', status: 'ended' },
  { date: '2026-01-30', time: '11:00', table: 2, round: 'Grupos', group: 9, playerA: 'Hugo Portilla', playerB: 'Tulio Rivera', status: 'ended' },
  { date: '2026-01-30', time: '11:00', table: 3, round: 'Grupos', group: 10, playerA: 'Juan Bueno', playerB: 'Guillermo Herrera', status: 'ended' },
  { date: '2026-01-30', time: '11:00', table: 4, round: 'Grupos', group: 11, playerA: 'Antonio Osorio', playerB: 'Eduardo Rodríguez', status: 'ended' },

  // 12:00 m.
  { date: '2026-01-30', time: '12:00', table: 1, round: 'Grupos', group: 2, playerA: 'Ruben Velez', playerB: 'Jesus Alberto Sandoval', status: 'ended' },
  { date: '2026-01-30', time: '12:00', table: 2, round: 'Grupos', group: 3, playerA: 'Victor Manuel Oviedo', playerB: 'José Antonio Parada', status: 'ended' },
  { date: '2026-01-30', time: '12:00', table: 3, round: 'Grupos', group: 4, playerA: 'Javier García M.', playerB: 'Pedro Vasquez', status: 'ended' },
  { date: '2026-01-30', time: '12:00', table: 4, round: 'Grupos', group: 5, playerA: 'Nicolás Carrero', playerB: 'German Vivas', status: 'ended' },

  // 2:00 p.m.
  { date: '2026-01-30', time: '14:00', table: 1, round: 'Grupos', group: 6, playerA: 'Ruben Estrada', playerB: 'Franklin Bueno', status: 'ended' },
  { date: '2026-01-30', time: '14:00', table: 2, round: 'Grupos', group: 7, playerA: 'Gustavo Jimenez', playerB: 'Fernando Moreno', status: 'ended' },
  { date: '2026-01-30', time: '14:00', table: 3, round: 'Grupos', group: 8, playerA: 'Raul Marquez', playerB: 'Henry Pardo', status: 'ended' },
  { date: '2026-01-30', time: '14:00', table: 4, round: 'Grupos', group: 9, playerA: 'Fernando Arango', playerB: 'Anibal Ortiz', status: 'ended' },

  // 3:00 p.m.
  { date: '2026-01-30', time: '15:00', table: 1, round: 'Grupos', group: 1, playerA: 'William Abreo', playerB: 'Oscar Ramirez', status: 'ended' },
  { date: '2026-01-30', time: '15:00', table: 2, round: 'Grupos', group: 2, playerA: 'Victoriano Toloza', playerB: 'Ruben Velez', status: 'ended' },
  { date: '2026-01-30', time: '15:00', table: 3, round: 'Grupos', group: 10, playerA: 'Juan Bueno', playerB: 'Henry Pacheco', status: 'ended' },
  { date: '2026-01-30', time: '15:00', table: 4, round: 'Grupos', group: 11, playerA: 'Antonio Osorio', playerB: 'Daniel Mejia', status: 'ended' },

  // 4:00 p.m.
  { date: '2026-01-30', time: '16:00', table: 1, round: 'Grupos', group: 3, playerA: 'José Manuel Ardila', playerB: 'Victor Manuel Oviedo', status: 'ended' },
  { date: '2026-01-30', time: '16:00', table: 2, round: 'Grupos', group: 4, playerA: 'Luis Miguel Salguero', playerB: 'Javier García M.', status: 'ended' },
  { date: '2026-01-30', time: '16:00', table: 3, round: 'Grupos', group: 5, playerA: 'Alvaro Ortega Sierra', playerB: 'Nicolás Carrero', status: 'ended' },
  { date: '2026-01-30', time: '16:00', table: 4, round: 'Grupos', group: 6, playerA: 'Genaro Villamizar', playerB: 'Ruben Estrada', status: 'ended' },

  // 5:00 p.m.
  { date: '2026-01-30', time: '17:00', table: 1, round: 'Grupos', group: 7, playerA: 'Roberto Fuentes', playerB: 'Gustavo Jimenez', status: 'ended' },
  { date: '2026-01-30', time: '17:00', table: 2, round: 'Grupos', group: 8, playerA: 'Pedro J. Pezzoti', playerB: 'Raul Marquez', status: 'ended' },
  { date: '2026-01-30', time: '17:00', table: 3, round: 'Grupos', group: 9, playerA: 'Hugo Portilla', playerB: 'Fernando Arango', status: 'ended' },
  { date: '2026-01-30', time: '17:00', table: 4, round: 'Grupos', group: 10, playerA: 'Guillermo Herrera', playerB: 'Henry Pacheco', status: 'ended' },

  // 6:00 p.m.
  { date: '2026-01-30', time: '18:00', table: 1, round: 'Grupos', group: 1, playerA: 'David Varón', playerB: 'Argemiro Aguirre', status: 'ended' },
  { date: '2026-01-30', time: '18:00', table: 2, round: 'Grupos', group: 2, playerA: 'Omar Alvarez', playerB: 'Jesus Alberto Sandoval', status: 'ended' },
  { date: '2026-01-30', time: '18:00', table: 3, round: 'Grupos', group: 3, playerA: 'Jorge Leal', playerB: 'José Antonio Parada', status: 'ended' },
  { date: '2026-01-30', time: '18:00', table: 4, round: 'Grupos', group: 11, playerA: 'Eduardo Rodríguez', playerB: 'Daniel Mejia', status: 'ended' },

  // ============================================================
  //  SÁBADO 31 ENERO 2026 – Fase de Grupos (24 partidos)
  // ============================================================

  // 9:00 a.m.
  { date: '2026-01-31', time: '09:00', table: 1, round: 'Grupos', group: 4, playerA: 'Luis Miguel Salguero', playerB: 'Pedro Vasquez', status: 'ended' },
  { date: '2026-01-31', time: '09:00', table: 2, round: 'Grupos', group: 5, playerA: 'Alvaro Ortega Sierra', playerB: 'German Vivas', status: 'ended' },
  { date: '2026-01-31', time: '09:00', table: 3, round: 'Grupos', group: 6, playerA: 'Genaro Villamizar', playerB: 'Franklin Bueno', status: 'ended' },
  { date: '2026-01-31', time: '09:00', table: 4, round: 'Grupos', group: 7, playerA: 'Roberto Fuentes', playerB: 'Fernando Moreno', status: 'ended' },

  // 10:00 a.m.
  { date: '2026-01-31', time: '10:00', table: 1, round: 'Grupos', group: 1, playerA: 'William Abreo', playerB: 'Argemiro Aguirre', status: 'ended' },
  { date: '2026-01-31', time: '10:00', table: 2, round: 'Grupos', group: 2, playerA: 'Victoriano Toloza', playerB: 'Jesus Alberto Sandoval', status: 'ended' },
  { date: '2026-01-31', time: '10:00', table: 3, round: 'Grupos', group: 8, playerA: 'Pedro J. Pezzoti', playerB: 'Henry Pardo', status: 'ended' },
  { date: '2026-01-31', time: '10:00', table: 4, round: 'Grupos', group: 9, playerA: 'Hugo Portilla', playerB: 'Anibal Ortiz', status: 'ended' },

  // 11:00 a.m.
  { date: '2026-01-31', time: '11:00', table: 1, round: 'Grupos', group: 3, playerA: 'José Manuel Ardila', playerB: 'José Antonio Parada', status: 'ended' },
  { date: '2026-01-31', time: '11:00', table: 2, round: 'Grupos', group: 4, playerA: 'Gabriel Monsalve', playerB: 'Javier García M.', status: 'ended' },
  { date: '2026-01-31', time: '11:00', table: 3, round: 'Grupos', group: 5, playerA: 'Javier García', playerB: 'Nicolás Carrero', status: 'ended' },
  { date: '2026-01-31', time: '11:00', table: 4, round: 'Grupos', group: 6, playerA: 'Eugenio Sánchez', playerB: 'Ruben Estrada', status: 'ended' },

  // 12:00 m.
  { date: '2026-01-31', time: '12:00', table: 1, round: 'Grupos', group: 1, playerA: 'David Varón', playerB: 'Oscar Ramirez', status: 'ended' },
  { date: '2026-01-31', time: '12:00', table: 2, round: 'Grupos', group: 7, playerA: 'Carlos Pérez Jr.', playerB: 'Gustavo Jimenez', status: 'ended' },
  { date: '2026-01-31', time: '12:00', table: 3, round: 'Grupos', group: 8, playerA: 'Elkin Florez', playerB: 'Raul Marquez', status: 'ended' },
  { date: '2026-01-31', time: '12:00', table: 4, round: 'Grupos', group: 9, playerA: 'Tulio Rivera', playerB: 'Fernando Arango', status: 'ended' },

  // 2:00 p.m.
  { date: '2026-01-31', time: '14:00', table: 1, round: 'Grupos', group: 2, playerA: 'Omar Alvarez', playerB: 'Ruben Velez', status: 'ended' },
  { date: '2026-01-31', time: '14:00', table: 2, round: 'Grupos', group: 3, playerA: 'Jorge Leal', playerB: 'Victor Manuel Oviedo', status: 'ended' },
  { date: '2026-01-31', time: '14:00', table: 3, round: 'Grupos', group: 4, playerA: 'Gabriel Monsalve', playerB: 'Pedro Vasquez', status: 'ended' },
  { date: '2026-01-31', time: '14:00', table: 4, round: 'Grupos', group: 5, playerA: 'Javier García', playerB: 'German Vivas', status: 'ended' },

  // 3:00 p.m.
  { date: '2026-01-31', time: '15:00', table: 1, round: 'Grupos', group: 6, playerA: 'Eugenio Sánchez', playerB: 'Franklin Bueno', status: 'ended' },
  { date: '2026-01-31', time: '15:00', table: 2, round: 'Grupos', group: 7, playerA: 'Carlos Pérez Jr.', playerB: 'Fernando Moreno', status: 'ended' },
  { date: '2026-01-31', time: '15:00', table: 3, round: 'Grupos', group: 8, playerA: 'Elkin Florez', playerB: 'Henry Pardo', status: 'ended' },
  { date: '2026-01-31', time: '15:00', table: 4, round: 'Grupos', group: 9, playerA: 'Tulio Rivera', playerB: 'Anibal Ortiz', status: 'ended' },
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
  return `${day}/${month}`;
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
}
