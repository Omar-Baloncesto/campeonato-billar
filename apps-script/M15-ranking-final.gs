// ============================================================
// M15 - RANKING FINAL   (hoja VIVA, se actualiza sola)
// ============================================================
//
// QUE HACE
//
// Monta la hoja RankingFinal a partir del cuadro de eliminacion. Se
// corre UNA VEZ por torneo y a partir de ahi se actualiza sola: cada
// celda es una formula, asi que en cuanto se anotan carambolas en
// "Eliminación Simple" cambian los datos, las etiquetas y el ORDEN.
// No hay que volver a correr nada hasta el torneo siguiente.
//
// DE DONDE SALE
//
// SOLO de la hoja "Eliminación Simple". El ranking final no tiene nada
// que ver con la fase de grupos: son dos torneos distintos. Quien entro
// al cuadro sembrado de ultimo puede acabar campeon, y entonces es
// campeon y punto.
//
// SIRVE PARA CUALQUIER TORNEO
//
// No hay ni un numero fijo. Los jugadores, las rondas y los nombres de
// las rondas salen de leer el cuadro, y los objetivos de carambolas de
// 'Base de Datos'. Da igual que sean 8 jugadores o 64, dos categorias
// o una sola, y que el cuadro tenga BYE o no.
//
// COMO ORDENA
//
//       1º  HASTA DONDE LLEGO     campeon, subcampeon, semifinal...
//       2º  % DE SU OBJETIVO      carambolas hechas / las que debia
//       3º  PROMEDIO              carambolas / entradas
//       4º  ORDEN DEL CUADRO      su sitio en la siembra
//
// El 4º no es deportivo: esta para que NUNCA queden dos empatados y el
// orden no dependa del azar.
//
// El 2º es el que iguala a las dos categorias. No compara carambolas
// brutas, sino que porcentaje hizo cada uno DE LO SUYO:
//
//       Primera juega a 20 -> 18 carambolas = 18/20 =  90,0 %
//       Segunda juega a 17 -> 17 carambolas = 17/17 = 100,0 %
//
// El de Segunda hizo MENOS carambolas y rindio MAS, porque cumplio su
// objetivo. Es el mismo criterio con el que la columna K del cuadro
// decide cada partida.
//
// EN LA ELIMINACION NO HAY EMPATES
//
// Siempre tiene que haber un ganador. De ahi salen dos cosas:
//
//   · Quien perdio una vez, esta fuera. No hace falta mirar nada mas.
//   · La columna "Ganadas" sobraba: todos ganan las que jugaron menos
//     una, y el campeon las gana todas. No decia nada que no dijera ya
//     "hasta donde llego". Fuera.
//
// LA TABLA, EN TRES BLOQUES DE TRES
//
//    QUIEN ES              ASI SE DECIDE EL PUESTO      COMO JUGO
//    Puesto                Hasta donde llego            Partidas
//    Jugador               % de su objetivo             Carambolas
//    Categoria             Promedio                     Entradas
//
// COMO ESTA HECHA POR DENTRO
//
// Una tabla ordenada no se puede escribir celda a celda con formulas:
// hay que calcular primero y ordenar despues. Asi que la hoja tiene
// dos zonas:
//
//   · Un BLOQUE DE CALCULO oculto (columnas P a AB). Una fila por
//     jugador, SIN ordenar, con todas las cuentas.
//
//   · La TABLA VISIBLE (A a I), que es UNA SOLA formula en B3:
//         ARRAY_CONSTRAIN(SORT(bloque; Orden;desc; %;desc;
//                              Promedio;desc; Siembra;asc); filas; 8)
//
// Cuando se anota una carambola, el bloque se recalcula, el SORT
// reordena y la tabla cambia sola.
//
// AL FINAL SE COMPRUEBA SOLA
//
// El codigo calcula ademas el ranking por su cuenta, con JavaScript, y
// lo compara con lo que dieron las formulas. Si no coinciden, lo dice
// en el aviso.
//
// La hoja NO se borra ni se vuelve a crear, para que no le cambie el
// identificador y la web la siga encontrando. Volver a correrlo no
// puede danar ningun marcador: esta hoja no guarda ni un dato propio.
// ============================================================

