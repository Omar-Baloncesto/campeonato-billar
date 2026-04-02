import { PLAYERS } from './players';
import { GROUP_RESULTS, GROUP_STANDINGS } from './groups';
import { RANKING_FINAL } from './rankings';
import type { Player, GroupResult, GroupData } from './types';

export function getPlayersByGroup(group: number): Player[] {
  return PLAYERS.filter(p => p.group === group);
}

export function getPlayersByCity(city: string): Player[] {
  return PLAYERS.filter(p => p.city === city);
}

export function getResultsByGroup(group: number): GroupResult[] {
  return GROUP_RESULTS.filter(r => r.group === group);
}

export function getGroupStandings(group: number): GroupData | undefined {
  return GROUP_STANDINGS.find(g => g.number === group);
}

export function getAllCities(): string[] {
  return [...new Set(PLAYERS.map(p => p.city))].sort();
}

export function getAllGroups(): number[] {
  return [...new Set(PLAYERS.map(p => p.group))].sort((a, b) => a - b);
}

export function getChampion() {
  return RANKING_FINAL[0];
}

export function getPlayerCountByCity(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of PLAYERS) {
    counts[p.city] = (counts[p.city] || 0) + 1;
  }
  return counts;
}
