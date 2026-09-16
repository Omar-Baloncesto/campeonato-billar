// ============================================================
// M7 - ELIMINACION SIMPLE  (cuadro completo, todas las rondas)
// ============================================================
//
// Crea la hoja "Eliminación Simple" con TODAS las rondas ya
// construidas y con las formulas listas: solo hay que digitar
// Entradas y Carambolas y los ganadores van subiendo solos.
//
// Columnas:
//   A Ronda | B Partido | C Jugador A | D Entradas A | E Carambolas A
//   F Prom A | G Jugador B | H Entradas B | I Carambolas B | J Prom B
//   K Ganador | L Objetivo A | M Objetivo B | N Fecha | O Hora
//
// A:K se mantiene igual que siempre (la web lee A1:K200).
// L, M, N y O se anaden AL FINAL para no mover nada.
//
// N y O vienen ya llenas con la fecha y la hora de cada ronda: son las
// que colocan el cuadro en el calendario de la web. Se pueden editar a
// mano en la hoja cuando haga falta, y para el torneo siguiente basta
// con cambiar los cuatro ajustes de aqui abajo.
// ============================================================

var ELIM_HOJA = "Eliminación Simple";

// ---------- AJUSTES DE LA ELIMINACION -----------------------
// Dia en que se juega el cuadro. Dejar "" para no poner fecha.
var ELIM_FECHA = "18/09/2026";

// Hora a la que arranca, en formato de 24 horas: 17 = 5:00 p. m.
var ELIM_HORA_INICIO = 17;

// Mesas disponibles a la vez.
var ELIM_MESAS = 5;

// Cuanto dura cada partida, en horas.
var ELIM_HORAS_POR_PARTIDA = 1;

// Ultima hora a la que puede empezar una partida (23 = 11:00 p. m.).
// Si el cuadro no cabe en un dia, sigue al dia siguiente a ELIM_HORA_INICIO.
var ELIM_HORA_FIN = 23;
// ------------------------------------------------------------

var ELIM_ENCABEZADOS = [
  "Ronda", "Partido",
  "Jugador A", "Entradas A", "Carambolas A", "Prom A",
  "Jugador B", "Entradas B", "Carambolas B", "Prom B",
  "Ganador", "Objetivo A", "Objetivo B", "Fecha", "Hora"
];

var ELIM_COLS = 15;

/**
 * Nombre de la ronda segun cuantos partidos tiene.
 */
function nombreRondaElim(partidos, numeroRonda) {
  if (partidos === 1) return "FINAL";
  if (partidos === 2) return "SEMIFINAL";
  if (partidos === 4) return "CUARTOS DE FINAL";
  if (partidos === 8) return "OCTAVOS DE FINAL";
  if (partidos === 16) return "DIECISEISAVOS DE FINAL";
  if (partidos === 32) return "TREINTAIDOSAVOS DE FINAL";
  if (partidos === 64) return "SESENTAICUATROAVOS DE FINAL";
  return "RONDA " + numeroRonda;
}

/**
 * Pasa una hora de 24 a 12 horas: 17 -> "5:00 PM", 23 -> "11:00 PM".
 */
function horaElimTexto_(h) {
  h = ((h % 24) + 24) % 24;
  var sufijo = h < 12 ? "AM" : "PM";
  var h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return h12 + ":00 " + sufijo;
}

/**
 * ELIM_FECHA mas los dias que haga falta, en el mismo formato dd/mm/aaaa.
 * Sirve para los cuadros grandes, que no caben en una sola jornada.
 */
function fechaElimMasDias_(texto, dias) {
  if (texto === "") return "";
  var p = (texto + "").trim().split(/[\/\-\.\s]+/);
  if (p.length !== 3) return texto;          // formato raro: se deja igual
  var d, m, a;
  if (p[0].length === 4) { a = parseInt(p[0], 10); m = parseInt(p[1], 10); d = parseInt(p[2], 10); }
  else { d = parseInt(p[0], 10); m = parseInt(p[1], 10); a = parseInt(p[2], 10); }
  if (isNaN(d) || isNaN(m) || isNaN(a)) return texto;
  if (a < 100) a += 2000;
  var f = new Date(a, m - 1, d + dias);
  var dd = f.getDate(), mm = f.getMonth() + 1;
  return (dd < 10 ? "0" + dd : dd) + "/" + (mm < 10 ? "0" + mm : mm) + "/" + f.getFullYear();
}

