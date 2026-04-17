import Link from 'next/link';
import { fetchConfig, fetchPlayers, fetchResults, fetchEliminationMatches } from './lib/sheets';
import { ELIMINATION_MATCHES } from './data/elimination';
import { CITIES } from './lib/constants';
import { TrophyBadge, MedalBadge } from './components/TrophyBadge';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [config, players, results, liveElimination] = await Promise.all([
    fetchConfig(),
    fetchPlayers(),
    fetchResults(),
    fetchEliminationMatches().catch(() => null),
  ]);

  const elimData = liveElimination || ELIMINATION_MATCHES;

  // Champion & podium from elimination (semifinal + final)
  const finalMatch = elimData.find(m => m.round === 6 && !m.isBye);
  const semis = elimData.filter(m => m.round === 5 && !m.isBye);

  const championName = finalMatch?.winner || '';
  const finalistName = finalMatch ? (finalMatch.winner === finalMatch.playerA ? finalMatch.playerB : finalMatch.playerA) : '';

  // 3rd and 4th = losers of semifinals
  const semiLosers = semis.map(m => m.winner === m.playerA ? m.playerB : m.playerA).filter(Boolean);

  const champion = championName ? { player: championName, ranking: 1, roundReached: 6 } : null;
  const finalist = finalistName ? { player: finalistName, ranking: 2, roundReached: 6 } : null;
  const third = semiLosers[0] ? { player: semiLosers[0], ranking: 3, roundReached: 5 } : null;
  const fourth = semiLosers[1] ? { player: semiLosers[1], ranking: 4, roundReached: 5 } : null;

  const totalMatches = results.length;
  const eliminationMatches = elimData.filter(m => !m.isBye).length;

  const cityCounts: Record<string, number> = {};
  for (const p of players) {
    cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
  }

  const stats = [
    { label: 'Jugadores', value: config.totalPlayers, icon: 'players' },
    { label: 'Grupos', value: config.totalGroups, icon: 'groups' },
    { label: 'Partidos Grupo', value: totalMatches, icon: 'matches' },
    { label: 'Partidos Elim.', value: eliminationMatches, icon: 'trophy' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Stats bar */}
      <div className="px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto stagger-children">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 text-center glow-hover">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-500/10 flex items-center justify-center">
                {s.icon === 'players' && (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                )}
                {s.icon === 'groups' && (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                )}
                {s.icon === 'matches' && (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
                {s.icon === 'trophy' && (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M8 6h8v3c0 3-2 5.5-4 6.5C10 14.5 8 12 8 9V6z" />
                    <path d="M6 6H4c0 3 1.5 5 3.5 6v-1C6 10 5.5 8 6 6z" />
                    <path d="M18 6h2c0 3-1.5 5-3.5 6v-1c1.5-1 2-3 1.5-5z" />
                    <rect x="10.5" y="15.5" width="3" height="3" rx="0.5" />
                    <rect x="8" y="18.5" width="8" height="2" rx="1" />
                  </svg>
                )}
              </div>
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
            <div className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-center border-2 border-[#F5B800]/40"
              style={{
                background: 'linear-gradient(160deg, rgba(245,184,0,0.12) 0%, rgba(255,215,0,0.06) 40%, rgba(16,185,129,0.04) 100%)',
                boxShadow: '0 0 60px rgba(245,184,0,0.1), 0 8px 32px rgba(0,0,0,0.08)',
              }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(245,184,0,0.15) 0%, transparent 55%)' }}
              />
              <div className="relative">
                <div className="flex justify-center mb-5">
                  <TrophyBadge size={130} />
                </div>
                <div className="text-xs tracking-[0.35em] text-[#B8860B] uppercase mb-2 font-black">
                  Campeón
                </div>
                <div className="text-3xl md:text-5xl font-black tracking-wider text-[#C8960A] mb-4"
                  style={{ textShadow: '0 2px 12px rgba(245,184,0,0.25)' }}
                >
                  {champion.player}
                </div>
                {finalMatch && finalist && (
                  <div className="text-sm text-text-muted font-medium">
                    Final: <span className="text-emerald-400 font-black text-base">{finalMatch.carambolasA}</span>
                    <span className="text-text-muted/50 mx-2">vs</span>
                    <span className="text-text-primary font-bold text-base">{finalMatch.carambolasB}</span>
                    <span className="text-text-muted/60 ml-2">contra {finalist.player}</span>
                  </div>
                )}
                {finalMatch && (
                  <div className="text-xs text-text-muted/60 mt-2">
                    {finalMatch.entriesA} entradas · Promedio: {finalMatch.averageA.toFixed(3)}
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
                const colors = ['#F5B800', '#C0C0C0', '#CD7F32', '#888888'];
                const bgAlpha = ['0.08', '0.06', '0.06', '0.04'];
                return (
                  <div
                    key={p.ranking}
                    className="glass-card rounded-xl p-5 text-center glow-hover"
                    style={{
                      borderTop: `3px solid ${colors[i]}`,
                    }}
                  >
                    <div className="flex justify-center mb-3">
                      <MedalBadge position={(i + 1) as 1 | 2 | 3 | 4} size={48} />
                    </div>
                    <div className="text-sm font-bold" style={{ color: colors[i] }}>
                      {p.player}
                    </div>
                    <div className="text-[11px] text-text-muted mt-1">
                      Ronda {p.roundReached}
                    </div>
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
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold tracking-wider text-text-muted uppercase mb-4 px-1">Navegación Rápida</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { href: '/calendario', label: 'Calendario', desc: 'Programación por jornada', icon: 'grid' },
              { href: '/grupos', label: 'Cuadro Principal', desc: 'Grupos y clasificación', icon: 'grid' },
              { href: '/resultados', label: 'Resultados', desc: 'Partidos fase de grupos', icon: 'results' },
              { href: '/eliminacion', label: 'Eliminación', desc: 'Cuadro eliminatorio', icon: 'bracket' },
              { href: '/ranking', label: 'Ranking Final', desc: 'Clasificación general', icon: 'ranking' },
              { href: '/jugadores', label: 'Jugadores', desc: 'Plantel de jugadores', icon: 'players' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="glass-card rounded-xl p-4 glow-hover no-underline group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      {link.icon === 'grid' && <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />}
                      {link.icon === 'results' && <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />}
                      {link.icon === 'bracket' && <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A2.25 2.25 0 0014.25 12h0a2.25 2.25 0 00-2.25 2.25v4.5m-6 0v-4.5A2.25 2.25 0 018.25 12h0A2.25 2.25 0 0110.5 14.25v4.5" />}
                      {link.icon === 'ranking' && <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />}
                      {link.icon === 'players' && <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />}
                      {link.icon === 'config' && <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />}
                      {link.icon === 'config' && <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{link.label}</div>
                    <div className="text-[10px] text-text-muted">{link.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
