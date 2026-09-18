'use client';

import { useMemo } from 'react';
import type { EliminationMatch } from '../data/types';
import { fmtInt, fmtPct } from '../lib/format';

/* ==================================================================
 *  Cuadro de eliminación, para cualquier número de rondas.
 *
 *  El Apps Script siembra en espejo: en cada ronda el partido i lo
 *  juegan el ganador del partido i y el del partido (último + 1 - i)
 *  de la ronda anterior. Eso mantiene la siembra (el 1 y el 2 solo se
 *  cruzan en la final) pero significa que los partidos que alimentan
 *  a uno NO son vecinos en la lista.
 *
 *  Por eso el cuadro se dibuja construyendo el árbol de verdad desde
 *  la final hacia atrás y colocando cada partido en la media de la
 *  altura de sus dos alimentadores.
 * ================================================================== */

const CARD_W = 184;
const CARD_H = 58;
const V_GAP = 12;
const H_GAP = 36;
const LABEL_H = 34;

interface Node {
  round: number;
  match: number;
  data: EliminationMatch | null;
  children: Node[];
  y: number;
}

function buildTree(byRound: Map<number, EliminationMatch[]>, rounds: number[]): Node | null {
  if (rounds.length === 0) return null;
  const last = rounds[rounds.length - 1];

  const make = (round: number, match: number): Node => {
    const list = byRound.get(round) || [];
    const data = list.find(m => m.match === match) || null;
    const node: Node = { round, match, data, children: [], y: 0 };

    const prevRound = round - 1;
    const prev = byRound.get(prevRound);
    if (prev && prev.length > 0) {
      const total = prev.length;
      node.children = [make(prevRound, match), make(prevRound, total + 1 - match)];
    }
    return node;
  };

  const root = make(last, 1);

  let leaf = 0;
  const assignY = (n: Node): number => {
    if (n.children.length === 0) {
      n.y = leaf * (CARD_H + V_GAP) + CARD_H / 2;
      leaf++;
      return n.y;
    }
    const ys = n.children.map(assignY);
    n.y = (ys[0] + ys[ys.length - 1]) / 2;
    return n.y;
  };
  assignY(root);

  return root;
}

function flatten(root: Node | null): Node[] {
  if (!root) return [];
  const out: Node[] = [];
  const walk = (n: Node) => {
    out.push(n);
    n.children.forEach(walk);
  };
  walk(root);
  return out;
}

function Slot({
  name, carambolas, pct, isWinner, isBye, showPct,
}: {
  name: string;
  carambolas: number | null;
  pct: number | null;
  isWinner: boolean;
  isBye: boolean;
  showPct: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1.5 px-2 h-[26px] rounded"
      style={{
        background: isWinner ? 'rgba(16,185,129,0.12)' : 'transparent',
      }}
    >
      <span
        title={name || 'Por definir'}
        className={`flex-1 text-[11px] truncate ${
          isBye || name.trim() === ''
            ? 'text-text-muted/40 italic'
            : isWinner
              ? 'text-text-primary font-bold'
              : 'text-text-muted'
        }`}
      >
        {name.trim() === '' ? 'Por definir' : name}
      </span>
      {showPct && (
        <span className={`font-mono text-[9px] w-10 text-right ${isWinner ? 'text-emerald-400' : 'text-text-muted/60'}`}>
          {pct === null ? '' : fmtPct(pct, 0)}
        </span>
      )}
      <span className={`font-mono text-[11px] w-5 text-right ${isWinner ? 'text-emerald-400 font-bold' : 'text-text-muted/70'}`}>
        {isBye ? '' : fmtInt(carambolas)}
      </span>
    </div>
  );
}

