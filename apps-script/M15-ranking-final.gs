// ============================================================
// M15 - GENERAR RANKING FINAL   (hoja VIVA, se actualiza sola)
// ============================================================
//
// QUE HACE
//
// Monta la hoja RankingFinal a partir del cuadro de eliminacion. Se
// corre UNA VEZ por torneo y a partir de ahi se actualiza sola: cada
// celda es una formula, asi que en cuanto se anotan carambolas en
// "Eliminación Simple" cambian los datos, las etiquetas y el ORDEN.
//
// DE DONDE SALE
//
// SOLO de la hoja "Eliminación Simple". El ranking final no tiene nada
// que ver con la fase de grupos: son dos torneos distintos. Quien entro
// al cuadro sembrado en el puesto 22 puede acabar campeon, y entonces
// es campeon y punto.
//
// COMO ORDENA
//
//       1º  HASTA DONDE LLEGO    campeon, subcampeon, semifinal...
//       2º  RENDIMIENTO          carambolas hechas / carambolas que
//                                debia hacer (su objetivo)
//       3º  PROMEDIO             carambolas / entradas
//       4º  ORDEN DEL CUADRO     su sitio en la siembra
//
// El 4º no es un criterio deportivo: esta para que NUNCA queden dos
// empatados y el orden no dependa del azar. Con el 1º, el 2º y el 3º
// ya es practicamente imposible llegar hasta ahi.
//
// El 2º es el que iguala a las dos categorias. No compara carambolas
// brutas, sino que porcentaje hizo cada uno DE LO SUYO:
//
//       Primera juega a 20 -> 18 carambolas = 18/20 =  90,0 %
//       Segunda juega a 17 -> 17 carambolas = 17/17 = 100,0 %
//
// El de Segunda hizo MENOS carambolas y rindio MAS, porque cumplio su
// objetivo. Es el mismo criterio con el que la columna K del cuadro
// decide cada partido, asi que el ranking no se contradice con el
// resto del torneo.
//
// COMO ESTA HECHA POR DENTRO
//
// Una tabla ordenada no se puede escribir celda a celda con formulas:
// hay que calcular primero y ordenar despues. Asi que la hoja tiene
// dos zonas:
//
//   · Un BLOQUE DE CALCULO oculto (columnas P a AD). Una fila por
//     jugador, SIN ordenar, con todas las cuentas: partidos, ganados,
//     carambolas, entradas, rendimiento, hasta donde llego y una
//     columna "Orden" que resume el primer criterio.
//
//   · La TABLA VISIBLE (A a L), que es UNA SOLA formula en B3:
//         ARRAY_CONSTRAIN(SORT(bloque; Orden;desc; Rendimiento;desc;
//                              Promedio;desc; Siembra;asc); filas; 11)
//     SORT devuelve el bloque ya ordenado y ARRAY_CONSTRAIN se queda
//     con las 11 primeras columnas, que son justo las que se ensenan.
//
// Cuando se anota una carambola, el bloque de calculo se recalcula, el
// SORT reordena y la tabla cambia sola. Nadie tiene que correr nada.
//
// AL FINAL SE COMPRUEBA SOLA
//
// El codigo calcula ademas el ranking por su cuenta, con JavaScript, y
// lo compara con lo que dieron las formulas. Si no coinciden, lo dice
// en el aviso. Asi no hay que fiarse de que las formulas esten bien:
// la propia hoja lo verifica cada vez que se genera.
//
// LO QUE NO CAMBIA
//    - La columna "Ronda Alcanzada" sigue con ese nombre, porque es la
//      que busca la web para reconocer la hoja.
//    - La hoja NO se borra ni se vuelve a crear, para que no le cambie
//      el identificador y la web la siga encontrando.
//
// Volver a correrlo no puede danar ningun marcador: esta hoja no
// guarda ni un dato propio, todo lo saca del cuadro.
// ============================================================

var RF_HOJA      = "RankingFinal";
var RF_ANCHO     = 12;  // A..L, la tabla visible
var RF_AUX_INI   = 16;  // P, donde empieza el bloque de calculo
var RF_AUX_DATOS = 14;  // P..AC, una columna por dato de cada jugador
var RF_AUX_COLS  = 15;  // P..AD, contando la columna de las constantes
var RF_VISIBLES  = 11;  // P..Z, lo que se copia a la tabla (B..L)

