'use client';

import { useState } from 'react';
import { ROUND_NAMES } from '../data/elimination';
import { getCityColor } from '../lib/constants';
import FilterPills from '../components/FilterPills';

interface RankingFinal {
  ranking: number;
  player: string;
  roundReached: number;
}

interface RankingGroup {
  ranking: number;
  player: string;
  city: string;
  carambolas: number;
  entries: number;
  average: number;
  points: number;
}

function getMedal(pos: number) {
  if (pos === 1) return <span className="medal-gold text-lg">🥇</span>;
  if (pos === 2) return <span className="medal-silver text-lg">🥈</span>;
  if (pos === 3) return <span className="medal-bronze text-lg">🥉</span>;
  return <span className="text-text-muted text-sm">{pos}</span>;
}

export default function RankingClient({ rankingFinal, rankingGroups }: { rankingFinal: RankingFinal[]; rankingGroups: RankingGroup[] }) {
  const [tab, setTab] = useState('final');

  const tabs = [
    { key: 'final', label: 'Ranking Final' },
    { key: 'groups', label: 'Ranking Grupos' },
  ];

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">
          Ranking
        </h2>

        <div className="mb-6">
          <FilterPills items={tabs} active={tab} onChange={setTab} />
        </div>

        {tab === 'final' && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="bg-bg-header px-4 py-3 border-b border-border-light">
              <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                Ranking Final por Ronda Alcanzada
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-muted/70 text-xs border-b border-border-subtle">
                    <th className="px-4 py-3 text-left w-12">#</th>
                    <th className="px-4 py-3 text-left">Jugador</th>
                    <th className="px-4 py-3 text-center">Ronda</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Etapa</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingFinal.map((r) => (
                    <tr key={r.ranking} className={`table-row-hover border-b border-border-subtle ${r.ranking <= 3 ? 'bg-emerald/[0.03]' : ''}`}>
                      <td className="px-4 py-3">{getMedal(r.ranking)}</td>
                      <td className="px-4 py-3 font-semibold">{r.player}</td>
                      <td className="px-4 py-3 text-center font-mono text-emerald-400 font-bold">{r.roundReached}</td>
                      <td className="px-4 py-3 text-text-muted text-xs hidden md:table-cell">{ROUND_NAMES[r.roundReached]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'groups' && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="bg-bg-header px-4 py-3 border-b border-border-light">
              <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                Ranking Fase de Grupos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-muted/70 text-xs border-b border-border-subtle">
                    <th className="px-3 py-3 text-left w-10">#</th>
                    <th className="px-3 py-3 text-left">Jugador</th>
                    <th className="px-3 py-3 text-left hidden md:table-cell">Ciudad</th>
                    <th className="px-2 py-3 text-center">Car</th>
                    <th className="px-2 py-3 text-center hidden sm:table-cell">Ent</th>
                    <th className="px-2 py-3 text-center">Prom</th>
                    <th className="px-2 py-3 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingGroups.map((r) => (
                    <tr key={r.ranking} className={`table-row-hover border-b border-border-subtle ${r.ranking <= 3 ? 'bg-emerald/[0.03]' : ''}`}>
                      <td className="px-3 py-3">{getMedal(r.ranking)}</td>
                      <td className="px-3 py-3 font-semibold">{r.player}</td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: getCityColor(r.city) }} />
                          <span className="text-xs text-text-muted">{r.city}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center font-mono text-emerald-400">{r.carambolas}</td>
                      <td className="px-2 py-3 text-center font-mono text-text-muted hidden sm:table-cell">{r.entries}</td>
                      <td className="px-2 py-3 text-center font-mono text-text-primary">{r.average.toFixed(3)}</td>
                      <td className="px-2 py-3 text-center font-mono font-bold text-text-primary">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