var RF_HOJA      = "RankingFinal";
var RF_ANCHO     = 9;   // A..I, la tabla visible
var RF_AUX_INI   = 16;  // P, donde empieza el bloque de calculo
var RF_AUX_SORT  = 12;  // P..AA, lo que entra en el SORT
var RF_AUX_COLS  = 13;  // P..AB, contando la columna de las constantes
var RF_VISIBLES  = 8;   // P..W, lo que se copia a la tabla (B..I)

// AB guarda dos constantes (ultima ronda y campeon) y NO forma parte de
// la fila de datos: si se escribe encima, el campeon se queda en blanco
// y nadie sale como CAMPEÓN.
var RF_AUX = {
  jugador: "P", categoria: "Q", hasta: "R", porcentaje: "S", promedio: "T",
  partidas: "U", carambolas: "V", entradas: "W",
  orden: "X", ronda: "Y", ganadas: "Z", siembra: "AA", constantes: "AB"
};

// Posicion de cada columna dentro del SORT (1 = la primera del bloque).
var RF_POS = { porcentaje: 4, promedio: 5, orden: 9, siembra: 12 };

// La hoja del cuadro, lista para meter en una formula.
var RF_ELIM = "'Eliminación Simple'!";

function GenerarRankingFinal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var wsE = ss.getSheetByName("Eliminación Simple");
  if (!wsE) { avisoRF_("No se encontro la hoja 'Eliminación Simple'."); return; }

  var ultFilaE = wsE.getLastRow();
  if (ultFilaE < 2) { avisoRF_("La hoja 'Eliminación Simple' esta vacia."); return; }

  // ----------------------------------------------------------
  // 1. LEER EL CUADRO
  //
  //    A Ronda | B Partido | C Jugador A | D Entradas A | E Carambolas A
  //    F Prom A | G Jugador B | H Entradas B | I Carambolas B | J Prom B
  //    K Ganador | L Objetivo A | M Objetivo B | N Fecha | O Hora
  //
  //    OJO con D y E: aqui van al reves que en RESULTADOS. En el cuadro
  //    la columna D son las ENTRADAS y la E las CARAMBOLAS.
  // ----------------------------------------------------------
  var lectura = leerCuadroRF_(wsE.getRange(1, 1, ultFilaE, 15).getValues());

  if (lectura.nombres.length === 0) {
    avisoRF_("En el cuadro todavia no hay jugadores.");
    return;
  }

  var nombres = lectura.nombres;
  var total = nombres.length;

  // ----------------------------------------------------------
  // 2. PREPARAR LA HOJA SIN BORRARLA
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

  wsR.getRange(A.constantes + "1").setFormula("=MAX(" + RF_ELIM + "$A:$A)");
  wsR.getRange(A.constantes + "2").setFormula(
    "=IFERROR(INDEX(" + RF_ELIM + "$K:$K;MATCH($" + A.constantes + "$1;" +
    RF_ELIM + "$A:$A;0));\"\")");

  // Los encabezados del bloque llevan "Aux" delante a proposito: si se
  // llamaran igual que los de verdad, la web podria leer estos.
  var cabAux = [
    "Aux Jugador", "Aux Categoria", "Aux Hasta", "Aux Porcentaje", "Aux Promedio",
    "Aux Partidas", "Aux Carambolas", "Aux Entradas",
    "Aux Orden", "Aux Ronda", "Aux Ganadas", "Aux Siembra"
  ];
  wsR.getRange(2, RF_AUX_INI, 1, RF_AUX_SORT).setValues([cabAux]);

  var aux = [];
  for (var i = 0; i < total; i++) {
    var f = i + 3;
    aux.push([
      nombres[i],
      formulaCategoriaRF_(f),
      formulaHastaDondeRF_(f),
      formulaPorcentajeRF_(f),
      formulaPromedioRF_(f),
      formulaContarRF_(f, false),
      formulaSumarRF_(f, "E", "I"),      // carambolas
      formulaSumarRF_(f, "D", "H"),      // entradas
      formulaOrdenRF_(f),
      formulaRondaRF_(f),
      formulaContarRF_(f, true),         // ganadas
      i + 1                              // sitio en la siembra
    ]);
  }
  wsR.getRange(3, RF_AUX_INI, total, RF_AUX_SORT).setValues(aux);

  // ----------------------------------------------------------
  // 4. LA TABLA VISIBLE
  // ----------------------------------------------------------
  var rotulos = ["", "", "", "", "", "", "", "", ""];
  rotulos[0] = "QUIÉN ES";                 // A..C
  rotulos[3] = "ASÍ SE DECIDE EL PUESTO";  // D..F
  rotulos[6] = "CÓMO JUGÓ · NO ORDENA";    // G..I

  // OJO: "Ranking", "Jugador" y "Hasta dónde llegó" son los nombres con
  // los que la web reconoce esta hoja. Si se cambian hay que cambiar
  // tambien app/lib/parsers.ts y app/lib/sheets.ts.
  var encabezados = [
    "Ranking", "Jugador", "Categoría",
    "Hasta dónde llegó", "% de su objetivo", "Promedio",
    "Partidas", "Carambolas", "Entradas"
  ];

  wsR.getRange(1, 1, 1, RF_ANCHO).setValues([rotulos]);
  wsR.getRange(2, 1, 1, RF_ANCHO).setValues([encabezados]);

  var colA = [];
  for (var a = 0; a < total; a++) colA.push(['=IF($B' + (a + 3) + '="";"";ROW()-2)']);
  wsR.getRange(3, 1, total, 1).setFormulas(colA);

  // B3: UNA sola formula que trae la tabla entera ya ordenada.
  var rangoAux = "$" + A.jugador + "$3:$" + A.siembra + "$" + finAux;
  wsR.getRange("B3").setFormula(
    "=IFERROR(ARRAY_CONSTRAIN(SORT(" + rangoAux + ";" +
    RF_POS.orden + ";FALSE;" + RF_POS.porcentaje + ";FALSE;" +
    RF_POS.promedio + ";FALSE;" + RF_POS.siembra + ";TRUE);" +
    total + ";" + RF_VISIBLES + ");\"\")");

  // ----------------------------------------------------------
  // 5. EL PIE QUE LO EXPLICA
  // ----------------------------------------------------------
  var pie = [
    "CÓMO SE LEE ESTE RANKING",
    "El puesto lo decide, en este orden:  1º hasta dónde llegó en el cuadro  ·  2º % de su objetivo  ·  3º promedio.",
    "% de su objetivo = carambolas que hizo ÷ carambolas que debía hacer. Es lo que iguala a las dos categorías: Primera juega a 20 y",
    "Segunda a 17, así que 17 de 17 (100,0 %) rinde más que 18 de 20 (90,0 %), aunque sean menos carambolas.",
    "Todo sale de «Eliminación Simple»; la fase de grupos no cuenta aquí. Los BYE no cuentan como partida: no se jugaron."
  ];
  for (var q = 0; q < pie.length; q++) wsR.getRange(filaPie + q, 1).setValue(pie[q]);

  SpreadsheetApp.flush();
  FormatoRankingFinal_(wsR, total, filaPie, lineasPie);

  // ----------------------------------------------------------
  // 6. COMPROBARSE A SI MISMA
  // ----------------------------------------------------------
  SpreadsheetApp.flush();
  var esperado = rankingCalculadoRF_(lectura);
  var salio = wsR.getRange(3, 2, total, 1).getValues();
  var diferencias = [];
  for (var v = 0; v < total && diferencias.length < 5; v++) {
    var dio = String(salio[v][0]).trim();
    if (dio !== esperado[v].nombre) {
      diferencias.push("  fila " + (v + 1) + ": la hoja dice «" + dio +
                       "» y deberia decir «" + esperado[v].nombre + "»");
    }
  }

  ss.setActiveSheet(wsR);

  var campeon = (esperado[0] && esperado[0].etiqueta === "CAMPEÓN")
    ? esperado[0].nombre : "(todavia no hay campeon)";

  var msg =
    "Ranking Final generado.\n\n" +
    total + " jugadores · " + lectura.rondaFinal + " rondas.\n" +
    "Campeon: " + campeon + "\n\n" +
    "La hoja quedo VIVA: se actualiza sola cada vez que se\n" +
    "anotan carambolas en 'Eliminación Simple'. No hay que\n" +
    "volver a correr esto hasta el proximo torneo.\n\n" +
    "El puesto lo decide: 1º hasta donde llego · 2º % de su\n" +
    "objetivo · 3º promedio. Todo del cuadro; los grupos no\n" +
    "cuentan aqui.";

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
 *  Una partida cuenta como JUGADA solo si los DOS anotaron entradas.
 *  Asi quedan fuera los BYE (que no tienen entradas) y los cruces que
 *  todavia no se han jugado, sin tener que adivinar nada. Se piden
 *  entradas y no carambolas porque un jugador SI puede quedarse en
 *  cero carambolas, pero nunca en cero entradas.
 * ============================================================ */