/** Pasa a la hora siguiente; si ya es tarde, al dia siguiente. */
function avanzarHoraElim_(reloj) {
  reloj.hora += ELIM_HORAS_POR_PARTIDA;
  reloj.mesas = 0;
  if (reloj.hora > ELIM_HORA_FIN) {
    reloj.dia += 1;
    reloj.hora = ELIM_HORA_INICIO;
  }
}

/**
 * Deja la hoja como recien creada, pero SIN cambiarle el gid:
 * deshace las celdas combinadas del cuadro anterior y borra contenido,
 * formato, validaciones y formato condicional.
 */
function limpiarHojaElim_(ws) {
  var todo = ws.getRange(1, 1, ws.getMaxRows(), ws.getMaxColumns());
  todo.breakApart();
  todo.clear();
  todo.clearDataValidations();
  ws.setConditionalFormatRules([]);
  ws.setFrozenRows(0);
}

function CrearEliminacionSimple() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  var wsG = ss.getSheetByName("GRUPOS");
  if (!wsG) {
    ui.alert("No existe la hoja GRUPOS. Corre primero el paso 6.");
    return;
  }

  // --- 1. Localizar la columna "Ranking Jugadores" en GRUPOS -------------
  var colRankingJug = 0;
  var firstRowG = ws_getRange_row1(wsG);
  for (var i = 0; i < firstRowG.length; i++) {
    if ((firstRowG[i] + "").trim() == "Ranking Jugadores") {
      colRankingJug = i + 1;
      break;
    }
  }
  if (colRankingJug === 0) {
    ui.alert("No se encontro la columna 'Ranking Jugadores' en GRUPOS.");
    return;
  }

  var ultFilaRanking = getLastRow(wsG, colRankingJug);
  var totalJugadores = ultFilaRanking - 1; // el ranking empieza en la fila 2

  if (totalJugadores < 2) {
    ui.alert("No hay suficientes jugadores en el ranking (hay " + totalJugadores + ").");
    return;
  }

  // --- 2. Tamano del cuadro ----------------------------------------------
  var cupo = 1;
  var rondas = 0;
  while (cupo < totalJugadores) {
    cupo = cupo * 2;
    rondas++;
  }
  if (rondas === 0) rondas = 1; // exactamente 2 jugadores
  var byes = cupo - totalJugadores;

  // --- 3. Mapa de filas de cada ronda ------------------------------------
  //   fila 1                -> titulo general
  //   por cada ronda: titulo, encabezados, partidos, y una fila en blanco
  var bloques = [];
  var fila = 2;
  for (var r = 1; r <= rondas; r++) {
    var partidosR = cupo / Math.pow(2, r);
    bloques.push({
      ronda: r,
      partidos: partidosR,
      titulo: fila,
      header: fila + 1,
      ini: fila + 2,
      fin: fila + 1 + partidosR
    });
    fila = fila + 2 + partidosR + 1; // +1 = fila separadora en blanco
  }
  var totalFilas = bloques[bloques.length - 1].fin;

  // --- 4. Preparar la hoja ------------------------------------------------
  //
  // OJO: la hoja NO se borra para volver a crearla. Al borrarla, Google le
  // da un gid NUEVO a la que se crea en su lugar, y el gid es lo que usa la
  // web para pedir esta pestaña: con un gid muerto, la página de Eliminación
  // se queda en blanco aunque la hoja esté perfecta.
  //
  // Se limpia a fondo y se reutiliza. El resultado es el mismo y el gid no
  // cambia nunca más.
  var wsE = ss.getSheetByName(ELIM_HOJA);

  // Hojas sobrantes de versiones antiguas, con el nombre mal escrito.
  //
  // CUIDADO: getSheetByName NO distingue mayusculas de minusculas, asi que
  // buscar "ELIMINACIÓN SIMPLE" devuelve la hoja "Eliminación Simple", la
  // buena. Comparar los NOMBRES como texto no basta: hay que comparar el
  // identificador de la hoja, que es unico. Si no, se borra la hoja buena
  // y la que se crea en su lugar estrena gid, que es exactamente lo que
  // dejaba la pagina de Eliminacion en blanco.
  var nombresViejos = ["Eliminacion Simple", "ELIMINACION SIMPLE", "ELIMINACIÓN SIMPLE"];
  for (var v = 0; v < nombresViejos.length; v++) {
    var vieja = ss.getSheetByName(nombresViejos[v]);
    if (!vieja) continue;
    if (wsE && vieja.getSheetId() === wsE.getSheetId()) continue;   // es la buena
    desprotegerHoja(vieja);
    ss.deleteSheet(vieja);
  }

  if (!wsE) {
    wsE = ss.insertSheet(ELIM_HOJA);
  } else {
    desprotegerHoja(wsE);
    limpiarHojaElim_(wsE);
  }

  if (wsE.getMaxColumns() < ELIM_COLS) {
    wsE.insertColumnsAfter(wsE.getMaxColumns(), ELIM_COLS - wsE.getMaxColumns());
  }
  if (wsE.getMaxRows() < totalFilas) {
    wsE.insertRowsAfter(wsE.getMaxRows(), totalFilas - wsE.getMaxRows());
  }

  // --- 5. Construir TODO en memoria --------------------------------------
  var datos = [];
  for (var f = 0; f < totalFilas; f++) {
    datos.push(new Array(ELIM_COLS).fill(""));
  }

  datos[0][0] = "ELIMINACIÓN SIMPLE";

  // Reparto de horas: las rondas van una detras de otra, y dentro de cada
  // ronda caben ELIM_MESAS partidas por hora. Los BYE no ocupan mesa.
  var reloj = { hora: ELIM_HORA_INICIO, dia: 0, mesas: 0 };
  var colocadosAntes = 0;
  var horarioRondas = [];   // solo para el informe final

  for (var b = 0; b < bloques.length; b++) {
    var bl = bloques[b];
    var prev = b > 0 ? bloques[b - 1] : null;

    datos[bl.titulo - 1][0] = nombreRondaElim(bl.partidos, bl.ronda);

    for (var c = 0; c < ELIM_COLS; c++) {
      datos[bl.header - 1][c] = ELIM_ENCABEZADOS[c];
    }

    // Cada ronda arranca en una hora nueva: no puede empezar hasta que
    // termine la anterior.
    if (colocadosAntes > 0) avanzarHoraElim_(reloj);
    reloj.mesas = 0;
    var desde = null, hasta = null;
    var realesEnRonda = 0;

    for (var p = 1; p <= bl.partidos; p++) {
      var n = bl.ini + p - 1;      // fila real en la hoja
      var fd = datos[n - 1];

      fd[0] = bl.ronda;
      fd[1] = p;

      var esBye = false;

      if (bl.ronda === 1) {
        // Siembra "espejo": 1 vs cupo, 2 vs cupo-1, ...
        var seedA = p;
        var seedB = cupo + 1 - p;
        fd[2] = seedA <= totalJugadores
          ? "=GRUPOS!" + getCellA1(seedA + 1, colRankingJug)
          : "BYE";
        fd[6] = seedB <= totalJugadores
          ? "=GRUPOS!" + getCellA1(seedB + 1, colRankingJug)
          : "BYE";
        esBye = (seedA > totalJugadores) || (seedB > totalJugadores);
      } else {
        // Los ganadores de la ronda anterior, tambien en espejo
        var rango = "$K$" + prev.ini + ":$K$" + prev.fin;
        fd[2] = formulaGanadorPrevio(rango, p);
        fd[6] = formulaGanadorPrevio(rango, prev.partidos - p + 1);
      }

      // Promedios de la partida (carambolas / entradas), sin #DIV/0!
      fd[5] = '=IF(OR(E' + n + '="";D' + n + '="");"";IF(D' + n + '=0;0;E' + n + '/D' + n + '))';
      fd[9] = '=IF(OR(I' + n + '="";H' + n + '="");"";IF(H' + n + '=0;0;I' + n + '/H' + n + '))';

      // Ganador
      fd[10] = formulaGanadorElim(n);

      // Objetivos (carambolas que debe hacer cada uno segun su categoria)
      fd[11] = formulaObjetivoElim("C" + n);
      fd[12] = formulaObjetivoElim("G" + n);

      // Fecha y hora. Un BYE no se juega, asi que va sin fecha.
      if (esBye || ELIM_FECHA === "") {
        fd[13] = "";
        fd[14] = "";
      } else {
        if (reloj.mesas >= ELIM_MESAS) avanzarHoraElim_(reloj);
        var fechaTxt = fechaElimMasDias_(ELIM_FECHA, reloj.dia);
        var horaTxt = horaElimTexto_(reloj.hora);
        fd[13] = fechaTxt;
        fd[14] = horaTxt;
        reloj.mesas++;
        realesEnRonda++;
        colocadosAntes++;
        if (desde === null) desde = { fecha: fechaTxt, hora: horaTxt };
        hasta = { fecha: fechaTxt, hora: horaTxt };
      }
    }

    if (realesEnRonda > 0) {
      horarioRondas.push({
        nombre: nombreRondaElim(bl.partidos, bl.ronda),
        partidos: realesEnRonda,
        desde: desde,
        hasta: hasta
      });
    }
  }

  // Fecha y hora como TEXTO: si no, Sheets convierte 18/09/2026 en un
  // numero de serie y la hora deja de leerse bien.
  wsE.getRange(1, 14, totalFilas, 2).setNumberFormat("@");

  // UNA sola escritura
  wsE.getRange(1, 1, totalFilas, ELIM_COLS).setValues(datos);

  // --- 6. Formato ---------------------------------------------------------
  wsE.getRange(1, 1, 1, ELIM_COLS).merge()
    .setValue("ELIMINACIÓN SIMPLE")
    .setBackground(rgbToHex(0, 32, 96))
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(16)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  wsE.setRowHeight(1, 30);

  for (var b2 = 0; b2 < bloques.length; b2++) {
    Formato_Ronda(wsE, bloques[b2].titulo, bloques[b2].ini, bloques[b2].fin);
  }

  // Anchos (una sola vez para toda la hoja)
  wsE.setColumnWidth(1, 55);    // A Ronda
  wsE.setColumnWidth(2, 60);    // B Partido
  wsE.setColumnWidth(3, 225);   // C Jugador A
  wsE.setColumnWidth(4, 85);    // D Entradas A
  wsE.setColumnWidth(5, 100);   // E Carambolas A
  wsE.setColumnWidth(6, 85);    // F Prom A
  wsE.setColumnWidth(7, 225);   // G Jugador B
  wsE.setColumnWidth(8, 85);    // H Entradas B
  wsE.setColumnWidth(9, 100);   // I Carambolas B
  wsE.setColumnWidth(10, 85);   // J Prom B
  wsE.setColumnWidth(11, 190);  // K Ganador
  wsE.setColumnWidth(12, 85);   // L Objetivo A
  wsE.setColumnWidth(13, 85);   // M Objetivo B
  wsE.setColumnWidth(14, 100);  // N Fecha
  wsE.setColumnWidth(15, 95);   // O Hora

  wsE.setFrozenRows(1);

  ss.setActiveSheet(wsE);

  // --- 7. Informe ---------------------------------------------------------
  var detalle = [];
  for (var b3 = 0; b3 < bloques.length; b3++) {
    detalle.push("  " + nombreRondaElim(bloques[b3].partidos, bloques[b3].ronda) +
                 ": " + bloques[b3].partidos + " partido(s)  [filas " +
                 bloques[b3].ini + "-" + bloques[b3].fin + "]");
  }

  var horario = [];
  var variosDias = false;
  for (var h = 0; h < horarioRondas.length; h++) {
    var hr = horarioRondas[h];
    if (hr.desde.fecha !== ELIM_FECHA || hr.hasta.fecha !== ELIM_FECHA) variosDias = true;
    var ini = (hr.desde.fecha === hr.hasta.fecha ? "" : hr.desde.fecha + " ") + hr.desde.hora;
    var fin = (hr.desde.fecha === hr.hasta.fecha ? "" : hr.hasta.fecha + " ") + hr.hasta.hora;
    horario.push("  " + hr.nombre + ": " +
                 (hr.desde.fecha !== ELIM_FECHA ? hr.desde.fecha + "  " : "") + ini +
                 (hr.desde.hora === hr.hasta.hora && hr.desde.fecha === hr.hasta.fecha ? "" : " a " + fin) +
                 "   (" + hr.partidos + " partida" + (hr.partidos === 1 ? "" : "s") + ")");
  }

  var msg = "ELIMINACIÓN SIMPLE CREADA\n\n" +
            "Jugadores clasificados: " + totalJugadores + "\n" +
            "Cuadro: " + cupo + "   BYEs: " + byes + "\n" +
            "Rondas: " + rondas + "   Partidos: " + (cupo - 1) + "\n\n" +
            detalle.join("\n") + "\n\n" +
            "Todas las rondas quedaron creadas con sus fórmulas.\n" +
            "Solo hay que digitar Entradas y Carambolas:\n" +
            "el ganador y la ronda siguiente se llenan solos.";

  if (horario.length > 0) {
    msg += "\n\nPROGRAMACIÓN (columnas N y O), desde el " + ELIM_FECHA + ":\n" +
           horario.join("\n");
    if (variosDias) {
      msg += "\n\nEl cuadro no cabe en un solo día (la última partida\n" +
             "empezaría después de las " + horaElimTexto_(ELIM_HORA_FIN) + "),\n" +
             "así que sigue al día siguiente.";
    }
    msg += "\n\nSe puede cambiar a mano en la hoja, o arriba del código\n" +
           "en ELIM_FECHA, ELIM_HORA_INICIO, ELIM_HORA_FIN y ELIM_MESAS.";
  } else {
    msg += "\n\nLas columnas N (Fecha) y O (Hora) quedaron en blanco.\n" +
           "Llénalas para que el cuadro salga en el calendario de la web.";
  }

  ui.alert(msg);
}