// AD guarda dos constantes (ultima ronda y campeon) y NO forma parte de
// la fila de datos: si se escribe encima, el campeon se queda en blanco
// y nadie sale como CAMPEÓN.

// Columnas del bloque de calculo, en el mismo orden en que se ensenan.
// Las 11 primeras son las que ve la gente; Orden, Siembra y Empates son
// de uso interno y se quedan fuera del ARRAY_CONSTRAIN.
var RF_AUX = {
  jugador: "P", categoria: "Q", objetivo: "R", hasta: "S", ronda: "T",
  rendimiento: "U", promedio: "V", partidos: "W", ganados: "X",
  carambolas: "Y", entradas: "Z", orden: "AA", siembra: "AB",
  empates: "AC", constantes: "AD"
};

// La hoja del cuadro, lista para meter en una formula.
var RF_ELIM = "'Eliminación Simple'!";

function GenerarRankingFinal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var wsE = ss.getSheetByName("Eliminación Simple");
  if (!wsE) { avisoRF_("No se encontro la hoja 'Eliminación Simple'."); return; }

  var ultFilaE = wsE.getLastRow();
  if (ultFilaE < 2) { avisoRF_("La hoja 'Eliminación Simple' esta vacia."); return; }

  // ----------------------------------------------------------
  // 1. QUIENES JUEGAN EL CUADRO
  //
  //    A Ronda | B Partido | C Jugador A | D Entradas A | E Carambolas A
  //    F Prom A | G Jugador B | H Entradas B | I Carambolas B | J Prom B
  //    K Ganador | L Objetivo A | M Objetivo B | N Fecha | O Hora
  //
  //  OJO con D y E: aqui van al reves que en RESULTADOS. En el cuadro
  //  la columna D son las ENTRADAS y la E las CARAMBOLAS.
  // ----------------------------------------------------------
  var cuadro = wsE.getRange(1, 1, ultFilaE, 15).getValues();
  var lectura = leerCuadroRF_(cuadro);

  if (lectura.nombres.length === 0) {
    avisoRF_("En el cuadro todavia no hay jugadores.");
    return;
  }

  var nombres = lectura.nombres;
  var total = nombres.length;

  // ----------------------------------------------------------
  // 2. PREPARAR LA HOJA SIN BORRARLA
  //
  //    Borrar y volver a insertar la hoja le cambia el identificador
  //    (gid) y la web se queda ciega. Se limpia por dentro y ya.
  // ----------------------------------------------------------
  var creada = false;
  var wsR = ss.getSheetByName(RF_HOJA);
  if (!wsR) { wsR = ss.insertSheet(RF_HOJA); creada = true; }

  var lineasPie = 5;
  var filaPie = total + 4;
  var filasNecesarias = filaPie + lineasPie + 1;
  var colsNecesarias = RF_AUX_INI + RF_AUX_COLS - 1;
  if (wsR.getMaxRows()    < filasNecesarias) wsR.insertRowsAfter(wsR.getMaxRows(), filasNecesarias - wsR.getMaxRows());
  if (wsR.getMaxColumns() < colsNecesarias)  wsR.insertColumnsAfter(wsR.getMaxColumns(), colsNecesarias - wsR.getMaxColumns());

  wsR.showColumns(RF_AUX_INI, RF_AUX_COLS);

  var todo = wsR.getRange(1, 1, wsR.getMaxRows(), wsR.getMaxColumns());
  todo.breakApart();
  todo.clear();
  todo.clearDataValidations();
  wsR.setConditionalFormatRules([]);
  wsR.setFrozenRows(0);

  // ----------------------------------------------------------
  // 3. EL BLOQUE DE CALCULO (oculto)
  // ----------------------------------------------------------
  var A = RF_AUX;
  var finAux = total + 2;

  // Dos constantes que usan todas las filas.
  wsR.getRange(A.constantes + "1").setFormula("=MAX(" + RF_ELIM + "$A:$A)");
  wsR.getRange(A.constantes + "2").setFormula(
    "=IFERROR(INDEX(" + RF_ELIM + "$K:$K;MATCH($" + A.constantes + "$1;" + RF_ELIM + "$A:$A;0));\"\")");

  // Los encabezados del bloque llevan "Aux" delante a proposito: si se
  // llamaran igual que los de verdad, la web podria leer estos.
  var cabAux = [
    "Aux Jugador", "Aux Categoria", "Aux Objetivo", "Aux Hasta", "Aux Ronda",
    "Aux Rendimiento", "Aux Promedio", "Aux Partidos", "Aux Ganados",
    "Aux Carambolas", "Aux Entradas", "Aux Orden", "Aux Siembra", "Aux Empates"
  ];
  wsR.getRange(2, RF_AUX_INI, 1, RF_AUX_DATOS).setValues([cabAux]);

  var aux = [];
  for (var i = 0; i < total; i++) {
    var f = i + 3;                       // fila en la hoja
    aux.push([
      nombres[i],
      formulaCategoriaRF_(f),
      formulaObjetivoRF_(f),
      formulaHastaDondeRF_(f),
      formulaRondaRF_(f),
      formulaRendimientoRF_(f),
      formulaPromedioRF_(f),
      formulaContarRF_(f, null),
      formulaContarRF_(f, "ganados"),
      formulaSumarRF_(f, "E", "I"),      // carambolas
      formulaSumarRF_(f, "D", "H"),      // entradas
      formulaOrdenRF_(f),
      i + 1,                             // sitio en la siembra del cuadro
      formulaContarRF_(f, "empates")
    ]);
  }
  wsR.getRange(3, RF_AUX_INI, total, RF_AUX_DATOS).setValues(aux);

  // ----------------------------------------------------------
  // 4. LA TABLA VISIBLE
  // ----------------------------------------------------------
  var rotulos = ["", "", "", "", "", "", "", "", "", "", "", ""];
  rotulos[0] = "QUIEN ES";                         // A..D
  rotulos[4] = "ESTO DECIDE EL ORDEN";             // E..H
  rotulos[8] = "SOLO INFORMATIVO · NO ORDENA";     // I..L

  // OJO: "Ranking", "Jugador" y "Ronda Alcanzada" son los nombres que
  // busca la web. Si se cambian hay que cambiar app/lib/parsers.ts.
  var encabezados = [
    "Ranking", "Jugador", "Categoría", "Objetivo",
    "Hasta dónde llegó", "Ronda Alcanzada", "Rendimiento", "Promedio",
    "Partidos", "Ganados", "Carambolas", "Entradas"
  ];

  wsR.getRange(1, 1, 1, RF_ANCHO).setValues([rotulos]);
  wsR.getRange(2, 1, 1, RF_ANCHO).setValues([encabezados]);

  // Columna A: el puesto. Se apoya en que la fila tenga jugador.
  var colA = [];
  for (var a = 0; a < total; a++) colA.push(['=IF($B' + (a + 3) + '="";"";ROW()-2)']);
  wsR.getRange(3, 1, total, 1).setFormulas(colA);

  // B3: UNA sola formula que trae la tabla entera ya ordenada.
  //     12 = Orden (desc) · 6 = Rendimiento (desc) · 7 = Promedio (desc)
  //     13 = Siembra (asc), solo para que nunca queden dos empatados.
  var rangoAux = "$" + A.jugador + "$3:$" + A.siembra + "$" + finAux;
  wsR.getRange("B3").setFormula(
    "=IFERROR(ARRAY_CONSTRAIN(SORT(" + rangoAux + ";12;FALSE;6;FALSE;7;FALSE;13;TRUE);" +
    total + ";" + RF_VISIBLES + ");\"\")");

  // ----------------------------------------------------------
  // 5. EL PIE QUE LO EXPLICA
  // ----------------------------------------------------------
  var pie = [
    "CÓMO SE ORDENA ESTE RANKING",
    "1º  Hasta dónde llegó en el cuadro.  ·  2º  Rendimiento sobre su objetivo.  ·  3º  Promedio (carambolas ÷ entradas).",
    "Rendimiento = carambolas que hizo ÷ carambolas que debía hacer (su objetivo × partidas jugadas). Es lo que iguala a las dos categorías:",
    "Primera juega a 20 y Segunda a 17, así que 17 de 17 (100,0 %) rinde más que 18 de 20 (90,0 %), aunque sean menos carambolas.",
    "Todo sale de la hoja «Eliminación Simple»: la fase de grupos no cuenta aquí. Las partidas de BYE tampoco, porque no se jugaron.",
    "Esta hoja se actualiza sola: no hay que volver a correr nada hasta el próximo torneo."
  ];
  for (var q = 0; q < pie.length; q++) wsR.getRange(filaPie + q, 1).setValue(pie[q]);

  SpreadsheetApp.flush();
  FormatoRankingFinal_(wsR, total, filaPie, lineasPie);

  // ----------------------------------------------------------
  // 6. COMPROBARSE A SI MISMA
  //
  //    Las formulas las calcula Google; el mismo ranking se calcula
  //    aqui con JavaScript y se comparan. Si no coinciden, se avisa.
  // ----------------------------------------------------------
  SpreadsheetApp.flush();
  var esperado = rankingCalculadoRF_(lectura);
  var salio = wsR.getRange(3, 2, total, 1).getValues();
  var diferencias = [];
  for (var v = 0; v < total; v++) {
    var dio = String(salio[v][0]).trim();
    if (dio !== esperado[v].nombre) {
      diferencias.push("  fila " + (v + 1) + ": la hoja dice «" + dio +
                       "» y deberia decir «" + esperado[v].nombre + "»");
    }
    if (diferencias.length >= 5) break;
  }

  ss.setActiveSheet(wsR);

  var campeon = esperado[0] && esperado[0].etiqueta === "CAMPEÓN"
    ? esperado[0].nombre : "(todavia no hay campeon)";

  var msg =
    "Ranking Final generado.\n\n" +
    total + " jugadores.\n" +
    "Campeon: " + campeon + "\n\n" +
    "La hoja quedo VIVA: se actualiza sola cada vez que se\n" +
    "anotan carambolas en 'Eliminación Simple'. No hay que\n" +
    "volver a correr esto hasta el proximo torneo.\n\n" +
    "Todo sale del cuadro: la fase de grupos no cuenta aqui.\n\n" +
    "Orden: 1º hasta donde llego · 2º rendimiento sobre su\n" +
    "objetivo · 3º promedio.\n" +
    "El rendimiento iguala Primera (20) con Segunda (17):\n" +
    "17 de 17 rinde mas que 18 de 20.";

  if (diferencias.length === 0) {
    msg += "\n\nCOMPROBADO: las formulas dan exactamente el mismo\n" +
           "orden que el calculo de control.";
  } else {
    msg += "\n\nATENCION: las formulas NO dan el mismo orden que el\n" +
           "calculo de control:\n" + diferencias.join("\n") +
           "\n\nAvisa de esto antes de publicar nada.";
  }
  if (creada) {
    msg += "\n\nATENCION: la hoja no existia y se acaba de crear.\n" +
           "Abre la web y comprueba que el ranking aparece.";
  }
  avisoRF_(msg);
}

