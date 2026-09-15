# Registro de cambios en Google Sheets / Apps Script

Documento de trabajo. Cada cambio que se hace en el Sheet o en el Apps Script
se apunta aquí junto con **lo que hay que tocar después en la web** (`app/`).

Cuando Omar diga que ha terminado con el Sheet, se revisa esta lista entera y
se aplican todos los arreglos pendientes en la App y la web.

---

## A · Cambios YA APLICADOS por Omar

### A1 · Trigger W.O. — `onEditResultadosWO`
Nueva convención al registrar un W.O.:

| | Carambolas | Entradas |
|---|---|---|
| Jugador que SÍ se presentó | **1** | **0** |
| Jugador que NO se presentó | **0** | **0** |

Antes era 1/1 y 0/1. Se acabaron los promedios falsos de 1,000.

### A2 · RESULTADOS columna K — "SIN JUGAR"
```
=IF(L2="SI";"W.O.";IF(OR(D2="";H2="");"SIN JUGAR";IF(D2>H2;C2;IF(H2>D2;G2;"EMPATE"))))
```
Antes un partido sin jugar salía como `EMPATE`. Aplicado en la hoja (K2:K61) y
en `CargarResultados`.

### A3 · RESULTADOS columnas F y J — sin `#DIV/0!`
```
F: =IF(OR(D2="";E2="");"";IF(E2=0;0;D2/E2))
J: =IF(OR(H2="";I2="");"";IF(I2=0;0;H2/I2))
```
Necesario porque con la convención A1 las entradas de un W.O. son 0.

### A4 · GRUPOS — reescritura completa
`GenerarGruposCompletos`, `CrearRankingJugadores`, `FormatoGrupos`:
- Construye todo en memoria y escribe con **un solo `setValues`**
  (de ~1.942 llamadas a ~80). Antes superaba el límite de 6 min de Apps Script
  y dejaba la hoja a medio llenar.
- Cruza nombres JUGADORES ↔ RESULTADOS **normalizados** (espacios, mayúsculas).
- **CA/CR devuelven `""` en vez de `0`** cuando el partido no se ha jugado:
  `=IF(RESULTADOS!D2="";"";RESULTADOS!D2)`
- PTS comprueba CA **y** CR (un partido a medio digitar ya no da 2 puntos).
- Informe final: avisa de jugadores cuyos partidos no cuadran.

### A5 · FormatoGrupos — bordes por grupo
Se limpian todos los bordes y luego se dibuja cada grupo como recuadro cerrado.
Antes `setBorder(false,...)` sobre la fila separadora borraba el borde inferior
del grupo anterior y el superior del siguiente.

---

## B · Entregado, PENDIENTE de que Omar lo aplique

### B1 · `GenerarRankingGrupos`
- Excluye del promedio los partidos de W.O. (`if (resData[j][11] === "SI") continue;`).
- Guarda contra `#DIV/0!` en la columna Promedio.
- Afecta a 10 jugadores. Sin el guard, Henry Pacheco y Eduardo Rodríguez dan error.

### B2 · CONFIGURACION — nueva fila
`CrearTorneo` + `FormatoConfiguracion`:

| | Antes | Después |
|---|---|---|
| A6 | Carambolas - Ronda preliminar (fórmula) | **Carambolas primera categoría** (se digita) |
| A7 | Limite de entradas | **Carambolas segunda categoría** (se digita) |
| A8 | Tiempo por entrada | Limite de entradas |
| A9 | Carambolas - Semifinal | Tiempo por entrada |
| A10 | Carambolas - Final | Carambolas - Semifinal |
| A11 | — | Carambolas - Final |

### B3 · `GenerarFixtureGrupos` — obligatorio tras B2
```js
// Carambolas (col E): ahora depende de la categoría
wsF.getRange(filaF, 5).setFormula('=IF(CONFIGURACION!$B$5="Primera";CONFIGURACION!$B$6;CONFIGURACION!$B$7)');
// Entradas (col F): el límite bajó una fila
wsF.getRange(filaF, 6).setFormula("=CONFIGURACION!$B$8");
```
Sin esto la columna Entradas del fixture mostraría las carambolas de 2ª categoría.

