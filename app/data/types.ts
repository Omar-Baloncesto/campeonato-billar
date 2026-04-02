export interface TournamentConfig {
  totalPlayers: number;
  playersPerGroup: number;
  totalGroups: number;
  category: string;
  carambolasPreliminary: number;
  carambolasSemifinal: number;
  carambolasFinal: number;
  entriesLimit: number;
  timePerEntry: number;
}

export interface Player {
  id: number;
  name: string;
  group: number;
  category: string;
  active: boolean;
  city: string;
}

export interface GroupResult {
  group: number;
  match: number;
  playerA: string;
  carambolasA: number;
  entriesA: number;
  averageA: number;
  playerB: string;
  carambolasB: number;
  entriesB: number;
  averageB: number;
  winner: string;
  walkover: boolean;
}

export interface GroupStanding {
  position: number;
  player: string;
  caP1: number;
  caP2: number;
  caP3: number | null;
  totalCA: number;
  crP1: number;
  crP2: number;
  crP3: number | null;
  totalCR: number;
  differential: number;
  ptsP1: number;
  ptsP2: number;
  ptsP3: number | null;
  totalPts: number;
  groupOrder: number;
  generalClassification: number;
}

export interface GroupData {
  number: number;
  standings: GroupStanding[];
}

export interface EliminationMatch {
  round: number;
  match: number;
  playerA: string;
  entriesA: number;
  carambolasA: number;
  averageA: number;
  playerB: string;
  entriesB: number;
  carambolasB: number;
  averageB: number;
  winner: string;
  isBye: boolean;
}

export interface RankingFinal {
  ranking: number;
  player: string;
  roundReached: number;
}

export interface RankingGroup {
  ranking: number;
  player: string;
  city: string;
  carambolas: number;
  entries: number;
  average: number;
  points: number;
}
