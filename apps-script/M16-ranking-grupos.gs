// ============================================================
// M16 - GENERAR RANKING GRUPOS   (hoja VIVA, se actualiza sola)
// ============================================================
//
// QUE CAMBIA RESPECTO A LA VERSION ANTERIOR
//
// 1. ANTES la hoja era una FOTO. El codigo leia GRUPOS y RESULTADOS,
//    calculaba en memoria y escribia NUMEROS FIJOS. Si despues alguien
//    anotaba una partida, la hoja se quedaba con los datos viejos hasta
//    que se volviera a correr el boton del menu.
//
//    AHORA cada celda es una FORMULA. Se corre el boton UNA VEZ, queda
//    montada, y a partir de ahi la hoja se recalcula sola cada vez que
//    se digita una carambola en RESULTADOS. No hay que volver a correr
//    nada en todo el torneo.
//
// 2. Se anaden las columnas que EXPLICAN el orden. El orden de esta
//    hoja lo copia de la columna "Ranking Jugadores" de GRUPOS, que
//    sale de CLASIF GRAL, que se decide asi:
//
//        1º  ORDEN GRUPO        (puesto dentro del grupo)
//        2º  PTS x PARTIDO      (puntos / partidos del grupo)
//        3º  VENTAJA x PARTIDO  (DIF % / partidos del grupo)
//        4º  TOTAL CA           (carambolas a favor)
//
//    Antes la hoja ensenaba "Promedio" (carambolas / entradas) al lado
//    del ranking, y ese numero NO PINTA NADA en el orden: ordenando por
//    el promedio cambiarian de puesto 21 de los 22 jugadores. Quien
//    miraba la hoja veia una lista ordenada y una columna que no la
//    explicaba. Ahora las columnas que mandan van juntas, con un rotulo
//    VERDE encima, y las informativas con un rotulo AMBAR.
//
// 3. Se conserva la columna Categoria, que sale de 'Base de Datos'.
//
// LO QUE NO CAMBIA
//    - El ORDEN es exactamente el mismo de antes: se copia de GRUPOS.
//    - Carambolas, Entradas y Promedio se calculan igual que antes,
//      dejando fuera los partidos de W.O. (columna L de RESULTADOS).
//    - La hoja NO se borra ni se vuelve a crear, para que no cambie su
//      identificador y la web la siga encontrando.
//
// ESTA HOJA NO GUARDA NINGUN DATO PROPIO: todo lo saca de GRUPOS,
// RESULTADOS, JUGADORES y 'Base de Datos'. Volver a correr el boton no
// puede danar ningun marcador.
// ============================================================

// Columnas de la hoja RankingGrupos
var RG_HOJA   = "RankingGrupos";
var RG_ANCHO  = 11;   // A..K

