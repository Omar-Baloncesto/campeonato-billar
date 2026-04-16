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
