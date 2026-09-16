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

### B6 · M7 — columnas N (Fecha) y O (Hora) en la eliminación
El paso 7 ya programa el cuadro: reparte las rondas en horas seguidas
respetando que una ronda no empieza hasta que acaba la anterior y que solo
hay `ELIM_MESAS` mesas a la vez. Los BYE quedan sin fecha porque no se
juegan. Las dos columnas se pueden editar a mano en la hoja.

Ajustes al principio del archivo: `ELIM_FECHA`, `ELIM_HORA_INICIO`,
`ELIM_HORA_FIN`, `ELIM_MESAS` y `ELIM_HORAS_POR_PARTIDA`. Si el cuadro no
cabe en un día, sigue al siguiente (comprobado con 42 y 64 jugadores).

### B4 · M7/M8/M9 — Eliminación Simple reescrita
`CrearEliminacionSimple`, `Crear_Rondas_Eliminacion_Automatica`, `Formato_Ronda`.
Código completo en `apps-script/M7-M9-eliminacion-simple.gs`.

- **Bug destructivo corregido.** `Crear_Rondas_Eliminacion_Automatica` colocaba
  la ronda 2 en `getLastRow(K)+4`. Como los ganadores todavía están vacíos,
  `getLastRow(K)` apuntaba al último partido CON ganador y la ronda nueva se
  escribía **encima** de los últimos partidos de la ronda 1. En el torneo actual
  se perdieron los partidos 14, 15 y 16 y la ronda 2 se creó con 5 partidos en
  vez de 8: los jugadores 11 a 22 quedaron fuera del cuadro.
- Ahora el cuadro **entero** se calcula del tamaño del torneo
  (`cupo = 2^ceil(log2(N))`, ronda *r* tiene `cupo/2^r` partidos) y se escribe
  con **un solo `setValues`**. No depende de que haya resultados.
- Todas las rondas nacen con fórmulas listas: el ganador sube solo a la
  siguiente ronda. Vacío mientras no se digite; nunca propaga "EMPATE".
- Rondas con nombre: FINAL, SEMIFINAL, CUARTOS, OCTAVOS, DIECISEISAVOS…
- **Nuevas columnas L = Objetivo A y M = Objetivo B** (`VLOOKUP` a
  `'Base de Datos'!$B$3:$E` columna 4). Van al final para no mover `A:K`.
- Ganador **por promedio** `carambolas/objetivo`, igual que GRUPOS. Si los dos
  objetivos son iguales el resultado es idéntico a comparar carambolas, así que
  sirve para torneo de una sola categoría y para primera contra segunda.
- La hoja se crea ya **con tilde**: `Eliminación Simple`. Esto cierra el punto
  D2: `GenerarRankingFinal` y la web la buscan con tilde.
- `Crear_Rondas_Eliminacion_Automatica` queda como aviso; ya no se usa.

### B5 · M5 RESULTADOS — el ganador sale del promedio, no de las carambolas
`CargarResultados` + nueva función `formulaResultadoPartido(r)`.
Código completo en `apps-script/M5-resultados.gs`.

La columna K comparaba `D>H` (carambolas a secas). En un grupo mixto eso da el
ganador equivocado: Andrés 10 carambolas con objetivo 20 (0,500) figuraba por
encima de Jorge con 9 y objetivo 17 (0,529). GRUPOS ya calculaba bien el punto,
así que RESULTADOS y GRUPOS se contradecían en pantalla.

Ahora K decide en este orden: `W.O.` → `SIN JUGAR` → mayor `D/M` contra `H/N`
→ (si falta objetivo) mayor carambolas → `EMPATE`. Con objetivos iguales las
dos comparaciones son equivalentes, así que sirve igual para torneo de una sola
categoría.

**Columnas O y P — `% Objetivo A` y `% Objetivo B`.** El número que decide el
partido (`carambolas / objetivo`) ahora se ve, en formato porcentaje: Andrés
50,0% contra Jorge 52,9%. El más alto de los dos sale en verde y negrita por
formato condicional, así que se entiende sin abrir la fórmula. Van después de
`N`, así que `A:L` —lo que lee la web— no se mueve.