/* ============================================================
 *  LAS FORMULAS DEL BLOQUE DE CALCULO
 *
 *  Un cruce cuenta como JUGADO solo si los DOS anotaron entradas.
 *  Asi quedan fuera los BYE (que no tienen entradas) y los cruces que
 *  todavia no se han jugado, sin tener que adivinar nada. Se pide
 *  entradas y no carambolas porque un jugador SI puede quedarse en
 *  cero carambolas, pero nunca en cero entradas.
 * ============================================================ */

/** Las tres condiciones de "cruce jugado", vistas desde cada lado. */
function condJugadoRF_(comoLocal) {
  var E = RF_ELIM;
  return comoLocal
    ? E + "$D:$D;\">0\";" + E + "$H:$H;\">0\""
    : E + "$H:$H;\">0\";" + E + "$D:$D;\">0\"";
}

/**
 * Cuenta cruces del jugador de la fila f.
 *   null       -> todos los jugados
 *   "ganados"  -> los que gano
 *   "empates"  -> los que quedaron en EMPATE (hay que repetirlos, asi
 *                 que NO cuentan como derrota)
 */
function formulaContarRF_(f, que) {
  var E = RF_ELIM;
  var extra = "";
  if (que === "ganados") extra = ";" + E + "$K:$K;$" + RF_AUX.jugador + f;
  if (que === "empates") extra = ";" + E + "$K:$K;\"EMPATE\"";
  return "=COUNTIFS(" + E + "$C:$C;$" + RF_AUX.jugador + f + ";" + condJugadoRF_(true) + extra + ")" +
         "+COUNTIFS(" + E + "$G:$G;$" + RF_AUX.jugador + f + ";" + condJugadoRF_(false) + extra + ")";
}