/**
 * Formula que trae el ganador nº idx del rango de la ronda anterior,
 * dejando la celda vacia si todavia no hay ganador o si hubo EMPATE.
 */
function formulaGanadorPrevio(rango, idx) {
  var ref = "INDEX(" + rango + ";" + idx + ")";
  return '=IF(OR(' + ref + '="";' + ref + '="EMPATE");"";' + ref + ")";
}

/**
 * Objetivo (carambolas a hacer) del jugador de la celda indicada.
 * Lo busca en 'Base de Datos' columna B = nombre, columna E = carambolas.
 */
function formulaObjetivoElim(celdaJugador) {
  return '=IF(OR(' + celdaJugador + '="";' + celdaJugador + '="BYE");"";' +
         "IFERROR(VLOOKUP(" + celdaJugador + ";'Base de Datos'!$B$3:$E;4;FALSE);\"\"))";
}

/**
 * Ganador del partido de la fila n.
 *
 *  - Si no hay jugador A todavia          -> vacio
 *  - BYE                                  -> pasa el otro
 *  - Falta digitar carambolas             -> vacio (no adelanta a nadie)
 *  - Hay objetivos (L y M)                -> gana el mayor PROMEDIO
 *                                            carambolas / objetivo
 *  - No hay objetivos                     -> gana el que mas carambolas hizo
 *
 * Cuando los dos objetivos son iguales las dos comparaciones dan
 * exactamente lo mismo, asi que la formula sirve para un torneo de una
 * sola categoria y para uno de primera contra segunda.
 */
