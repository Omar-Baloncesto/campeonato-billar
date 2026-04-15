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

  // ============================================================
  //  DOMINGO 1 FEBRERO 2026 – Eliminación 1ra Ronda (desde 9:00 AM)
  // ============================================================
  { date: '2026-02-01', time: '09:00', table: 1, round: '1ra Ronda', playerA: 'José Manuel Ardila', playerB: 'Elkin Florez', scoreA: 15, scoreB: 0, winner: 'José Manuel Ardila', status: 'ended' },
  { date: '2026-02-01', time: '09:00', table: 2, round: '1ra Ronda', playerA: 'David Varón', playerB: 'Gabriel Monsalve', scoreA: 11, scoreB: 14, winner: 'Gabriel Monsalve', status: 'ended' },
  { date: '2026-02-01', time: '10:00', table: 1, round: '1ra Ronda', playerA: 'Pedro Vasquez', playerB: 'German Vivas', scoreA: 15, scoreB: 7, winner: 'Pedro Vasquez', status: 'ended' },
  { date: '2026-02-01', time: '10:00', table: 2, round: '1ra Ronda', playerA: 'Pedro J. Pezzoti', playerB: 'Oscar Ramirez', scoreA: 12, scoreB: 15, winner: 'Oscar Ramirez', status: 'ended' },

  // ============================================================
  //  DOMINGO 1 FEBRERO 2026 – Eliminación 2da Ronda
  // ============================================================
  { date: '2026-02-01', time: '11:00', table: 1, round: '2da Ronda', playerA: 'Hugo Portilla', playerB: 'Henry Pacheco', scoreA: 13, scoreB: 12, winner: 'Hugo Portilla', status: 'ended' },
  { date: '2026-02-01', time: '11:00', table: 2, round: '2da Ronda', playerA: 'Henry Pardo', playerB: 'Nicolás Carrero', scoreA: 15, scoreB: 4, winner: 'Henry Pardo', status: 'ended' },
  { date: '2026-02-01', time: '12:00', table: 1, round: '2da Ronda', playerA: 'Daniel Mejia', playerB: 'Omar Alvarez', scoreA: 15, scoreB: 10, winner: 'Daniel Mejia', status: 'ended' },

  // ============================================================
  //  DOMINGO 1 FEBRERO 2026 – Octavos de Final
  // ============================================================
  { date: '2026-02-01', time: '14:00', table: 1, round: 'Octavos', playerA: 'Hugo Portilla', playerB: 'William Abreo', scoreA: 12, scoreB: 10, winner: 'Hugo Portilla', status: 'ended' },
  { date: '2026-02-01', time: '14:00', table: 2, round: 'Octavos', playerA: 'Henry Pardo', playerB: 'Eugenio Sánchez', scoreA: 8, scoreB: 15, winner: 'Eugenio Sánchez', status: 'ended' },
  { date: '2026-02-01', time: '15:00', table: 1, round: 'Octavos', playerA: 'Luis Miguel Salguero', playerB: 'Alvaro Ortega Sierra', scoreA: 15, scoreB: 4, winner: 'Luis Miguel Salguero', status: 'ended' },
  { date: '2026-02-01', time: '15:00', table: 2, round: 'Octavos', playerA: 'Javier García', playerB: 'Jorge Leal', scoreA: 14, scoreB: 8, winner: 'Javier García', status: 'ended' },
  { date: '2026-02-01', time: '16:00', table: 1, round: 'Octavos', playerA: 'Franklin Bueno', playerB: 'Fernando Moreno', scoreA: 5, scoreB: 10, winner: 'Fernando Moreno', status: 'ended' },
  { date: '2026-02-01', time: '16:00', table: 2, round: 'Octavos', playerA: 'Argemiro Aguirre', playerB: 'Antonio Osorio', scoreA: 12, scoreB: 8, winner: 'Argemiro Aguirre', status: 'ended' },
  { date: '2026-02-01', time: '17:00', table: 1, round: 'Octavos', playerA: 'Gabriel Monsalve', playerB: 'Victor Manuel Oviedo', scoreA: 6, scoreB: 3, winner: 'Gabriel Monsalve', status: 'ended' },
  { date: '2026-02-01', time: '17:00', table: 2, round: 'Octavos', playerA: 'Daniel Mejia', playerB: 'Oscar Ramirez', scoreA: 10, scoreB: 7, winner: 'Daniel Mejia', status: 'ended' },

  // ============================================================
  //  LUNES 2 FEBRERO 2026 – Cuartos de Final (desde 9:00 AM)
  // ============================================================
  { date: '2026-02-02', time: '09:00', table: 1, round: 'Cuartos', playerA: 'Hugo Portilla', playerB: 'Gabriel Monsalve', scoreA: 15, scoreB: 12, winner: 'Hugo Portilla', status: 'ended' },
  { date: '2026-02-02', time: '09:00', table: 2, round: 'Cuartos', playerA: 'Eugenio Sánchez', playerB: 'Argemiro Aguirre', scoreA: 8, scoreB: 15, winner: 'Argemiro Aguirre', status: 'ended' },
  { date: '2026-02-02', time: '10:00', table: 1, round: 'Cuartos', playerA: 'Luis Miguel Salguero', playerB: 'Daniel Mejia', scoreA: 15, scoreB: 11, winner: 'Luis Miguel Salguero', status: 'ended' },
  { date: '2026-02-02', time: '10:00', table: 2, round: 'Cuartos', playerA: 'Javier García', playerB: 'Fernando Moreno', scoreA: 9, scoreB: 8, winner: 'Javier García', status: 'ended' },

  // ============================================================
  //  LUNES 2 FEBRERO 2026 – Semifinales
  // ============================================================
  { date: '2026-02-02', time: '14:00', table: 1, round: 'Semifinal', playerA: 'Hugo Portilla', playerB: 'Javier García', scoreA: 6, scoreB: 8, winner: 'Javier García', status: 'ended' },
  { date: '2026-02-02', time: '14:00', table: 2, round: 'Semifinal', playerA: 'Argemiro Aguirre', playerB: 'Luis Miguel Salguero', scoreA: 7, scoreB: 15, winner: 'Luis Miguel Salguero', status: 'ended' },

  // ============================================================
  //  LUNES 2 FEBRERO 2026 – FINAL
  // ============================================================
  { date: '2026-02-02', time: '17:00', table: 1, round: 'Final', playerA: 'Javier García', playerB: 'Luis Miguel Salguero', scoreA: 20, scoreB: 18, winner: 'Javier García', status: 'ended' },
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
