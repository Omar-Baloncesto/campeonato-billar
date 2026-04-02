import type { GroupResult, GroupData } from './types';

export const GROUP_RESULTS: GroupResult[] = [
  // Grupo 1
  { group: 1, match: 1, playerA: 'William Abreo', carambolasA: 11, entriesA: 30, averageA: 0.367, playerB: 'David Varón', carambolasB: 5, entriesB: 30, averageB: 0.167, winner: 'William Abreo', walkover: false },
  { group: 1, match: 2, playerA: 'William Abreo', carambolasA: 15, entriesA: 28, averageA: 0.536, playerB: 'Oscar Ramirez', carambolasB: 3, entriesB: 28, averageB: 0.107, winner: 'William Abreo', walkover: false },
  { group: 1, match: 3, playerA: 'William Abreo', carambolasA: 4, entriesA: 24, averageA: 0.167, playerB: 'Argemiro Aguirre', carambolasB: 15, entriesB: 24, averageB: 0.625, winner: 'Argemiro Aguirre', walkover: false },
  { group: 1, match: 4, playerA: 'David Varón', carambolasA: 8, entriesA: 30, averageA: 0.267, playerB: 'Oscar Ramirez', carambolasB: 8, entriesB: 30, averageB: 0.267, winner: 'EMPATE', walkover: false },
  { group: 1, match: 5, playerA: 'David Varón', carambolasA: 11, entriesA: 30, averageA: 0.367, playerB: 'Argemiro Aguirre', carambolasB: 8, entriesB: 30, averageB: 0.267, winner: 'David Varón', walkover: false },
  { group: 1, match: 6, playerA: 'Oscar Ramirez', carambolasA: 11, entriesA: 30, averageA: 0.367, playerB: 'Argemiro Aguirre', carambolasB: 13, entriesB: 30, averageB: 0.433, winner: 'Argemiro Aguirre', walkover: false },
  // Grupo 2
  { group: 2, match: 1, playerA: 'Victoriano Toloza', carambolasA: 8, entriesA: 30, averageA: 0.267, playerB: 'Omar Alvarez', carambolasB: 7, entriesB: 30, averageB: 0.233, winner: 'Victoriano Toloza', walkover: false },
  { group: 2, match: 2, playerA: 'Victoriano Toloza', carambolasA: 9, entriesA: 30, averageA: 0.300, playerB: 'Ruben Velez', carambolasB: 7, entriesB: 30, averageB: 0.233, winner: 'Victoriano Toloza', walkover: false },
  { group: 2, match: 3, playerA: 'Victoriano Toloza', carambolasA: 7, entriesA: 30, averageA: 0.233, playerB: 'Jesus Alberto Sandoval', carambolasB: 2, entriesB: 30, averageB: 0.067, winner: 'Victoriano Toloza', walkover: false },
  { group: 2, match: 4, playerA: 'Omar Alvarez', carambolasA: 4, entriesA: 30, averageA: 0.133, playerB: 'Ruben Velez', carambolasB: 5, entriesB: 30, averageB: 0.167, winner: 'Ruben Velez', walkover: false },
  { group: 2, match: 5, playerA: 'Omar Alvarez', carambolasA: 10, entriesA: 30, averageA: 0.333, playerB: 'Jesus Alberto Sandoval', carambolasB: 7, entriesB: 30, averageB: 0.233, winner: 'Omar Alvarez', walkover: false },
  { group: 2, match: 6, playerA: 'Ruben Velez', carambolasA: 3, entriesA: 30, averageA: 0.100, playerB: 'Jesus Alberto Sandoval', carambolasB: 4, entriesB: 30, averageB: 0.133, winner: 'Jesus Alberto Sandoval', walkover: false },
  // Grupo 3
  { group: 3, match: 1, playerA: 'José Manuel Ardila', carambolasA: 10, entriesA: 30, averageA: 0.333, playerB: 'Jorge Leal', carambolasB: 10, entriesB: 30, averageB: 0.333, winner: 'EMPATE', walkover: false },
  { group: 3, match: 2, playerA: 'José Manuel Ardila', carambolasA: 14, entriesA: 30, averageA: 0.467, playerB: 'Victor Manuel Oviedo', carambolasB: 15, entriesB: 30, averageB: 0.500, winner: 'Victor Manuel Oviedo', walkover: false },
  { group: 3, match: 3, playerA: 'José Manuel Ardila', carambolasA: 6, entriesA: 30, averageA: 0.200, playerB: 'José Antonio Parada', carambolasB: 4, entriesB: 30, averageB: 0.133, winner: 'José Manuel Ardila', walkover: false },
  { group: 3, match: 4, playerA: 'Jorge Leal', carambolasA: 5, entriesA: 30, averageA: 0.167, playerB: 'Victor Manuel Oviedo', carambolasB: 8, entriesB: 30, averageB: 0.267, winner: 'Victor Manuel Oviedo', walkover: false },
  { group: 3, match: 5, playerA: 'Jorge Leal', carambolasA: 10, entriesA: 30, averageA: 0.333, playerB: 'José Antonio Parada', carambolasB: 3, entriesB: 30, averageB: 0.100, winner: 'Jorge Leal', walkover: false },
  { group: 3, match: 6, playerA: 'Victor Manuel Oviedo', carambolasA: 10, entriesA: 30, averageA: 0.333, playerB: 'José Antonio Parada', carambolasB: 14, entriesB: 30, averageB: 0.467, winner: 'José Antonio Parada', walkover: false },
  // Grupo 4
  { group: 4, match: 1, playerA: 'Luis Miguel Salguero', carambolasA: 12, entriesA: 30, averageA: 0.400, playerB: 'Gabriel Monsalve', carambolasB: 10, entriesB: 30, averageB: 0.333, winner: 'Luis Miguel Salguero', walkover: false },
  { group: 4, match: 2, playerA: 'Luis Miguel Salguero', carambolasA: 15, entriesA: 30, averageA: 0.500, playerB: 'Javier García M.', carambolasB: 0, entriesB: 0, averageB: 0, winner: 'W.O.', walkover: true },
  { group: 4, match: 3, playerA: 'Luis Miguel Salguero', carambolasA: 11, entriesA: 30, averageA: 0.367, playerB: 'Pedro Vasquez', carambolasB: 10, entriesB: 30, averageB: 0.333, winner: 'Luis Miguel Salguero', walkover: false },
  { group: 4, match: 4, playerA: 'Gabriel Monsalve', carambolasA: 7, entriesA: 30, averageA: 0.233, playerB: 'Javier García M.', carambolasB: 11, entriesB: 30, averageB: 0.367, winner: 'Javier García M.', walkover: false },
  { group: 4, match: 5, playerA: 'Gabriel Monsalve', carambolasA: 8, entriesA: 30, averageA: 0.267, playerB: 'Pedro Vasquez', carambolasB: 13, entriesB: 30, averageB: 0.433, winner: 'Pedro Vasquez', walkover: false },
  { group: 4, match: 6, playerA: 'Javier García M.', carambolasA: 8, entriesA: 30, averageA: 0.267, playerB: 'Pedro Vasquez', carambolasB: 7, entriesB: 30, averageB: 0.233, winner: 'Javier García M.', walkover: false },
  // Grupo 5
  { group: 5, match: 1, playerA: 'Alvaro Ortega Sierra', carambolasA: 4, entriesA: 30, averageA: 0.133, playerB: 'Javier García', carambolasB: 6, entriesB: 30, averageB: 0.200, winner: 'Javier García', walkover: false },
  { group: 5, match: 2, playerA: 'Alvaro Ortega Sierra', carambolasA: 15, entriesA: 30, averageA: 0.500, playerB: 'Nicolás Carrero', carambolasB: 0, entriesB: 0, averageB: 0, winner: 'W.O.', walkover: true },
  { group: 5, match: 3, playerA: 'Alvaro Ortega Sierra', carambolasA: 11, entriesA: 30, averageA: 0.367, playerB: 'German Vivas', carambolasB: 6, entriesB: 30, averageB: 0.200, winner: 'Alvaro Ortega Sierra', walkover: false },
  { group: 5, match: 4, playerA: 'Javier García', carambolasA: 8, entriesA: 30, averageA: 0.267, playerB: 'Nicolás Carrero', carambolasB: 5, entriesB: 30, averageB: 0.167, winner: 'Javier García', walkover: false },
  { group: 5, match: 5, playerA: 'Javier García', carambolasA: 11, entriesA: 30, averageA: 0.367, playerB: 'German Vivas', carambolasB: 8, entriesB: 30, averageB: 0.267, winner: 'Javier García', walkover: false },
  { group: 5, match: 6, playerA: 'Nicolás Carrero', carambolasA: 7, entriesA: 30, averageA: 0.233, playerB: 'German Vivas', carambolasB: 5, entriesB: 30, averageB: 0.167, winner: 'Nicolás Carrero', walkover: false },
  // Grupo 6
  { group: 6, match: 1, playerA: 'Genaro Villamizar', carambolasA: 13, entriesA: 30, averageA: 0.433, playerB: 'Eugenio Sánchez', carambolasB: 9, entriesB: 30, averageB: 0.300, winner: 'Genaro Villamizar', walkover: false },
  { group: 6, match: 2, playerA: 'Genaro Villamizar', carambolasA: 4, entriesA: 30, averageA: 0.133, playerB: 'Ruben Estrada', carambolasB: 4, entriesB: 30, averageB: 0.133, winner: 'EMPATE', walkover: false },
  { group: 6, match: 3, playerA: 'Genaro Villamizar', carambolasA: 9, entriesA: 30, averageA: 0.300, playerB: 'Franklin Bueno', carambolasB: 3, entriesB: 30, averageB: 0.100, winner: 'Genaro Villamizar', walkover: false },
  { group: 6, match: 4, playerA: 'Eugenio Sánchez', carambolasA: 10, entriesA: 30, averageA: 0.333, playerB: 'Ruben Estrada', carambolasB: 5, entriesB: 30, averageB: 0.167, winner: 'Eugenio Sánchez', walkover: false },
  { group: 6, match: 5, playerA: 'Eugenio Sánchez', carambolasA: 11, entriesA: 30, averageA: 0.367, playerB: 'Franklin Bueno', carambolasB: 7, entriesB: 30, averageB: 0.233, winner: 'Eugenio Sánchez', walkover: false },
  { group: 6, match: 6, playerA: 'Ruben Estrada', carambolasA: 5, entriesA: 30, averageA: 0.167, playerB: 'Franklin Bueno', carambolasB: 5, entriesB: 30, averageB: 0.167, winner: 'EMPATE', walkover: false },
  // Grupo 7
  { group: 7, match: 1, playerA: 'Roberto Fuentes', carambolasA: 5, entriesA: 30, averageA: 0.167, playerB: 'Carlos Pérez Jr.', carambolasB: 6, entriesB: 30, averageB: 0.200, winner: 'Carlos Pérez Jr.', walkover: false },
  { group: 7, match: 2, playerA: 'Roberto Fuentes', carambolasA: 11, entriesA: 30, averageA: 0.367, playerB: 'Gustavo Jimenez', carambolasB: 9, entriesB: 30, averageB: 0.300, winner: 'Roberto Fuentes', walkover: false },
  { group: 7, match: 3, playerA: 'Roberto Fuentes', carambolasA: 15, entriesA: 30, averageA: 0.500, playerB: 'Fernando Moreno', carambolasB: 12, entriesB: 30, averageB: 0.400, winner: 'Roberto Fuentes', walkover: false },
  { group: 7, match: 4, playerA: 'Carlos Pérez Jr.', carambolasA: 5, entriesA: 30, averageA: 0.167, playerB: 'Gustavo Jimenez', carambolasB: 6, entriesB: 30, averageB: 0.200, winner: 'Gustavo Jimenez', walkover: false },
  { group: 7, match: 5, playerA: 'Carlos Pérez Jr.', carambolasA: 3, entriesA: 30, averageA: 0.100, playerB: 'Fernando Moreno', carambolasB: 7, entriesB: 30, averageB: 0.233, winner: 'Fernando Moreno', walkover: false },
  { group: 7, match: 6, playerA: 'Gustavo Jimenez', carambolasA: 10, entriesA: 30, averageA: 0.333, playerB: 'Fernando Moreno', carambolasB: 10, entriesB: 30, averageB: 0.333, winner: 'EMPATE', walkover: false },
  // Grupo 8
  { group: 8, match: 1, playerA: 'Pedro J. Pezzoti', carambolasA: 14, entriesA: 30, averageA: 0.467, playerB: 'Elkin Florez', carambolasB: 6, entriesB: 30, averageB: 0.200, winner: 'Pedro J. Pezzoti', walkover: false },
  { group: 8, match: 2, playerA: 'Pedro J. Pezzoti', carambolasA: 11, entriesA: 29, averageA: 0.379, playerB: 'Raul Marquez', carambolasB: 15, entriesB: 29, averageB: 0.517, winner: 'Raul Marquez', walkover: false },
  { group: 8, match: 3, playerA: 'Pedro J. Pezzoti', carambolasA: 13, entriesA: 29, averageA: 0.448, playerB: 'Henry Pardo', carambolasB: 15, entriesB: 29, averageB: 0.517, winner: 'Henry Pardo', walkover: false },
  { group: 8, match: 4, playerA: 'Elkin Florez', carambolasA: 0, entriesA: 0, averageA: 0, playerB: 'Raul Marquez', carambolasB: 15, entriesB: 20, averageB: 0.750, winner: 'W.O.', walkover: true },
  { group: 8, match: 5, playerA: 'Elkin Florez', carambolasA: 0, entriesA: 0, averageA: 0, playerB: 'Henry Pardo', carambolasB: 15, entriesB: 20, averageB: 0.750, winner: 'W.O.', walkover: true },
  { group: 8, match: 6, playerA: 'Raul Marquez', carambolasA: 6, entriesA: 30, averageA: 0.200, playerB: 'Henry Pardo', carambolasB: 12, entriesB: 30, averageB: 0.400, winner: 'Henry Pardo', walkover: false },
  // Grupo 9
  { group: 9, match: 1, playerA: 'Hugo Portilla', carambolasA: 15, entriesA: 24, averageA: 0.625, playerB: 'Tulio Rivera', carambolasB: 4, entriesB: 24, averageB: 0.167, winner: 'Hugo Portilla', walkover: false },
  { group: 9, match: 2, playerA: 'Hugo Portilla', carambolasA: 15, entriesA: 25, averageA: 0.600, playerB: 'Fernando Arango', carambolasB: 14, entriesB: 25, averageB: 0.560, winner: 'Hugo Portilla', walkover: false },
  { group: 9, match: 3, playerA: 'Hugo Portilla', carambolasA: 15, entriesA: 30, averageA: 0.500, playerB: 'Anibal Ortiz', carambolasB: 0, entriesB: 0, averageB: 0, winner: 'W.O.', walkover: true },
  { group: 9, match: 4, playerA: 'Tulio Rivera', carambolasA: 6, entriesA: 26, averageA: 0.231, playerB: 'Fernando Arango', carambolasB: 15, entriesB: 26, averageB: 0.577, winner: 'Fernando Arango', walkover: false },
  { group: 9, match: 5, playerA: 'Tulio Rivera', carambolasA: 15, entriesA: 30, averageA: 0.500, playerB: 'Anibal Ortiz', carambolasB: 0, entriesB: 0, averageB: 0, winner: 'W.O.', walkover: true },
  { group: 9, match: 6, playerA: 'Fernando Arango', carambolasA: 9, entriesA: 30, averageA: 0.300, playerB: 'Anibal Ortiz', carambolasB: 5, entriesB: 30, averageB: 0.167, winner: 'Fernando Arango', walkover: false },
  // Grupo 10
  { group: 10, match: 1, playerA: 'Juan Bueno', carambolasA: 1, entriesA: 30, averageA: 0.033, playerB: 'Guillermo Herrera', carambolasB: 1, entriesB: 30, averageB: 0.033, winner: 'EMPATE', walkover: false },
  { group: 10, match: 2, playerA: 'Juan Bueno', carambolasA: 15, entriesA: 30, averageA: 0.500, playerB: 'Henry Pacheco', carambolasB: 0, entriesB: 0, averageB: 0, winner: 'W.O.', walkover: true },
  { group: 10, match: 3, playerA: 'Guillermo Herrera', carambolasA: 15, entriesA: 30, averageA: 0.500, playerB: 'Henry Pacheco', carambolasB: 0, entriesB: 0, averageB: 0, winner: 'W.O.', walkover: true },
  // Grupo 11
  { group: 11, match: 1, playerA: 'Antonio Osorio', carambolasA: 15, entriesA: 30, averageA: 0.500, playerB: 'Eduardo Rodríguez', carambolasB: 0, entriesB: 0, averageB: 0, winner: 'W.O.', walkover: true },
  { group: 11, match: 2, playerA: 'Antonio Osorio', carambolasA: 6, entriesA: 30, averageA: 0.200, playerB: 'Daniel Mejia', carambolasB: 6, entriesB: 30, averageB: 0.200, winner: 'EMPATE', walkover: false },
  { group: 11, match: 3, playerA: 'Eduardo Rodríguez', carambolasA: 0, entriesA: 0, averageA: 0, playerB: 'Daniel Mejia', carambolasB: 15, entriesB: 30, averageB: 0.500, winner: 'W.O.', walkover: true },
];

