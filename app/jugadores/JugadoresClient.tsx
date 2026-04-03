'use client';

import { useState } from 'react';
import { getCityColor } from '../lib/constants';
import FilterPills from '../components/FilterPills';
import EmptyState from '../components/EmptyState';

interface Player {
  id: number;
  name: string;
  group: number;
  category: string;
  active: boolean;
  city: string;
}

export default function JugadoresClient({ players }: { players: Player[] }) {
  const [groupFilter, setGroupFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [search, setSearch] = useState('');

  const groups = [...new Set(players.map(p => p.group))].sort((a, b) => a - b);
  const cities = [...new Set(players.map(p => p.city))].sort();

  const groupItems = [
    { key: 'all', label: 'Todos' },
    ...groups.map(g => ({ key: String(g), label: `Grupo ${g}` })),
  ];

  const cityItems = [
    { key: 'all', label: 'Todas' },
    ...cities.map(c => ({ key: c, label: c, color: getCityColor(c) })),
  ];

  const filtered = players.filter(p => {
    if (groupFilter !== 'all' && p.group !== Number(groupFilter)) return false;
    if (cityFilter !== 'all' && p.city !== cityFilter) return false;
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  const resetFilters = () => {
    setGroupFilter('all');
    setCityFilter('all');
    setSearch('');
  };

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">
            Jugadores
          </h2>
          <span className="text-sm text-text-muted">{filtered.length} jugadores</span>
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/60 pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jugador..."
            className="w-full bg-[#1a2e23] border border-[#2a4a3a] rounded-lg pl-10 pr-4 py-2.5 text-sm
                       text-text-primary placeholder:text-text-muted/50
                       focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/30
                       transition-colors"
          />
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Grupo</div>
            <FilterPills items={groupItems} active={groupFilter} onChange={setGroupFilter} />
          </div>
          <div>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Ciudad</div>
            <FilterPills items={cityItems} active={cityFilter} onChange={setCityFilter} variant="outline" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            message="No se encontraron jugadores con los filtros seleccionados."
            onReset={resetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
            {filtered.map((player) => (
              <div key={player.id} className="glass-card rounded-xl p-4 glow-hover flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: getCityColor(player.city) + '20',
                    color: getCityColor(player.city),
                    border: `1px solid ${getCityColor(player.city)}40`,
                  }}
                >
                  {player.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-text-primary truncate">{player.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-emerald-400 font-medium">Grupo {player.group}</span>
                    <span className="text-text-muted/30">·</span>
                    <span className="text-[11px] text-text-muted truncate">{player.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
