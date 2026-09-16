// ============================================================
// M6 - GRUPOS COMPLETOS
// ============================================================
//
// QUE CAMBIA RESPECTO A LA VERSION ANTERIOR
//
// Los grupos no tienen todos el mismo tamano (22 jugadores no se
// reparten en partes iguales), asi que unos juegan 4 partidos y otros
// 3. Comparar sumas de 4 partidos contra sumas de 3 favorece a los
// primeros: un jugador de grupo de 4 NO PUEDE llegar a 8 puntos por
// mucho que gane todo, y su DIF % suma un termino menos.
//
// Por eso CLASIF GRAL —la unica columna que compara entre grupos—
// pasa a mirar el rendimiento POR PARTIDO en vez de los totales.
// Se anaden dos columnas nuevas que lo dejan a la vista:
//
//     PTS x PARTIDO       = TOTAL PTS  / partidos del grupo
//     VENTAJA x PARTIDO   = DIF %      / partidos del grupo
//
// ORDEN GRUPO no se toca: dentro de un grupo todos juegan lo mismo,
// asi que normalizar ahi no cambiaria absolutamente nada.
//
// Lo demas queda igual.
// ============================================================

/**
 * Normaliza un nombre para comparar entre hojas:
 * quita espacios sobrantes (incluidos los del final) y unifica mayusculas.
 */
