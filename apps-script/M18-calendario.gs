// ============================================================
// M18 - CREAR CALENDARIO
// ============================================================
//
// Toma la tabla de FIXTURE_GRUPOS, la ordena por fecha y hora de menor
// a mayor y la deja en una hoja nueva llamada "Calendario", con un
// color distinto para cada grupo.
//
// - Agrupa por jornada, con una banda por día.
// - Dentro de cada día agrupa por turno: la hora se muestra una sola
//   vez y los partidos que salen a la misma hora quedan juntos.
// - Si en FIXTURE_GRUPOS existe una columna I con la mesa, la trae
//   también. Si no existe, esa columna no aparece.
// - Los partidos a los que les falte la fecha o la hora no se pierden:
//   van al final, en un bloque aparte, y el aviso final dice cuáles son.
//
// Entiende la fecha escrita de varias formas: 16/09/2026, 16-09-2026,
// 16 09 26 o 2026-09-16. Y la hora como 5:00 PM, 5:00 p. m. o 17:00.
// ============================================================

var CAL_HOJA = "Calendario";

// Un color por grupo. Si hay más grupos que colores, se vuelve a empezar.
var CAL_COLORES = [
  { fondo: "#E8F5E9", letra: "#1B5E20", fuerte: "#2E7D32" },  // grupo 1  verde
  { fondo: "#FFF8E1", letra: "#E65100", fuerte: "#EF6C00" },  // grupo 2  ámbar
  { fondo: "#E3F2FD", letra: "#0D47A1", fuerte: "#1565C0" },  // grupo 3  azul
  { fondo: "#F3E5F5", letra: "#4A148C", fuerte: "#6A1B9A" },  // grupo 4  morado
  { fondo: "#E0F7FA", letra: "#006064", fuerte: "#00838F" },  // grupo 5  cian
  { fondo: "#FCE4EC", letra: "#880E4F", fuerte: "#AD1457" },  // grupo 6  rosa
  { fondo: "#FFF3E0", letra: "#BF360C", fuerte: "#D84315" },  // grupo 7  naranja
  { fondo: "#F1F8E9", letra: "#33691E", fuerte: "#558B2F" },  // grupo 8  lima
  { fondo: "#EDE7F6", letra: "#311B92", fuerte: "#4527A0" },  // grupo 9  violeta
  { fondo: "#E0F2F1", letra: "#004D40", fuerte: "#00695C" },  // grupo 10 verde azulado
  { fondo: "#FBE9E7", letra: "#B71C1C", fuerte: "#C62828" }   // grupo 11 rojo
];

