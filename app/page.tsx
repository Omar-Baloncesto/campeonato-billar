import Link from 'next/link';
import { fetchConfig, fetchPlayers, fetchResults, fetchRankingFinal } from './lib/sheets';
import { ELIMINATION_MATCHES } from './data/elimination';
import { CITIES } from './lib/constants';

export const revalidate = 60;

export default async function Dashboard() {
  const [config, players, results, rankingFinal] = await Promise.all([
    fetchConfig(),
    fetchPlayers(),
    fetchResults(),
    fetchRankingFinal(),
  ]);

  const champion = rankingFinal[0];
  const finalist = rankingFinal[1];
  const third = rankingFinal[2];
  const fourth = rankingFinal[3];
  const totalMatches = results.length;
  const eliminationMatches = ELIMINATION_MATCHES.filter(m => !m.isBye).length;

  const cityCounts: Record<string, number> = {};
  for (const p of players) {
    cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
  }

  const finalMatch = ELIMINATION_MATCHES.find(m => m.round === 6);

  const stats = [
    { label: 'Jugadores', value: config.totalPlayers, icon: '👤' },
    { label: 'Grupos', value: config.totalGroups, icon: '📋' },
    { label: 'Partidos Grupo', value: totalMatches, icon: '🎱' },
    { label: 'Partidos Elim.', value: eliminationMatches, icon: '🏆' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Stats bar */}
      <div className="px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto stagger-children">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 text-center glow-hover">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl md:text-3xl font-black text-emerald-400 count-up">{s.value}</div>
              <div className="text-[11px] text-text-muted tracking-wider uppercase mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Champion highlight */}
      {champion && (
        <div className="px-4 pb-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-center border border-[rgba(245,184,0,0.2)]"
              style={{
                background: 'linear-gradient(135deg, rgba(245,184,0,0.06), rgba(16,185,129,0.04))',
                boxShadow: '0 0 60px rgba(245,184,0,0.05)',
              }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(245,184,0,0.1) 0%, transparent 70%)' }}
              />
              <div className="relative">
                <div className="text-5xl mb-3">🏆</div>
                <div className="text-[11px] tracking-[0.3em] text-text-muted uppercase mb-2 font-semibold">Campeon</div>
                <div className="text-2xl md:text-3xl font-black tracking-wider text-[#F5B800] mb-3">
                  {champion.player}
                </div>
                {finalMatch && finalist && (
                  <div className="text-sm text-text-muted">
                    Final: <span className="text-text-primary font-semibold">{finalMatch.carambolasA}</span>
                    <span className="text-text-muted/50 mx-1">-</span>
                    <span className="text-text-primary font-semibold">{finalMatch.carambolasB}</span>
                    <span className="text-text-muted/50 ml-1">vs {finalist.player}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Podium */}
      {champion && finalist && third && fourth && (
        <div className="px-4 pb-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold tracking-wider text-text-muted uppercase mb-4 px-1">Podio Final</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
              {[champion, finalist, third, fourth].map((p, i) => {
                const medals = ['🥇', '🥈', '🥉', '4'];
                const colors = ['#F5B800', '#C0C0C0', '#CD7F32', '#888888'];
                return (
                  <div key={p.ranking} className="glass-card rounded-xl p-4 text-center glow-hover">
                    <div className="text-3xl mb-2">{i < 3 ? medals[i] : ''}</div>
                    <div className="text-sm font-bold" style={{ color: colors[i] }}>{p.player}</div>
                    <div className="text-[11px] text-text-muted mt-1">Ronda {p.roundReached}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cities breakdown */}
      <div className="px-4 pb-8 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold tracking-wider text-text-muted uppercase mb-4 px-1">Jugadores por Ciudad</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 stagger-children">
            {Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
              <div key={city} className="glass-card rounded-lg p-3 flex items-center gap-2 glow-hover">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: CITIES[city]?.safeColor || '#888' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-text-primary font-medium truncate">{city}</div>
                </div>
                <div className="text-sm font-bold text-emerald-400">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="px-4 pb-8 md:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/grupos', label: 'Ver Grupos', icon: '📋' },
            { href: '/resultados', label: 'Resultados', icon: '📊' },
            { href: '/eliminacion', label: 'Eliminacion', icon: '🏆' },
            { href: '/ranking', label: 'Ranking Final', icon: '🥇' },
            { href: '/jugadores', label: 'Jugadores', icon: '👤' },
            { href: '/configuracion', label: 'Configuracion', icon: '⚙️' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="glass-card rounded-xl p-4 text-center glow-hover no-underline"
            >
              <div className="text-2xl mb-1">{link.icon}</div>
              <div className="text-xs font-semibold text-text-muted">{link.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
