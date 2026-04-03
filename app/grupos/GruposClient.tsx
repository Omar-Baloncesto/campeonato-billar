'use client';

import { useState } from 'react';
import FilterPills from '../components/FilterPills';
import GroupStandingsTable from '../components/GroupStandingsTable';
import EmptyState from '../components/EmptyState';

interface GroupData {
  number: number;
  standings: Record<string, unknown>[];
}

export default function GruposClient({ groups }: { groups: GroupData[] }) {
  const [groupFilter, setGroupFilter] = useState('all');

  const groupItems = [
    { key: 'all', label: 'Todos' },
    ...groups.map(g => ({ key: String(g.number), label: `Grupo ${g.number}` })),
  ];

  const filtered = groupFilter === 'all'
    ? groups
    : groups.filter(g => g.number === Number(groupFilter));

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">
          Fase de Grupos
        </h2>

        <div className="mb-6">
          <FilterPills items={groupItems} active={groupFilter} onChange={setGroupFilter} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            message="No se encontraron grupos con el filtro seleccionado."
            onReset={() => setGroupFilter('all')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
            {filtered.map((group) => (
              <GroupStandingsTable key={group.number} group={group as never} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