/** Suma una columna del cuadro: colLocal cuando es A, colVisita cuando es B. */
function formulaSumarRF_(f, colLocal, colVisita) {
  var E = RF_ELIM;
  var p = "$" + RF_AUX.jugador + f;
  return "=SUMIFS(" + E + "$" + colLocal + ":$" + colLocal + ";" + E + "$C:$C;" + p + ";" + condJugadoRF_(true) + ")" +
         "+SUMIFS(" + E + "$" + colVisita + ":$" + colVisita + ";" + E + "$G:$G;" + p + ";" + condJugadoRF_(false) + ")";
}

/**
 * Rendimiento = carambolas hechas / carambolas que debia hacer.
 * El divisor es la suma de sus objetivos (columnas L y M) en los
 * cruces que jugo de verdad, asi que un BYE no lo penaliza.
 */
function formulaRendimientoRF_(f) {
  var E = RF_ELIM;
  var p = "$" + RF_AUX.jugador + f;
  var objetivos =
    "(SUMIFS(" + E + "$L:$L;" + E + "$C:$C;" + p + ";" + condJugadoRF_(true) + ")" +
    "+SUMIFS(" + E + "$M:$M;" + E + "$G:$G;" + p + ";" + condJugadoRF_(false) + "))";
  return "=IF(" + objetivos + "=0;0;$" + RF_AUX.carambolas + f + "/" + objetivos + ")";
}

