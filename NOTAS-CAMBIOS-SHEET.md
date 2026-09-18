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

### C13 · La página de Grupos salía vacía  ← el fallo del 16/09

Síntoma: `/grupos` decía «La hoja GRUPOS todavía no tiene datos» con la hoja
llena de datos.

No era el parser. Leyendo el Sheet de verdad (vía Drive) y pasándolo por
`parseGroupStandings` salían los 5 grupos perfectos. El fallo estaba en la
descarga.

`SHEET_GIDS` solo tiene gid de CONFIGURACION y JUGADORES. Para el resto,
`candidateUrls` pedía la pestaña por nombre metido dentro de `range`:

```
/export?format=csv&range='GRUPOS'!A1:AZ400
```

Google **no siempre respeta ese nombre**: cuando no lo respeta devuelve la
PRIMERA hoja del libro (aquí, `Base de Datos`). Llega un CSV impecable, con
cientos de filas, y `fetchSheet` lo daba por bueno. El parser no encontraba
ningún «GRUPO n» y devolvía cero grupos.

Tres arreglos:

1. **Comprobación de identidad** (`SENAS` en `app/lib/sheets.ts`). Cada
   pestaña tiene una seña que no aparece en ninguna otra —GRUPOS necesita una
   celda `GRUPO n` y un encabezado `TOTAL PTS`— y una respuesta que no la
   cumple se descarta y se prueba la siguiente URL. Más vale una página que
   dice «no hay datos» que una que enseña datos de otra hoja.
2. **gviz con `headers=0`**. Sin ese parámetro gviz se come la primera fila
   para usarla de encabezado, y la fila «GRUPO 1» desaparecía.
3. **Orden de intentos**: gid (exacto y sin caché) → gviz por nombre →
   `range` con nombre de pestaña, que pasa a ser el último recurso.

Probado con un servidor falso que imita el fallo: pide GRUPOS por `range` y
devuelve `Base de Datos`. Antes: 0 grupos. Ahora: los 5.

**Resuelto:** `SHEET_GIDS` ya tiene las diez pestañas. Comprobado contra un
servidor que solo responde a gid correctos: las nueve descargas de las ocho
páginas van por gid, ninguna cae en el camino por nombre. Las defensas de
arriba se quedan igual, como red por si algún día se añade una pestaña
nueva y se olvida su gid.

| Pestaña | gid |
|---|---|
| Base de Datos | 2016460506 |
| CONFIGURACION | 394693629 |
| JUGADORES | 1215907359 |
| FIXTURE_GRUPOS | 420873071 |
| Calendario | 739589239 |
| RESULTADOS | 1802098051 |
| GRUPOS | 331979390 |
| Eliminación Simple | 24087976 |
| RankingGrupos | 77690621 |
| RankingFinal | 860732655 |

### C14 · Grupos: la tabla completa del Sheet

`GroupStandingsTable` enseñaba un resumen (PJ, CA, CR, Dif, Pts) y escondía el
detalle tras un «Ver detalle por partido». Ahora es la tabla de la hoja entera
y a la vista: Nº, Jugador, CA P1..Pn, TOTAL CA, CR P1..Pn, TOTAL CR, DIF %,
PTS P1..Pn, TOTAL PTS y CLASIF GRAL, con las tres cabeceras de bloque.

- Los grupos pasan a ocupar el ancho completo, uno debajo de otro.
- En móvil la tabla se desplaza y las columnas Nº y Jugador se quedan fijas.
  La columna Nº lleva ancho fijo de 40 px, que es exactamente el `left-10` de
  la columna Jugador: sin eso se colaba contenido por el hueco al desplazar.
- **ORDEN GRUPO solo se usa cuando el Sheet ya lo ha calculado.** Antes de
  jugar nada la hoja pone 1 a todos; pintar cinco medallas de oro sería
  mentir, así que mientras tanto se enseña el Nº de inscripción.