function GenerarRankingGrupos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var wsG   = ss.getSheetByName("GRUPOS");
  var wsRes = ss.getSheetByName("RESULTADOS");
  var wsJ   = ss.getSheetByName("JUGADORES");

  if (!wsG || !wsRes) {
    avisoRG_("No se encontraron las hojas necesarias (GRUPOS, RESULTADOS).");
    return;
  }

  // ----------------------------------------------------------
  // 1. LOCALIZAR LAS COLUMNAS DE GRUPOS
  //
  //    GRUPOS no tiene una sola tabla: son varios bloques, uno por
  //    grupo, y a la derecha de todos el bloque "Clasif / Ranking
  //    Jugadores" con el encabezado en la FILA 1.
  // ----------------------------------------------------------
  var maxColG = wsG.getMaxColumns();
  var maxRowG = wsG.getLastRow();
  if (maxRowG < 2) { avisoRG_("La hoja GRUPOS esta vacia. Corre primero GenerarGruposCompletos."); return; }

  var fila1 = wsG.getRange(1, 1, 1, maxColG).getValues()[0];

  var colRankJug = 0;   // columna con los nombres ya ordenados
  var colClasif  = 0;   // columna 1,2,3... que va a su izquierda
  for (var c1 = 0; c1 < fila1.length; c1++) {
    var t1 = String(fila1[c1]).trim();
    if (t1 === "Ranking Jugadores") colRankJug = c1 + 1;
    if (t1 === "Clasif")            colClasif  = c1 + 1;
  }
  if (colRankJug === 0) {
    avisoRG_("En GRUPOS no aparece la columna 'Ranking Jugadores'.\n\n" +
             "Corre primero GenerarGruposCompletos (menu Torneo Billar).");
    return;
  }

  // Fila de encabezados de un bloque de grupo: la primera cuya columna
  // B dice exactamente "Jugador".
  var colB = wsG.getRange(1, 2, Math.min(maxRowG, 60), 1).getValues();
  var filaEncG = 0;
  for (var rb = 0; rb < colB.length; rb++) {
    if (String(colB[rb][0]).trim() === "Jugador") { filaEncG = rb + 1; break; }
  }
  if (filaEncG === 0) { avisoRG_("En GRUPOS no se encontro la fila de encabezados."); return; }

  var encG = wsG.getRange(filaEncG, 1, 1, maxColG).getValues()[0];
  var colTotalCA = 0, colTotalPTS = 0, colPtsPart = 0, colVentPart = 0;
  var colOrdenGrupo = 0, colClasifGral = 0;
  for (var c2 = 0; c2 < encG.length; c2++) {
    var t2 = String(encG[c2]).trim();
    if (t2 === "TOTAL CA")          colTotalCA    = c2 + 1;
    if (t2 === "TOTAL PTS")         colTotalPTS   = c2 + 1;
    if (t2 === "PTS x PARTIDO")     colPtsPart    = c2 + 1;
    if (t2 === "VENTAJA x PARTIDO") colVentPart   = c2 + 1;
    if (t2 === "ORDEN GRUPO")       colOrdenGrupo = c2 + 1;
    if (t2 === "CLASIF GRAL")       colClasifGral = c2 + 1;
  }
  if (colTotalPTS === 0 || colOrdenGrupo === 0) {
    avisoRG_("En GRUPOS faltan columnas (TOTAL PTS / ORDEN GRUPO).\n" +
             "Vuelve a correr GenerarGruposCompletos.");
    return;
  }

  // Ultima columna del bloque de grupo: hasta ahi puede buscar VLOOKUP.
  // Nunca se mete en el bloque "Clasif / Ranking Jugadores", que va
  // justo despues de CLASIF GRAL.
  var colFinBusca = colClasifGral > 0 ? colClasifGral : colOrdenGrupo;
  var letFinBusca = colNumToLetter(colFinBusca);
  var letRankJug  = colNumToLetter(colRankJug);

  // ----------------------------------------------------------
  // 2. CUANTOS JUGADORES HAY
  //    La columna "Clasif" lleva 1,2,3... uno por clasificado.
  // ----------------------------------------------------------
  var total = 0;
  var colCuenta = colClasif > 0 ? colClasif : colRankJug;
  var filasACuentar = Math.max(1, wsG.getLastRow() - 1);
  var cuenta = wsG.getRange(2, colCuenta, filasACuentar, 1).getValues();
  for (var rc = 0; rc < cuenta.length; rc++) {
    var v = cuenta[rc][0];
    if (v === "" || v === null) break;
    total++;
  }
  if (total === 0) { avisoRG_("La columna 'Ranking Jugadores' de GRUPOS esta vacia."); return; }

  // ----------------------------------------------------------
  // 3. PREPARAR LA HOJA SIN BORRARLA
  //
  //    Borrar y volver a insertar la hoja le cambia el identificador
  //    (gid) y la web se queda ciega. Se limpia por dentro y ya.
  // ----------------------------------------------------------
  var creada = false;
  var wsR = ss.getSheetByName(RG_HOJA);
  if (!wsR) { wsR = ss.insertSheet(RG_HOJA); creada = true; }

  var filasNecesarias = total + 2;                 // 1 rotulos + 1 encabezados
  if (wsR.getMaxRows()    < filasNecesarias) wsR.insertRowsAfter(wsR.getMaxRows(), filasNecesarias - wsR.getMaxRows());
  if (wsR.getMaxColumns() < RG_ANCHO)        wsR.insertColumnsAfter(wsR.getMaxColumns(), RG_ANCHO - wsR.getMaxColumns());

  var todo = wsR.getRange(1, 1, wsR.getMaxRows(), wsR.getMaxColumns());
  todo.breakApart();
  todo.clear();
  todo.clearDataValidations();
  wsR.setConditionalFormatRules([]);
  wsR.setFrozenRows(0);

  // ----------------------------------------------------------
  // 4. CONSTRUIR LA HOJA EN MEMORIA (todo formulas)
  // ----------------------------------------------------------

  // --- Fila 1: los rotulos de color ---
  var rotulos = ["", "", "", "", "", "", "", "", "", "", ""];
  rotulos[0] = "QUIEN ES";                        // A..C
  rotulos[3] = "ESTO DECIDE EL ORDEN";            // D..H
  rotulos[8] = "SOLO INFORMATIVO · NO ORDENA";    // I..K

  // --- Fila 2: los encabezados ---
  // OJO: la web busca estos nombres tal cual. Si se cambian, hay que
  // cambiarlos tambien en app/lib/parsers.ts.
  var encabezados = [
    "Ranking", "Jugador", "Categoría",
    "Grupo", "Puesto", "Puntos", "Pts x Partido", "Ventaja x Partido",
    "Carambolas", "Entradas", "Promedio"
  ];

  var notas = [
    "Puesto en la clasificación general de la fase de grupos.\nEs el orden con el que se siembra la eliminación.",
    "Sale de la columna «Ranking Jugadores» de GRUPOS, ya ordenada.",
    "Categoría del jugador, según la hoja «Base de Datos».",
    "Grupo en el que jugó, según la hoja JUGADORES.",
    "1er criterio: puesto dentro de su grupo (ORDEN GRUPO).",
    "Puntos ganados en el grupo: 2 por partido ganado, 1 por empate.",
    "2º criterio: Puntos ÷ partidos que juega su grupo.\nIguala los grupos de 4 y los de 5 jugadores.",
    "3er criterio: DIF % ÷ partidos que juega su grupo.",
    "INFORMATIVO. Carambolas hechas en el grupo.\nNo cuenta las partidas de W.O.",
    "INFORMATIVO. Entradas jugadas en el grupo.\nNo cuenta las partidas de W.O.",
    "INFORMATIVO. Carambolas ÷ entradas.\nEs el promedio de billar, NO ordena esta tabla."
  ];

  // --- Filas 3 en adelante: un jugador por fila ---
  var datos = [];
  for (var k = 1; k <= total; k++) {
    var f  = k + 2;        // fila en RankingGrupos
    var fg = k + 1;        // fila en GRUPOS (encabezado en la 1)
    var nom = "GRUPOS!$" + letRankJug + "$" + fg;

    datos.push([
      // A - Ranking
      '=IF($B' + f + '="";"";' + k + ')',

      // B - Jugador: copiado de GRUPOS, ya ordenado
      '=IFERROR(IF(' + nom + '="";"";' + nom + ');"")',

      // C - Categoría: se busca el nombre en 'Base de Datos'. Igual que
      //     antes: primero el bloque que empieza en B, si no en F, si
      //     no en J; siempre se toma la columna siguiente.
      '=IF($B' + f + '="";"";' +
        'IFERROR(VLOOKUP($B' + f + ";'Base de Datos'!$B:$C;2;FALSE);" +
        'IFERROR(VLOOKUP($B' + f + ";'Base de Datos'!$F:$G;2;FALSE);" +
        'IFERROR(VLOOKUP($B' + f + ";'Base de Datos'!$J:$K;2;FALSE);\"\"))))",

      // D - Grupo
      wsJ ? '=IF($B' + f + '="";"";IFERROR(VLOOKUP($B' + f + ';JUGADORES!$B:$C;2;FALSE);""))' : "",

      // E - Puesto dentro del grupo
      buscaEnGrupos_(f, colOrdenGrupo, letFinBusca),
      // F - Puntos
      buscaEnGrupos_(f, colTotalPTS, letFinBusca),
      // G - Pts x Partido
      buscaEnGrupos_(f, colPtsPart, letFinBusca),
      // H - Ventaja x Partido
      buscaEnGrupos_(f, colVentPart, letFinBusca),

      // I - Carambolas (sin los W.O.)
      sumaResultados_(f, "D", "H"),
      // J - Entradas (sin los W.O.)
      sumaResultados_(f, "E", "I"),

      // K - Promedio. Si todas sus partidas fueron W.O. las entradas
      //     quedan en 0: se devuelve 0 y no #DIV/0!
      '=IF(OR($I' + f + '="";$J' + f + '="");"";IF($J' + f + '=0;0;$I' + f + '/$J' + f + '))'
    ]);
  }

  // ----------------------------------------------------------
  // 5. UNA SOLA ESCRITURA
  // ----------------------------------------------------------
  wsR.getRange(1, 1, 1, RG_ANCHO).setValues([rotulos]);
  wsR.getRange(2, 1, 1, RG_ANCHO).setValues([encabezados]);
  wsR.getRange(3, 1, total, RG_ANCHO).setValues(datos);
  SpreadsheetApp.flush();

  FormatoRankingGrupos_(wsR, total);
  NotasRankingGrupos_(wsR, notas);

  ss.setActiveSheet(wsR);

  avisoRG_(
    "RankingGrupos generado.\n\n" +
    total + " jugadores.\n\n" +
    "La hoja quedo VIVA: cada celda es una formula, asi que se\n" +
    "actualiza sola a medida que se anotan las carambolas en\n" +
    "RESULTADOS. No hay que volver a correr este boton.\n\n" +
    "Verde = columnas que deciden el orden.\n" +
    "Ambar = columnas informativas, no ordenan nada." +
    (creada ? "\n\nATENCION: la hoja no existia y se acaba de crear.\n" +
              "Abre la web y comprueba que el ranking aparece." : "")
  );
}

