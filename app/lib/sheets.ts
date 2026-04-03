const SPREADSHEET_ID = '13drcy7eWhX3P0cfrzYWAoBAJ53bRwQLU3NGKxEgiXYQ';

function sheetUrl(sheetName: string, range?: string): string {
  let url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  if (range) url += `&range=${encodeURIComponent(range)}`;
  return url;
}

function parseCSV(csv: string): string[][] {
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

function parseNumber(val: string): number {
  if (!val || val === '') return 0;
  return Number(val.replace(',', '.'));
}

async function fetchSheet(sheetName: string, range?: string): Promise<string[][]> {
  const url = sheetUrl(sheetName, range);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch sheet ${sheetName}: ${res.status}`);
  const csv = await res.text();
  return parseCSV(csv);
}

export async function fetchConfig() {
  const rows = await fetchSheet('CONFIGURACION', 'A1:B10');
  const config: Record<string, string> = {};
  for (const row of rows) {
    if (row[0] && row[1]) config[row[0]] = row[1];
  }
  return {
    totalPlayers: parseNumber(config['Numero total de jugadores'] || '42'),
    playersPerGroup: parseNumber(config['Jugadores por grupo'] || '4'),
    totalGroups: 11,
    category: config['Categoria'] || 'Primera',
    carambolasPreliminary: parseNumber(config['Carambolas - Ronda preliminar'] || '20'),
    carambolasSemifinal: parseNumber(config['Carambolas - Semifinal'] || '25'),
    carambolasFinal: parseNumber(config['Carambolas - Final'] || '25'),
    entriesLimit: parseNumber(config['Limite de entradas'] || '30'),
    timePerEntry: parseNumber(config['Tiempo por entrada (segundos)'] || '40'),
  };
}

export async function fetchPlayers() {
  const rows = await fetchSheet('JUGADORES', 'A1:F100');
  // Skip header row
  return rows.slice(1).filter(r => r[0] && r[1]).map(r => ({
    id: parseNumber(r[0]),
    name: r[1].trim(),
    group: parseNumber(r[2]),
    category: r[3] || 'Primera',
    active: (r[4] || '').toUpperCase() === 'SI',
    city: r[5] || '',
  }));
}

export async function fetchResults() {
  const rows = await fetchSheet('RESULTADOS', 'A1:L200');
  return rows.slice(1).filter(r => r[0] && r[2]).map(r => ({
    group: parseNumber(r[0]),
    match: parseNumber(r[1]),
    playerA: r[2] || '',
    carambolasA: parseNumber(r[3]),
    entriesA: parseNumber(r[4]),
    averageA: parseNumber(r[5]),
    playerB: r[6] || '',
    carambolasB: parseNumber(r[7]),
    entriesB: parseNumber(r[8]),
    averageB: parseNumber(r[9]),
    winner: r[10] || '',
    walkover: (r[11] || '').toLowerCase() === 'si',
  }));
}

export async function fetchGroupStandings() {
  const rows = await fetchSheet('GRUPOS', 'A1:Q200');
  const groups: { number: number; standings: Record<string, unknown>[] }[] = [];
  let currentGroup = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Detect group header: "GRUPO X" in column B (row[1]) or column A header row
    const groupMatch = (row[0] || '').match(/GRUPO\s+(\d+)/i) || (row[1] || '').match(/GRUPO\s+(\d+)/i);
    if (groupMatch) {
      currentGroup = parseInt(groupMatch[1]);
      continue;
    }

    // Skip sub-headers like "Jugador", "N°"
    if ((row[1] || '').toLowerCase() === 'jugador' || row[0] === 'N°') {
      continue;
    }

    // Data row: position in col 0, player name in col 1
    if (currentGroup > 0 && row[0] && row[1] && !isNaN(Number(row[0]))) {
      let group = groups.find(g => g.number === currentGroup);
      if (!group) {
        group = { number: currentGroup, standings: [] };
        groups.push(group);
      }

      // Columns: 0=N°, 1=Player, 2=CA_P1, 3=CA_P2, 4=CA_P3, 5=TOTAL_CA,
      //          6=CR_P1, 7=CR_P2, 8=CR_P3, 9=TOTAL_CR, 10=DIF,
      //          11=PTS_P1, 12=PTS_P2, 13=PTS_P3, 14=TOTAL_PTS, 15=ORDEN, 16=CLASIF
      const hasP3 = row[4] !== undefined && row[4] !== '';
      group.standings.push({
        position: parseNumber(row[0]),
        player: row[1].trim(),
        caP1: parseNumber(row[2]),
        caP2: parseNumber(row[3]),
        caP3: hasP3 ? parseNumber(row[4]) : null,
        totalCA: parseNumber(row[5]),
        crP1: parseNumber(row[6]),
        crP2: parseNumber(row[7]),
        crP3: hasP3 ? parseNumber(row[8]) : null,
        totalCR: parseNumber(row[9]),
        differential: parseNumber(row[10]),
        ptsP1: parseNumber(row[11]),
        ptsP2: parseNumber(row[12]),
        ptsP3: hasP3 ? parseNumber(row[13]) : null,
        totalPts: parseNumber(row[14]),
        groupOrder: parseNumber(row[15]),
        generalClassification: parseNumber(row[16]),
      });
    }
  }
  return groups;
}

export async function fetchRankingFinal() {
  const rows = await fetchSheet('RankingFinal', 'A1:C100');
  return rows.slice(1).filter(r => r[0] && r[1]).map(r => ({
    ranking: parseNumber(r[0]),
    player: r[1].trim(),
    roundReached: parseNumber(r[2]),
  }));
}

export async function fetchRankingGroups() {
  const rows = await fetchSheet('RankingGrupos', 'A1:G100');
  return rows.slice(1).filter(r => r[0] && r[1]).map(r => ({
    ranking: parseNumber(r[0]),
    player: r[1].trim(),
    city: r[2] || '',
    carambolas: parseNumber(r[3]),
    entries: parseNumber(r[4]),
    average: parseNumber(r[5]),
    points: parseNumber(r[6]),
  }));
}

export async function fetchEliminationMatches() {
  // The elimination data is complex - read the full sheet
  const rows = await fetchSheet('RESULTADOS', 'A1:L200');
  // For now we still use static elimination data since the sheet structure
  // for elimination is different. We'll parse the results for group stage.
  return null;
}