- La leyenda va una sola vez al pie, no repetida en cada grupo.


### B7 · M6 — CLASIF GRAL compara por partido jugado

Con 22 jugadores los grupos no salen iguales: dos de 5 y tres de 4. Unos
juegan 4 partidos y otros 3, y comparar una suma de 4 términos contra una de
3 favorece a los primeros:

- un jugador de grupo de 4 **no puede** llegar a 8 puntos por mucho que gane todo;
- DIF % es una suma, así que también acumula un término menos.

Medido en los datos de prueba: Contreras jugó mejor que Delgado por partido
(+0,348 contra +0,271) y aun así salía detrás, solo por tener un partido menos
que sumar.

`GenerarGruposCompletos` gana dos columnas, justo detrás de TOTAL PTS:

```
PTS x PARTIDO      = TOTAL PTS / (jugadores del grupo - 1)
VENTAJA x PARTIDO  = DIF %     / (jugadores del grupo - 1)
```

El divisor es una constante distinta en cada grupo, escrita por el script, que
sabe el tamaño de cada uno. CLASIF GRAL pasa a comparar esas dos en lugar de
los totales.

**ORDEN GRUPO no se toca**: dentro de un grupo todos juegan lo mismo, así que
dividir por el mismo número no movería ni un puesto.

Se puede volver atrás poniendo `CLASIF_POR_PARTIDO = false` arriba del módulo.

Comprobado con un simulador de SpreadsheetApp que ejecuta el módulo entero
sobre los 5 grupos y los 38 resultados reales:

- las fórmulas de CLASIF GRAL referencian S y T (las nuevas), no R ni M;
- ORDEN GRUPO sigue referenciando R y M;
- el divisor sale 4 en los grupos de 5 y 3 en los de 4;
- **los 10 que pasan con BYE son los mismos** y ningún campeón de grupo cambia;
  solo se reordenan los puestos 6-9 y 11-14, que es a quién le toca contra quién.

En la web, `GroupStandingsTable` enseña las dos columnas (PTS x P y VENT x P).
No hace falta tocar el parser: las calcula con `totalPts / matchesPerPlayer`,
que es exactamente el mismo divisor.

### B8 · M7 — la hoja se reutiliza, no se recrea  ← el gid muerto

Síntoma: tras correr el paso 7, `/eliminacion` decía «El cuadro todavía no
está creado» con la hoja perfectamente creada.

Causa, y es un fallo de diseño mío: `CrearEliminacionSimple` hacía
`deleteSheet` + `insertSheet`. **Al borrar una pestaña y crear otra, Google le
asigna un gid nuevo.** Como `SHEET_GIDS` lleva el gid escrito a mano, el que
había apuntaba a una pestaña que ya no existe, y las lecturas por nombre no
recuperaron la situación (el acento de «Eliminación Simple» no ayuda).

Los demás módulos no tienen el problema: M5 y M6 usan `getOrCreateSheet` y
M18 solo inserta si no existe, así que sus gid son estables.

Arreglo: el paso 7 ya no borra la hoja. Si existe, la limpia a fondo
(`breakApart` de las celdas combinadas, `clear`, `clearDataValidations`,
`setConditionalFormatRules([])`) y la reutiliza. Mismo resultado en pantalla,
y el gid no vuelve a cambiar nunca.

**Y aun así volvió a cambiar**, porque el primer arreglo tenía otro fallo:

```javascript
if (nombresViejos[v] === ELIM_HOJA) continue;   // MAL
```

`getSheetByName` **no distingue mayúsculas de minúsculas**, así que buscar
`"ELIMINACIÓN SIMPLE"` devuelve la hoja buena, `"Eliminación Simple"`. Pero
la guarda comparaba los NOMBRES como texto, y `"ELIMINACIÓN SIMPLE"` no es
igual a `"Eliminación Simple"`, así que no la reconocía y la borraba. Luego
`insertSheet` creaba otra con gid nuevo.

