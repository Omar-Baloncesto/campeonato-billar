// ============================================================
// M5 - RESULTADOS
// ============================================================

function CargarResultados() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  var wsR = getOrCreateSheet(ss, "RESULTADOS");
  var wsF = ss.getSheetByName("FIXTURE_GRUPOS");

  if (!wsF) { ui.alert("No se encontro la hoja FIXTURE_GRUPOS."); return; }

  desprotegerHoja(wsR);

  // Limpiar hoja RESULTADOS
  wsR.clear();

  var ultimaFilaF = getLastRow(wsF, 1);
  if (ultimaFilaF < 2) {
    ui.alert("El fixture esta vacio.\nGenera primero FIXTURE_GRUPOS.");
    return;
  }

  // ----------------------------------------------------------
  // LEER EL FIXTURE DE UNA SOLA VEZ
  //   1 = Grupo        2 = Partido       3 = Jugador A
  //   4 = Carambolas A 5 = Jugador B     6 = Carambolas B
  //   7 = Fecha        8 = Hora
  // ----------------------------------------------------------
  var fixture = wsF.getRange(2, 1, ultimaFilaF - 1, 8).getValues();

  // ----------------------------------------------------------
  // CONSTRUIR RESULTADOS EN MEMORIA
  //   Carambolas y Entradas se DIGITAN (van vacias).
  //   Promedios y Resultado son formulas.
  //   Objetivo A y Objetivo B van al FINAL (M y N) para que la
  //   zona A:L no cambie: de ahi salen los puntos por promedio.
  // ----------------------------------------------------------
  var salida = [[
    "Grupo", "Partido", "Jugador A",
    "Carambolas A", "Entradas A", "Promedio A",
    "Jugador B", "Carambolas B", "Entradas B",
    "Promedio B", "Resultado", "W.O.",
    "Objetivo A", "Objetivo B"
  ]];

  var fila = 2;
  var totalPartidos = 0;
  var sinObjetivo = 0;

  for (var i = 0; i < fixture.length; i++) {
    var jugA = fixture[i][2];   // columna C del fixture
    var jugB = fixture[i][4];   // columna E del fixture
    if (jugA === "" || jugA === null || jugB === "" || jugB === null) continue;

    var objA = fixture[i][3];   // columna D del fixture - Carambolas A
    var objB = fixture[i][5];   // columna F del fixture - Carambolas B
    if (objA === "" || objA === null || objB === "" || objB === null) sinObjetivo++;

    var r = fila;

    salida.push([
      fixture[i][0],   // A - Grupo
      fixture[i][1],   // B - Partido
      jugA,            // C - Jugador A
      "",              // D - Carambolas A  (se digita)
      "",              // E - Entradas A    (se digita)
      // F - Promedio A. Si las entradas son 0 (W.O.) devuelve 0 en vez de #DIV/0!
      '=IF(OR(D' + r + '="";E' + r + '="");"";IF(E' + r + '=0;0;D' + r + '/E' + r + '))',
      jugB,            // G - Jugador B
      "",              // H - Carambolas B  (se digita)
      "",              // I - Entradas B    (se digita)
      // J - Promedio B
      '=IF(OR(H' + r + '="";I' + r + '="");"";IF(I' + r + '=0;0;H' + r + '/I' + r + '))',
      // K - Resultado (gana el mayor promedio carambolas / objetivo)
      formulaResultadoPartido(r),
      "",              // L - W.O.          (se digita)
      objA,            // M - Objetivo A
      objB             // N - Objetivo B
    ]);

    fila++;
    totalPartidos++;
  }

  if (totalPartidos === 0) {
    ui.alert("No se encontro ningun partido valido en FIXTURE_GRUPOS.");
    return;
  }

  // ----------------------------------------------------------
  // UNA SOLA ESCRITURA
  // ----------------------------------------------------------
  wsR.getRange(1, 1, salida.length, 14).setValues(salida);
  SpreadsheetApp.flush();

  // Aplicar formato
  FormatoResultados();

  var msg = "Hoja RESULTADOS creada correctamente.\n\n" +
            totalPartidos + " partidos cargados desde el fixture.";
  if (sinObjetivo > 0) {
    msg += "\n\nATENCION: " + sinObjetivo + " partidos sin objetivo de carambolas.\n" +
           "Esos partidos se van a decidir por carambolas, no por promedio.\n" +
           "Revisa la columna E de 'Base de Datos'.";
  }
  ui.alert(msg);
}