function MatchCard({ node, showPct, isFinal = false }: { node: Node; showPct: boolean; isFinal?: boolean }) {
  const m = node.data;
  if (!m) {
    return (
      <div className="h-full rounded-lg border border-dashed border-border-subtle flex items-center justify-center">
        <span className="text-[10px] text-text-muted/40">Por definir</span>
      </div>
    );
  }

  const winnerA = m.winner !== '' && m.winner === m.playerA;
  const winnerB = m.winner !== '' && m.winner === m.playerB;

  return (
    <div
      className={`h-full rounded-lg border px-1 py-1 flex flex-col justify-center ${
        isFinal && m.winner
          ? 'border-2 border-[#F5B800]/50'
          : m.isBye
            ? 'border-border-subtle/60 bg-white/[0.01]'
            : m.status === 'pending'
              ? 'border-border-subtle border-dashed'
              : 'border-border-light bg-white/[0.02]'
      }`}
      style={isFinal && m.winner
        ? { background: 'linear-gradient(135deg, rgba(245,184,0,0.12), rgba(245,184,0,0.03))' }
        : undefined}
    >
      <Slot
        name={m.playerA}
        carambolas={m.carambolasA}
        pct={m.pctA}
        isWinner={winnerA}
        isBye={m.playerA.toUpperCase() === 'BYE'}
        showPct={showPct}
      />
      <Slot
        name={m.playerB}
        carambolas={m.carambolasB}
        pct={m.pctB}
        isWinner={winnerB}
        isBye={m.isBye}
        showPct={showPct}
      />
    </div>
  );
}

export default function BracketTree({
  matches,
  showPct = true,
}: {
  matches: EliminationMatch[];
  showPct?: boolean;
}) {
  const { nodes, rounds, roundNames, height, champion } = useMemo(() => {
    const byRound = new Map<number, EliminationMatch[]>();
    for (const m of matches) {
      const list = byRound.get(m.round) || [];
      list.push(m);
      byRound.set(m.round, list);
    }
    for (const list of byRound.values()) list.sort((a, b) => a.match - b.match);

    const rs = [...byRound.keys()].sort((a, b) => a - b);
    const names: Record<number, string> = {};
    for (const r of rs) names[r] = byRound.get(r)![0]?.roundName || `Ronda ${r}`;

    const root = buildTree(byRound, rs);
    const flat = flatten(root);
    const firstRoundCount = rs.length ? (byRound.get(rs[0]) || []).length : 0;

    return {
      nodes: flat,
      rounds: rs,
      roundNames: names,
      height: Math.max(CARD_H, firstRoundCount * (CARD_H + V_GAP)),
      champion: root?.data?.winner || '',
    };
  }, [matches]);

  if (rounds.length === 0) return null;

  const colX = (round: number) => rounds.indexOf(round) * (CARD_W + H_GAP);
  const lastRound = rounds[rounds.length - 1];
  const totalW = (rounds.length - 1) * (CARD_W + H_GAP) + CARD_W;

  return (
    <div className="glass-card rounded-xl p-4 overflow-x-auto">
      <div className="relative" style={{ width: totalW, height: height + LABEL_H + 8 }}>
        {/* Etiquetas de ronda */}
        {rounds.map(r => (
          <div
            key={`label-${r}`}
            className="absolute text-center"
            style={{ left: colX(r), top: 0, width: CARD_W }}
          >
            <span className="text-[10px] tracking-[0.12em] uppercase font-bold text-text-muted">
              {roundNames[r]}
            </span>
          </div>
        ))}
        {/* Líneas del cuadro */}
        <svg
          className="absolute pointer-events-none"
          style={{ left: 0, top: LABEL_H, width: totalW, height }}
          width={totalW}
          height={height}
        >
          {nodes.flatMap(node =>
            node.children.map((child, i) => {
              const x1 = colX(child.round) + CARD_W;
              const xMid = x1 + H_GAP / 2;
              const x2 = colX(node.round);
              return (
                <g key={`l-${node.round}-${node.match}-${i}`} stroke="var(--color-border-light, rgba(255,255,255,0.12))" strokeWidth={1.5} fill="none">
                  <line x1={x1} y1={child.y} x2={xMid} y2={child.y} />
                  <line x1={xMid} y1={child.y} x2={xMid} y2={node.y} />
                  <line x1={xMid} y1={node.y} x2={x2} y2={node.y} />
                </g>
              );
            }),
          )}
        </svg>

        {/* Partidos */}
        {nodes.map(node => (
          <div
            key={`m-${node.round}-${node.match}`}
            className="absolute"
            style={{
              left: colX(node.round),
              top: LABEL_H + node.y - CARD_H / 2,
              width: CARD_W,
              height: CARD_H,
            }}
          >
            <MatchCard node={node} showPct={showPct} isFinal={node.round === lastRound} />
          </div>
        ))}

      </div>

      {champion && (
        <p className="text-[11px] text-text-muted mt-3">
          Campeón: <span className="text-[#C8960A] font-black">{champion}</span>
        </p>
      )}
    </div>
  );
}