/** Las condiciones de "partida jugada", vistas desde cada lado. */
function condJugadaRF_(comoLocal) {
  var E = RF_ELIM;
  return comoLocal
    ? E + "$D:$D;\">0\";" + E + "$H:$H;\">0\""
    : E + "$H:$H;\">0\";" + E + "$D:$D;\">0\"";
}

/** Partidas jugadas del jugador de la fila f, o solo las ganadas. */
function formulaContarRF_(f, soloGanadas) {
  var E = RF_ELIM, p = "$" + RF_AUX.jugador + f;
  var extra = soloGanadas ? (";" + E + "$K:$K;" + p) : "";
  return "=COUNTIFS(" + E + "$C:$C;" + p + ";" + condJugadaRF_(true) + extra + ")" +
         "+COUNTIFS(" + E + "$G:$G;" + p + ";" + condJugadaRF_(false) + extra + ")";
}

/** Suma una columna del cuadro: colLocal cuando es A, colVisita cuando es B. */
function formulaSumarRF_(f, colLocal, colVisita) {
  var E = RF_ELIM, p = "$" + RF_AUX.jugador + f;
  return "=SUMIFS(" + E + "$" + colLocal + ":$" + colLocal + ";" + E + "$C:$C;" + p + ";" + condJugadaRF_(true) + ")" +
         "+SUMIFS(" + E + "$" + colVisita + ":$" + colVisita + ";" + E + "$G:$G;" + p + ";" + condJugadaRF_(false) + ")";
}