function formulaGanadorElim(n) {
  var C = "C" + n, E = "E" + n, G = "G" + n, I = "I" + n, L = "L" + n, M = "M" + n;

  var cmpHandicap = "IF(" + E + "/" + L + ">" + I + "/" + M + ";" + C + ";" +
                    "IF(" + I + "/" + M + ">" + E + "/" + L + ";" + G + ';"EMPATE"))';

  var cmpDirecto = "IF(" + E + ">" + I + ";" + C + ";" +
                   "IF(" + I + ">" + E + ";" + G + ';"EMPATE"))';

  var sinObjetivo = "OR(" + L + '="";' + M + '="";' + L + "=0;" + M + "=0)";

  var decidir = "IF(" + sinObjetivo + ";" + cmpDirecto + ";" + cmpHandicap + ")";
  var jugado = "IF(OR(" + E + '="";' + I + '="");"";' + decidir + ")";
  var conB = "IF(" + G + '="BYE";' + C + ";" + jugado + ")";
  var conA = "IF(" + C + '="BYE";IF(' + G + '="BYE";"";' + G + ");" + conB + ")";

  return "=IF(" + C + '="";"";' + conA + ")";
}

/**
 * Helper: obtener fila 1 de una hoja como array
 */
function ws_getRange_row1(ws) {
  return ws.getRange(1, 1, 1, ws.getMaxColumns()).getValues()[0];
}

