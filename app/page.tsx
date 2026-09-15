import Link from 'next/link';
import { fetchConfig, fetchPlayers, fetchResults, fetchEliminationMatches, fetchGroups } from './lib/sheets';
import { CITIES } from './lib/constants';
import { TrophyBadge, MedalBadge } from './components/TrophyBadge';
import StatCard from './components/StatCard';
import { fmtAvg, fmtPct, fmtInt, EMPTY } from './lib/format';
import { shortRoundName } from './lib/rounds';

// ISR: la página se regenera cada 15 s como mucho, y al instante
// cuando el Apps Script llama a /api/revalidate al editar una celda.
export const revalidate = 15;

export default async function Dashboard() {
  const [config, players, results, elimination, { groups }] = await Promise.all([
    fetchConfig(),
    fetchPlayers(),
    fetchResults(),
    fetchEliminationMatches().catch(() => []),
    fetchGroups().catch(() => ({ groups: [], ranking: [] })),
  ]);

  /* ---------------- Eliminación: campeón y podio ---------------- */
  const elimRounds = [...new Set(elimination.map(m => m.round))].sort((a, b) => a - b);
  const maxRound = elimRounds.length ? elimRounds[elimRounds.length - 1] : 0;
  const firstRound = elimRounds.length ? elimRounds[0] : 0;

  const finalMatch = elimination.find(m => m.round === maxRound && !m.isBye) || null;
  const champion = finalMatch?.winner || '';
  const runnerUp = finalMatch && champion
    ? (champion === finalMatch.playerA ? finalMatch.playerB : finalMatch.playerA)
    : '';

  const semis = elimination.filter(m => m.round === maxRound - 1 && !m.isBye && m.winner);
  const semiLosers = semis.map(m => (m.winner === m.playerA ? m.playerB : m.playerA)).filter(Boolean);

  const podium = champion
    ? [
        { pos: 1 as const, player: champion, round: maxRound, label: finalMatch?.roundName || 'Final' },
        { pos: 2 as const, player: runnerUp, round: maxRound, label: finalMatch?.roundName || 'Final' },
        ...semiLosers.slice(0, 2).map((p, i) => ({
          pos: (3 + i) as 3 | 4,
          player: p,
          round: maxRound - 1,
          label: semis[0]?.roundName || 'Semifinal',
        })),
      ]
    : [];

  /* ---------------- Números del torneo ---------------- */
  const playedGroup = results.filter(r => r.status === 'played' || r.status === 'draw').length;
  const elimReal = elimination.filter(m => !m.isBye);
  const elimPlayed = elimReal.filter(m => m.status === 'played').length;
  const byeCount = elimination.filter(m => m.round === firstRound && m.isBye).length;

  let carambolas = 0;
  let entries = 0;
  let best = { avg: -1, player: '' };
  let bestPct = { pct: -1, player: '' };
  for (const r of results) {
    if (r.status !== 'played' && r.status !== 'draw') continue;
    for (const s of [
      { c: r.carambolasA, e: r.entriesA, a: r.averageA, p: r.pctA, n: r.playerA },
      { c: r.carambolasB, e: r.entriesB, a: r.averageB, p: r.pctB, n: r.playerB },
    ]) {
      if (s.c !== null) carambolas += s.c;
      if (s.e !== null) entries += s.e;
      if (s.a !== null && s.a > best.avg) best = { avg: s.a, player: s.n };
      if (s.p !== null && s.p > bestPct.pct) bestPct = { pct: s.p, player: s.n };
    }
  }
  const generalAvg = entries > 0 ? carambolas / entries : null;

  const cityCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  for (const p of players) {
    if (p.city) cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
    if (p.category) categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }

  const stage = champion
    ? 'Torneo finalizado'
    : elimination.length > 0
      ? `En ${shortRoundName(currentRoundName(elimination, elimRounds))}`
      : playedGroup > 0
        ? 'Fase de grupos'
        : 'Por comenzar';

  return (
    <div className="animate-fade-in">
      {/* ---------------- Cabecera de estado ---------------- */}
      <div className="px-4 pt-6 md:px-8">
        <div className="max-w-4xl mx-auto flex items-baseline justify-between gap-3 flex-wrap mb-4">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">
            {config.category ? `Torneo ${config.category}` : 'Torneo'}
          </h2>
          <span className="text-xs text-text-muted bg-white/5 px-3 py-1 rounded-full">{stage}</span>
        </div>
      </div>

      {/* ---------------- Números ---------------- */}
      <div className="px-4 pb-6 md:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
          <StatCard label="Jugadores" value={players.length || config.totalPlayers} />
          <StatCard label="Grupos" value={groups.length || config.totalGroups} />
          <StatCard
            label="Partidos de grupo"
            value={`${playedGroup}/${results.length}`}
            hint={results.length ? `${Math.round((playedGroup / results.length) * 100)} % disputado` : undefined}
          />
          <StatCard
            label="Partidos de cuadro"
            value={`${elimPlayed}/${elimReal.length}`}
            hint={byeCount > 0 ? `${byeCount} BYE` : undefined}
          />
        </div>
      </div>

      {/* ---------------- Campeón ---------------- */}
      {champion && (
        <div className="px-4 pb-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div
              className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-center border-2 border-[#F5B800]/40"
              style={{
                background: 'linear-gradient(160deg, rgba(245,184,0,0.12) 0%, rgba(255,215,0,0.06) 40%, rgba(16,185,129,0.04) 100%)',
                boxShadow: '0 0 60px rgba(245,184,0,0.1), 0 8px 32px rgba(0,0,0,0.08)',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(245,184,0,0.15) 0%, transparent 55%)' }}
              />
              <div className="relative">
                <div className="flex justify-center mb-5">
                  <TrophyBadge size={130} />
                </div>
                <div className="text-xs tracking-[0.35em] text-[#B8860B] uppercase mb-2 font-black">Campeón</div>
                <div
                  className="text-3xl md:text-5xl font-black tracking-wider text-[#C8960A] mb-4"
                  style={{ textShadow: '0 2px 12px rgba(245,184,0,0.25)' }}
                >
                  {champion}
                </div>
                {finalMatch && runnerUp && (
                  <>
                    <div className="text-sm text-text-muted font-medium">
                      {finalMatch.roundName}:{' '}
                      <span className="text-emerald-400 font-black text-base">{fmtInt(finalMatch.carambolasA)}</span>
                      <span className="text-text-muted/50 mx-2">–</span>
                      <span className="text-text-primary font-bold text-base">{fmtInt(finalMatch.carambolasB)}</span>
                      <span className="text-text-muted/60 ml-2">contra {runnerUp}</span>
                    </div>
                    <div className="text-xs text-text-muted/60 mt-2">
                      {finalMatch.playerA} {fmtPct(finalMatch.pctA, 0)} · {finalMatch.playerB} {fmtPct(finalMatch.pctB, 0)}
                      {finalMatch.averageA !== null && <> · promedio {fmtAvg(finalMatch.averageA)}</>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Podio ---------------- */}
      {podium.length >= 2 && (
        <div className="px-4 pb-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold tracking-wider text-text-muted uppercase mb-4 px-1">Podio Final</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
              {podium.map((p, i) => {
                const colors = ['#F5B800', '#C0C0C0', '#CD7F32', '#888888'];
                return (
                  <div
                    key={`${p.pos}-${p.player}`}
                    className="glass-card rounded-xl p-5 text-center glow-hover"
                    style={{ borderTop: `3px solid ${colors[i]}` }}
                  >
                    <div className="flex justify-center mb-3">
                      <MedalBadge position={(i + 1) as 1 | 2 | 3 | 4} size={48} />
                    </div>
                    <div className="text-sm font-bold" style={{ color: colors[i] }}>{p.player}</div>
                    <div className="text-[11px] text-text-muted mt-1">{shortRoundName(p.label)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Marcas del torneo ---------------- */}
      {(best.avg >= 0 || bestPct.pct >= 0) && (
        <div className="px-4 pb-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold tracking-wider text-text-muted uppercase mb-4 px-1">Marcas de la Fase de Grupos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total carambolas" value={carambolas} />
              <StatCard label="Promedio general" value={fmtAvg(generalAvg)} hint="carambolas por entrada" />
              <StatCard label="Mejor promedio" value={fmtAvg(best.avg >= 0 ? best.avg : null)} hint={best.player} accent />
              {config.mixedCategories ? (
                <StatCard label="Mejor % objetivo" value={fmtPct(bestPct.pct >= 0 ? bestPct.pct : null)} hint={bestPct.player} accent />
              ) : (
                <StatCard label="Límite de entradas" value={config.entriesLimit} hint={`${config.timePerEntry} s por entrada`} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Reparto de jugadores ---------------- */}
      <div className="px-4 pb-8 md:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-text-muted uppercase mb-4 px-1">Jugadores por Club</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 stagger-children">
              {Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
                <div key={city} className="glass-card rounded-lg p-3 flex items-center gap-2 glow-hover">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CITIES[city]?.safeColor || '#888' }} />
                  <div className="flex-1 min-w-0 text-[11px] text-text-primary font-medium truncate">{city}</div>
                  <div className="text-sm font-bold text-emerald-400 tabular-nums">{count}</div>
                </div>
              ))}
              {Object.keys(cityCounts).length === 0 && (
                <div className="text-xs text-text-muted px-1">{EMPTY}</div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-wider text-text-muted uppercase mb-4 px-1">Por Categoría</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="glass-card rounded-lg p-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-text-primary font-medium truncate">{cat}</div>
                    <div className="text-[10px] text-text-muted">
                      objetivo{' '}
                      {cat.toLowerCase().startsWith('prim') ? config.carambolasPrimera : config.carambolasSegunda}{' '}
                      carambolas
                    </div>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 tabular-nums">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Navegación ---------------- */}
      <div className="px-4 pb-8 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold tracking-wider text-text-muted uppercase mb-4 px-1">Navegación Rápida</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { href: '/calendario', label: 'Calendario', desc: 'Programación por jornada' },
              { href: '/grupos', label: 'Grupos', desc: 'Tablas y clasificación' },
              { href: '/resultados', label: 'Resultados', desc: 'Partidos de la fase de grupos' },
              { href: '/eliminacion', label: 'Eliminación', desc: 'Cuadro eliminatorio' },
              { href: '/ranking', label: 'Ranking', desc: 'Clasificación general' },
              { href: '/jugadores', label: 'Jugadores', desc: 'Plantel inscrito' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="glass-card rounded-xl p-4 glow-hover no-underline group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
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

function currentRoundName(
  matches: { round: number; isBye: boolean; status: string; roundName: string }[],
  rounds: number[],
): string {
  for (const r of rounds) {
    const real = matches.filter(m => m.round === r && !m.isBye);
    if (real.some(m => m.status === 'pending')) return real[0]?.roundName || `Ronda ${r}`;
  }
  const last = rounds[rounds.length - 1];
  return matches.find(m => m.round === last)?.roundName || '';
}