Ojo: `F` y `J` (`Promedio A/B`) siguen siendo carambolas ÷ entradas, el promedio
de la partida. No deciden nada; son dos cosas distintas y ahora se ven por
separado.

Fórmula para arreglar las filas que ya existen (pegar en K2 y arrastrar):
```
=SI(L2="SI";"W.O.";SI(O(D2="";H2="");"SIN JUGAR";SI(O(M2="";N2="";M2=0;N2=0);SI(D2>H2;C2;SI(H2>D2;G2;"EMPATE"));SI(D2/M2>H2/N2;C2;SI(H2/N2>D2/M2;G2;"EMPATE")))))
```

---

## C · LA WEB, YA ARREGLADA SEGÚN EL SHEET

Todo lo de esta sección está aplicado y verificado contra una copia local
del Sheet real (22 jugadores, 5 grupos, cuadro de 32).

### C1 · `app/lib/sheets.ts` — reescrito
Antes se leía `GRUPOS!A1:Q200` con las columnas fijadas a mano suponiendo
grupos de 3 partidos. El Sheet de hoy llega hasta la columna **V** y tiene
**4** columnas CA/CR/PTS, así que la web leía cada dato una columna corrida:
en `#` salía el ORDEN, en `CA` la suma de otra cosa, y la columna
«Ranking Jugadores» ni se leía.

Ahora la posición de cada columna se deduce del **encabezado de cada grupo**,
así que funciona con cualquier tamaño de grupo sin tocar código.

### C2 · Vacío ya no es cero
`parseNumber('')` devolvía `0`, así que un partido sin jugar se pintaba como
un 0-0 real. Ahora todo lo que puede estar pendiente es `number | null` y se
pinta `—`.

### C3 · Se acabaron las columnas P1/P2/P3 fijas
En un grupo de n jugadores cada uno juega n-1 partidos. Se calcula, no se
supone. Con eso el recuento pasó de «34 de 44» (mal) a «34 de 38» (bien).

### C4 · «SIN JUGAR» y «EMPATE» ya no son nombres de jugador
La columna Resultado puede traer `W.O.`, `SIN JUGAR` o `EMPATE`. Antes se
tomaban como el nombre del ganador. Ahora cada partido tiene un estado
(jugado / sin jugar / empate / W.O.) con su etiqueta de color.

### C5 · W.O. con 0 entradas
Ya no aparece como «Programado»: el estado sale de la columna W.O., no de
si hay carambolas.

### C6 · Eliminación: rondas y campeón dinámicos
El campeón estaba fijado a `round === 6`. Con 22 inscritos la final es la
ronda **5**, así que la web se quedaba sin campeón ni podio. Ahora la última
ronda se deduce del cuadro, y el nombre de cada ronda sale de cuántos
partidos tiene (Final, Semifinal, Cuartos, Octavos, Dieciseisavos…).

También se leen las columnas **L y M** (Objetivo A/B), así que la web enseña
el **% de objetivo** y explica cuándo alguien pasa con menos carambolas.

### C7 · Cuadro de eliminación de verdad
El cuadro anterior estaba dibujado a mano para 16 jugadores desde octavos.
Ahora se construye el árbol desde la final hacia atrás siguiendo la siembra
en espejo del Apps Script, así que sirve para cualquier número de rondas.

### C8b · Calendario: grupos + eliminación, y vista de Resultados
El calendario ahora junta en una sola línea de tiempo la fase de grupos y
el cuadro de eliminación, cada partido en su día y su hora:

- **Programación** — todo lo que se juega, jornada por jornada y turno por
  turno. Los partidos de grupo con el color de su grupo, los del cuadro en
  dorado y con el nombre de la ronda (Octavos, Cuartos, Semifinal, Final).
- **Resultados** — solo lo ya jugado, lo más reciente arriba, con el día y
  la hora en la ficha.
- Filtros por fase (grupos / eliminación) y por jornada.