---

## C · QUÉ HAY QUE ARREGLAR EN LA WEB por estos cambios

### C1 · `app/lib/sheets.ts` — `fetchConfig()` 🔴 (por B2)
La etiqueta `"Carambolas - Ronda preliminar"` **deja de existir**. Hoy:
```ts
carambolasPreliminary: parseNumber(get('Carambolas - Ronda preliminar') || byLabel('Carambolas - Ronda') || '20')
```
Los dos fallan → cae al default 20. Hay que leer las dos etiquetas nuevas y
elegir según `category`. Lo mismo en `app/configuracion/ConfigClient.tsx`.

Las demás etiquetas siguen bien: la web busca por texto, no por fila.

### C2 · `parseNumber('')` devuelve `0` 🔴 (por A4)
`app/lib/sheets.ts` y `app/lib/sheets-client.ts`. El Sheet ya distingue
"pendiente" (vacío) de "cero", pero la web lo pisa y pinta **0**.
Hay que permitir `null` para CA/CR/PTS y pintar `—` o vacío.

### C3 · `hasP3` incoherente 🟡 (por A4)
```ts
const hasP3 = row[4] !== undefined && row[4] !== '';
caP3: hasP3 ? parseNumber(row[4]) : null,
```
P1/P2 pendientes → `0`; P3 pendiente → columna oculta. Tres comportamientos
para lo mismo. Debe distinguir "grupo de 3 jugadores" de "partido pendiente".

### C4 · "SIN JUGAR" en la columna Resultado 🟡 (por A2)
`fetchResults()` mapea `winner: r[10]`. Ahora puede valer `"SIN JUGAR"`.
Revisar `/resultados` y `/calendario` para que no lo trate como nombre de jugador.

### C5 · W.O. con 0 entradas 🟡 (por A1)
`CalendarioClient`: `hasScore = m.carambolasA > 0 || m.carambolasB > 0`.
Un W.O. tipo "AB" (0-0) aparecería como "Programado" aunque esté resuelto.

---

## D · Pendientes del diagnóstico original (independientes de lo anterior)

| # | Qué | Estado |
|---|---|---|
| 1 | Ciudad equivocada en 29 de 42 jugadores (el sorteo baraja solo la columna B) | 🔴 pendiente |
| 2 | `Eliminación Simple` con/sin tilde: el paso 7 recrea la pestaña sin tilde | 🔴 pendiente |
| 3 | No hay `error.tsx`: si Google falla, la web se queda en blanco | 🔴 pendiente |
| 4 | Sin caché: ~7 lecturas del Sheet por visitante → Google rate-limita | 🔴 pendiente |
| 5 | `/api/revalidate` no hace nada y nadie lo llama (tiempo real) | 🟡 pendiente |
| 6 | Calendario usa `app/data/schedule.ts` fijo; `fetchProgramacion()` es código muerto | 🟡 pendiente |
| 7 | ORDEN GRUPO sin desempate final (dos "1" en el Grupo 10) | ⚖️ decide Omar |
| 8 | GRUPOS no trae entradas → no existe el promedio en la clasificación | ⚖️ decide Omar |
| 9 | Convención de W.O. — resuelto en A1, confirmar que es la definitiva | ⚖️ decide Omar |
| 14 | Campeón/podio fijados a `round === 6`: con otro nº de inscritos se queda vacío | 🟡 pendiente |
| 15 | Resto del Apps Script sigue escribiendo celda a celda | ⚪ pendiente |
| 16-18 | Código duplicado, archivos muertos, `package.json` | ⚪ pendiente |

**RankingGrupos y RankingFinal son fotos congeladas** (valores, no fórmulas).
No se actualizan solas: hay que correr el menú. La web `/ranking` las lee tal cual.

---

## E · Copia de seguridad

`COPIA SEGURIDAD 2026-09-15 — Programa Billar 3 bandas Club Tennis`
https://docs.google.com/spreadsheets/d/1TzWeEtQCOhR3SG0YXJg64ppT34uSIeKEQ-Q5UQp_2TE/edit

Sin verificar si arrastró el Apps Script vinculado.