Ahora se compara `getSheetId()`, que es único y no engaña:

```javascript
if (wsE && vieja.getSheetId() === wsE.getSheetId()) continue;
```

Comprobado con un simulador cuyo `getSheetByName` ignora mayúsculas, igual
que el de Google: cuatro ejecuciones seguidas del paso 7 y el gid no se
mueve, sin `deleteSheet` ni `insertSheet`. Y una hoja sobrante de verdad
(«Eliminacion Simple», sin tilde) sí se borra.

**Resuelto:** el gid de `Eliminación Simple` pasó de `1544967020` a
`24087976` al correr el paso 7 con el código viejo. Ya está actualizado en
`SHEET_GIDS`, y todos los demás gid salieron idénticos, lo que confirma el
diagnóstico: solo cambia el de la pestaña que se borraba y se recreaba.

### C15 · La web descubre los gid sola

El gid de `Eliminación Simple` caducó DOS veces en una tarde, y las dos hubo
que perseguirlo a mano. Con `/api/diagnostico` (nueva ruta, probada desde el
propio servidor de Vercel) por fin se vio qué pasa de verdad con cada forma
de pedir una pestaña:

| Forma | Resultado |
|---|---|
| `export?format=csv&gid=N` | **HTTP 400** con el gid caduco. Es la única buena cuando el gid vale. |
| `export?format=csv&range='Hoja'!A1:BZ500` | **HTTP 400 siempre.** Google no acepta el nombre dentro de `range`. Candidato eliminado. |
| `gviz/tq?...&sheet=Nombre&headers=0` | HTTP 200, pero **los datos llegan dañados** |
| `gviz/tq?...&sheet=Nombre` | HTTP 200, **también dañados** |

Lo de gviz merece detalle, porque parecía la salvación: **gviz adivina el tipo
de cada columna y borra el texto que no encaje**. En la hoja de eliminación
las columnas A y B son numéricas (Ronda, Partido), así que se come sus
encabezados «Ronda» y «Partido» — que es justo lo que la comprobación de
identidad busca. Además junta las filas de título en una sola y devuelve 36
filas donde la hoja tiene 46. No sirve como fuente.

Así que el gid es imprescindible, y escribirlo a mano no es sostenible.
Ahora, cuando el gid del código falla, la web **le pregunta a Google cuál es**:
lee `/htmlview` del libro, que trae la lista de pestañas con su gid, y usa el
bueno. El resultado se guarda en memoria, así que se pide una vez.

`extraerGids()` falló al primer intento porque yo esperaba la barra de
pestañas clásica (`<li id="sheet-button-N">`). El `/api/diagnostico` devuelve
un trozo del HTML cuando no encuentra nada, y ahí se vio la forma real:

```javascript
items.push({nombre: "Base de Datos", pageUrl: "https:\/\/...#gid=2016460506"});
```

Dos sorpresas: es JavaScript, no marcado HTML; y **la clave del nombre viene
traducida** según el idioma con que Google sirva la página (`nombre` en
español, `name` en inglés — y el mismo libro llegó en los dos idiomas en
peticiones seguidas). Por eso el extractor no busca la clave por su nombre:
coge el texto entrecomillado que va justo antes de la URL con el gid.

También hay que deshacer los escapes: las barras van como `\/` y los acentos
como `\u00f3`, así que «Eliminación Simple» llega escrita
`Eliminaci\u00f3n Simple`.

Probado con las tres formas —español, inglés y la barra clásica, que se deja
como respaldo— y las diez pestañas salen bien en las tres.

Con esto el paso 7 puede recrear la hoja las veces que quiera: la web se
arregla sola. Los gid de `SHEET_GIDS` se quedan como atajo, para no pedir el
htmlview en cada arranque.

### B9 · M16 — el W.O. no puede preguntar nada

`onEditResultadosWO` abría una ventana con `ui.prompt()` para preguntar quién
no se presentó. Funciona cuando edita el dueño con la hoja abierta, pero:

