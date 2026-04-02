'use client';

import { useState } from 'react';
import { GROUP_RESULTS } from '../data/groups';
import { getAllGroups } from '../data/helpers';
import FilterPills from '../components/FilterPills';
import MatchResultCard from '../components/MatchResultCard';

export default function ResultadosPage() {
  const [groupFilter, setGroupFilter] = useState('all');
  const groups = getAllGroups();

  const groupItems = [
    { key: 'all', label: 'Todos' },
    ...groups.map(g => ({ key: String(g), label: `Grupo ${g}` })),
  ];

  const filtered = groupFilter === 'all'
    ? GROUP_RESULTS
    : GROUP_RESULTS.filter(r => r.group === Number(groupFilter));

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">
            Resultados
          </h2>
          <span className="text-sm text-text-muted">{filtered.length} partidos</span>
        </div>

        <div className="mb-6">
          <FilterPills items={groupItems} active={groupFilter} onChange={setGroupFilter} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
          {filtered.map((result, i) => (
            <MatchResultCard key={`${result.group}-${result.match}`} result={result} />
          ))}
        </div>
      </div>
    </div>
  );
}
