'use client';

import type { GroupData } from '../data/types';
import { getCityColor } from '../lib/constants';

const GROUP_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
];

function PlayerRow({
  position,
  name,
  isQualified,
}: {
  position: number;
  name: string;
  isQualified: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 ${
        position < 4 ? 'border-b border-white/5' : ''
      }`}
    >
      {/* Position number */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
          isQualified
            ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
            : 'bg-white/5 text-text-muted/60'
        }`}
      >
        {position}
      </div>

      {/* Player name */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-bold truncate uppercase tracking-wide ${
            isQualified ? 'text-text-primary' : 'text-text-muted'
          }`}
        >
          {name.split(' ').slice(-1)[0]}
        </div>
        <div className="text-[10px] text-text-muted/60 truncate">
          {name.split(' ').slice(0, -1).join(' ')}
        </div>
      </div>
    </div>
  );
}

function GroupCard({ group, index }: { group: GroupData; index: number }) {
  const letter = GROUP_LETTERS[index] || String(group.number);

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 hover:border-emerald-500/30 transition-colors">
      {/* Group header */}
      <div
        className="px-4 py-2.5 flex items-center gap-3"
        style={{
          background:
            'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
          borderBottom: '2px solid rgba(16,185,129,0.3)',
        }}
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <span className="text-lg font-black text-emerald-400">{letter}</span>
        </div>
        <div>
          <span className="text-xs font-bold text-text-primary tracking-wider uppercase">
            Grupo {group.number}
          </span>
          <span className="text-[10px] text-text-muted/60 ml-2">
            {group.standings.length} jugadores
          </span>
        </div>
      </div>

      {/* Players */}
      <div
        style={{
          background: 'var(--color-bg-secondary)',
        }}
      >
        {group.standings
          .sort((a, b) => a.groupOrder - b.groupOrder)
          .map((standing) => (
            <PlayerRow
              key={standing.player}
              position={standing.groupOrder}
              name={standing.player}
              isQualified={standing.groupOrder <= 2}
            />
          ))}
      </div>
    </div>
  );
}

export default function CuadroPrincipal({ groups }: { groups: GroupData[] }) {
  return (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-lg font-black tracking-[0.2em] text-text-primary uppercase">
          Cuadro Principal
        </h3>
        <p className="text-[11px] text-text-muted mt-1">
          {groups.length} grupos · {groups.reduce((sum, g) => sum + g.standings.length, 0)} jugadores
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
        {groups.map((group, i) => (
          <GroupCard key={group.number} group={group} index={i} />
        ))}
      </div>
    </div>
  );
}
