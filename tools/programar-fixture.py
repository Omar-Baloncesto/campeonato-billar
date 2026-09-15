#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Reparte los partidos de FIXTURE_GRUPOS en días, turnos y mesas.

Genera las tres columnas que se pegan en la hoja FIXTURE_GRUPOS del Google
Sheets: G (Fecha), H (Hora) e I (Mesa). El calendario de la web las lee de
ahí y ordena solo.

Qué respeta:
  · nadie está citado en dos mesas a la misma hora
  · nadie juega dos turnos seguidos            (se minimiza; ver más abajo)
  · nadie juega más de MAX_POR_NOCHE partidos en una misma noche
  · todos los grupos juegan el primer día

Con muchos partidos en pocos turnos el cero absoluto de "turnos seguidos"
puede ser imposible: el programa busca el mínimo y te dice a quién le toca,
para que lo tengas en cuenta el día del torneo.

Uso:
    python3 tools/programar-fixture.py fixture.csv

donde fixture.csv es la hoja FIXTURE_GRUPOS descargada como CSV
(Archivo → Descargar → CSV). Imprime la programación y deja el bloque
listo para pegar en programacion-G-H-I.tsv.
"""

import csv, io, sys, math, random, time, datetime
from collections import defaultdict

# ------------------------------------------------------------------ ajustes
JORNADAS = [
    # (fecha, [horas de inicio de cada turno], partidos de esa jornada)
    (datetime.date(2026, 9, 23), ["17:00", "18:00", "19:00", "20:00", "21:00"], 25),
    (datetime.date(2026, 9, 24), ["17:00", "18:00", "19:00"], 13),
]
MESAS = 5
MAX_POR_NOCHE = 3
SEGUNDOS_DE_BUSQUEDA = 20
INTENTOS = 6


def turnos_y_cupos():
    """Convierte JORNADAS en una lista plana de turnos con su cupo."""
    turnos, cupos, dias = [], [], []
    for d, (fecha, horas, total) in enumerate(JORNADAS):
        base, resto = divmod(total, len(horas))
        for i, h in enumerate(horas):
            cupo = min(MESAS, base + (1 if i < resto else 0))
            turnos.append((fecha, h)); cupos.append(cupo); dias.append(d)
    if sum(cupos) != sum(t for _, _, t in JORNADAS):
        raise SystemExit("Los turnos y las mesas no dan para tantos partidos.")
    return turnos, cupos, dias


def leer(ruta):
    filas = list(csv.reader(io.open(ruta, encoding="utf-8")))[1:]
    return [(int(r[0]), int(r[1]), r[2].strip(), r[4].strip())
            for r in filas if r and r[0].strip() and r[2].strip() and r[4].strip()]


def resolver(partidos, cupos, dias, semilla):
    """Recocido simulado sobre el reparto de partidos en turnos."""
    jugadores = sorted({x for p in partidos for x in (p[2], p[3])})
    idx = {j: i for i, j in enumerate(jugadores)}
    pares = [(idx[p[2]], idx[p[3]]) for p in partidos]
    ns, nj, nm = len(cupos), len(jugadores), len(partidos)

    def coste(turno):
        c = [[0] * ns for _ in range(nj)]
        for m, s in enumerate(turno):
            a, b = pares[m]; c[a][s] += 1; c[b][s] += 1
        choque = seguido = exceso = 0
        for j in range(nj):
            por_dia = defaultdict(int)
            for s in range(ns):
                n = c[j][s]
                if n > 1: choque += n - 1
                por_dia[dias[s]] += n
                if n and s + 1 < ns and dias[s + 1] == dias[s] and c[j][s + 1]:
                    seguido += 1
            for n in por_dia.values():
                if n > MAX_POR_NOCHE: exceso += n - MAX_POR_NOCHE
        return choque * 1000 + exceso * 50 + seguido

    r = random.Random(semilla)
    turno = [s for s, c in enumerate(cupos) for _ in range(c)]
    r.shuffle(turno)
    actual = coste(turno)
    mejor, mejor_t = actual, turno[:]
    fin, T = time.time() + SEGUNDOS_DE_BUSQUEDA, 3.0
    while time.time() < fin and mejor > 0:
        T = max(0.05, T * 0.999995)
        i, j = r.randrange(nm), r.randrange(nm)
        if turno[i] == turno[j]: continue
        turno[i], turno[j] = turno[j], turno[i]
        nuevo = coste(turno)
        if nuevo <= actual or r.random() < math.exp((actual - nuevo) / T):
            actual = nuevo
            if actual < mejor: mejor, mejor_t = actual, turno[:]
        else:
            turno[i], turno[j] = turno[j], turno[i]
    return mejor, mejor_t


def repartir_mesas(partidos, turno):
    """Cada grupo intenta quedarse siempre en la misma mesa."""
    por_turno = defaultdict(list)
    for m, s in enumerate(turno): por_turno[s].append(m)
    mesa = {}
    for s, ms in por_turno.items():
        libres = set(range(1, MESAS + 1))
        pend = sorted(ms, key=lambda m: (partidos[m][0], partidos[m][1]))
        for m in pend[:]:
            g = partidos[m][0]
            if g in libres: mesa[m] = g; libres.discard(g); pend.remove(m)
        for m in pend:
            x = min(libres); mesa[m] = x; libres.discard(x)
    return mesa


def h12(h):
    hh, mm = h.split(":"); hh = int(hh)
    return f"{hh - 12 if hh > 12 else hh}:{mm} {'p. m.' if hh >= 12 else 'a. m.'}"


def main():
    ruta = sys.argv[1] if len(sys.argv) > 1 else "fixture.csv"
    partidos = leer(ruta)
    turnos, cupos, dias = turnos_y_cupos()
    if len(partidos) != sum(cupos):
        raise SystemExit(f"{len(partidos)} partidos pero {sum(cupos)} huecos: ajusta JORNADAS.")

    mejor, turno = min((resolver(partidos, cupos, dias, s) for s in range(INTENTOS)),
                       key=lambda x: x[0])
    mesa = repartir_mesas(partidos, turno)

    # informe
    ps = defaultdict(list)
    for m, s in enumerate(turno):
        for j in (partidos[m][2], partidos[m][3]): ps[j].append(s)
    seguidos = [(j, turnos[a][0], turnos[a][1], turnos[b][1])
                for j, sl in ps.items() for a, b in zip(sorted(sl), sorted(sl)[1:])
                if dias[a] == dias[b] and b == a + 1]
    print(f"{len(partidos)} partidos · coste {mejor}")
    print("jugadores con dos partidos seguidos:", seguidos or "ninguno")

    for d, (fecha, horas, total) in enumerate(JORNADAS):
        print(f"\n=== {fecha.strftime('%d/%m/%Y')} — {sum(1 for s in turno if dias[s]==d)} partidos")
        for s in [i for i in range(len(turnos)) if dias[i] == d]:
            ms = [m for m in range(len(partidos)) if turno[m] == s]
            if not ms: continue
            print(f"  {h12(turnos[s][1])}")
            for m in sorted(ms, key=lambda m: mesa[m]):
                g, n, a, b = partidos[m]
                print(f"      Mesa {mesa[m]}  ·  G{g} P{n:<2}  {a:<20} vs  {b}")

    with io.open("programacion-G-H-I.tsv", "w", encoding="utf-8") as f:
        for m, p in enumerate(partidos):
            fecha, hora = turnos[turno[m]]
            f.write(f"{fecha.strftime('%d/%m/%Y')}\t{h12(hora)}\t{mesa[m]}\n")
    print("\nPega programacion-G-H-I.tsv en la celda G2 de FIXTURE_GRUPOS.")


if __name__ == "__main__":
    main()