**Un trigger instalable se dispara con la edición de CUALQUIER editor y corre
en un servidor de Google en nombre de quien lo instaló. Ahí no hay pantalla.**
`SpreadsheetApp.getUi()` falla y la función se corta en esa línea.

Con César digitando: escribe `SI`, no pasa nada, y nadie ve ningún error. Un
W.O. sin registrar en mitad del torneo. Tampoco funcionaría desde el celular,
donde las ventanas de Apps Script no existen.

Arreglo: no preguntar. Quien digita escribe directamente en la columna W.O.
**quién** no se presentó — `A`, `B` o `AB` — y el trigger llena las carambolas
y las entradas y deja la celda en `SI`, que es lo que esperan la fórmula de
Resultado y el paso 6. Quién faltó queda en las carambolas y en una nota de la
celda (`setNote` sí funciona sin pantalla).

Si alguien escribe `SI` a secas, no se adivina nada: se deja una nota en la
celda explicando qué escribir.

Probado con un simulador cuyo `getUi()` lanza el error real: los siete casos
(`A`, `B`, `AB`, minúsculas, con puntos, `SI`, borrar) salen bien y **no se
llama a `getUi()` ni una vez**. Comprobado además que no reacciona en otras
hojas, ni en la fila de encabezados, ni en otras columnas.

### B10 · M16 — `RankingGrupos` pasa a ser una hoja viva

`apps-script/M16-ranking-grupos.gs`. Antes la hoja era una **foto**: el código
leía GRUPOS y RESULTADOS, calculaba en memoria y escribía números fijos. En
cuanto se anotaba una partida, la hoja quedaba vieja hasta que alguien volviera
a correr el botón del menú.

Ahora **cada celda es una fórmula**. Se corre el botón una sola vez y la hoja se
recalcula sola durante todo el torneo.

Layout nuevo, con dos rótulos de color en la fila 1 y los encabezados en la 2:

| | A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Fila 1 | QUIEN ES ||| ESTO DECIDE EL ORDEN (verde) ||||| SOLO INFORMATIVO (ámbar) |||
| Fila 2 | Ranking | Jugador | Categoría | Grupo | Puesto | Puntos | Pts x Partido | Ventaja x Partido | Carambolas | Entradas | Promedio |

El motivo del rótulo: el orden de esta hoja se copia de «Ranking Jugadores» de
GRUPOS, que sale de CLASIF GRAL (ORDEN GRUPO → PTS x PARTIDO → VENTAJA x
PARTIDO → TOTAL CA). La columna **Promedio** (carambolas ÷ entradas) **no pinta
nada** en ese orden: ordenando por ella cambiarían de puesto 21 de los 22
jugadores. Antes iba sola al lado del ranking y parecía explicarlo.

De dónde sale cada columna:

| Columna | Fórmula |
|---|---|
| Jugador | `GRUPOS!<col Ranking Jugadores><fila>` |
| Categoría | `VLOOKUP` en `'Base de Datos'` B→C, si no F→G, si no J→K (igual que antes) |
| Grupo | `VLOOKUP` en `JUGADORES!$B:$C` |
| Puesto · Puntos · Pts x Partido · Ventaja x Partido | `VLOOKUP` en `GRUPOS!$B:$<última>`, con el índice que el script calcula leyendo los encabezados |
| Carambolas · Entradas | `SUMIF` del total − `SUMIFS` de lo marcado `SI` en la columna L (W.O.) |
| Promedio | `carambolas ÷ entradas`, con guarda contra `#DIV/0!` |

Se resta lo marcado `SI` en vez de usar el criterio `"<>SI"` porque el trato que
le da Sheets a las celdas vacías con ese criterio no es de fiar.

La hoja **no se borra ni se vuelve a crear**: se limpia por dentro, para que no
cambie su `gid` y la web la siga encontrando.