/**
 * VLOOKUP del jugador de la fila f dentro del bloque de grupo de GRUPOS.
 * col es la columna absoluta de GRUPOS; la busqueda arranca en B.
 */
function buscaEnGrupos_(f, col, letFinBusca) {
  if (!col) return "";
  return '=IF($B' + f + '="";"";IFERROR(VLOOKUP($B' + f +
         ';GRUPOS!$B:$' + letFinBusca + ';' + (col - 1) + ';FALSE);""))';
}

/**
 * Suma una columna de RESULTADOS para el jugador de la fila f, jugando
 * de local (columna C) o de visitante (columna G).
 *
 * Los partidos de W.O. (columna L = "SI") se restan: la carambola de
 * oficio del W.O. no puede ensuciar el promedio de nadie. Se suma todo
 * y se resta lo marcado, en vez de usar "<>SI", porque el trato que le
 * da Sheets a las celdas vacias con ese criterio no es de fiar.
 */
function sumaResultados_(f, colLocal, colVisita) {
  var R = "RESULTADOS!";
  var cl = "$" + colLocal  + ":$" + colLocal;
  var cv = "$" + colVisita + ":$" + colVisita;
  return '=IF($B' + f + '="";"";' +
    'SUMIF(' + R + '$C:$C;$B' + f + ';' + R + cl + ')' +
    '+SUMIF(' + R + '$G:$G;$B' + f + ';' + R + cv + ')' +
    '-SUMIFS(' + R + cl + ';' + R + '$C:$C;$B' + f + ';' + R + '$L:$L;"SI")' +
    '-SUMIFS(' + R + cv + ';' + R + '$G:$G;$B' + f + ';' + R + '$L:$L;"SI"))';
}

