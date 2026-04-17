'use client';

import { useState, useEffect, useCallback } from 'react';
import { sheetUrl, parseCSV, parseNumber, fetchEliminationClient } from '../lib/sheets-client';
import { ELIMINATION_MATCHES } from '../data/elimination';
import { CITIES } from '../lib/constants';
import { SHEET_REFRESH_EVENT } from '../components/AutoRefresh';

interface ConfigData {
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

interface PlayerData {
  city: string;
}

// Comparar claves sin que tildes/mayúsculas/espacios rompan el match.
function normKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

async function fetchConfigClient(): Promise<{ data: ConfigData; fromSheet: boolean; error?: string }> {
  const defaults: ConfigData = {
    totalPlayers: 42, playersPerGroup: 4, totalGroups: 11,
    category: 'Primera', carambolasPreliminary: 15, carambolasSemifinal: 20,
    carambolasFinal: 20, entriesLimit: 30, timePerEntry: 40,
  };
  try {
    const res = await fetch(sheetUrl('CONFIGURACION', 'A1:B15'));
    if (!res.ok) {
      const msg = `fetch status ${res.status}`;
      console.error('[ConfigClient]', msg);
      return { data: defaults, fromSheet: false, error: msg };
    }
    const csv = await res.text();
    const rows = parseCSV(csv);
    const map: Record<string, string> = {};
    for (const row of rows) {
      if (row[0] && row[1]) map[normKey(row[0])] = row[1].trim();
    }
    const get = (key: string) => map[normKey(key)];
    // Fallback por posición: la hoja tiene layout fijo.
    const rowVal = (i: number) => (rows[i - 1]?.[1] || '').trim();
    if (typeof window !== 'undefined') {
      console.info(
        '[ConfigClient] keys del Sheet:', Object.keys(map),
        '| Categoria via key =', JSON.stringify(get('Categoria')),
        '| B5 via posición =', JSON.stringify(rowVal(5)),
      );
    }
    const data: ConfigData = {
      totalPlayers: parseNumber(get('Numero total de jugadores') || rowVal(3) || '42'),
      playersPerGroup: parseNumber(get('Jugadores por grupo') || rowVal(4) || '4'),
      totalGroups: parseNumber(get('Numero total de grupos') || get('Total de grupos') || get('Grupos') || '11'),
      category: get('Categoria') || rowVal(5) || 'Primera',
      carambolasPreliminary: parseNumber(get('Carambolas - Ronda preliminar') || rowVal(6) || '15'),
      carambolasSemifinal: parseNumber(get('Carambolas - Semifinal') || rowVal(9) || '20'),
      carambolasFinal: parseNumber(get('Carambolas - Final') || rowVal(10) || '20'),
      entriesLimit: parseNumber(get('Limite de entradas') || rowVal(7) || '30'),
      timePerEntry: parseNumber(get('Tiempo por entrada (segundos)') || rowVal(8) || '40'),
    };
    return { data, fromSheet: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[ConfigClient] excepción:', msg);
    return { data: defaults, fromSheet: false, error: msg };
  }
}

async function fetchPlayersClient(): Promise<PlayerData[]> {
  try {
    const res = await fetch(sheetUrl('JUGADORES', 'A1:F100'));
    if (!res.ok) return [];
    const csv = await res.text();
    const rows = parseCSV(csv);
    return rows.slice(1).filter(r => r[0] && r[1]).map(r => ({ city: r[5] || '' }));
  } catch (_e) {
    return [];
  }
}

export default function ConfigClient() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [source, setSource] = useState<{ fromSheet: boolean; error?: string; at: string }>({
    fromSheet: false,
    at: '',
  });
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});
  const [elimRounds, setElimRounds] = useState(6);
  const [elimReal, setElimReal] = useState(41);

  const load = useCallback(async () => {
    const [cfgResult, players, elimData] = await Promise.all([
      fetchConfigClient(),
      fetchPlayersClient(),
      fetchEliminationClient(),
    ]);

    setConfig(cfgResult.data);
    setSource({
      fromSheet: cfgResult.fromSheet,
      error: cfgResult.error,
      at: new Date().toLocaleTimeString('es-CO'),
    });

    const counts: Record<string, number> = {};
    for (const p of players) {
      if (p.city) counts[p.city] = (counts[p.city] || 0) + 1;
    }
    setCityCounts(counts);

    const elim = elimData || ELIMINATION_MATCHES;
    setElimRounds([...new Set(elim.map(m => m.round))].length);
    setElimReal(elim.filter(m => !m.isBye).length);
  }, []);

  useEffect(() => {
    load();
    const handler = () => { load(); };
    window.addEventListener(SHEET_REFRESH_EVENT, handler);
    return () => window.removeEventListener(SHEET_REFRESH_EVENT, handler);
  }, [load]);

  if (!config) {
    return (
      <div className="animate-fade-in px-4 py-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">
            Configuración del Torneo
          </h2>
          <div className="text-text-muted text-sm">Cargando...</div>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: 'General', icon: '🎱',
      items: [
        { label: 'Total Jugadores', value: config.totalPlayers },
        { label: 'Grupos', value: config.totalGroups },
        { label: 'Jugadores por Grupo', value: config.playersPerGroup },
        { label: 'Categoría', value: config.category },
      ],
    },
    {
      title: 'Fase de Grupos', icon: '📋',
      items: [
        { label: 'Carambolas por partido', value: config.carambolasPreliminary },
        { label: 'Límite de entradas', value: config.entriesLimit },
        { label: 'Tiempo por entrada', value: `${config.timePerEntry}s` },
      ],
    },
    {
      title: 'Semifinal y Final', icon: '🏆',
      items: [
        { label: 'Carambolas semifinal', value: config.carambolasSemifinal },
        { label: 'Carambolas final', value: config.carambolasFinal },
      ],
    },
    {
      title: 'Formato Eliminación', icon: '⚡',
      items: [
        { label: 'Tipo', value: 'Eliminación Simple' },
        { label: 'Rondas', value: elimRounds },
        { label: 'Partidos reales', value: elimReal },
        { label: 'Jugadores clasificados', value: config.totalPlayers },
      ],
    },
  ];

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">
          Configuración del Torneo
        </h2>

        <div
          className={`text-[11px] mb-4 px-3 py-2 rounded-lg border ${
            source.fromSheet
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
              : 'border-red-500/40 bg-red-500/10 text-red-400'
          }`}
        >
          {source.fromSheet
            ? `✅ Datos en vivo desde Google Sheets · última lectura ${source.at}`
            : `⚠️ No se pudo leer Google Sheets (${source.error || 'fetch error'}) — mostrando valores por defecto · intento ${source.at}`}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 stagger-children">
          {sections.map((section) => (
            <div key={section.title} className="glass-card rounded-xl overflow-hidden glow-hover">
              <div className="bg-bg-header px-4 py-3 border-b border-border-light flex items-center gap-2">
                <span className="text-lg">{section.icon}</span>
                <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                  {section.title}
                </h3>
              </div>
              <div className="p-4">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                    <span className="text-sm text-text-muted">{item.label}</span>
                    <span className="text-sm font-bold text-text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(cityCounts).length > 0 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="bg-bg-header px-4 py-3 border-b border-border-light">
              <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                Ciudades Participantes
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
                  <div key={city} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: CITIES[city]?.safeColor || '#888' }}
                    />
                    <span className="flex-1 text-sm text-text-primary">{city}</span>
                    <span className="text-sm font-bold text-emerald-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