Probado con un simulador de `SpreadsheetApp` y un evaluador de fórmulas de
Sheets (IF, IFERROR, OR, SUMIF, SUMIFS, VLOOKUP, celda vacía ≠ texto vacío):
los 11 valores de los 9 jugadores de la prueba coinciden con el cálculo de
referencia; se anota una partida en RESULTADOS **sin volver a correr nada** y
la hoja cambia sola; marcar esa partida como W.O. la saca del promedio de los
dos; cambiar el orden en GRUPOS reordena la hoja con su categoría y sus
carambolas detrás; repetir el botón da exactamente lo mismo y reutiliza la
misma hoja. El CSV resultante pasa por `parseRankingGroups` con las 11 columnas
completas.

Un GRUPOS de una versión vieja (sin `PTS x PARTIDO`) no rompe nada: esas dos
columnas quedan vacías y el resto funciona.

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

### C13 · La web enseña el ranking de grupos igual que la hoja

`app/ranking/RankingClient.tsx`. La tabla llevaba las columnas en otro orden
que la hoja (Car · Ent · Prom · Pts · Pts/P · Vent/P), con el **Promedio pegado
al ranking**: quien la miraba daba por hecho que ordenaba por ahí, y no ordena.

Ahora es calcada de la hoja RankingGrupos:

`# · Jugador · Categoría ‖ Gr · Pos · Pts · Pts/P · Vent/P ‖ Car · Ent · Prom`

con los mismos tres rótulos encima — **Quién es**, **Esto decide el orden**
(verde) y **Solo informativo · no ordena** (ámbar) — y los dos primeros de cada
grupo con el filete verde, como el verde de la hoja. Debajo, una línea que
explica qué pasa a la eliminación y en qué orden se mira.

Detalles que costaron una vuelta:

- **No se esconde ninguna columna en móvil.** Si se escondieran, los `colSpan`
  de los rótulos dejarían de cuadrar con las columnas de abajo. En su lugar la
  tabla se desliza y se quedan fijas `#` y `Jugador`, igual que en Grupos.
- El bloque fijo de la fila de rótulos mide **exactamente** lo que miden las
  columnas fijas. Con un `colSpan` que alcanzaba a Categoría, al deslizar se
  quedaba clavado un trozo ancho que tapaba el rótulo verde.
- Los rótulos se acortan en pantalla estrecha (`Decide el orden`, `No ordena`)
  en vez de partirse en tres renglones. El número de columnas no cambia.
- Fuera la columna **Club**: no está en la hoja, en este torneo todos son del
  mismo club y se comía 130 px. Sigue en la página Jugadores.
- `text-amber-400` sobre fondo blanco casi no se leía: override en
  `globals.css` para el tema claro, igual que ya había para el emerald.

El texto de arriba ya no dice que las dos tablas son fotos: el ranking de
grupos se actualiza solo (B10), el final sigue siendo una foto.

Probado contra el servidor falso de Sheets con los datos reales del torneo, en
1340 px y en 390 px, tema oscuro y claro, y con una hoja **vieja de 7 columnas**
para comprobar que si Omar todavía no ha regenerado la hoja la web no se rompe:
en ese caso enseña la tabla de antes, sin rótulos. Sin errores de consola.

---

### C14 · Ranking de grupos: bloques separados por puesto

Omar preguntó por qué aparecían ventajas positivas debajo de negativas. No era
un fallo: **Vent/P es el 3er criterio**, solo desempata entre quienes ya están
empatados en Pos y en Pts/P. Comprobado fila por fila contra los cuatro
criterios: el orden de las 22 filas es exactamente el correcto, y ningún empate
llegó a necesitar el 4º (carambolas).

Pero se leía mal: la tabla son cinco bloques (los 1.º, los 2.º…) y nada los
separaba, así que la vista leía 22 filas seguidas y la ventaja parecía
desordenada. Ahora cada bloque abre con una banda:

`LOS 2.º DE CADA GRUPO · pasan a la eliminación`