// ============================================================
// M8 - CREAR RONDAS ELIMINACION AUTOMATICA   (OBSOLETA)
// ============================================================
//
// Ya no hace falta: CrearEliminacionSimple construye el cuadro
// completo de una vez. Se deja como aviso porque la version
// anterior escribia la ronda 2 encima de los ultimos partidos
// de la ronda 1 y borraba jugadores del cuadro.
// ============================================================

function Crear_Rondas_Eliminacion_Automatica() {
  SpreadsheetApp.getUi().alert(
    "Esta función ya no se usa.\n\n" +
    "El paso 7 (Crear Eliminación Simple) ya crea TODAS las rondas " +
    "de una sola vez, con sus fórmulas listas."
  );
}

// ============================================================
// M9 - FORMATO RONDA
// ============================================================

function Formato_Ronda(wsE, filaTitulo, filaIniDatos, filaFinDatos) {
  if (filaFinDatos < filaIniDatos) return;

  var numRows = filaFinDatos - filaIniDatos + 1;

  // Titulo de la ronda
  wsE.getRange(filaTitulo, 1, 1, ELIM_COLS).merge()
    .setBackground(rgbToHex(0, 32, 96))
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(14)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  // Encabezados
  wsE.getRange(filaTitulo + 1, 1, 1, ELIM_COLS)
    .setBackground(rgbToHex(47, 85, 151))
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  // Entradas
  wsE.getRange(filaIniDatos, 4, numRows, 1).setBackground(rgbToHex(221, 235, 247));
  wsE.getRange(filaIniDatos, 8, numRows, 1).setBackground(rgbToHex(221, 235, 247));

  // Carambolas
  wsE.getRange(filaIniDatos, 5, numRows, 1).setBackground(rgbToHex(198, 224, 180));
  wsE.getRange(filaIniDatos, 9, numRows, 1).setBackground(rgbToHex(198, 224, 180));

  // Promedios
  wsE.getRange(filaIniDatos, 6, numRows, 1)
    .setFontStyle("italic").setFontColor(rgbToHex(64, 64, 64)).setNumberFormat("0.000");
  wsE.getRange(filaIniDatos, 10, numRows, 1)
    .setFontStyle("italic").setFontColor(rgbToHex(64, 64, 64)).setNumberFormat("0.000");

  // Ganador
  wsE.getRange(filaIniDatos, 11, numRows, 1)
    .setFontWeight("bold").setBackground(rgbToHex(255, 242, 204));

  // Objetivos (solo referencia, no se digitan)
  wsE.getRange(filaIniDatos, 12, numRows, 2)
    .setBackground(rgbToHex(242, 242, 242))
    .setFontColor(rgbToHex(89, 89, 89))
    .setNumberFormat("0");

  // Fecha y hora: se pueden editar, por eso van en blanco
  wsE.getRange(filaIniDatos, 14, numRows, 2)
    .setBackground("#FFFFFF")
    .setFontColor(rgbToHex(64, 64, 64));

  // Bordes del bloque completo (encabezados + partidos)
  wsE.getRange(filaTitulo, 1, filaFinDatos - filaTitulo + 1, ELIM_COLS)
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);

  // Alineaciones
  wsE.getRange(filaIniDatos, 1, numRows, 2).setHorizontalAlignment("center");
  wsE.getRange(filaIniDatos, 4, numRows, 3).setHorizontalAlignment("center");
  wsE.getRange(filaIniDatos, 8, numRows, 3).setHorizontalAlignment("center");
  wsE.getRange(filaIniDatos, 11, numRows, 5).setHorizontalAlignment("center");

  // Jugadores
  wsE.getRange(filaIniDatos, 3, numRows, 1).setFontWeight("bold").setHorizontalAlignment("left");
  wsE.getRange(filaIniDatos, 7, numRows, 1).setFontWeight("bold").setHorizontalAlignment("left");

  // Altura de filas
  for (var r = filaTitulo; r <= filaFinDatos; r++) {
    wsE.setRowHeight(r, 22);
  }
}