Las fechas del cuadro salen de las columnas **N (Fecha)** y **O (Hora)** de
la hoja `Eliminación Simple`, que se digitan igual que las de
FIXTURE_GRUPOS. Los jugadores NO se digitan: son fórmulas que miran el
ranking de GRUPOS, así que al anotar un resultado de grupos los cruces se
recalculan solos y la web los muestra ya actualizados. Mientras un cruce
no esté decidido aparece como «Por definir».

### C8 · Calendario conectado al Sheet
Leía un archivo fijo dentro del código con la programación de otro torneo.
Ahora lee **FIXTURE_GRUPOS** y cruza los marcadores con RESULTADOS.

Columnas que usa: **G Fecha**, **H Hora** y **I Mesa** (esta última opcional).
La vista es una línea de tiempo: jornada → turno → los partidos que salen a
la vez, ordenado por fecha y hora. Filtros por jornada y por grupo. Mientras
no haya fechas, avisa dónde se digitan.

La fecha se acepta como `23/09/2026`, `23-09-2026` o `2026-09-23`, y la hora
como `5:00 p. m.` o `17:00`. Si el libro estuviera en inglés y exportara
`09/23/2026`, se detecta que el primer número no puede ser un mes.

### C9 · Caché y tiempo real
Cada visitante disparaba ~7 descargas del Sheet sin caché. Ahora:
- la página se guarda 15 s (ISR) y todas las lecturas van marcadas con el
  tag `sheet-data`;
- `/api/revalidate` **por fin hace algo**: antes invalidaba un tag que
  ninguna descarga llevaba, y `revalidatePath` no servía porque todas las
  páginas eran `force-dynamic` (que obliga a `no-store` en cada `fetch`);
- el Apps Script llama a esa ruta al editar una celda
  (`apps-script/M16-avisar-a-la-web.gs`) y el cambio se ve al instante.

### C10 · Ya no hay pantalla en blanco
Se añadieron `app/error.tsx` y `app/global-error.tsx`, y ninguna lectura del
Sheet lanza excepción: si Google falla, la página muestra su estado vacío.

### C11 · Fuera los datos del torneo viejo
`app/data/{elimination,groups,players,rankings,schedule,config,helpers}.ts`
tenían el torneo de 42 jugadores y se usaban de respaldo, así que ante
cualquier fallo la web enseñaba **otro torneo** como si fuera este. Borrados.

### C12 · Ranking: la columna C dice Categoría
`GenerarRankingGrupos` busca el nombre en `Base de Datos` y escribe la columna
**siguiente**, que es la C = Categoría. El encabezado decía «Ciudad» y no
cuadraba con el dato. Corregido en el Apps Script (M16): C1 ahora dice
**Categoría**. La web muestra categoría y club, este último desde JUGADORES.

---

## E · Copia de seguridad

`COPIA SEGURIDAD 2026-09-15 — Programa Billar 3 bandas Club Tennis`
https://docs.google.com/spreadsheets/d/1TzWeEtQCOhR3SG0YXJg64ppT34uSIeKEQ-Q5UQp_2TE/edit

Sin verificar si arrastró el Apps Script vinculado.

---

## F · Lo que queda pendiente

| # | Qué | Dónde |
|---|---|---|
| 1 | `REVALIDATE_TOKEN` en Vercel y en las Propiedades del Apps Script | lo pone Omar |
| 2 | Instalar el activador `onEditAvisarWeb` (M16) | Apps Script |
| 3 | `var CLAVE = "cablestaca"` está en texto plano en el Código.gs | Apps Script |
| 4 | Los `gid` de las pestañas que faltan en `SHEET_GIDS` | `app/lib/sheets.ts` |

**Sobre el punto 4:** hoy se leen todas las hojas y funciona. Añadir el gid de
RESULTADOS, GRUPOS y Eliminación Simple hace que esas tres se pidan por la vía
más directa. El gid se ve en la URL al hacer clic en la pestaña:
`.../edit#gid=123456789`.