function normNombreGrupo(v) {
  if (v === null || v === undefined) return "";
  return String(v).replace(/ /g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

// ------------------------------------------------------------
// COMO SE REPARTEN LOS PUNTOS
//   "AUTO"       Si en RESULTADOS hay objetivos de carambolas DISTINTOS
//                (Primera contra Segunda) -> gana el MAYOR PROMEDIO
//                (carambolas hechas / carambolas que debia hacer).
//                Si todos tienen el MISMO objetivo (solo Primera o solo
//                Segunda) -> gana el que hizo MAS CARAMBOLAS.
//   "PROMEDIO"   Fuerza siempre el promedio.
//   "CARAMBOLAS" Fuerza siempre las carambolas brutas.
// ------------------------------------------------------------
var MODO_PUNTOS = "AUTO";

// ------------------------------------------------------------
// COMO SE ORDENA LA CLASIFICACION GENERAL
//   true   Compara PTS x PARTIDO y VENTAJA x PARTIDO.
//          Es lo correcto cuando los grupos NO son todos del mismo
//          tamano, porque quita la ventaja de jugar un partido mas.
//   false  Compara TOTAL PTS y DIF % como antes.
//
// Con todos los grupos iguales las dos opciones dan exactamente el
// mismo orden: dividir todo por el mismo numero no cambia nada.
// ------------------------------------------------------------
var CLASIF_POR_PARTIDO = true;

function GenerarGruposCompletos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  var wsG = getOrCreateSheet(ss, "GRUPOS");
  var wsJ = ss.getSheetByName("JUGADORES");
  var wsR = ss.getSheetByName("RESULTADOS");

  if (!wsJ || !wsR) {
    ui.alert("No se encontraron las hojas necesarias (JUGADORES, RESULTADOS).");
    return;
  }

  desprotegerHoja(wsG);
  wsG.clear();

  // ----------------------------------------------------------
  // 1. LEER TODO DE UNA SOLA VEZ
  //    RESULTADOS se lee hasta la columna N para traer los Objetivos.
  // ----------------------------------------------------------
  var ultFilaJ = getLastRow(wsJ, 2);
  var ultFilaR = getLastRow(wsR, 3);

  if (ultFilaJ < 2) { ui.alert("No hay jugadores en la hoja JUGADORES."); return; }

  var jugadoresData = wsJ.getRange(2, 1, ultFilaJ - 1, 3).getValues();
  var resultadosData = (ultFilaR >= 2)
    ? wsR.getRange(2, 1, ultFilaR - 1, 14).getValues()
    : [];

  // ----------------------------------------------------------
  // 2. ELEGIR EL MODO DE PUNTUACION
  //    M (indice 12) = Objetivo A   |   N (indice 13) = Objetivo B
  // ----------------------------------------------------------
  var objetivos = {};
  for (var ro = 0; ro < resultadosData.length; ro++) {
    var oA = resultadosData[ro][12];
    var oB = resultadosData[ro][13];
    if (oA !== "" && oA !== null && oA !== undefined) objetivos[oA] = true;
    if (oB !== "" && oB !== null && oB !== undefined) objetivos[oB] = true;
  }
  var listaObjetivos = Object.keys(objetivos);

  var usarPromedio;
  if (MODO_PUNTOS === "PROMEDIO")        usarPromedio = true;
  else if (MODO_PUNTOS === "CARAMBOLAS") usarPromedio = false;
  else                                   usarPromedio = (listaObjetivos.length > 1);

  // ----------------------------------------------------------
  // 3. INDICE DE PARTIDOS POR JUGADOR (una sola pasada)
  //    clave normalizada -> [{fila, local}]
  // ----------------------------------------------------------
  var indicePartidos = {};
  for (var r = 0; r < resultadosData.length; r++) {
    var filaRes = r + 2;
    var nA = normNombreGrupo(resultadosData[r][2]);
    var nB = normNombreGrupo(resultadosData[r][6]);
    if (nA !== "") {
      if (!indicePartidos[nA]) indicePartidos[nA] = [];
      indicePartidos[nA].push({ fila: filaRes, local: true });
    }
    if (nB !== "") {
      if (!indicePartidos[nB]) indicePartidos[nB] = [];
      indicePartidos[nB].push({ fila: filaRes, local: false });
    }
  }

  // ----------------------------------------------------------
  // 4. AGRUPAR JUGADORES (dinamico: cualquier numero de grupos
  //    y cualquier tamano, incluso desiguales)
  // ----------------------------------------------------------
  var grupos = {};
  var numerosGrupo = [];
  for (var p = 0; p < jugadoresData.length; p++) {
    var nombre = jugadoresData[p][1];
    var g = Number(jugadoresData[p][2]);
    if (nombre === "" || nombre === null || !g || g <= 0) continue;
    if (!grupos[g]) { grupos[g] = []; numerosGrupo.push(g); }
    grupos[g].push(nombre);
  }
  numerosGrupo.sort(function (a, b) { return a - b; });

  if (numerosGrupo.length === 0) {
    ui.alert("Ningun jugador tiene grupo asignado en la columna C de JUGADORES.");
    return;
  }

  // maxPartidos = (grupo mas grande) - 1
  var maxJugadoresGrupo = 0;
  var minJugadoresGrupo = 999999;
  for (var gi = 0; gi < numerosGrupo.length; gi++) {
    var t = grupos[numerosGrupo[gi]].length;
    if (t > maxJugadoresGrupo) maxJugadoresGrupo = t;
    if (t < minJugadoresGrupo) minJugadoresGrupo = t;
  }
  var maxPartidos = maxJugadoresGrupo - 1;
  if (maxPartidos < 1) {
    ui.alert("Los grupos deben tener al menos 2 jugadores.");
    return;
  }
  var gruposDesiguales = (maxJugadoresGrupo !== minJugadoresGrupo);

  // ----------------------------------------------------------
  // 5. MAPA DE COLUMNAS (dinamico segun maxPartidos)
  //
  //    Las dos columnas nuevas van justo detras de TOTAL PTS, que es
  //    de donde salen. ORDEN GRUPO y CLASIF GRAL siguen siendo las
  //    ultimas, para que el bloque Clasif / Ranking Jugadores se
  //    coloque despues igual que siempre.
  // ----------------------------------------------------------
  var colCAIni      = 3;
  var colTotalCA    = colCAIni + maxPartidos;
  var colCRIni      = colTotalCA + 1;
  var colTotalCR    = colCRIni + maxPartidos;
  var colPromDif    = colTotalCR + 1;
  var colPTSIni     = colPromDif + 1;
  var colTotalPTS   = colPTSIni + maxPartidos;
  var colPtsPart    = colTotalPTS + 1;
  var colVentPart   = colPtsPart + 1;
  var colOrdenGrupo = colVentPart + 1;
  var colClasifGral = colOrdenGrupo + 1;
  var ancho         = colClasifGral;

  var TITULO_DIF = usarPromedio ? "DIF %" : "PROM - DIF";

  // ----------------------------------------------------------
  // 6. CONSTRUIR TODA LA HOJA EN MEMORIA
  // ----------------------------------------------------------
  function filaVacia() {
    var a = [];
    for (var k = 0; k < ancho; k++) a.push("");
    return a;
  }

  var salida = [];
  var filasTitulo = [];
  var filasJugador = [];
  var faltantes = [];

  var filaSheet = 1;

  for (var gi2 = 0; gi2 < numerosGrupo.length; gi2++) {
    var numGrupo = numerosGrupo[gi2];
    var miembros = grupos[numGrupo];
    var partidosEsperados = miembros.length - 1;

    // Divisor de este grupo. Nunca 0, para no provocar #DIV/0!
    var divisor = partidosEsperados > 0 ? partidosEsperados : 1;

    // --- Titulo ---
    var fTit = filaVacia();
    fTit[1] = "GRUPO " + numGrupo;
    salida.push(fTit);
    filasTitulo.push(filaSheet);
    filaSheet++;

    // --- Encabezados ---
    var fEnc = filaVacia();
    fEnc[0] = "No";
    fEnc[1] = "Jugador";
    var c = colCAIni;
    for (var i = 1; i <= maxPartidos; i++) { fEnc[c - 1] = "CA P" + i; c++; }
    fEnc[c - 1] = "TOTAL CA"; c++;
    for (var i2 = 1; i2 <= maxPartidos; i2++) { fEnc[c - 1] = "CR P" + i2; c++; }
    fEnc[c - 1] = "TOTAL CR"; c++;
    fEnc[c - 1] = TITULO_DIF; c++;
    for (var i3 = 1; i3 <= maxPartidos; i3++) { fEnc[c - 1] = "PTS P" + i3; c++; }
    fEnc[c - 1] = "TOTAL PTS";
    fEnc[c]     = "PTS x PARTIDO";
    fEnc[c + 1] = "VENTAJA x PARTIDO";
    fEnc[c + 2] = "ORDEN GRUPO";
    fEnc[c + 3] = "CLASIF GRAL";
    salida.push(fEnc);
    filaSheet++;

    var filaIniDatos = filaSheet;

    // --- Jugadores ---
    for (var pi = 0; pi < miembros.length; pi++) {
      var jugador = miembros[pi];
      var partidos = indicePartidos[normNombreGrupo(jugador)] || [];

      if (partidos.length !== partidosEsperados) {
        faltantes.push("• " + jugador + "  (Grupo " + numGrupo + "): " +
                       partidos.length + " partidos en RESULTADOS, se esperaban " + partidosEsperados);
      }

      var fj = filaVacia();
      fj[0] = pi + 1;
      fj[1] = jugador;

      var nPartidos = Math.min(partidos.length, maxPartidos);
      var terminosMios = [];
      var terminosRival = [];

      for (var q = 0; q < nPartidos; q++) {
        var pr = partidos[q];
        var n = pr.fila;

        var miCar = pr.local ? ("RESULTADOS!D" + n) : ("RESULTADOS!H" + n);
        var miObj = pr.local ? ("RESULTADOS!M" + n) : ("RESULTADOS!N" + n);
        var rvCar = pr.local ? ("RESULTADOS!H" + n) : ("RESULTADOS!D" + n);
        var rvObj = pr.local ? ("RESULTADOS!N" + n) : ("RESULTADOS!M" + n);

        // CA / CR: SIEMPRE carambolas reales. Vacias si no se ha jugado.
        fj[colCAIni + q - 1] = '=IF(' + miCar + '="";"";' + miCar + ')';
        fj[colCRIni + q - 1] = '=IF(' + rvCar + '="";"";' + rvCar + ')';

        if (usarPromedio) {
          // Gana el MAYOR PROMEDIO (carambolas / objetivo de su categoria)
          fj[colPTSIni + q - 1] =
            '=IF(OR(' + miCar + '="";' + rvCar + '="";' + miObj + '="";' + rvObj + '="";' +
            miObj + '=0;' + rvObj + '=0);"";' +
            'IF(' + miCar + '/' + miObj + '>' + rvCar + '/' + rvObj + ';2;' +
            'IF(' + miCar + '/' + miObj + '=' + rvCar + '/' + rvObj + ';1;0)))';

          terminosMios.push('IFERROR(' + miCar + '/' + miObj + ';0)');
          terminosRival.push('IFERROR(' + rvCar + '/' + rvObj + ';0)');

        } else {
          // Gana el que hizo MAS CARAMBOLAS (todos con el mismo objetivo)
          var caCell = getCellA1(filaSheet, colCAIni + q);
          var crCell = getCellA1(filaSheet, colCRIni + q);
          fj[colPTSIni + q - 1] =
            '=IF(OR(' + caCell + '="";' + crCell + '="");"";' +
            'IF(' + caCell + '>' + crCell + ';2;IF(' + caCell + '=' + crCell + ';1;0)))';
        }
      }

      // TOTAL CA / TOTAL CR — carambolas reales en los dos modos
      fj[colTotalCA - 1] = "=SUM(" + getCellA1(filaSheet, colCAIni) + ":" + getCellA1(filaSheet, colTotalCA - 1) + ")";
      fj[colTotalCR - 1] = "=SUM(" + getCellA1(filaSheet, colCRIni) + ":" + getCellA1(filaSheet, colTotalCR - 1) + ")";

      // Columna de diferencia: porcentajes o carambolas segun el modo
      if (usarPromedio) {
        fj[colPromDif - 1] = (terminosMios.length === 0)
          ? 0
          : '=(' + terminosMios.join('+') + ')-(' + terminosRival.join('+') + ')';
      } else {
        fj[colPromDif - 1] = "=" + getCellA1(filaSheet, colTotalCA) + "-" + getCellA1(filaSheet, colTotalCR);
      }

      // TOTAL PTS
      fj[colTotalPTS - 1] = "=SUM(" + getCellA1(filaSheet, colPTSIni) + ":" + getCellA1(filaSheet, colTotalPTS - 1) + ")";

      // Las dos columnas nuevas: lo mismo, repartido entre los partidos
      // que juega este grupo. El divisor es una constante distinta en
      // cada grupo, y es justo eso lo que iguala la comparacion.
      fj[colPtsPart - 1]  = "=" + getCellA1(filaSheet, colTotalPTS) + "/" + divisor;
      fj[colVentPart - 1] = "=" + getCellA1(filaSheet, colPromDif)  + "/" + divisor;

      salida.push(fj);
      filasJugador.push(filaSheet);
      filaSheet++;
    }

    var filaFinDatos = filaSheet - 1;

    // --- ORDEN GRUPO (solo dentro del grupo) ---
    // Aqui se siguen usando los TOTALES a proposito: dentro de un grupo
    // todos juegan el mismo numero de partidos, asi que dividir por el
    // mismo numero no cambiaria ni un puesto.
    var rgPTS = getCellA1(filaIniDatos, colTotalPTS) + ":" + getCellA1(filaFinDatos, colTotalPTS);
    var rgDIF = getCellA1(filaIniDatos, colPromDif)  + ":" + getCellA1(filaFinDatos, colPromDif);
    var rgCA  = getCellA1(filaIniDatos, colTotalCA)  + ":" + getCellA1(filaFinDatos, colTotalCA);

    for (var fr = filaIniDatos; fr <= filaFinDatos; fr++) {
      var myPTS = getCellA1(fr, colTotalPTS);
      var myDIF = getCellA1(fr, colPromDif);
      var myCA  = getCellA1(fr, colTotalCA);
      salida[fr - 1][colOrdenGrupo - 1] =
        '=IF(' + myPTS + '="";"";1+SUMPRODUCT((' + rgPTS + '>' + myPTS + ')' +
        '+((' + rgPTS + '=' + myPTS + ')*(' + rgDIF + '>' + myDIF + '))' +
        '+((' + rgPTS + '=' + myPTS + ')*(' + rgDIF + '=' + myDIF + ')*(' + rgCA + '>' + myCA + '))))';
    }

    // --- Fila separadora entre grupos ---
    salida.push(filaVacia());
    filaSheet++;
  }

  // ----------------------------------------------------------
  // 7. CLASIF GRAL (rango global, se conoce al terminar)
  //
  //    Orden: 1º puesto en el grupo, 2º puntos, 3º ventaja,
  //    4º carambolas a favor, 5º quien esta antes en la hoja.
  //
  //    Los criterios 2 y 3 son POR PARTIDO cuando CLASIF_POR_PARTIDO
  //    esta en true: son los unicos que comparan jugadores de grupos
  //    distintos, que pueden haber jugado distinto numero de partidos.
  // ----------------------------------------------------------
  var firstDataRow = filasJugador[0];
  var lastDataRow  = filasJugador[filasJugador.length - 1];

  var colPtsCmp = CLASIF_POR_PARTIDO ? colPtsPart  : colTotalPTS;
  var colDifCmp = CLASIF_POR_PARTIDO ? colVentPart : colPromDif;

  var letOG  = colNumToLetter(colOrdenGrupo);
  var letTP  = colNumToLetter(colPtsCmp);
  var letPD  = colNumToLetter(colDifCmp);
  var letTCA = colNumToLetter(colTotalCA);

  var ogRange  = "$" + letOG  + "$" + firstDataRow + ":$" + letOG  + "$" + lastDataRow;
  var tpRange  = "$" + letTP  + "$" + firstDataRow + ":$" + letTP  + "$" + lastDataRow;
  var pdRange  = "$" + letPD  + "$" + firstDataRow + ":$" + letPD  + "$" + lastDataRow;
  var tcaRange = "$" + letTCA + "$" + firstDataRow + ":$" + letTCA + "$" + lastDataRow;
  var bRange   = "$B$" + firstDataRow + ":$B$" + lastDataRow;

  for (var fj2 = 0; fj2 < filasJugador.length; fj2++) {
    var fr2 = filasJugador[fj2];
    var myOG  = getCellA1(fr2, colOrdenGrupo);
    var myTP  = getCellA1(fr2, colPtsCmp);
    var myPD  = getCellA1(fr2, colDifCmp);
    var myTCA = getCellA1(fr2, colTotalCA);

    salida[fr2 - 1][colClasifGral - 1] =
      '=1+SUMPRODUCT(' +
      '--(' + bRange + '<>"")' + '*' +
      '--(LEFT(' + bRange + ';5)<>"GRUPO")' + '*' +
      '((' + ogRange + '<' + myOG + ')+(' +
      ogRange + '=' + myOG + ')*(' + tpRange + '>' + myTP + ')+(' +
      ogRange + '=' + myOG + ')*(' + tpRange + '=' + myTP + ')*(' + pdRange + '>' + myPD + ')+(' +
      ogRange + '=' + myOG + ')*(' + tpRange + '=' + myTP + ')*(' + pdRange + '=' + myPD + ')*(' + tcaRange + '>' + myTCA + ')+(' +
      ogRange + '=' + myOG + ')*(' + tpRange + '=' + myTP + ')*(' + pdRange + '=' + myPD + ')*(' + tcaRange + '=' + myTCA + ')*(ROW(' + tcaRange + ')<ROW())' +
      '))';
  }

  // ----------------------------------------------------------
  // 8. UNA SOLA ESCRITURA
  // ----------------------------------------------------------
  wsG.getRange(1, 1, salida.length, ancho).setValues(salida);
  SpreadsheetApp.flush();

  // Merge de los titulos de grupo
  for (var mt = 0; mt < filasTitulo.length; mt++) {
    wsG.getRange(filasTitulo[mt], 2, 1, ancho - 1)
      .merge()
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
  }

  // ----------------------------------------------------------
  // 9. RANKING Y FORMATO
  // ----------------------------------------------------------
  CrearRankingJugadores();
  FormatoGrupos();

  ss.setActiveSheet(wsG);

  // ----------------------------------------------------------
  // 10. INFORME
  // ----------------------------------------------------------
  var infoModo = usarPromedio
    ? "Puntos por PROMEDIO (carambolas / objetivo).\nObjetivos en juego: " + listaObjetivos.join(", ")
    : "Puntos por CARAMBOLAS." + (listaObjetivos.length === 1
        ? "\nTodos juegan a " + listaObjetivos[0] + " carambolas."
        : "\nNo se encontraron objetivos en RESULTADOS (columnas M y N).");

  var infoClasif;
  if (!CLASIF_POR_PARTIDO) {
    infoClasif = "CLASIF GRAL: por TOTALES (puntos y diferencia sin dividir).";
  } else if (gruposDesiguales) {
    infoClasif = "CLASIF GRAL: por PARTIDO JUGADO.\n" +
                 "Los grupos no son iguales (" + minJugadoresGrupo + " y " + maxJugadoresGrupo +
                 " jugadores), así que se compara\nPTS x PARTIDO y VENTAJA x PARTIDO. " +
                 "Sin eso, quien juega un\npartido más sale favorecido solo por jugarlo.";
  } else {
    infoClasif = "CLASIF GRAL: por PARTIDO JUGADO.\n" +
                 "Todos los grupos son iguales, así que el orden es el mismo\n" +
                 "que saldría con los totales.";
  }

  if (faltantes.length > 0) {
    ui.alert(
      "GRUPOS generado, pero hay jugadores cuyos partidos NO cuadran:\n\n" +
      faltantes.join("\n") +
      "\n\nRevisa que el nombre este escrito igual en JUGADORES y en RESULTADOS."
    );
  } else {
    ui.alert(
      "Proceso COMPLETO y CORRECTO.\n\n" +
      numerosGrupo.length + " grupos · " + filasJugador.length + " jugadores · " +
      maxPartidos + " partidos por jugador (maximo).\n\n" + infoModo + "\n\n" + infoClasif
    );
  }
}

function CrearRankingJugadores() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var ws = ss.getSheetByName("GRUPOS");
  if (!ws) return;

  var colJugador = 2;
  var ultFila = getLastRow(ws, colJugador);
  if (ultFila < 2) return;

  var maxCols = ws.getMaxColumns();

  // Lectura en bloque de toda la zona de datos
  var datos = ws.getRange(1, 1, ultFila, maxCols).getValues();

  // Fila de encabezados = primera fila cuya columna B dice "Jugador"
  var filaEncabezado = 0;
  for (var r = 0; r < datos.length; r++) {
    if ((datos[r][colJugador - 1] + "").trim() === "Jugador") { filaEncabezado = r + 1; break; }
  }
  if (filaEncabezado === 0) { ui.alert("No se encontro la fila de encabezados."); return; }

  // Columna CLASIF GRAL
  var colClasifGral = 0;
  for (var c = 0; c < maxCols; c++) {
    if ((datos[filaEncabezado - 1][c] + "").trim() === "CLASIF GRAL") { colClasifGral = c + 1; break; }
  }
  if (colClasifGral === 0) { ui.alert("No se encontro la columna 'CLASIF GRAL'."); return; }

  // Contar clasificados reales
  var total = 0;
  for (var r2 = filaEncabezado; r2 < datos.length; r2++) {
    var v = datos[r2][colClasifGral - 1];
    if (v !== "" && v !== null && !isNaN(v)) total++;
  }
  if (total === 0) return;

  // Limpiar ranking previo
  ws.getRange(1, colClasifGral + 1, ws.getMaxRows(), 2).clearContent();

  // Construir en memoria y escribir de una vez
  var colClasifLetter = colNumToLetter(colClasifGral);
  var clasifRange = "$" + colClasifLetter + "$" + (filaEncabezado + 1) + ":$" + colClasifLetter + "$" + ultFila;
  var bloque = [["Clasif", "Ranking Jugadores"]];
  for (var k = 1; k <= total; k++) {
    bloque.push([
      k,
      '=INDEX($B$' + (filaEncabezado + 1) + ':$B$' + ultFila + ';MATCH(SMALL(' + clasifRange + ';' + k + ');' + clasifRange + ';0))'
    ]);
  }
  ws.getRange(1, colClasifGral + 1, bloque.length, 2).setValues(bloque);
  ws.getRange(1, colClasifGral + 1, 1, 2).setFontWeight("bold");
}

