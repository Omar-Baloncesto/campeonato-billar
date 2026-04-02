'use client';

import { TOURNAMENT_CONFIG } from '../data/config';
import { getPlayerCountByCity } from '../data/helpers';
import { CITIES } from '../lib/constants';

export default function ConfiguracionPage() {
  const cityCounts = getPlayerCountByCity();

  const sections = [
    {
      title: 'General',
      icon: '🎱',
      items: [
        { label: 'Total Jugadores', value: TOURNAMENT_CONFIG.totalPlayers },
        { label: 'Grupos', value: TOURNAMENT_CONFIG.totalGroups },
        { label: 'Jugadores por Grupo', value: TOURNAMENT_CONFIG.playersPerGroup },
        { label: 'Categoria', value: TOURNAMENT_CONFIG.category },
      ],
    },
    {
      title: 'Fase de Grupos',
      icon: '📋',
      items: [
        { label: 'Carambolas por partido', value: TOURNAMENT_CONFIG.carambolasPreliminary },
        { label: 'Limite de entradas', value: TOURNAMENT_CONFIG.entriesLimit },
        { label: 'Tiempo por entrada', value: `${TOURNAMENT_CONFIG.timePerEntry}s` },
      ],
    },
    {
      title: 'Semifinal y Final',
      icon: '🏆',
      items: [
        { label: 'Carambolas semifinal', value: TOURNAMENT_CONFIG.carambolasSemifinal },
        { label: 'Carambolas final', value: TOURNAMENT_CONFIG.carambolasFinal },
      ],
    },
    {
      title: 'Formato Eliminacion',
      icon: '⚡',
      items: [
        { label: 'Tipo', value: 'Eliminacion Simple' },
        { label: 'Rondas', value: 6 },
        { label: 'Jugadores clasificados', value: 42 },
      ],
    },
  ];

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">
          Configuracion del Torneo
        </h2>

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

        {/* Cities */}
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
      </div>
    </div>
  );
}