/** Promedio de billar: carambolas / entradas. Informativo. */
function formulaPromedioRF_(f) {
  return "=IF($" + RF_AUX.entradas + f + "=0;0;$" + RF_AUX.carambolas + f + "/$" + RF_AUX.entradas + f + ")";
}

/** La ronda mas lejos a la que llego, este de local o de visitante. */
function formulaRondaRF_(f) {
  var E = RF_ELIM;
  var p = "$" + RF_AUX.jugador + f;
  return "=MAX(IFERROR(MAXIFS(" + E + "$A:$A;" + E + "$C:$C;" + p + ");0);" +
         "IFERROR(MAXIFS(" + E + "$A:$A;" + E + "$G:$G;" + p + ");0))";
}

/** Categoria, buscada en 'Base de Datos' igual que en el resto del libro. */
function formulaCategoriaRF_(f) {
  var p = "$" + RF_AUX.jugador + f;
  return "=IF(" + p + "=\"\";\"\";" +
    "IFERROR(VLOOKUP(" + p + ";'Base de Datos'!$B:$C;2;FALSE);" +
    "IFERROR(VLOOKUP(" + p + ";'Base de Datos'!$F:$G;2;FALSE);" +
    "IFERROR(VLOOKUP(" + p + ";'Base de Datos'!$J:$K;2;FALSE);\"\"))))";
}

/** Carambolas que tiene que hacer. La misma busqueda que usa el cuadro. */
function formulaObjetivoRF_(f) {
  var p = "$" + RF_AUX.jugador + f;
  return "=IF(" + p + "=\"\";\"\";IFERROR(VLOOKUP(" + p + ";'Base de Datos'!$B$3:$E;4;FALSE);\"\"))";
}

/**
 * Hasta donde llego.
 *
 *   - Es el campeon si es el ganador de la ultima ronda.
 *   - Esta eliminado si perdio algun cruce: partidos - ganados -
 *     empates > 0. En eliminacion directa solo se puede perder una vez.
 *   - Si perdio en la ultima ronda, es el subcampeon.
 *   - Si no perdio ninguno y no es campeon, sigue vivo.
 */
function formulaHastaDondeRF_(f) {
  var A = RF_AUX;
  var p = "$" + A.jugador + f;
  var n = "COUNTIF(" + RF_ELIM + "$A:$A;$" + A.ronda + f + ")";

  var nombreRonda =
    "IF(" + n + "=1;\"Final\";" +
    "IF(" + n + "=2;\"Semifinal\";" +
    "IF(" + n + "=4;\"Cuartos de final\";" +
    "IF(" + n + "=8;\"Octavos de final\";" +
    "IF(" + n + "=16;\"Dieciseisavos de final\";" +
    "IF(" + n + "=32;\"Treintaidosavos de final\";" +
    "IF(" + n + "=64;\"Sesentaicuatroavos de final\";" +
    "\"Ronda \"&$" + A.ronda + f + ")))))))";

  return "=IF(" + p + "=\"\";\"\";" +
         "IF(" + p + "=$" + A.constantes + "$2;\"CAMPEÓN\";" +
         "IF(" + condPerdioRF_(f) + ";" +
         "IF($" + A.ronda + f + "=$" + A.constantes + "$1;\"SUBCAMPEÓN\";" + nombreRonda + ");" +
         "\"EN JUEGO\")))";
}

