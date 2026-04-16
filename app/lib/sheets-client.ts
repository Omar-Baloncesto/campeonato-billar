/**
 * Client-safe Google Sheets utilities.
 * No server directives — safe to import from 'use client' components.
 */

const SPREADSHEET_ID = '13drcy7eWhX3P0cfrzYWAoBAJ53bRwQLU3NGKxEgiXYQ';

export function sheetUrl(sheetName: string, range?: string): string {
  let url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  if (range) url += `&range=${encodeURIComponent(range)}`;
  return url;
}

export function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (inQuotes) {
      if (ch === '"' && csv[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(current.trim());
        current = '';
      } else if (ch === '\n' || (ch === '\r' && csv[i + 1] === '\n')) {
        row.push(current.trim());
        rows.push(row);
        row = [];
        current = '';
        if (ch === '\r') i++;
      } else {
        current += ch;
      }
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

export function parseNumber(val: string): number {
  if (!val || val === '') return 0;
  return Number(val.replace(',', '.'));
}

export function parseTime24(timeStr: string): string {
  const clean = timeStr.replace(/\s+/g, ' ').trim().toLowerCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(a\.?\s*m\.?|p\.?\s*m\.?|m\.?)?$/);
  if (!match) return '00:00';
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = (match[3] || '').replace(/[\s.]/g, '');
  if (period.startsWith('p') && hours < 12) hours += 12;
  if (period.startsWith('a') && hours === 12) hours = 0;
  if (period === 'm') hours = 12;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

export function parseDateDMY(dateStr: string): string {
  const match = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) return '';
  return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  Client-side fetch helpers                                          */
/* ------------------------------------------------------------------ */

import type { EliminationMatch } from '../data/types';

async function fetchSheetClient(sheetName: string, range: string): Promise<string[][] | null> {
  try {
    const res = await fetch(sheetUrl(sheetName, range));
    if (!res.ok) return null;
    const csv = await res.text();
    if (!csv || csv.length < 10) return null;
    return parseCSV(csv);
  } catch (_e) {
    return null;
  }
}

export async function fetchEliminationClient(): Promise<EliminationMatch[] | null> {
  let rows: string[][] | null = null;
  for (const name of ['Eliminación Simple', 'ELIMINACIÓN SIMPLE', 'ELIMINACION SIMPLE']) {
    rows = await fetchSheetClient(name, 'A1:K200');
    if (rows && rows.length > 5) break;
    rows = null;
  }
  if (!rows) return null;

  const matches: EliminationMatch[] = [];
  for (const row of rows) {
    const ronda = parseInt(row[0]);
    if (isNaN(ronda) || ronda < 1 || ronda > 10) continue;
    const matchNum = parseInt(row[1]);
    if (isNaN(matchNum)) continue;
    const playerA = (row[2] || '').trim();
    const playerB = (row[6] || '').trim();
    if (!playerA) continue;

    const isBye = playerB.toUpperCase() === 'BYE';
    const entriesA = parseNumber(row[3]);
    const entriesB = parseNumber(row[7]);

    matches.push({
      round: ronda,
      match: matchNum,
      playerA,
      entriesA: entriesA < 1 ? 0 : Math.round(entriesA),
      carambolasA: parseNumber(row[4]),
      averageA: parseNumber(row[5]),
      playerB: isBye ? 'BYE' : playerB,
      entriesB: entriesB < 1 ? 0 : Math.round(entriesB),
      carambolasB: parseNumber(row[8]),
      averageB: parseNumber(row[9]),
      winner: (row[10] || '').trim(),
      isBye,
    });
  }
  return matches.length > 20 ? matches : null;
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
}

export async function fetchResultsClient(): Promise<GroupResult[] | null> {
  const rows = await fetchSheetClient('RESULTADOS', 'A1:L200');
  if (!rows) return null;

  const results: GroupResult[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] || !row[2]) continue;
    results.push({
      group: parseNumber(row[0]),
      match: parseNumber(row[1]),
      playerA: (row[2] || '').trim(),
      carambolasA: parseNumber(row[3]),
      entriesA: parseNumber(row[4]),
      averageA: parseNumber(row[5]),
      playerB: (row[6] || '').trim(),
      carambolasB: parseNumber(row[7]),
      entriesB: parseNumber(row[8]),
      averageB: parseNumber(row[9]),
      winner: (row[10] || '').trim(),
    });
  }
  return results.length > 0 ? results : null;
}