var CAL_AZUL = "#1F3864";
var CAL_VERDE = "#2E7D5B";
var CAL_DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
var CAL_MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
                 "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function CrearCalendario() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  var wsF = ss.getSheetByName("FIXTURE_GRUPOS");
  if (!wsF) { ui.alert("No se encontró la hoja FIXTURE_GRUPOS."); return; }

  var ultima = wsF.getLastRow();
  if (ultima < 2) { ui.alert("FIXTURE_GRUPOS está vacía."); return; }

  // ----------------------------------------------------------
  // 1. LEER EL FIXTURE
  //    A Grupo | B Partido | C Jugador A | D Carambolas A
  //    E Jugador B | F Carambolas B | G Fecha | H Hora | I Mesa
  // ----------------------------------------------------------
  var rango = wsF.getRange(2, 1, ultima - 1, 9);
  var valores = rango.getValues();
  var textos = rango.getDisplayValues();

  var partidos = [];
  var sinFecha = [];
  var hayMesa = false;

  for (var i = 0; i < valores.length; i++) {
    var v = valores[i], t = textos[i];
    var jugA = (v[2] + "").trim();
    var jugB = (v[4] + "").trim();
    if (jugA === "" || jugB === "") continue;

    var mesa = (v[8] + "").trim();
    if (mesa !== "") hayMesa = true;

    var p = {
      fila: i + 2,
      grupo: Number(v[0]) || 0,
      partido: Number(v[1]) || 0,
      jugA: jugA,
      carA: v[3],
      jugB: jugB,
      carB: v[5],
      mesa: mesa,
      fecha: calParsearFecha_(v[6], t[6]),
      minutos: calParsearHora_(v[7], t[7]),
      textoFecha: (t[6] + "").trim(),
      textoHora: (t[7] + "").trim()
    };

    if (p.fecha === null || p.minutos === null) sinFecha.push(p);
    else partidos.push(p);
  }

  if (partidos.length === 0 && sinFecha.length === 0) {
    ui.alert("No se encontró ningún partido en FIXTURE_GRUPOS.");
    return;
  }

  // ----------------------------------------------------------
  // 2. ORDENAR POR FECHA Y HORA, DE MENOR A MAYOR
  // ----------------------------------------------------------
  partidos.sort(function (a, b) {
    if (a.fecha.getTime() !== b.fecha.getTime()) return a.fecha.getTime() - b.fecha.getTime();
    if (a.minutos !== b.minutos) return a.minutos - b.minutos;
    if (a.mesa !== b.mesa) return (a.mesa === "" ? 99 : Number(a.mesa)) - (b.mesa === "" ? 99 : Number(b.mesa));
    if (a.grupo !== b.grupo) return a.grupo - b.grupo;
    return a.partido - b.partido;
  });
  sinFecha.sort(function (a, b) {
    if (a.grupo !== b.grupo) return a.grupo - b.grupo;
    return a.partido - b.partido;
  });

  // ----------------------------------------------------------
  // 3. COLUMNAS
  // ----------------------------------------------------------
  var cabeceras = ["Fecha", "Día", "Hora"];
  if (hayMesa) cabeceras.push("Mesa");
  cabeceras = cabeceras.concat(["Grupo", "Partido", "Jugador A", "Carambolas A",
                                "Jugador B", "Carambolas B"]);
  var NC = cabeceras.length;
  var colGrupo = hayMesa ? 5 : 4;   // 1-based

  // ----------------------------------------------------------
  // 4. CONSTRUIR TODO EN MEMORIA
  //    (una sola escritura: así no se agota el tiempo de ejecución)
  // ----------------------------------------------------------
  var datos = [], fondos = [], letras = [], negritas = [], alineados = [];
  var bandas = [], cabeceraFilas = [], bloquesHora = [], filasDatos = [];

  function nuevaFila(fondo, letra) {
    var d = [], f = [], l = [], n = [], a = [];
    for (var c = 0; c < NC; c++) { d.push(""); f.push(fondo); l.push(letra); n.push(false); a.push("center"); }
    datos.push(d); fondos.push(f); letras.push(l); negritas.push(n); alineados.push(a);
    return datos.length;   // nº de fila (1-based)
  }

  // Título
  var fTitulo = nuevaFila(CAL_AZUL, "#FFFFFF");
  datos[fTitulo - 1][0] = "CALENDARIO · FASE DE GRUPOS";
  negritas[fTitulo - 1][0] = true;

  // Subtítulo
  var totalCon = partidos.length, totalSin = sinFecha.length;
  var jornadas = {};
  for (var q = 0; q < partidos.length; q++) jornadas[partidos[q].fecha.getTime()] = true;
  var nJornadas = Object.keys(jornadas).length;

  var fSub = nuevaFila("#FFFFFF", "#595959");
  datos[fSub - 1][0] = (totalCon + totalSin) + " partidos · " + nJornadas +
                       (nJornadas === 1 ? " jornada" : " jornadas") +
                       (totalSin > 0 ? " · " + totalSin + " sin fecha" : "");

  // Encabezados
  var fCab = nuevaFila("#595959", "#FFFFFF");
  for (var c2 = 0; c2 < NC; c2++) { datos[fCab - 1][c2] = cabeceras[c2]; negritas[fCab - 1][c2] = true; }
  cabeceraFilas.push(fCab);

  // Partidos, día por día
  var diaActual = "", horaActual = -1, inicioHora = 0;

  function cerrarBloqueHora() {
    if (inicioHora > 0 && datos.length >= inicioHora) bloquesHora.push([inicioHora, datos.length]);
    inicioHora = 0;
  }

  for (var k = 0; k < partidos.length; k++) {
    var p = partidos[k];
    var claveDia = p.fecha.getTime() + "";

    if (claveDia !== diaActual) {
      cerrarBloqueHora();
      diaActual = claveDia; horaActual = -1;
      var cuantos = 0;
      for (var z = 0; z < partidos.length; z++) {
        if (partidos[z].fecha.getTime() === p.fecha.getTime()) cuantos++;
      }
      var fBanda = nuevaFila(CAL_VERDE, "#FFFFFF");
      datos[fBanda - 1][0] = calNombreDia_(p.fecha).toUpperCase() + "  ·  " + cuantos +
                             (cuantos === 1 ? " partido" : " partidos");
      negritas[fBanda - 1][0] = true;
      bandas.push(fBanda);
    }

    if (p.minutos !== horaActual) {
      cerrarBloqueHora();
      horaActual = p.minutos;
      inicioHora = datos.length + 1;
    }

    var col = CAL_COLORES[(p.grupo - 1 + CAL_COLORES.length) % CAL_COLORES.length];
    var f = nuevaFila(col.fondo, col.letra);
    var fi = f - 1, ci = 0;

    datos[fi][ci] = calTextoFecha_(p.fecha); alineados[fi][ci] = "center"; ci++;
    datos[fi][ci] = CAL_DIAS[p.fecha.getDay()]; ci++;
    datos[fi][ci] = calTextoHora_(p.minutos); negritas[fi][ci] = true; ci++;
    if (hayMesa) { datos[fi][ci] = p.mesa === "" ? "" : Number(p.mesa); ci++; }
    datos[fi][ci] = "Grupo " + p.grupo; negritas[fi][ci] = true; letras[fi][ci] = col.fuerte; ci++;
    datos[fi][ci] = p.partido; ci++;
    datos[fi][ci] = p.jugA; negritas[fi][ci] = true; alineados[fi][ci] = "left"; ci++;
    datos[fi][ci] = p.carA; ci++;
    datos[fi][ci] = p.jugB; negritas[fi][ci] = true; alineados[fi][ci] = "left"; ci++;
    datos[fi][ci] = p.carB; ci++;

    filasDatos.push(f);
  }
  cerrarBloqueHora();

  // Partidos sin fecha, al final
  if (sinFecha.length > 0) {
    nuevaFila("#FFFFFF", "#000000");
    var fAviso = nuevaFila("#C00000", "#FFFFFF");
    datos[fAviso - 1][0] = "SIN FECHA U HORA  ·  " + sinFecha.length +
                           (sinFecha.length === 1 ? " partido" : " partidos") +
                           "  —  revisa las columnas G y H de FIXTURE_GRUPOS";
    negritas[fAviso - 1][0] = true;
    bandas.push(fAviso);

    var fCab2 = nuevaFila("#595959", "#FFFFFF");
    for (var c3 = 0; c3 < NC; c3++) { datos[fCab2 - 1][c3] = cabeceras[c3]; negritas[fCab2 - 1][c3] = true; }
    cabeceraFilas.push(fCab2);

    for (var s = 0; s < sinFecha.length; s++) {
      var q2 = sinFecha[s];
      var col2 = CAL_COLORES[(q2.grupo - 1 + CAL_COLORES.length) % CAL_COLORES.length];
      var f2 = nuevaFila(col2.fondo, col2.letra);
      var fi2 = f2 - 1, ci2 = 0;
      datos[fi2][ci2] = q2.textoFecha; ci2++;
      datos[fi2][ci2] = ""; ci2++;
      datos[fi2][ci2] = q2.textoHora; ci2++;
      if (hayMesa) { datos[fi2][ci2] = q2.mesa === "" ? "" : Number(q2.mesa); ci2++; }
      datos[fi2][ci2] = "Grupo " + q2.grupo; negritas[fi2][ci2] = true; letras[fi2][ci2] = col2.fuerte; ci2++;
      datos[fi2][ci2] = q2.partido; ci2++;
      datos[fi2][ci2] = q2.jugA; negritas[fi2][ci2] = true; alineados[fi2][ci2] = "left"; ci2++;
      datos[fi2][ci2] = q2.carA; ci2++;
      datos[fi2][ci2] = q2.jugB; negritas[fi2][ci2] = true; alineados[fi2][ci2] = "left"; ci2++;
      datos[fi2][ci2] = q2.carB; ci2++;
      filasDatos.push(f2);
    }
  }

  var totalFilas = datos.length;

  // ----------------------------------------------------------
  // 5. CREAR LA HOJA Y ESCRIBIR
  // ----------------------------------------------------------
  var ws = ss.getSheetByName(CAL_HOJA);
  if (ws) {
    calDesproteger_(ws);
    ws.clear();
    ws.getRangeList(["A1"]).getRanges()[0].activate();
    var mergesViejos = ws.getRange(1, 1, Math.max(ws.getMaxRows(), 1), Math.max(ws.getMaxColumns(), 1)).getMergedRanges();
    for (var mm = 0; mm < mergesViejos.length; mm++) mergesViejos[mm].breakApart();
    ws.setFrozenRows(0);
  } else {
    ws = ss.insertSheet(CAL_HOJA);
  }

  if (ws.getMaxColumns() < NC) ws.insertColumnsAfter(ws.getMaxColumns(), NC - ws.getMaxColumns());
  if (ws.getMaxRows() < totalFilas) ws.insertRowsAfter(ws.getMaxRows(), totalFilas - ws.getMaxRows());

  var todo = ws.getRange(1, 1, totalFilas, NC);
  todo.setNumberFormat("@");            // para que 16/09/2026 no se convierta solo
  todo.setValues(datos);
  todo.setBackgrounds(fondos);
  todo.setFontColors(letras);
  todo.setFontWeights(calPesos_(negritas));
  todo.setHorizontalAlignments(alineados);
  todo.setVerticalAlignment("middle");
  todo.setFontFamily("Arial");
  todo.setFontSize(10);

  // ----------------------------------------------------------
  // 6. FORMATO
  // ----------------------------------------------------------
  // Título y subtítulo
  ws.getRange(1, 1, 1, NC).merge().setFontSize(15).setHorizontalAlignment("center");
  ws.setRowHeight(1, 34);
  ws.getRange(2, 1, 1, NC).merge().setFontSize(10).setFontStyle("italic").setHorizontalAlignment("center");
  ws.setRowHeight(2, 22);

  // Bandas de día
  for (var b = 0; b < bandas.length; b++) {
    ws.getRange(bandas[b], 1, 1, NC).merge().setFontSize(12).setHorizontalAlignment("center");
    ws.setRowHeight(bandas[b], 26);
  }

  // Encabezados de columna
  for (var h = 0; h < cabeceraFilas.length; h++) {
    ws.getRange(cabeceraFilas[h], 1, 1, NC).setFontSize(10).setFontStyle("italic");
    ws.setRowHeight(cabeceraFilas[h], 22);
  }

  // La hora, una sola vez por turno
  for (var t2 = 0; t2 < bloquesHora.length; t2++) {
    var ini = bloquesHora[t2][0], fin = bloquesHora[t2][1];
    if (fin > ini) ws.getRange(ini, 3, fin - ini + 1, 1).merge();
    ws.getRange(ini, 3).setFontSize(12).setHorizontalAlignment("center").setVerticalAlignment("middle");
  }

  // Bordes: recuadro de cada bloque y línea al cambiar de turno
  todo.setBorder(true, true, true, true, false, false, "#9E9E9E", SpreadsheetApp.BorderStyle.SOLID);
  if (filasDatos.length > 0) {
    ws.getRange(filasDatos[0], 1, filasDatos[filasDatos.length - 1] - filasDatos[0] + 1, NC)
      .setBorder(null, null, null, null, true, true, "#FFFFFF", SpreadsheetApp.BorderStyle.SOLID);
  }
  for (var t3 = 0; t3 < bloquesHora.length; t3++) {
    ws.getRange(bloquesHora[t3][1], 1, 1, NC)
      .setBorder(null, null, true, null, null, null, "#616161", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }

  // Anchos
  var anchos = [95, 90, 95];
  if (hayMesa) anchos.push(60);
  anchos = anchos.concat([85, 70, 200, 105, 200, 105]);
  for (var a2 = 0; a2 < anchos.length; a2++) ws.setColumnWidth(a2 + 1, anchos[a2]);

  for (var r2 = 0; r2 < filasDatos.length; r2++) ws.setRowHeight(filasDatos[r2], 21);

  ws.setFrozenRows(3);
  ws.setHiddenGridlines(true);
  ss.setActiveSheet(ws);

  // ----------------------------------------------------------
  // 7. INFORME
  // ----------------------------------------------------------
  var msg = "CALENDARIO CREADO\n\n" +
            partidos.length + (partidos.length === 1 ? " partido ordenado" : " partidos ordenados") +
            " por fecha y hora.\n" +
            nJornadas + (nJornadas === 1 ? " jornada." : " jornadas.");
  if (sinFecha.length > 0) {
    var lista = [];
    for (var s2 = 0; s2 < Math.min(sinFecha.length, 12); s2++) {
      var x = sinFecha[s2];
      lista.push("  fila " + x.fila + ":  Grupo " + x.grupo + " partido " + x.partido +
                 "   fecha \"" + x.textoFecha + "\"   hora \"" + x.textoHora + "\"");
    }
    if (sinFecha.length > 12) lista.push("  ... y " + (sinFecha.length - 12) + " más");
    msg += "\n\nATENCIÓN: " + sinFecha.length +
           (sinFecha.length === 1 ? " partido no tiene" : " partidos no tienen") +
           " una fecha u hora que se pueda leer.\n" +
           "Quedaron al final del calendario, en el bloque rojo.\n" +
           "En FIXTURE_GRUPOS revisa estas filas:\n\n" + lista.join("\n") +
           "\n\nLa fecha debe ir como 16/09/2026 y la hora como 5:00 PM.";
  }
  ui.alert(msg);
}