/** Perdio algun cruce: partidos - ganados - empates > 0. */
function condPerdioRF_(f) {
  var A = RF_AUX;
  return "($" + A.partidos + f + "-$" + A.ganados + f + "-$" + A.empates + f + ")>0";
}

/**
 * La clave con la que se ordena todo.
 *   campeon          -> ultima ronda + 1  (por encima del subcampeon)
 *   eliminado        -> la ronda en que perdio
 *   sigue en carrera -> media ronda por encima de los que cayeron ahi
 *
 * Se escribe 1/2 y no 0,5 para no depender de si el libro usa coma o
 * punto como separador decimal.
 */
function formulaOrdenRF_(f) {
  var A = RF_AUX;
  var p = "$" + A.jugador + f;
  return "=IF(" + p + "=\"\";\"\";" +
         "IF(" + p + "=$" + A.constantes + "$2;$" + A.constantes + "$1+1;" +
         "IF(" + condPerdioRF_(f) + ";$" + A.ronda + f + ";$" + A.ronda + f + "+1/2)))";
}

/* ============================================================
 *  CALCULO DE CONTROL
 *
 *  Lo mismo, pero en JavaScript. No se escribe en la hoja: sirve para
 *  comprobar que las formulas dan el mismo resultado.
 * ============================================================ */

function esNumeroRF_(v) {
  return v !== "" && v !== null && v !== undefined && !isNaN(v);
}

/** Recorre el cuadro y devuelve los cruces y los jugadores. */
function leerCuadroRF_(cuadro) {
  var nombres = [], vistos = {}, cruces = [], partidosPorRonda = {}, rondaFinal = 0, campeon = "";

  for (var r = 0; r < cuadro.length; r++) {
    var f = cuadro[r];
    if (!esNumeroRF_(f[0])) continue;                 // titulos y encabezados
    var ronda = parseInt(f[0], 10);
    if (!ronda) continue;

    partidosPorRonda[ronda] = (partidosPorRonda[ronda] || 0) + 1;
    if (ronda > rondaFinal) rondaFinal = ronda;

    var jugA = String(f[2]).trim(), jugB = String(f[6]).trim();
    var ganador = String(f[10]).trim();
    var jugado = esNumeroRF_(f[3]) && Number(f[3]) > 0 &&
                 esNumeroRF_(f[7]) && Number(f[7]) > 0;

    cruces.push({
      ronda: ronda, jugado: jugado, ganador: ganador,
      a: { nombre: jugA, ent: f[3], car: f[4], obj: f[11] },
      b: { nombre: jugB, ent: f[7], car: f[8], obj: f[12] }
    });

    var dos = [jugA, jugB];
    for (var k = 0; k < 2; k++) {
      var n = dos[k];
      if (n === "" || n === "BYE" || n === "Jugador A" || n === "Jugador B") continue;
      if (!vistos[n]) { vistos[n] = true; nombres.push(n); }
    }
  }

  for (var c = 0; c < cruces.length; c++) {
    if (cruces[c].ronda === rondaFinal) {
      var g = cruces[c].ganador;
      if (g !== "" && g !== "EMPATE" && g !== "BYE") campeon = g;
    }
  }

  return { nombres: nombres, cruces: cruces, partidosPorRonda: partidosPorRonda,
           rondaFinal: rondaFinal, campeon: campeon };
}