export const GROUP_STANDINGS: GroupData[] = [
  {
    number: 1,
    standings: [
      { position: 1, player: 'Argemiro Aguirre', caP1: 15, caP2: 8, caP3: 13, totalCA: 36, crP1: 4, crP2: 11, crP3: 11, totalCR: 26, differential: 10, ptsP1: 2, ptsP2: 0, ptsP3: 2, totalPts: 4, groupOrder: 1, generalClassification: 7 },
      { position: 2, player: 'William Abreo', caP1: 11, caP2: 15, caP3: 4, totalCA: 30, crP1: 5, crP2: 3, crP3: 15, totalCR: 23, differential: 7, ptsP1: 2, ptsP2: 2, ptsP3: 0, totalPts: 4, groupOrder: 2, generalClassification: 17 },
      { position: 3, player: 'David Varón', caP1: 5, caP2: 8, caP3: 11, totalCA: 24, crP1: 11, crP2: 8, crP3: 8, totalCR: 27, differential: -3, ptsP1: 0, ptsP2: 1, ptsP3: 2, totalPts: 3, groupOrder: 3, generalClassification: 25 },
      { position: 4, player: 'Oscar Ramirez', caP1: 3, caP2: 8, caP3: 11, totalCA: 22, crP1: 15, crP2: 8, crP3: 13, totalCR: 36, differential: -14, ptsP1: 0, ptsP2: 1, ptsP3: 0, totalPts: 1, groupOrder: 4, generalClassification: 38 },
    ],
  },
  {
    number: 2,
    standings: [
      { position: 1, player: 'Victoriano Toloza', caP1: 8, caP2: 9, caP3: 7, totalCA: 24, crP1: 7, crP2: 7, crP3: 2, totalCR: 16, differential: 8, ptsP1: 2, ptsP2: 2, ptsP3: 2, totalPts: 6, groupOrder: 1, generalClassification: 5 },
      { position: 2, player: 'Omar Alvarez', caP1: 7, caP2: 4, caP3: 10, totalCA: 21, crP1: 8, crP2: 5, crP3: 7, totalCR: 20, differential: 1, ptsP1: 0, ptsP2: 0, ptsP3: 2, totalPts: 2, groupOrder: 2, generalClassification: 22 },
      { position: 3, player: 'Ruben Velez', caP1: 7, caP2: 5, caP3: 3, totalCA: 15, crP1: 9, crP2: 4, crP3: 4, totalCR: 17, differential: -2, ptsP1: 0, ptsP2: 2, ptsP3: 0, totalPts: 2, groupOrder: 3, generalClassification: 28 },
      { position: 4, player: 'Jesus Alberto Sandoval', caP1: 2, caP2: 7, caP3: 4, totalCA: 13, crP1: 7, crP2: 10, crP3: 3, totalCR: 20, differential: -7, ptsP1: 0, ptsP2: 0, ptsP3: 2, totalPts: 2, groupOrder: 4, generalClassification: 36 },
    ],
  },
  {
    number: 3,
    standings: [
      { position: 1, player: 'Victor Manuel Oviedo', caP1: 15, caP2: 8, caP3: 10, totalCA: 33, crP1: 14, crP2: 5, crP3: 14, totalCR: 33, differential: 0, ptsP1: 2, ptsP2: 2, ptsP3: 0, totalPts: 4, groupOrder: 1, generalClassification: 9 },
      { position: 2, player: 'Jorge Leal', caP1: 10, caP2: 5, caP3: 10, totalCA: 25, crP1: 10, crP2: 8, crP3: 3, totalCR: 21, differential: 4, ptsP1: 1, ptsP2: 0, ptsP3: 2, totalPts: 3, groupOrder: 2, generalClassification: 20 },
      { position: 3, player: 'José Manuel Ardila', caP1: 10, caP2: 14, caP3: 6, totalCA: 30, crP1: 10, crP2: 15, crP3: 4, totalCR: 29, differential: 1, ptsP1: 1, ptsP2: 0, ptsP3: 2, totalPts: 3, groupOrder: 3, generalClassification: 23 },
      { position: 4, player: 'José Antonio Parada', caP1: 4, caP2: 3, caP3: 14, totalCA: 21, crP1: 6, crP2: 10, crP3: 10, totalCR: 26, differential: -5, ptsP1: 0, ptsP2: 0, ptsP3: 2, totalPts: 2, groupOrder: 4, generalClassification: 35 },
    ],
  },
  {
    number: 4,
    standings: [
      { position: 1, player: 'Luis Miguel Salguero', caP1: 12, caP2: 15, caP3: 11, totalCA: 38, crP1: 10, crP2: 0, crP3: 10, totalCR: 20, differential: 18, ptsP1: 2, ptsP2: 2, ptsP3: 2, totalPts: 6, groupOrder: 1, generalClassification: 3 },
      { position: 2, player: 'Javier García M.', caP1: 0, caP2: 11, caP3: 8, totalCA: 19, crP1: 15, crP2: 7, crP3: 7, totalCR: 29, differential: -10, ptsP1: 0, ptsP2: 2, ptsP3: 2, totalPts: 4, groupOrder: 2, generalClassification: 19 },
      { position: 3, player: 'Pedro Vasquez', caP1: 10, caP2: 13, caP3: 7, totalCA: 30, crP1: 11, crP2: 8, crP3: 8, totalCR: 27, differential: 3, ptsP1: 0, ptsP2: 2, ptsP3: 0, totalPts: 2, groupOrder: 3, generalClassification: 26 },
      { position: 4, player: 'Gabriel Monsalve', caP1: 10, caP2: 7, caP3: 8, totalCA: 25, crP1: 12, crP2: 11, crP3: 13, totalCR: 36, differential: -11, ptsP1: 0, ptsP2: 0, ptsP3: 0, totalPts: 0, groupOrder: 4, generalClassification: 40 },
    ],
  },
  {
    number: 5,
    standings: [
      { position: 1, player: 'Javier García', caP1: 6, caP2: 8, caP3: 11, totalCA: 25, crP1: 4, crP2: 5, crP3: 8, totalCR: 17, differential: 8, ptsP1: 2, ptsP2: 2, ptsP3: 2, totalPts: 6, groupOrder: 1, generalClassification: 4 },
      { position: 2, player: 'Alvaro Ortega Sierra', caP1: 4, caP2: 15, caP3: 11, totalCA: 30, crP1: 6, crP2: 0, crP3: 6, totalCR: 12, differential: 18, ptsP1: 0, ptsP2: 2, ptsP3: 2, totalPts: 4, groupOrder: 2, generalClassification: 14 },
      { position: 3, player: 'Nicolás Carrero', caP1: 0, caP2: 5, caP3: 7, totalCA: 12, crP1: 15, crP2: 8, crP3: 5, totalCR: 28, differential: -16, ptsP1: 0, ptsP2: 0, ptsP3: 2, totalPts: 2, groupOrder: 3, generalClassification: 31 },
      { position: 4, player: 'German Vivas', caP1: 6, caP2: 8, caP3: 5, totalCA: 19, crP1: 11, crP2: 11, crP3: 7, totalCR: 29, differential: -10, ptsP1: 0, ptsP2: 0, ptsP3: 0, totalPts: 0, groupOrder: 4, generalClassification: 39 },
    ],
  },
  {
    number: 6,
    standings: [
      { position: 1, player: 'Genaro Villamizar', caP1: 13, caP2: 4, caP3: 9, totalCA: 26, crP1: 9, crP2: 4, crP3: 3, totalCR: 16, differential: 10, ptsP1: 2, ptsP2: 1, ptsP3: 2, totalPts: 5, groupOrder: 1, generalClassification: 6 },
      { position: 2, player: 'Eugenio Sánchez', caP1: 9, caP2: 10, caP3: 11, totalCA: 30, crP1: 13, crP2: 5, crP3: 7, totalCR: 25, differential: 5, ptsP1: 0, ptsP2: 2, ptsP3: 2, totalPts: 4, groupOrder: 2, generalClassification: 18 },
      { position: 3, player: 'Ruben Estrada', caP1: 4, caP2: 5, caP3: 5, totalCA: 14, crP1: 4, crP2: 10, crP3: 5, totalCR: 19, differential: -5, ptsP1: 1, ptsP2: 0, ptsP3: 1, totalPts: 2, groupOrder: 3, generalClassification: 30 },
      { position: 4, player: 'Franklin Bueno', caP1: 3, caP2: 7, caP3: 5, totalCA: 15, crP1: 9, crP2: 11, crP3: 5, totalCR: 25, differential: -10, ptsP1: 0, ptsP2: 0, ptsP3: 1, totalPts: 1, groupOrder: 4, generalClassification: 37 },
    ],
  },
  {
    number: 7,
    standings: [
      { position: 1, player: 'Roberto Fuentes', caP1: 5, caP2: 11, caP3: 15, totalCA: 31, crP1: 6, crP2: 9, crP3: 12, totalCR: 27, differential: 4, ptsP1: 0, ptsP2: 2, ptsP3: 2, totalPts: 4, groupOrder: 1, generalClassification: 8 },
      { position: 2, player: 'Fernando Moreno', caP1: 12, caP2: 7, caP3: 10, totalCA: 29, crP1: 15, crP2: 3, crP3: 10, totalCR: 28, differential: 1, ptsP1: 0, ptsP2: 2, ptsP3: 1, totalPts: 3, groupOrder: 2, generalClassification: 21 },
      { position: 3, player: 'Gustavo Jimenez', caP1: 9, caP2: 6, caP3: 10, totalCA: 25, crP1: 11, crP2: 5, crP3: 10, totalCR: 26, differential: -1, ptsP1: 0, ptsP2: 2, ptsP3: 1, totalPts: 3, groupOrder: 3, generalClassification: 24 },
      { position: 4, player: 'Carlos Pérez Jr.', caP1: 6, caP2: 5, caP3: 3, totalCA: 14, crP1: 5, crP2: 6, crP3: 7, totalCR: 18, differential: -4, ptsP1: 2, ptsP2: 0, ptsP3: 0, totalPts: 2, groupOrder: 4, generalClassification: 34 },
    ],
  },
  {
    number: 8,
    standings: [
      { position: 1, player: 'Henry Pardo', caP1: 15, caP2: 15, caP3: 12, totalCA: 42, crP1: 13, crP2: 0, crP3: 6, totalCR: 19, differential: 23, ptsP1: 2, ptsP2: 2, ptsP3: 2, totalPts: 6, groupOrder: 1, generalClassification: 2 },
      { position: 2, player: 'Raul Marquez', caP1: 15, caP2: 15, caP3: 6, totalCA: 36, crP1: 11, crP2: 0, crP3: 12, totalCR: 23, differential: 13, ptsP1: 2, ptsP2: 2, ptsP3: 0, totalPts: 4, groupOrder: 2, generalClassification: 15 },
      { position: 3, player: 'Pedro J. Pezzoti', caP1: 14, caP2: 11, caP3: 13, totalCA: 38, crP1: 6, crP2: 15, crP3: 15, totalCR: 36, differential: 2, ptsP1: 2, ptsP2: 0, ptsP3: 0, totalPts: 2, groupOrder: 3, generalClassification: 27 },
      { position: 4, player: 'Elkin Florez', caP1: 6, caP2: 0, caP3: 0, totalCA: 6, crP1: 14, crP2: 15, crP3: 15, totalCR: 44, differential: -38, ptsP1: 0, ptsP2: 0, ptsP3: 0, totalPts: 0, groupOrder: 4, generalClassification: 42 },
    ],
  },
  {
    number: 9,
    standings: [
      { position: 1, player: 'Hugo Portilla', caP1: 15, caP2: 15, caP3: 15, totalCA: 45, crP1: 4, crP2: 14, crP3: 0, totalCR: 18, differential: 27, ptsP1: 2, ptsP2: 2, ptsP3: 2, totalPts: 6, groupOrder: 1, generalClassification: 1 },
      { position: 2, player: 'Fernando Arango', caP1: 14, caP2: 15, caP3: 9, totalCA: 38, crP1: 15, crP2: 6, crP3: 5, totalCR: 26, differential: 12, ptsP1: 0, ptsP2: 2, ptsP3: 2, totalPts: 4, groupOrder: 2, generalClassification: 16 },
      { position: 3, player: 'Tulio Rivera', caP1: 4, caP2: 6, caP3: 15, totalCA: 25, crP1: 15, crP2: 15, crP3: 0, totalCR: 30, differential: -5, ptsP1: 0, ptsP2: 0, ptsP3: 2, totalPts: 2, groupOrder: 3, generalClassification: 29 },
      { position: 4, player: 'Anibal Ortiz', caP1: 0, caP2: 0, caP3: 5, totalCA: 5, crP1: 15, crP2: 15, crP3: 9, totalCR: 39, differential: -34, ptsP1: 0, ptsP2: 0, ptsP3: 0, totalPts: 0, groupOrder: 4, generalClassification: 41 },
    ],
  },
  {
    number: 10,
    standings: [
      { position: 1, player: 'Juan Bueno', caP1: 1, caP2: 15, caP3: null, totalCA: 16, crP1: 1, crP2: 0, crP3: null, totalCR: 1, differential: 15, ptsP1: 1, ptsP2: 2, ptsP3: null, totalPts: 3, groupOrder: 1, generalClassification: 12 },
      { position: 2, player: 'Guillermo Herrera', caP1: 1, caP2: 15, caP3: null, totalCA: 16, crP1: 1, crP2: 0, crP3: null, totalCR: 1, differential: 15, ptsP1: 1, ptsP2: 2, ptsP3: null, totalPts: 3, groupOrder: 1, generalClassification: 13 },
      { position: 3, player: 'Henry Pacheco', caP1: 0, caP2: 0, caP3: null, totalCA: 0, crP1: 15, crP2: 15, crP3: null, totalCR: 30, differential: -30, ptsP1: 0, ptsP2: 0, ptsP3: null, totalPts: 0, groupOrder: 3, generalClassification: 32 },
    ],
  },
  {
    number: 11,
    standings: [
      { position: 1, player: 'Antonio Osorio', caP1: 15, caP2: 6, caP3: null, totalCA: 21, crP1: 0, crP2: 6, crP3: null, totalCR: 6, differential: 15, ptsP1: 2, ptsP2: 1, ptsP3: null, totalPts: 3, groupOrder: 1, generalClassification: 10 },
      { position: 2, player: 'Daniel Mejia', caP1: 6, caP2: 15, caP3: null, totalCA: 21, crP1: 6, crP2: 0, crP3: null, totalCR: 6, differential: 15, ptsP1: 1, ptsP2: 2, ptsP3: null, totalPts: 3, groupOrder: 1, generalClassification: 11 },
      { position: 3, player: 'Eduardo Rodríguez', caP1: 0, caP2: 0, caP3: null, totalCA: 0, crP1: 15, crP2: 15, crP3: null, totalCR: 30, differential: -30, ptsP1: 0, ptsP2: 0, ptsP3: null, totalPts: 0, groupOrder: 3, generalClassification: 33 },
    ],
  },
];