function FormatoGrupos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName("GRUPOS");
  if (!ws) return;

  var ultFila = getLastRow(ws, 2);
  if (ultFila < 2) return;

  var maxCols = ws.getMaxColumns();
  var datos = ws.getRange(1, 1, ultFila, maxCols).getValues();

  var colInicioRanking = 0;
  for (var c = 0; c < maxCols; c++) {
    if ((datos[0][c] + "").trim() === "Clasif") { colInicioRanking = c + 1; break; }
  }

  var lastColFormat;
  if (colInicioRanking > 1) { lastColFormat = colInicioRanking - 1; }
  else { lastColFormat = getLastCol(ws, 2); }

  // Limpiar TODOS los bordes de la zona. Cada grupo se dibuja despues
  // como un recuadro cerrado, en vez de dibujar todo y luego borrar
  // (borrar la fila separadora se llevaba por delante el borde
  //  inferior del grupo anterior y el superior del grupo siguiente).
  ws.getRange(1, 1, ultFila, lastColFormat)
    .setBorder(false, false, false, false, false, false)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  ws.setColumnWidth(2, 225);
  ws.getRange(2, 2, ultFila - 1, 1).setHorizontalAlignment("left").setFontWeight("bold");

  for (var f = 1; f <= ultFila; f++) {
    var cellVal = (datos[f - 1][1] + "");
    if (cellVal.substring(0, 5) !== "GRUPO") continue;

    var filaEnc = f + 1;
    if (filaEnc > ultFila) break;

    var colUltimaGrupo = 0;
    for (var cc0 = maxCols - 1; cc0 >= 0; cc0--) {
      if ((datos[filaEnc - 1][cc0] + "").trim() !== "") { colUltimaGrupo = cc0 + 1; break; }
    }
    if (colInicioRanking > 1 && colUltimaGrupo >= colInicioRanking) colUltimaGrupo = colInicioRanking - 1;
    if (colUltimaGrupo === 0) continue;

    var filaIniDatos = filaEnc + 1;
    var filaFinDatos = filaIniDatos;
    while (filaFinDatos <= ultFila) {
      var v = datos[filaFinDatos - 1][1];
      if (v === "" || v === null || (v + "").substring(0, 5) === "GRUPO") break;
      filaFinDatos++;
    }
    filaFinDatos = filaFinDatos - 1;
    if (filaFinDatos < filaIniDatos) continue;

    // RECUADRO COMPLETO DEL GRUPO: del titulo hasta el ultimo jugador,
    // con las cuatro lineas exteriores y todas las interiores.
    ws.getRange(f, 1, filaFinDatos - f + 1, colUltimaGrupo)
      .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);

    var colTotalCA = 0, colTotalCR = 0, colPromDif = 0, colTotalPTS = 0;
    var colPtsPart = 0, colVentPart = 0, colOrdenGrupo = 0, colClasifGral = 0;
    var esDifPorcentaje = false;
    for (var cc = 0; cc < colUltimaGrupo; cc++) {
      var hv = (datos[filaEnc - 1][cc] + "").trim();
      if (hv === "TOTAL CA")    colTotalCA    = cc + 1;
      if (hv === "TOTAL CR")    colTotalCR    = cc + 1;
      if (hv === "DIF %" || hv === "PROM - DIF") {
        colPromDif = cc + 1;
        esDifPorcentaje = (hv === "DIF %");
      }
      if (hv === "TOTAL PTS")         colTotalPTS   = cc + 1;
      if (hv === "PTS x PARTIDO")     colPtsPart    = cc + 1;
      if (hv === "VENTAJA x PARTIDO") colVentPart   = cc + 1;
      if (hv === "ORDEN GRUPO")       colOrdenGrupo = cc + 1;
      if (hv === "CLASIF GRAL")       colClasifGral = cc + 1;
    }

    ws.getRange(f, 2, 1, colUltimaGrupo - 1)
      .setFontWeight("bold").setFontSize(12).setHorizontalAlignment("center");
    ws.getRange(filaEnc, 1, 1, colUltimaGrupo).setFontWeight("bold");
    ws.getRange(filaEnc, 2).setHorizontalAlignment("center");

    var nDatos = filaFinDatos - filaIniDatos + 1;
    var nConEnc = filaFinDatos - filaEnc + 1;

    if (colTotalCA > 0)  ws.getRange(filaEnc, colTotalCA, nConEnc, 1).setBackground(rgbToHex(184,204,228)).setFontWeight("bold");
    if (colTotalCR > 0)  ws.getRange(filaEnc, colTotalCR, nConEnc, 1).setBackground(rgbToHex(184,204,228)).setFontWeight("bold");
    if (colPromDif > 0) {
      ws.getRange(filaIniDatos, colPromDif, nDatos, 1).setFontColor("#FF0000").setFontWeight("bold");
      if (esDifPorcentaje) {
        ws.getRange(filaIniDatos, colPromDif, nDatos, 1).setNumberFormat("0.000");
        ws.setColumnWidth(colPromDif, 90);
      }
    }
    if (colTotalPTS > 0) { ws.getRange(filaIniDatos, colTotalPTS, nDatos, 1).setBackground(rgbToHex(255,255,0)).setFontWeight("bold"); ws.setColumnWidth(colTotalPTS, 110); }

    // Las dos columnas por partido: en gris, para que se lean como lo
    // que son, una cuenta derivada y no un dato que alguien digita.
    if (colPtsPart > 0) {
      ws.getRange(filaIniDatos, colPtsPart, nDatos, 1)
        .setBackground(rgbToHex(242,242,242)).setFontColor(rgbToHex(89,89,89))
        .setFontStyle("italic").setNumberFormat("0.000");
      ws.setColumnWidth(colPtsPart, 120);
    }
    if (colVentPart > 0) {
      ws.getRange(filaIniDatos, colVentPart, nDatos, 1)
        .setBackground(rgbToHex(242,242,242)).setFontColor(rgbToHex(89,89,89))
        .setFontStyle("italic").setNumberFormat("0.000");
      ws.setColumnWidth(colVentPart, 140);
    }

    if (colOrdenGrupo > 0) { ws.getRange(filaIniDatos, colOrdenGrupo, nDatos, 1).setBackground(rgbToHex(146,208,80)).setFontWeight("bold"); ws.setColumnWidth(colOrdenGrupo, 135); }
    if (colClasifGral > 0) { ws.getRange(filaIniDatos, colClasifGral, nDatos, 1).setBackground(rgbToHex(255,192,0)).setFontWeight("bold"); ws.setColumnWidth(colClasifGral, 135); }

    // Fila separadora anterior al titulo: solo fondo blanco.
    // NO se tocan sus bordes: ya estan limpios y tocarlos borraria
    // el borde del grupo de arriba y el de este.
    if (f > 1) {
      ws.getRange(f - 1, 1, 1, lastColFormat).setBackground("#FFFFFF");
    }
  }

  var colClasifRank = 0, colRankingJug = 0;
  for (var cr = 0; cr < maxCols; cr++) {
    var v2 = (datos[0][cr] + "").trim();
    if (v2 === "Clasif") colClasifRank = cr + 1;
    if (v2 === "Ranking Jugadores") colRankingJug = cr + 1;
  }

  if (colClasifRank > 0 && colRankingJug > 0) {
    ws.getRange(1, colClasifRank, 1, colRankingJug - colClasifRank + 1)
      .setFontWeight("bold").setFontStyle("italic")
      .setFontColor("#FFFFFF").setBackground(rgbToHex(0, 32, 96));

    var ultFilaRankJug = getLastRow(ws, colRankingJug);

    if (ultFilaRankJug >= 2) {
      ws.getRange(2, colClasifRank, ultFilaRankJug - 1, colRankingJug - colClasifRank + 1)
        .setBackground(rgbToHex(184, 204, 228)).setFontWeight("bold");
      ws.getRange(2, colClasifRank, ultFilaRankJug - 1, 1)
        .setHorizontalAlignment("center").setVerticalAlignment("middle");
      ws.getRange(2, colRankingJug, ultFilaRankJug - 1, 1)
        .setHorizontalAlignment("left").setVerticalAlignment("middle");
      ws.getRange(1, colClasifRank, ultFilaRankJug, colRankingJug - colClasifRank + 1)
        .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);
    }

    ws.setColumnWidth(colClasifRank, 80);
    ws.setColumnWidth(colRankingJug, 225);
  }
}