/** El ranking, calculado aparte para comprobar las formulas. */
function rankingCalculadoRF_(lectura) {
  var fichas = {};

  for (var i = 0; i < lectura.nombres.length; i++) {
    fichas[lectura.nombres[i]] = {
      nombre: lectura.nombres[i], siembra: i + 1, partidos: 0, ganados: 0, empates: 0,
      carambolas: 0, entradas: 0, objetivos: 0, rondaMax: 0
    };
  }

  for (var c = 0; c < lectura.cruces.length; c++) {
    var cr = lectura.cruces[c];
    var lados = [cr.a, cr.b];
    for (var k = 0; k < 2; k++) {
      var lado = lados[k];
      var j = fichas[lado.nombre];
      if (!j) continue;
      if (cr.ronda > j.rondaMax) j.rondaMax = cr.ronda;
      if (!cr.jugado) continue;
      j.partidos++;
      j.carambolas += Number(lado.car) || 0;
      j.entradas   += Number(lado.ent) || 0;
      if (esNumeroRF_(lado.obj)) j.objetivos += Number(lado.obj);
      if (cr.ganador === lado.nombre) j.ganados++;
      else if (cr.ganador === "EMPATE") j.empates++;
    }
  }

  var lista = [];
  for (var nom in fichas) {
    var j = fichas[nom];
    var perdio = (j.partidos - j.ganados - j.empates) > 0;

    if (j.nombre === lectura.campeon) {
      j.etiqueta = "CAMPEÓN";
      j.orden = lectura.rondaFinal + 1;
    } else if (perdio) {
      j.etiqueta = (j.rondaMax === lectura.rondaFinal)
        ? "SUBCAMPEÓN"
        : nombreRondaFinal_(lectura.partidosPorRonda[j.rondaMax], j.rondaMax);
      j.orden = j.rondaMax;
    } else {
      j.etiqueta = "EN JUEGO";
      j.orden = j.rondaMax + 0.5;
    }

    j.rendimiento = (j.objetivos > 0) ? (j.carambolas / j.objetivos) : 0;
    j.promedio    = (j.entradas  > 0) ? (j.carambolas / j.entradas)  : 0;
    lista.push(j);
  }

  lista.sort(function (a, b) {
    if (b.orden !== a.orden)             return b.orden - a.orden;
    if (b.rendimiento !== a.rendimiento) return b.rendimiento - a.rendimiento;
    if (b.promedio !== a.promedio)       return b.promedio - a.promedio;
    return a.siembra - b.siembra;
  });
  return lista;
}

/** Nombre de la ronda segun cuantos cruces tiene, igual que en el cuadro. */
function nombreRondaFinal_(partidos, numero) {
  if (partidos === 1)  return "Final";
  if (partidos === 2)  return "Semifinal";
  if (partidos === 4)  return "Cuartos de final";
  if (partidos === 8)  return "Octavos de final";
  if (partidos === 16) return "Dieciseisavos de final";
  if (partidos === 32) return "Treintaidosavos de final";
  if (partidos === 64) return "Sesentaicuatroavos de final";
  return "Ronda " + numero;
}

/* ============================================================
 *  FORMATO
 * ============================================================ */