El «· pasan a la eliminación», en verde, solo en los bloques 1.º y 2.º. El texto
de la banda va dentro de un `div` con `sticky left-0`, así que se queda pegado a
la izquierda al deslizar la tabla en el móvil, igual que las columnas fijas.

Las bandas solo salen con la hoja nueva (`detalleOrden`). Comprobado con la hoja
vieja de 7 columnas: 1 fila de encabezado, 0 bandas, 22 filas de jugador, sin
errores.

**Nota para la próxima vez:** Next 16 guarda la caché de `fetch` del modo dev en
`.next/dev/cache/fetch-cache`, **no** en `.next/cache`. Borrar `.next/cache` no
hace nada y se acaba probando contra datos viejos sin enterarse.

---

### B11 · M15 — el Ranking Final: vivo, del cuadro, y en 9 columnas

`apps-script/M15-ranking-final.gs`. La versión anterior sacaba tres columnas
—Ranking, Jugador y «Ronda Alcanzada»— y esa última decía `2` o decía `1`. Y
**dentro de una misma ronda no existía ningún criterio**: el orden salía de cómo
JavaScript recorre un objeto.

Tres correcciones de Omar, en tres rondas:

1. **Que se actualice sola**, sin volver a correr nada.
2. **No tiene nada que ver con la fase de grupos.** El primer intento usaba el
   puesto de grupos como desempate: eso mezcla dos torneos distintos.
3. **En la eliminación no hay empates**, y la tabla no se entendía.

**De dónde sale:** SOLO de `Eliminación Simple`.

| | Criterio |
|---|---|
| 1º | Hasta dónde llegó (campeón, subcampeón, semifinal…) |
| 2º | **% de su objetivo** = carambolas hechas ÷ las que debía hacer |
| 3º | Promedio = carambolas ÷ entradas |
| 4º | Orden del cuadro — solo para que nunca queden dos empatados |

El 2º es el que iguala a las dos categorías: 17 de 17 (100 %) rinde más que 18
de 20 (90 %). Es el mismo criterio con el que la columna K del cuadro decide
cada partida.

**Sin empates, dos columnas se caen solas:**

- **«Ganados»** era ruido: si no hay empates, cada jugador pierde exactamente una
  vez, así que ganadas = jugadas − 1 para todos menos el campeón. No decía nada
  que no dijera ya «hasta dónde llegó».
- **«Ronda Alcanzada»** decía lo mismo que «Hasta dónde llegó», en número.

Y `condPerdio` se simplifica a `ganadas < partidas`: quien pierde una, está fuera.

De 13 columnas a **9, en tres bloques de tres**:

```
QUIÉN ES           ASÍ SE DECIDE EL PUESTO    CÓMO JUGÓ · NO ORDENA
Ranking            Hasta dónde llegó          Partidas
Jugador            % de su objetivo           Carambolas
Categoría          Promedio                   Entradas
```

**Sirve para cualquier torneo.** No hay ni un número fijo: jugadores, rondas y
nombres de ronda salen de leer el cuadro, y los objetivos de `Base de Datos`.

**La hoja es VIVA.** Como una tabla ordenada no se puede escribir celda a celda
con fórmulas, hay dos zonas: un **bloque de cálculo oculto** (P..AB), una fila
por jugador sin ordenar, y la **tabla visible**, que es **una sola fórmula** en
B3: `ARRAY_CONSTRAIN(SORT(bloque; Orden;desc; %;desc; Promedio;desc; Siembra;asc); filas; 8)`

Detalles que importan:

- **En el cuadro, D son las ENTRADAS y E las CARAMBOLAS** — al revés que en
  RESULTADOS.
- Una partida cuenta como jugada si **los dos anotaron entradas** (`">0"`). Así
  quedan fuera los BYE y lo que no se ha jugado. Se piden entradas y no
  carambolas porque un jugador sí puede quedarse en cero carambolas, pero nunca
  en cero entradas.
