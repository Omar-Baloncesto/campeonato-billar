'use client';

import { CITIES } from '../lib/constants';
import type { TournamentConfig, Player, GroupData } from '../data/types';

/* ==================================================================
 *  Configuración del torneo: lo que hay hoy en el Google Sheets.
 *  Es una vista de solo lectura; para cambiar algo se edita el Sheet.
 * ================================================================== */

function Field({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="glass-card rounded-lg px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs text-text-primary font-medium">{label}</div>
        {hint && <div className="text-[10px] text-text-muted/70 mt-0.5">{hint}</div>}
      </div>
      <div className="text-sm font-black text-emerald-400 tabular-nums shrink-0">{value}</div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase mb-1">{title}</h3>
      {subtitle && <p className="text-[11px] text-text-muted mb-3">{subtitle}</p>}
      <div className={subtitle ? '' : 'mt-3'}>{children}</div>
    </section>
  );
}

export default function ConfigClient({
  config,
  players,
  groups,
  resultsCount,
  eliminationCount,
  eliminationRounds,
}: {
  config: TournamentConfig;
  players: Player[];
  groups: GroupData[];
  resultsCount: number;
  eliminationCount: number;
  eliminationRounds: number;
}) {
  const cityCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  for (const p of players) {
    if (p.city) cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
    if (p.category) categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }

  const inactive = players.filter(p => !p.active).length;
  const sizes = [...new Set(groups.map(g => g.standings.length))].sort((a, b) => a - b);

  const total = players.length || config.totalPlayers;
  const bracketSize = total > 1 ? Math.pow(2, Math.ceil(Math.log2(total))) : 0;

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-1">
          Configuración
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Lo que está puesto ahora mismo en el Google Sheets. Para cambiar algo se edita allí y
          esta página se actualiza sola.
        </p>

        <Section title="Torneo">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label="Categoría del torneo" value={config.category} />
            <Field label="Jugadores inscritos" value={total} hint={inactive > 0 ? `${inactive} marcados como no activos` : undefined} />
            <Field label="Grupos" value={groups.length || config.totalGroups} hint={sizes.length ? `${sizes.join(' y ')} jugadores por grupo` : undefined} />
            <Field label="Jugadores por grupo (config.)" value={config.playersPerGroup} />
          </div>
        </Section>

        <Section
          title="Reglas de juego"
          subtitle={
            config.mixedCategories
              ? 'Se cruzan las dos categorías: gana quien consiga el mayor porcentaje de su propio objetivo.'
              : 'Todos los jugadores tienen el mismo objetivo, así que gana quien haga más carambolas.'
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label="Carambolas · primera categoría" value={config.carambolasPrimera} hint="objetivo de la partida" />
            <Field label="Carambolas · segunda categoría" value={config.carambolasSegunda} hint="objetivo de la partida" />
            <Field label="Límite de entradas" value={config.entriesLimit} hint="máximo de entradas por partida" />
            <Field label="Tiempo por entrada" value={`${config.timePerEntry} s`} />
            <Field label="Carambolas · semifinal" value={config.carambolasSemifinal} />
            <Field label="Carambolas · final" value={config.carambolasFinal} />
          </div>
        </Section>

        <Section title="Estado de las hojas" subtitle="Cuántos datos ha generado hasta ahora el Apps Script.">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Field label="Partidos de grupo" value={resultsCount} />
            <Field label="Partidos de cuadro" value={eliminationCount} />
            <Field label="Rondas de eliminación" value={eliminationRounds} />
            <Field label="Tamaño del cuadro" value={bracketSize} hint={`${Math.max(0, bracketSize - total)} BYE`} />
          </div>
        </Section>

        {Object.keys(categoryCounts).length > 0 && (
          <Section title="Jugadores por categoría">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, n]) => (
                <Field
                  key={cat}
                  label={cat}
                  value={n}
                  hint={`objetivo ${cat.toLowerCase().startsWith('prim') ? config.carambolasPrimera : config.carambolasSegunda} carambolas`}
                />
              ))}
            </div>
          </Section>
        )}

        {Object.keys(cityCounts).length > 0 && (
          <Section title="Jugadores por club">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).map(([city, n]) => (
                <div key={city} className="glass-card rounded-lg px-4 py-3 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CITIES[city]?.safeColor || '#888' }} />
                  <span className="flex-1 text-xs text-text-primary truncate">{city}</span>
                  <span className="text-sm font-black text-emerald-400 tabular-nums">{n}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