function FormatoRankingFinal_(wsR, total, filaPie, lineasPie) {
  var ultima = total + 2;

  // --- Fila 1: los rotulos ---
  wsR.getRange("A1:D1").merge()
    .setBackground(rgbToHex(217, 217, 217)).setFontColor(rgbToHex(64, 64, 64));
  wsR.getRange("E1:H1").merge()
    .setBackground(rgbToHex(56, 118, 29)).setFontColor("#FFFFFF");
  wsR.getRange("I1:L1").merge()
    .setBackground(rgbToHex(191, 144, 0)).setFontColor("#FFFFFF");
  wsR.getRange(1, 1, 1, RF_ANCHO)
    .setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  wsR.setRowHeight(1, 24);

  // --- Fila 2: encabezados ---
  wsR.getRange(2, 1, 1, RF_ANCHO)
    .setFontWeight("bold").setFontColor("#FFFFFF")
    .setBackground(rgbToHex(0, 32, 96))
    .setHorizontalAlignment("center").setVerticalAlignment("middle")
    .setWrap(true);
  wsR.setRowHeight(2, 34);

  var notas = [
    "Puesto final del torneo.",
    "",
    "Categoría en la que está inscrito, según «Base de Datos».",
    "Carambolas que tiene que hacer para ganar una partida.\nPrimera y Segunda no juegan a lo mismo.",
    "La última ronda que jugó. La perdió ahí, salvo el campeón.",
    "La misma ronda, en número. Es la que lee la web.",
    "1er criterio de desempate.\nCarambolas hechas ÷ carambolas que debía hacer.\n17 de 17 (100%) vale más que 18 de 20 (90%).",
    "2º criterio de desempate: carambolas ÷ entradas.\nEs el promedio de billar de toda la eliminación.",
    "INFORMATIVO. Partidas jugadas de verdad.\nLos BYE no cuentan: nadie tiró una bola.",
    "INFORMATIVO. Partidas ganadas.",
    "INFORMATIVO. Carambolas hechas en toda la eliminación.",
    "INFORMATIVO. Entradas jugadas en toda la eliminación."
  ];
  for (var i = 0; i < notas.length; i++) {
    if (notas[i] !== "") wsR.getRange(2, i + 1).setNote(notas[i]);
  }

  if (total > 0) {
    wsR.getRange(3, 1, total, RF_ANCHO)
      .setHorizontalAlignment("center").setVerticalAlignment("middle");
    wsR.getRange(3, 2, total, 2).setHorizontalAlignment("left");
    wsR.getRange(3, 2, total, 1).setFontWeight("bold");
    wsR.getRange(3, 5, total, 1).setHorizontalAlignment("left");

    wsR.getRange(3, 1, total, 1).setNumberFormat("0");
    wsR.getRange(3, 4, total, 1).setNumberFormat("0");
    wsR.getRange(3, 6, total, 1).setNumberFormat("0");
    wsR.getRange(3, 7, total, 1).setNumberFormat("0.0%");
    wsR.getRange(3, 8, total, 1).setNumberFormat("0.000");
    wsR.getRange(3, 9, total, 4).setNumberFormat("0");

    wsR.getRange(3, 5, total, 4).setBackground(rgbToHex(226, 239, 218));
    wsR.getRange(3, 7, total, 1).setFontWeight("bold");
    wsR.getRange(3, 9, total, 4)
      .setBackground(rgbToHex(252, 245, 226))
      .setFontColor(rgbToHex(89, 89, 89))
      .setFontStyle("italic");

    // El podio NO se puede pintar fila a fila: las filas cambian de
    // dueno solas cuando cambia el ranking. Va con formato condicional,
    // que mira el numero de la columna A.
    var zona = [wsR.getRange(3, 1, total, RF_ANCHO)];
    var reglas = [
      reglaPodioRF_("=$A3=1", rgbToHex(255, 217, 102), zona),
      reglaPodioRF_("=$A3=2", rgbToHex(217, 217, 217), zona),
      reglaPodioRF_("=$A3=3", rgbToHex(237, 187, 138), zona),
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=($G3<>"")*($G3>=1)')
        .setFontColor(rgbToHex(0, 97, 0)).setBold(true)
        .setRanges([wsR.getRange(3, 7, total, 1)])
        .build()
    ];
    wsR.setConditionalFormatRules(reglas);

    wsR.getRange(1, 1, ultima, RF_ANCHO)
      .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);
  }

  // --- Pie explicativo ---
  wsR.getRange(filaPie, 1, 1, RF_ANCHO).merge()
    .setBackground(rgbToHex(0, 32, 96)).setFontColor("#FFFFFF")
    .setFontWeight("bold").setHorizontalAlignment("left");
  for (var q = 1; q < lineasPie; q++) {
    wsR.getRange(filaPie + q, 1, 1, RF_ANCHO).merge()
      .setBackground(rgbToHex(242, 242, 242)).setFontColor(rgbToHex(64, 64, 64))
      .setHorizontalAlignment("left").setFontSize(9);
  }
  wsR.getRange(filaPie, 1, lineasPie, RF_ANCHO)
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);

  var anchos = [75, 235, 110, 85, 165, 95, 110, 100, 85, 85, 105, 90];
  for (var a = 0; a < anchos.length; a++) wsR.setColumnWidth(a + 1, anchos[a]);

  wsR.setFrozenRows(2);

  // El bloque de calculo se esconde: es maquinaria, no informacion.
  wsR.hideColumns(RF_AUX_INI, RF_AUX_COLS);
}

/** Una regla de formato condicional para pintar un puesto del podio. */
function reglaPodioRF_(formula, color, rangos) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(formula)
    .setBackground(color)
    .setFontColor("#000000")
    .setBold(true)
    .setRanges(rangos)
    .build();
}

/** Aviso por pantalla. Si no hay pantalla no se cae: va al registro. */
function avisoRF_(texto) {
  try {
    SpreadsheetApp.getUi().alert(texto);
  } catch (err) {
    console.log(texto);
  }
}