- Se escribe `+1/2` y no `+0,5` para no depender del separador decimal del libro.
- `AB1` y `AB2` guardan la última ronda y el campeón. **La fila de encabezados
  del bloque auxiliar las pisaba** y nadie salía como CAMPEÓN: por eso la fila de
  datos llega hasta AA y no hasta AB.
- El podio va con **formato condicional** (`=$A3=1`), no pintando filas: las
  filas cambian de dueño solas cuando cambia el ranking.

**La hoja se comprueba a sí misma.** Como no se puede probar contra Google de
verdad, el código calcula además el ranking en JavaScript y lo compara con lo
que dieron las fórmulas. Si no coinciden, lo dice en el aviso.

Probado con un simulador que monta el cuadro igual que el M7, y con el evaluador
de fórmulas ampliado (SORT, ARRAY_CONSTRAIN, COUNTIFS, MAXIFS, INDEX/MATCH, `&`,
y criterios con operador como `">0"`, donde una celda vacía **no** cuenta como
cero):

- **El mismo código con 6, 8, 22 y 40 jugadores** (cuadros de 8, 8, 32 y 64; de
  3 a 6 rondas). En los cuatro: un solo campeón, puestos del 1 al N sin
  repetirse, y la auto-comprobación en verde.
- **Se le da la vuelta a la final y el campeón cambia solo.** Se borra el
  marcador de la final y los dos finalistas vuelven a EN JUEGO, sin campeón; se
  vuelve a anotar y vuelve a haber campeón.
- **Se le da la vuelta al RankingGrupos y el ranking final no se mueve.**
- Dos jugadores con **16 carambolas cada uno**: el de Segunda (16/17 = 94,1 %)
  por encima del de Primera (16/20 = 80 %).

### B12 · M7 — en la eliminación no puede haber EMPATE

Omar vio esto en la semifinal:

| | Categoría | Objetivo | Carambolas | Entradas | % |
|---|---|---|---|---|---|
| OMAR ALVAREZ | Segunda | 17 | 17 | 30 | **100,0 %** |
| ANDRES GONZALEZ | Primera | 20 | 20 | 30 | **100,0 %** |

Ganador: `EMPATE`. **No era un fallo: era el hándicap funcionando.** Hacer 17
siendo de Segunda es la misma tarea que hacer 20 siendo de Primera, y los dos la
completaron en las mismas entradas. Con la entrada de igualada, además, que
coincidan las entradas es lo normal, no lo raro — así que iba a repetirse.

Pero el cuadro se bloquea: nadie pasa a la final. **En la eliminación siempre
tiene que haber un ganador.**

Decisión de Omar (es regla del torneo, no detalle técnico): **gana el de mejor
promedio** (carambolas ÷ entradas). Cascada nueva en `formulaGanadorElim`:

1. Mayor **% de su objetivo**
2. Si empatan, mayor **promedio**
3. Si también empatan, pasa el **Jugador A** (por el plegado del cuadro, el
   mejor sembrado)

Ojo con lo que significa el 2º: con las **mismas entradas**, el de Primera
siempre gana un doble 100 %, porque hizo más carambolas. Si las entradas no
coinciden, el de Segunda sí puede ganar (17/25 = 0,680 > 20/30 = 0,667).

Las comparaciones van **cruzadas** (`E*M > I*L` en vez de `E/L > I/M`) para no
dividir nunca: así una celda en cero o vacía no puede sacar un `#DIV/0!`.

### B13 · `ActualizarGanadoresElim` — arreglar el cuadro sin borrarlo

**`CrearEliminacionSimple` rehace el cuadro entero y BORRA los marcadores.** Con
el torneo en juego eso es inaceptable, así que no se le puede decir a Omar «corre
otra vez el paso 7».

La función nueva recorre las filas de partido que ya existen (las que tienen
número de ronda en A) y reescribe **solo la columna K**. Jugadores, entradas,
carambolas, fechas y horas se quedan intactos. Al terminar avisa de cuántas
partidas estaban en EMPATE, para que se revise que pasó quien debía pasar.