/**
 * Formato de la hoja. Va aparte para poder retocarlo sin tocar las
 * formulas.
 */
function FormatoRankingGrupos_(wsR, total) {
  var ultima = total + 2;

  // --- Fila 1: los tres rotulos ---
  wsR.getRange("A1:C1").merge()
    .setBackground(rgbToHex(217, 217, 217)).setFontColor(rgbToHex(64, 64, 64));
  wsR.getRange("D1:H1").merge()
    .setBackground(rgbToHex(56, 118, 29)).setFontColor("#FFFFFF");
  wsR.getRange("I1:K1").merge()
    .setBackground(rgbToHex(191, 144, 0)).setFontColor("#FFFFFF");

  wsR.getRange(1, 1, 1, RG_ANCHO)
    .setFontWeight("bold").setFontSize(10)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  wsR.setRowHeight(1, 24);

  // --- Fila 2: encabezados ---
  wsR.getRange(2, 1, 1, RG_ANCHO)
    .setFontWeight("bold").setFontColor("#FFFFFF")
    .setBackground(rgbToHex(0, 32, 96))
    .setHorizontalAlignment("center").setVerticalAlignment("middle")
    .setWrap(true);
  wsR.setRowHeight(2, 34);

  if (total > 0) {
    // Alineacion
    wsR.getRange(3, 1, total, RG_ANCHO)
      .setHorizontalAlignment("center").setVerticalAlignment("middle");
    wsR.getRange(3, 2, total, 2).setHorizontalAlignment("left");
    wsR.getRange(3, 2, total, 1).setFontWeight("bold");

    // Formatos de numero
    wsR.getRange(3,  1, total, 1).setNumberFormat("0");        // Ranking
    wsR.getRange(3,  4, total, 2).setNumberFormat("0");        // Grupo, Puesto
    wsR.getRange(3,  6, total, 1).setNumberFormat("0");        // Puntos
    wsR.getRange(3,  7, total, 2).setNumberFormat("0.000");    // Pts x P, Ventaja x P
    wsR.getRange(3,  9, total, 2).setNumberFormat("0");        // Carambolas, Entradas
    wsR.getRange(3, 11, total, 1).setNumberFormat("0.000");    // Promedio

    // Las que deciden, con fondo claro del color de su rotulo
    wsR.getRange(3, 6, total, 1)
      .setBackground(rgbToHex(255, 255, 0)).setFontWeight("bold");   // Puntos
    wsR.getRange(3, 5, total, 1)
      .setBackground(rgbToHex(226, 239, 218)).setFontWeight("bold"); // Puesto
    wsR.getRange(3, 7, total, 2)
      .setBackground(rgbToHex(226, 239, 218));                       // por partido

    // Las informativas, en gris y cursiva: se leen como lo que son
    wsR.getRange(3, 9, total, 3)
      .setBackground(rgbToHex(252, 245, 226))
      .setFontColor(rgbToHex(89, 89, 89))
      .setFontStyle("italic");

    // Los dos primeros de cada grupo son los que pasan a la
    // eliminacion. Se pintan solos, en cuanto la hoja los calcula.
    var regla = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=($E3<>"")*($E3<=2)')
      .setBackground(rgbToHex(198, 239, 206))
      .setRanges([wsR.getRange(3, 1, total, 3)])
      .build();
    wsR.setConditionalFormatRules([regla]);
  }

  // Anchos
  var anchos = [80, 235, 170, 70, 80, 80, 115, 140, 105, 90, 105];
  for (var a = 0; a < anchos.length; a++) wsR.setColumnWidth(a + 1, anchos[a]);

  // Recuadro
  wsR.getRange(1, 1, ultima, RG_ANCHO)
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);

  wsR.setFrozenRows(2);
}

/**
 * Notas de los encabezados. Se ponen aparte porque setNote solo admite
 * una celda a la vez y ensucia la funcion principal.
 */
function NotasRankingGrupos_(wsR, notas) {
  for (var i = 0; i < notas.length; i++) {
    wsR.getRange(2, i + 1).setNote(notas[i]);
  }
}

/**
 * Aviso por pantalla. Si no hay pantalla (por ejemplo si algun dia esto
 * se llama desde un trigger) no se cae: escribe en el registro.
 */
function avisoRG_(texto) {
  try {
    SpreadsheetApp.getUi().alert(texto);
  } catch (err) {
    console.log(texto);
  }
}