/* ---------------------------------------------------------------- */
/*  Ayudantes                                                       */
/* ---------------------------------------------------------------- */

/** Convierte true/false en "bold"/"normal" para setFontWeights. */
function calPesos_(negritas) {
  var out = [];
  for (var i = 0; i < negritas.length; i++) {
    var fila = [];
    for (var j = 0; j < negritas[i].length; j++) fila.push(negritas[i][j] ? "bold" : "normal");
    out.push(fila);
  }
  return out;
}

/**
 * Lee la fecha venga como venga: celda de fecha de verdad, o texto tipo
 * 16/09/2026, 16-09-2026, 16 09 26 o 2026-09-16.
 * Devuelve un Date sin hora, o null si no se entiende.
 */
function calParsearFecha_(valor, texto) {
  if (Object.prototype.toString.call(valor) === "[object Date]" && !isNaN(valor.getTime())) {
    return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
  }
  var t = ((texto === "" || texto === null || texto === undefined) ? valor : texto);
  t = (t === null || t === undefined) ? "" : (t + "").trim();
  if (t === "") return null;

  var p = t.split(/[\/\-\.\s]+/);
  if (p.length !== 3) return null;

  var d, m, a;
  if (p[0].length === 4) { a = parseInt(p[0], 10); m = parseInt(p[1], 10); d = parseInt(p[2], 10); }
  else { d = parseInt(p[0], 10); m = parseInt(p[1], 10); a = parseInt(p[2], 10); }
  if (isNaN(d) || isNaN(m) || isNaN(a)) return null;

  // Si el primero no puede ser día y el segundo sí, venía al revés (mm/dd)
  if (d > 12 && m > 12) return null;
  if (d <= 12 && m > 12) { var x = d; d = m; m = x; }

  if (a < 100) a += 2000;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return new Date(a, m - 1, d);
}