Probado con un evaluador de fórmulas: los 12 casos con nombre (el real de Omar,
el hándicap en los dos sentidos, empate total, sin objetivos, BYE en cada lado,
sin digitar, medio digitado, entradas en cero) y un barrido de **13.689
combinaciones** de objetivo × carambolas × entradas: **0 empates, 0 errores, y
ninguna se queda sin ganador** cuando los dos marcadores están puestos.

**Orden importante:** primero `ActualizarGanadoresElim`, después el M15. Si
queda un EMPATE en la hoja, el Ranking Final cuenta a los dos como eliminados en
esa ronda, que no es verdad.

### C15 · La web enseña el Ranking Final igual que la hoja

`parseRankingFinal` pasa a leer por encabezados —igual que `parseRankingGroups`,
y ahora los dos comparten `buscaFilaEncabezados` y `mapaColumnas`— y trae las
columnas nuevas. `RankingFinalRow` las lleva opcionales, así que una hoja vieja
de tres columnas sigue funcionando y enseña la tabla de siempre.

`# · Jugador · Categoría ‖ Hasta dónde llegó · % objetivo · Prom ‖ Partidas · Car · Ent`

con los tres rótulos, el campeón con 🏆 en dorado, el subcampeón en plata,
`EN JUEGO` con su punto verde, y bandas «CAYERON EN CUARTOS DE FINAL» separando
los bloques. Debajo, la explicación del % con el ejemplo de 17 de 17 contra 18
de 20, y el aviso de que la fase de grupos no cuenta aquí.

`SENAS` acepta las dos hojas: la nueva se reconoce por «Hasta dónde llegó» y la
vieja por «Ronda Alcanzada», así que da igual el orden en que se actualicen el
Sheet y la web.

El texto de arriba ya no dice que el final sea una foto: las dos tablas se
actualizan solas.

Probado en 1340 px y 390 px con el cuadro de 22 terminado, y con la hoja vieja
de 3 columnas: 5 columnas, sin rótulos, sin bandas, sin errores.

### C16 · El cuadro se cortaba por donde iba el torneo

En CALENDARIO → Programación → Eliminación solo salían las fechas hasta octavos,
y en ELIMINACIÓN DIRECTA lo mismo. Faltaban cuartos, semifinal y final.

La culpa era de una línea de `parseElimination`:

```ts
const playerA = cell(row, 2);
if (!playerA) continue;      // <- se comía las rondas sin jugadores
```

En cuartos, semifinal y final los nombres **todavía no existen**: son fórmulas
que se llenan cuando termina la ronda anterior. Al descartar esas filas, el
cuadro se cortaba justo por donde iba el torneo, y desaparecían del calendario
las fechas de las rondas que la gente quiere mirar (la final era 21 de las 21
partidas de esa noche… y no aparecía).

Tenía además un efecto de segundo orden: el nombre de cada ronda sale de contar
sus cruces, y contaba solo los que ya tenían jugador. Una ronda medio llena se
habría llamado «Ronda 3» en vez de «Cuartos de final».

Ahora se leen todas las filas con número de ronda y de partido, con el nombre
vacío, y quien las pinta enseña **«Por definir»**:

- `MatchCard` del calendario ya lo hacía (y ya traía el aviso «los jugadores
  salen solos cuando termine la ronda anterior»).
- `PlayerSlot` de la página de Eliminación y `Slot` de `BracketTree`, añadido.

Comprobado con el cuadro real de Omar a medias (32 plazas, 10 BYE, rondas 3 a 5
sin jugadores): el calendario pasa de **14 a 21 partidas** de eliminación y
enseña las cinco horas, de las 5:00 p. m. a las 11:00 p. m.; la página de
Eliminación pasa de 3 a **5 rondas** con sus cinco filtros, y el cuadro se dibuja
entero hasta la final. Sin errores de consola.

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
