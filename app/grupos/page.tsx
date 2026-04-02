'use client';

import { useState } from 'react';
import { GROUP_STANDINGS } from '../data/groups';
import FilterPills from '../components/FilterPills';
import GroupStandingsTable from '../components/GroupStandingsTable';

export default function GruposPage() {
  const [groupFilter, setGroupFilter] = useState('all');

  const groupItems = [
    { key: 'all', label: 'Todos' },
    ...GROUP_STANDINGS.map(g => ({ key: String(g.number), label: `Grupo ${g.number}` })),
  ];

  const filtered = groupFilter === 'all'
    ? GROUP_STANDINGS
    : GROUP_STANDINGS.filter(g => g.number === Number(groupFilter));

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">
          Fase de Grupos
        </h2>

        <div className="mb-6">
          <FilterPills items={groupItems} active={groupFilter} onChange={setGroupFilter} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
          {filtered.map((group) => (
            <GroupStandingsTable key={group.number} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}