/**
 * Formula de la columna K (Resultado) para la fila r.
 *
 * Orden de decision:
 *   1. L = "SI"                         -> "W.O."
 *   2. Falta digitar carambolas         -> "SIN JUGAR"
 *   3. Hay objetivo en M y N            -> gana el mayor PROMEDIO
 *                                          carambolas / objetivo
 *   4. No hay objetivo                  -> gana el que mas carambolas hizo
 *
 * El promedio de handicap es lo que hace justo un grupo donde se cruzan
 * primera (20 carambolas) y segunda (17): 10/20 = 0,500 pierde contra
 * 9/17 = 0,529 aunque sean menos carambolas.
 *
 * Cuando los dos objetivos son iguales las dos comparaciones dan el mismo
 * resultado, asi que la misma formula sirve para un torneo de una sola
 * categoria y para uno de primera contra segunda.
 */
function formulaResultadoPartido(r) {
  var C = "C" + r, D = "D" + r, G = "G" + r, H = "H" + r;
  var L = "L" + r, M = "M" + r, N = "N" + r;

  var cmpHandicap = "IF(" + D + "/" + M + ">" + H + "/" + N + ";" + C + ";" +
                    "IF(" + H + "/" + N + ">" + D + "/" + M + ";" + G + ';"EMPATE"))';

  var cmpDirecto = "IF(" + D + ">" + H + ";" + C + ";" +
                   "IF(" + H + ">" + D + ";" + G + ';"EMPATE"))';

  var sinObjetivo = "OR(" + M + '="";' + N + '="";' + M + "=0;" + N + "=0)";

  var decidir = "IF(" + sinObjetivo + ";" + cmpDirecto + ";" + cmpHandicap + ")";
  var jugado = "IF(OR(" + D + '="";' + H + '="");"SIN JUGAR";' + decidir + ")";

  return "=IF(" + L + '="SI";"W.O.";' + jugado + ")";
}

function FormatoResultados() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName("RESULTADOS");
  if (!ws) return;

  var ultimaFila = getLastRow(ws, 1);
  if (ultimaFila < 2) return;

  // Encabezados
  ws.getRange("A1:N1")
    .setFontWeight("bold")
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(rgbToHex(184, 204, 228));

  // Anchos de columna:  A   B    C    D   E   F    G    H   I   J    K    L   M   N
  var anchos = [65, 65, 180, 95, 80, 95, 180, 95, 80, 95, 180, 65, 95, 95];
  for (var c = 0; c < anchos.length; c++) ws.setColumnWidth(c + 1, anchos[c]);

  // Alineaciones
  ws.getRange(2, 1, ultimaFila - 1, 2).setHorizontalAlignment("center");
  ws.getRange(2, 4, ultimaFila - 1, 3).setHorizontalAlignment("center");
  ws.getRange(2, 8, ultimaFila - 1, 3).setHorizontalAlignment("center");
  ws.getRange(2, 11, ultimaFila - 1, 4).setHorizontalAlignment("center");

  // Formatos numericos
  ws.getRange(2, 6, ultimaFila - 1, 1).setNumberFormat("0.000");
  ws.getRange(2, 10, ultimaFila - 1, 1).setNumberFormat("0.000");

  // Bordes
  ws.getRange(1, 1, ultimaFila, 14).setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);

  // Bloqueo visual de celdas no editables
  ws.getRange(2, 1, ultimaFila - 1, 3).setBackground(rgbToHex(242, 242, 242));
  ws.getRange(2, 5, ultimaFila - 1, 1).setBackground(rgbToHex(242, 242, 242));
  ws.getRange(2, 9, ultimaFila - 1, 1).setBackground(rgbToHex(242, 242, 242));
  ws.getRange(2, 13, ultimaFila - 1, 2).setBackground(rgbToHex(242, 242, 242));  // M y N - Objetivos
  ws.getRange(2, 6, ultimaFila - 1, 1).setBackground(rgbToHex(226, 239, 218));
  ws.getRange(2, 10, ultimaFila - 1, 1).setBackground(rgbToHex(226, 239, 218));
  ws.getRange(2, 11, ultimaFila - 1, 1).setBackground(rgbToHex(226, 239, 218));

  // Celdas editables
  ws.getRange(2, 4, ultimaFila - 1, 1).setBackground("#FFFFFF");
  ws.getRange(2, 8, ultimaFila - 1, 1).setBackground("#FFFFFF");
  ws.getRange(2, 12, ultimaFila - 1, 1).setBackground("#FFFFFF");

  // Ir a la hoja
  ss.setActiveSheet(ws);
}