/**
 * % de su objetivo = carambolas hechas / carambolas que debia hacer.
 * El divisor es la suma de sus objetivos (columnas L y M) en las
 * partidas que jugo de verdad, asi que un BYE no lo penaliza.
 */
function formulaPorcentajeRF_(f) {
  var E = RF_ELIM, p = "$" + RF_AUX.jugador + f;
  var objetivos =
    "(SUMIFS(" + E + "$L:$L;" + E + "$C:$C;" + p + ";" + condJugadaRF_(true) + ")" +
    "+SUMIFS(" + E + "$M:$M;" + E + "$G:$G;" + p + ";" + condJugadaRF_(false) + "))";
  return "=IF(" + objetivos + "=0;0;$" + RF_AUX.carambolas + f + "/" + objetivos + ")";
}

/** Promedio de billar: carambolas / entradas. */
function formulaPromedioRF_(f) {
  var A = RF_AUX;
  return "=IF($" + A.entradas + f + "=0;0;$" + A.carambolas + f + "/$" + A.entradas + f + ")";
}

/** La ronda mas lejos a la que llego, este de local o de visitante. */
function formulaRondaRF_(f) {
  var E = RF_ELIM, p = "$" + RF_AUX.jugador + f;
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

/**
 * En la eliminacion no hay empates: el que pierde una, esta fuera.
 * Asi que "esta eliminado" es, simplemente, que gano menos partidas de
 * las que jugo.
 */
function condPerdioRF_(f) {
  var A = RF_AUX;
  return "$" + A.ganadas + f + "<$" + A.partidas + f;
}

/**
 * Hasta donde llego. El nombre de la ronda sale de cuantos cruces
 * tiene, asi que vale para un cuadro de 8 y para uno de 64.
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

/** Recorre el cuadro y devuelve las partidas y los jugadores. */
function leerCuadroRF_(cuadro) {
  var nombres = [], vistos = {}, partidas = [], porRonda = {}, rondaFinal = 0, campeon = "";

  for (var r = 0; r < cuadro.length; r++) {
    var f = cuadro[r];
    if (!esNumeroRF_(f[0])) continue;                 // titulos y encabezados
    var ronda = parseInt(f[0], 10);
    if (!ronda) continue;

    porRonda[ronda] = (porRonda[ronda] || 0) + 1;
    if (ronda > rondaFinal) rondaFinal = ronda;

    var jugada = esNumeroRF_(f[3]) && Number(f[3]) > 0 &&
                 esNumeroRF_(f[7]) && Number(f[7]) > 0;

    partidas.push({
      ronda: ronda, jugada: jugada, ganador: String(f[10]).trim(),
      a: { nombre: String(f[2]).trim(), ent: f[3], car: f[4], obj: f[11] },
      b: { nombre: String(f[6]).trim(), ent: f[7], car: f[8], obj: f[12] }
    });

    var dos = [String(f[2]).trim(), String(f[6]).trim()];
    for (var k = 0; k < 2; k++) {
      var n = dos[k];
      if (n === "" || n === "BYE" || n === "Jugador A" || n === "Jugador B") continue;
      if (!vistos[n]) { vistos[n] = true; nombres.push(n); }
    }
  }

  for (var c = 0; c < partidas.length; c++) {
    if (partidas[c].ronda !== rondaFinal) continue;
    var g = partidas[c].ganador;
    if (g !== "" && g !== "BYE") campeon = g;
  }

  return { nombres: nombres, partidas: partidas, porRonda: porRonda,
           rondaFinal: rondaFinal, campeon: campeon };
}

/** El ranking, calculado aparte para comprobar las formulas. */
function rankingCalculadoRF_(lectura) {
  var fichas = {}, lista = [];

  for (var i = 0; i < lectura.nombres.length; i++) {
    var ficha = {
      nombre: lectura.nombres[i], siembra: i + 1, partidas: 0, ganadas: 0,
      carambolas: 0, entradas: 0, objetivos: 0, rondaMax: 0
    };
    fichas[ficha.nombre] = ficha;
    lista.push(ficha);
  }

  for (var c = 0; c < lectura.partidas.length; c++) {
    var pa = lectura.partidas[c];
    var lados = [pa.a, pa.b];
    for (var k = 0; k < 2; k++) {
      var lado = lados[k];
      var j = fichas[lado.nombre];
      if (!j) continue;
      if (pa.ronda > j.rondaMax) j.rondaMax = pa.ronda;
      if (!pa.jugada) continue;
      j.partidas++;
      j.carambolas += Number(lado.car) || 0;
      j.entradas   += Number(lado.ent) || 0;
      if (esNumeroRF_(lado.obj)) j.objetivos += Number(lado.obj);
      if (pa.ganador === lado.nombre) j.ganadas++;
    }
  }

  for (var q = 0; q < lista.length; q++) {
    var p = lista[q];
    var perdio = p.ganadas < p.partidas;     // sin empates, una derrota y fuera

    if (p.nombre === lectura.campeon) {
      p.etiqueta = "CAMPEÓN";
      p.orden = lectura.rondaFinal + 1;
    } else if (perdio) {
      p.etiqueta = (p.rondaMax === lectura.rondaFinal)
        ? "SUBCAMPEÓN"
        : nombreRondaFinal_(lectura.porRonda[p.rondaMax], p.rondaMax);
      p.orden = p.rondaMax;
    } else {
      p.etiqueta = "EN JUEGO";
      p.orden = p.rondaMax + 0.5;
    }

    p.porcentaje = (p.objetivos > 0) ? (p.carambolas / p.objetivos) : 0;
    p.promedio   = (p.entradas  > 0) ? (p.carambolas / p.entradas)  : 0;
  }

  lista.sort(function (a, b) {
    if (b.orden !== a.orden)           return b.orden - a.orden;
    if (b.porcentaje !== a.porcentaje) return b.porcentaje - a.porcentaje;
    if (b.promedio !== a.promedio)     return b.promedio - a.promedio;
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

  // --- Fila 1: los tres rotulos ---
  wsR.getRange("A1:C1").merge()
    .setBackground(rgbToHex(217, 217, 217)).setFontColor(rgbToHex(64, 64, 64));
  wsR.getRange("D1:F1").merge()
    .setBackground(rgbToHex(56, 118, 29)).setFontColor("#FFFFFF");
  wsR.getRange("G1:I1").merge()
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
    "La última ronda que jugó. La perdió ahí, salvo el campeón.\nEn la eliminación no hay empates: quien pierde una, queda fuera.",
    "1er criterio de desempate.\nCarambolas que hizo ÷ carambolas que debía hacer.\n17 de 17 (100%) vale más que 18 de 20 (90%).",
    "2º criterio de desempate: carambolas ÷ entradas.\nEs el promedio de billar de toda la eliminación.",
    "Partidas que jugó de verdad.\nLos BYE no cuentan: nadie tiró una bola.",
    "Carambolas hechas en toda la eliminación.",
    "Entradas jugadas en toda la eliminación."
  ];
  for (var i = 0; i < notas.length; i++) {
    if (notas[i] !== "") wsR.getRange(2, i + 1).setNote(notas[i]);
  }

  if (total > 0) {
    wsR.getRange(3, 1, total, RF_ANCHO)
      .setHorizontalAlignment("center").setVerticalAlignment("middle");
    wsR.getRange(3, 2, total, 3).setHorizontalAlignment("left");

    wsR.getRange(3, 1, total, 1).setNumberFormat("0");
    wsR.getRange(3, 5, total, 1).setNumberFormat("0.0%");
    wsR.getRange(3, 6, total, 1).setNumberFormat("0.000");
    wsR.getRange(3, 7, total, 3).setNumberFormat("0");

    wsR.getRange(3, 2, total, 1).setFontWeight("bold");
    wsR.getRange(3, 4, total, 3).setBackground(rgbToHex(226, 239, 218));
    wsR.getRange(3, 5, total, 1).setFontWeight("bold");
    wsR.getRange(3, 7, total, 3)
      .setBackground(rgbToHex(252, 245, 226))
      .setFontColor(rgbToHex(89, 89, 89))
      .setFontStyle("italic");

    // El podio NO se puede pintar fila a fila: las filas cambian de
    // dueno solas cuando cambia el ranking. Va con formato condicional.
    var zona = [wsR.getRange(3, 1, total, RF_ANCHO)];
    wsR.setConditionalFormatRules([
      reglaPodioRF_("=$A3=1", rgbToHex(255, 217, 102), zona),
      reglaPodioRF_("=$A3=2", rgbToHex(217, 217, 217), zona),
      reglaPodioRF_("=$A3=3", rgbToHex(237, 187, 138), zona),
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=($E3<>"")*($E3>=1)')
        .setFontColor(rgbToHex(0, 97, 0)).setBold(true)
        .setRanges([wsR.getRange(3, 5, total, 1)])
        .build()
    ]);

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

  var anchos = [75, 240, 115, 170, 125, 100, 90, 105, 90];
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
