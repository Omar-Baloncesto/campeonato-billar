import { fetchConfig, fetchPlayers } from '../lib/sheets';
import { CITIES } from '../lib/constants';

export const revalidate = 60;

export default async function ConfiguracionPage() {
  const [config, players] = await Promise.all([
    fetchConfig(),
    fetchPlayers(),
  ]);

  const cityCounts: Record<string, number> = {};
  for (const p of players) {
    cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
  }

  const sections = [
    {
      title: 'General',
      icon: '🎱',
      items: [
        { label: 'Total Jugadores', value: config.totalPlayers },
        { label: 'Grupos', value: config.totalGroups },
        { label: 'Jugadores por Grupo', value: config.playersPerGroup },
        { label: 'Categoria', value: config.category },
      ],
    },
    {
      title: 'Fase de Grupos',
      icon: '📋',
      items: [
        { label: 'Carambolas por partido', value: config.carambolasPreliminary },
        { label: 'Limite de entradas', value: config.entriesLimit },
        { label: 'Tiempo por entrada', value: `${config.timePerEntry}s` },
      ],
    },
    {
      title: 'Semifinal y Final',
      icon: '🏆',
      items: [
        { label: 'Carambolas semifinal', value: config.carambolasSemifinal },
        { label: 'Carambolas final', value: config.carambolasFinal },
      ],
    },
    {
      title: 'Formato Eliminación',
      icon: '⚡',
      items: [
        { label: 'Tipo', value: 'Eliminación Simple' },
        { label: 'Rondas', value: 6 },
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