/**
 * Lee la hora venga como venga: celda de hora de verdad, o texto tipo
 * 5:00 PM, 5:00 p. m., 17:00 o 5 PM. Devuelve minutos desde medianoche.
 */
function calParsearHora_(valor, texto) {
  if (Object.prototype.toString.call(valor) === "[object Date]" && !isNaN(valor.getTime())) {
    return valor.getHours() * 60 + valor.getMinutes();
  }
  var t = ((texto === "" || texto === null || texto === undefined) ? valor : texto);
  t = (t === null || t === undefined) ? "" : (t + "").trim().toLowerCase();
  if (t === "") return null;

  var m = t.match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(a\.?\s*m\.?|p\.?\s*m\.?|m\.?)?$/);
  if (m) return calAMinutos_(parseInt(m[1], 10), parseInt(m[2], 10), m[3]);

  m = t.match(/^(\d{1,2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)$/);
  if (m) return calAMinutos_(parseInt(m[1], 10), 0, m[2]);

  return null;
}

function calAMinutos_(h, min, sufijo) {
  var s = (sufijo || "").replace(/[\s.]/g, "");
  if (s === "m") h = 12;
  else if (s.charAt(0) === "p" && h < 12) h += 12;
  else if (s.charAt(0) === "a" && h === 12) h = 0;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function calTextoFecha_(fecha) {
  var d = fecha.getDate(), m = fecha.getMonth() + 1;
  return (d < 10 ? "0" + d : d) + "/" + (m < 10 ? "0" + m : m) + "/" + fecha.getFullYear();
}

function calTextoHora_(minutos) {
  var h = Math.floor(minutos / 60), mi = minutos % 60;
  var sufijo = h < 12 ? "a. m." : "p. m.";
  var h12 = h % 12; if (h12 === 0) h12 = 12;
  return h12 + ":" + (mi < 10 ? "0" + mi : mi) + " " + sufijo;
}

function calNombreDia_(fecha) {
  return CAL_DIAS[fecha.getDay()] + " " + fecha.getDate() + " de " +
         CAL_MESES[fecha.getMonth()] + " de " + fecha.getFullYear();
}

/** Quita las protecciones de la hoja para poder reescribirla. */
function calDesproteger_(hoja) {
  try {
    var ps = hoja.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    for (var i = 0; i < ps.length; i++) if (ps[i].canEdit()) ps[i].remove();
    var rs = hoja.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (var j = 0; j < rs.length; j++) if (rs[j].canEdit()) rs[j].remove();
  } catch (e) { /* sin permisos de protección: seguimos igual */ }
}
