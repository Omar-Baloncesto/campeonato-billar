// ============================================================
// M15 - GENERAR RANKING FINAL
// ============================================================
//
// POR QUE CAMBIA
//
// La version anterior sacaba tres columnas: Ranking, Jugador y "Ronda
// Alcanzada". Y "Ronda Alcanzada" decia 2 o decia 1. Eso no le dice
// nada a nadie: ni quien fue campeon, ni quien jugo bien, ni por que
// un jugador esta por encima de otro.
//
// Peor todavia: DENTRO de una misma ronda no habia ningun criterio. El
// orden salia de como JavaScript recorre un objeto, que es el orden en
// que se encontraron los nombres en la hoja. Por eso el puesto 1 lo
// tenia quien aparecia primero en el cuadro y no quien mejor jugo.
//
// QUE HACE AHORA
//
// 1. Ordena de verdad, con tres criterios en cascada:
//
//       1º  HASTA DONDE LLEGO    campeon, subcampeon, semifinal...
//       2º  RENDIMIENTO          carambolas hechas / carambolas que
//                                debia hacer (su objetivo)
//       3º  PUESTO EN GRUPOS     el de la fase de grupos, que ya esta
//                                calculado y nunca se repite
//
//    El 3º garantiza que NUNCA haya dos jugadores empatados: el orden
//    es siempre el mismo pase lo que pase.
//
// 2. El RENDIMIENTO es la pieza importante, y es lo que iguala a las
//    dos categorias. No compara carambolas brutas, sino que porcentaje
//    hizo cada uno DE LO SUYO:
//
//       Primera juega a 20 -> 18 carambolas = 18/20 = 90,0 %
//       Segunda juega a 17 -> 17 carambolas = 17/17 = 100,0 %
//
//    El de Segunda hizo MENOS carambolas y rindio MAS, porque cumplio
//    su objetivo. Es exactamente el mismo criterio con el que se
//    deciden los partidos en RESULTADOS y en la eliminacion, asi que
//    el ranking final no se contradice con el resto del torneo.
//
// 3. Ensena de donde sale cada cosa: categoria, objetivo, partidos,
//    ganados, carambolas, entradas y promedio. Con rotulos de color
//    que separan lo que DECIDE el orden de lo que es informativo.
//
// 4. Las partidas de BYE no cuentan como partido jugado: nadie tiro
//    una bola ahi, asi que no pueden ensuciar el rendimiento.
//
// LO QUE NO CAMBIA
//    - La columna "Ronda Alcanzada" sigue existiendo y con ese nombre,
//      porque es la que lee la web.
//    - La hoja NO se borra ni se vuelve a crear, para que no le cambie
//      el identificador y la web la siga encontrando.
//
// Esta hoja es una FOTO, no como RankingGrupos: quien perdio en cual
// ronda no se puede sacar con formulas. Se corre al terminar el cuadro
// (o cuando se quiera ver como va: los que siguen vivos salen como EN
// JUEGO y van los primeros).
// ============================================================

var RF_HOJA  = "RankingFinal";
var RF_ANCHO = 13;   // A..M

function GenerarRankingFinal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  RF_CACHE_CATEGORIAS = null;      // que no se quede la lectura anterior

  var wsE = ss.getSheetByName("Eliminación Simple");
  if (!wsE) { avisoRF_("No se encontro la hoja 'Eliminación Simple'."); return; }

  // ----------------------------------------------------------
  // 1. LEER EL CUADRO DE UNA SOLA VEZ
  //
  //    A Ronda | B Partido | C Jugador A | D Entradas A | E Carambolas A
  //    F Prom A | G Jugador B | H Entradas B | I Carambolas B | J Prom B
  //    K Ganador | L Objetivo A | M Objetivo B | N Fecha | O Hora
  //
    //  OJO con D y E: aqui van al reves que en RESULTADOS. En el cuadro
    //  la columna D son las ENTRADAS y la E las CARAMBOLAS.
  // ----------------------------------------------------------
  var ultFilaE = wsE.getLastRow();
  if (ultFilaE < 2) { avisoRF_("La hoja 'Eliminación Simple' esta vacia."); return; }
  var cuadro = wsE.getRange(1, 1, ultFilaE, 15).getValues();

  var jugadores = {};        // nombre -> ficha
  var partidosPorRonda = {}; // ronda  -> cuantos cruces tiene
  var rondaFinal = 0;

  function ficha_(nombre) {
    if (!jugadores[nombre]) {
      jugadores[nombre] = {
        nombre: nombre, partidos: 0, ganados: 0,
        carambolas: 0, entradas: 0, objetivos: 0,
        objetivo: "", rondaMax: 0, ganoLaUltima: false, ultimaDecidida: false
      };
    }
    return jugadores[nombre];
  }

  function esNumero_(v) {
    return v !== "" && v !== null && v !== undefined && !isNaN(v);
  }

  for (var r = 0; r < cuadro.length; r++) {
    var f = cuadro[r];
    if (!esNumero_(f[0])) continue;              // titulos y encabezados
    var ronda = parseInt(f[0], 10);
    if (!ronda) continue;

    partidosPorRonda[ronda] = (partidosPorRonda[ronda] || 0) + 1;
    if (ronda > rondaFinal) rondaFinal = ronda;

    var jugA = String(f[2]).trim(), jugB = String(f[6]).trim();
    var ganador = String(f[10]).trim();

    // Un partido cuenta como JUGADO solo si los dos anotaron carambolas.
    // Asi quedan fuera los BYE y los cruces que todavia no se han jugado.
    var jugado = esNumero_(f[4]) && esNumero_(f[8]) &&
                 jugA !== "" && jugB !== "" && jugA !== "BYE" && jugB !== "BYE";

    var lados = [
      { nombre: jugA, ent: f[3], car: f[4], obj: f[11] },
      { nombre: jugB, ent: f[7], car: f[8], obj: f[12] }
    ];

    for (var k = 0; k < 2; k++) {
      var lado = lados[k];
      if (lado.nombre === "" || lado.nombre === "BYE") continue;
      if (lado.nombre === "Jugador A" || lado.nombre === "Jugador B") continue;

      var j = ficha_(lado.nombre);

      if (esNumero_(lado.obj)) j.objetivo = Number(lado.obj);

      if (jugado) {
        j.partidos++;
        j.carambolas += Number(lado.car) || 0;
        j.entradas   += Number(lado.ent) || 0;
        if (esNumero_(lado.obj)) j.objetivos += Number(lado.obj);
        if (ganador === lado.nombre) j.ganados++;
      }

      // La ronda mas lejos a la que llego, y como termino ahi.
      if (ronda >= j.rondaMax) {
        j.rondaMax        = ronda;
        j.ganoLaUltima    = (ganador === lado.nombre);
        j.ultimaDecidida  = (ganador !== "" && ganador !== "EMPATE");
      }
    }
  }

  var lista = [];
  for (var nom in jugadores) lista.push(jugadores[nom]);
  if (lista.length === 0) { avisoRF_("En el cuadro todavia no hay jugadores."); return; }

  // ----------------------------------------------------------
  // 2. HASTA DONDE LLEGO CADA UNO
  // ----------------------------------------------------------
  var puestos = puestosDeGrupos_(ss);   // nombre -> puesto en la fase de grupos
  var hayCampeon = false;

  for (var i = 0; i < lista.length; i++) {
    var j = lista[i];

    if (!j.ultimaDecidida) {
      // Su ultimo cruce todavia no tiene ganador: sigue en carrera.
      j.etiqueta = "EN JUEGO";
      j.orden = j.rondaMax + 0.5;
    } else if (j.ganoLaUltima) {
      if (j.rondaMax >= rondaFinal) {
        j.etiqueta = "CAMPEÓN";
        j.orden = rondaFinal + 1;      // por encima del subcampeon
        hayCampeon = true;
      } else {
        // Gano pero la ronda siguiente aun no lo recoge.
        j.etiqueta = "EN JUEGO";
        j.orden = j.rondaMax + 0.5;
      }
    } else if (j.rondaMax >= rondaFinal) {
      j.etiqueta = "SUBCAMPEÓN";
      j.orden = rondaFinal;
    } else {
      j.etiqueta = nombreRondaFinal_(partidosPorRonda[j.rondaMax], j.rondaMax);
      j.orden = j.rondaMax;
    }

    j.rendimiento = (j.objetivos > 0) ? (j.carambolas / j.objetivos) : null;
    j.promedio    = (j.entradas  > 0) ? (j.carambolas / j.entradas)  : null;
    j.puestoGrupo = puestos[normNombreRF_(j.nombre)] || null;
  }

  // ----------------------------------------------------------
  // 3. ORDENAR
  //    1º hasta donde llego · 2º rendimiento · 3º puesto en grupos
  // ----------------------------------------------------------
  lista.sort(function (a, b) {
    if (b.orden !== a.orden) return b.orden - a.orden;

    var ra = (a.rendimiento === null) ? -1 : a.rendimiento;
    var rb = (b.rendimiento === null) ? -1 : b.rendimiento;
    if (rb !== ra) return rb - ra;

    var pa = (a.puestoGrupo === null) ? 9999 : a.puestoGrupo;
    var pb = (b.puestoGrupo === null) ? 9999 : b.puestoGrupo;
    if (pa !== pb) return pa - pb;

    return a.nombre < b.nombre ? -1 : (a.nombre > b.nombre ? 1 : 0);
  });

  // ----------------------------------------------------------
  // 4. PREPARAR LA HOJA SIN BORRARLA
  // ----------------------------------------------------------
  var creada = false;
  var wsR = ss.getSheetByName(RF_HOJA);
  if (!wsR) { wsR = ss.insertSheet(RF_HOJA); creada = true; }

  var filasPie = 6;
  var filasNecesarias = lista.length + 2 + filasPie;
  if (wsR.getMaxRows()    < filasNecesarias) wsR.insertRowsAfter(wsR.getMaxRows(), filasNecesarias - wsR.getMaxRows());
  if (wsR.getMaxColumns() < RF_ANCHO)        wsR.insertColumnsAfter(wsR.getMaxColumns(), RF_ANCHO - wsR.getMaxColumns());

  var todo = wsR.getRange(1, 1, wsR.getMaxRows(), wsR.getMaxColumns());
  todo.breakApart();
  todo.clear();
  todo.clearDataValidations();
  wsR.setConditionalFormatRules([]);
  wsR.setFrozenRows(0);

  // ----------------------------------------------------------
  // 5. CONSTRUIR
  // ----------------------------------------------------------
  var rotulos = ["", "", "", "", "", "", "", "", "", "", "", "", ""];
  rotulos[0] = "QUIEN ES";                         // A..D
  rotulos[4] = "ESTO DECIDE EL ORDEN";             // E..H
  rotulos[8] = "SOLO INFORMATIVO · NO ORDENA";     // I..M

  // OJO: "Ranking", "Jugador" y "Ronda Alcanzada" son los nombres que
  // busca la web. Si se cambian hay que cambiar app/lib/parsers.ts.
  var encabezados = [
    "Ranking", "Jugador", "Categoría", "Objetivo",
    "Hasta dónde llegó", "Ronda Alcanzada", "Rendimiento", "Puesto en Grupos",
    "Partidos", "Ganados", "Carambolas", "Entradas", "Promedio"
  ];

  var notas = [
    "Puesto final del torneo.",
    "",
    "Categoría en la que está inscrito, según «Base de Datos».",
    "Carambolas que tiene que hacer para ganar una partida.\nPrimera y Segunda no juegan a lo mismo.",
    "La última ronda que jugó. La perdió ahí, salvo el campeón.",
    "La misma ronda, en número. Es la que lee la web.",
    "1er criterio de desempate.\nCarambolas hechas ÷ carambolas que debía hacer.\n17 de 17 (100%) vale más que 18 de 20 (90%).",
    "2º criterio de desempate: el puesto con el que salió de la fase de grupos.\nNunca se repite, así que nunca quedan dos empatados.",
    "INFORMATIVO. Partidas jugadas de verdad.\nLos BYE no cuentan: nadie tiró una bola.",
    "INFORMATIVO. Partidas ganadas.",
    "INFORMATIVO. Carambolas hechas en toda la eliminación.",
    "INFORMATIVO. Entradas jugadas en toda la eliminación.",
    "INFORMATIVO. Carambolas ÷ entradas.\nEs el promedio de billar, y NO ordena esta tabla:\nno tiene en cuenta el objetivo de cada categoría."
  ];

  var datos = [];
  for (var d = 0; d < lista.length; d++) {
    var p = lista[d];
    datos.push([
      d + 1,
      p.nombre,
      categoriaDeRF_(ss, p.nombre),
      p.objetivo === "" ? "" : p.objetivo,
      p.etiqueta,
      p.rondaMax,
      p.rendimiento === null ? "" : p.rendimiento,
      p.puestoGrupo === null ? "" : p.puestoGrupo,
      p.partidos,
      p.ganados,
      p.carambolas,
      p.entradas,
      p.promedio === null ? "" : p.promedio
    ]);
  }

  wsR.getRange(1, 1, 1, RF_ANCHO).setValues([rotulos]);
  wsR.getRange(2, 1, 1, RF_ANCHO).setValues([encabezados]);
  wsR.getRange(3, 1, datos.length, RF_ANCHO).setValues(datos);

  var filaPie = datos.length + 4;
  var pie = [
    ["CÓMO SE ORDENA ESTE RANKING"],
    ["1º  Hasta dónde llegó en el cuadro.  ·  2º  Rendimiento sobre su objetivo.  ·  3º  Puesto con el que salió de la fase de grupos."],
    ["Rendimiento = carambolas que hizo ÷ carambolas que debía hacer (su objetivo × partidas jugadas). Es lo que iguala a las dos categorías:"],
    ["Primera juega a 20 y Segunda a 17, así que 17 de 17 (100,0 %) rinde más que 18 de 20 (90,0 %), aunque sean menos carambolas."],
    ["Las partidas de BYE no cuentan como jugadas. Los dos que pierden la semifinal quedan 3º y 4º, y los separa el rendimiento."]
  ];
  for (var q = 0; q < pie.length; q++) {
    wsR.getRange(filaPie + q, 1).setValue(pie[q][0]);
  }

  SpreadsheetApp.flush();
  FormatoRankingFinal_(wsR, lista, filaPie, pie.length, notas);

  ss.setActiveSheet(wsR);

  var campeon = hayCampeon ? lista[0].nombre : "(todavia no hay campeon)";
  avisoRF_(
    "Ranking Final generado.\n\n" +
    lista.length + " jugadores.\n" +
    "Campeon: " + campeon + "\n\n" +
    "Orden: 1º hasta donde llego · 2º rendimiento sobre su\n" +
    "objetivo · 3º puesto en la fase de grupos.\n\n" +
    "El rendimiento iguala Primera (20) con Segunda (17):\n" +
    "17 de 17 rinde mas que 18 de 20." +
    (hayCampeon ? "" : "\n\nLa final todavia no tiene ganador: los que siguen\nvivos salen como EN JUEGO.") +
    (creada ? "\n\nATENCION: la hoja no existia y se acaba de crear.\n" +
              "Abre la web y comprueba que el ranking aparece." : "")
  );
}

/**
 * Nombre de la ronda segun cuantos cruces tiene, igual que en el cuadro.
 */
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

/** Quita espacios de sobra y unifica mayusculas, para comparar nombres. */
function normNombreRF_(v) {
  if (v === null || v === undefined) return "";
  return String(v).replace(/ /g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Puesto de cada jugador en la fase de grupos.
 *
 * Primero lo busca en RankingGrupos, que ya lo trae ordenado. Sirve
 * tanto la hoja nueva (encabezados en la fila 2) como la vieja (fila 1),
 * porque se busca la fila que dice "Jugador" en vez de dar por hecho
 * cual es. Si esa hoja no existe, tira de la columna "Ranking
 * Jugadores" de GRUPOS, que es de donde sale.
 */
function puestosDeGrupos_(ss) {
  var mapa = {};

  var wsRG = ss.getSheetByName("RankingGrupos");
  if (wsRG && wsRG.getLastRow() >= 2) {
    var rg = wsRG.getRange(1, 1, wsRG.getLastRow(), Math.min(wsRG.getMaxColumns(), 4)).getValues();
    var filaEnc = -1;
    for (var r = 0; r < Math.min(rg.length, 6); r++) {
      if (String(rg[r][1]).trim() === "Jugador") { filaEnc = r; break; }
    }
    if (filaEnc >= 0) {
      for (var d = filaEnc + 1; d < rg.length; d++) {
        var nom = String(rg[d][1]).trim();
        var pos = rg[d][0];
        if (nom === "" || pos === "" || isNaN(pos)) continue;
        mapa[normNombreRF_(nom)] = Number(pos);
      }
      if (Object.keys(mapa).length > 0) return mapa;
    }
  }

  var wsG = ss.getSheetByName("GRUPOS");
  if (!wsG) return mapa;
  var maxCol = wsG.getMaxColumns();
  var fila1 = wsG.getRange(1, 1, 1, maxCol).getValues()[0];
  var colRank = 0;
  for (var c = 0; c < fila1.length; c++) {
    if (String(fila1[c]).trim() === "Ranking Jugadores") { colRank = c + 1; break; }
  }
  if (colRank === 0) return mapa;

  var filas = Math.max(1, wsG.getLastRow() - 1);
  var col = wsG.getRange(2, colRank, filas, 1).getValues();
  for (var k = 0; k < col.length; k++) {
    var n2 = String(col[k][0]).trim();
    if (n2 === "") break;
    mapa[normNombreRF_(n2)] = k + 1;
  }
  return mapa;
}

/**
 * Categoria del jugador. Se lee 'Base de Datos' una sola vez y se
 * guarda, para no bajar la hoja entera por cada jugador.
 */
var RF_CACHE_CATEGORIAS = null;
function categoriaDeRF_(ss, nombre) {
  if (RF_CACHE_CATEGORIAS === null) {
    RF_CACHE_CATEGORIAS = {};
    var wsBD = ss.getSheetByName("Base de Datos");
    if (wsBD && wsBD.getLastRow() > 0) {
      var bd = wsBD.getRange(1, 1, wsBD.getLastRow(), Math.min(wsBD.getMaxColumns(), 12)).getValues();
      var bloques = [1, 5, 9];    // B, F y J llevan nombre; la de al lado, categoria
      for (var r = 0; r < bd.length; r++) {
        for (var b = 0; b < bloques.length; b++) {
          var n = String(bd[r][bloques[b]]).trim();
          var cat = bd[r][bloques[b] + 1];
          if (n !== "" && cat !== "" && cat !== null && !RF_CACHE_CATEGORIAS[normNombreRF_(n)]) {
            RF_CACHE_CATEGORIAS[normNombreRF_(n)] = cat;
          }
        }
      }
    }
  }
  return RF_CACHE_CATEGORIAS[normNombreRF_(nombre)] || "";
}

/**
 * Formato. Va aparte para poder retocarlo sin tocar el calculo.
 */
function FormatoRankingFinal_(wsR, lista, filaPie, lineasPie, notas) {
  var total = lista.length;
  var ultima = total + 2;

  // --- Fila 1: los rotulos ---
  wsR.getRange("A1:D1").merge()
    .setBackground(rgbToHex(217, 217, 217)).setFontColor(rgbToHex(64, 64, 64));
  wsR.getRange("E1:H1").merge()
    .setBackground(rgbToHex(56, 118, 29)).setFontColor("#FFFFFF");
  wsR.getRange("I1:M1").merge()
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
  for (var i = 0; i < notas.length; i++) {
    if (notas[i] !== "") wsR.getRange(2, i + 1).setNote(notas[i]);
  }

  if (total > 0) {
    var datos = wsR.getRange(3, 1, total, RF_ANCHO);
    datos.setHorizontalAlignment("center").setVerticalAlignment("middle");
    wsR.getRange(3, 2, total, 2).setHorizontalAlignment("left");
    wsR.getRange(3, 2, total, 1).setFontWeight("bold");
    wsR.getRange(3, 5, total, 1).setHorizontalAlignment("left");

    wsR.getRange(3, 1, total, 1).setNumberFormat("0");
    wsR.getRange(3, 4, total, 1).setNumberFormat("0");
    wsR.getRange(3, 6, total, 1).setNumberFormat("0");
    wsR.getRange(3, 7, total, 1).setNumberFormat("0.0%");
    wsR.getRange(3, 8, total, 1).setNumberFormat("0");
    wsR.getRange(3, 9, total, 4).setNumberFormat("0");
    wsR.getRange(3, 13, total, 1).setNumberFormat("0.000");

    // Las que deciden, con el fondo claro de su rotulo
    wsR.getRange(3, 5, total, 4).setBackground(rgbToHex(226, 239, 218));
    wsR.getRange(3, 7, total, 1).setFontWeight("bold");

    // Las informativas, en gris y cursiva
    wsR.getRange(3, 9, total, 5)
      .setBackground(rgbToHex(252, 245, 226))
      .setFontColor(rgbToHex(89, 89, 89))
      .setFontStyle("italic");

    // Podio
    if (total >= 1) pintarPuestoRF_(wsR, 3, RF_ANCHO, rgbToHex(255, 217, 102), 12);  // oro
    if (total >= 2) pintarPuestoRF_(wsR, 4, RF_ANCHO, rgbToHex(217, 217, 217), 11);  // plata
    if (total >= 3) pintarPuestoRF_(wsR, 5, RF_ANCHO, rgbToHex(237, 187, 138), 11);  // bronce

    // Una linea gruesa cada vez que cambia la ronda, para que se vea
    // que esto son bloques y no una lista de 22 seguidos.
    for (var d = 1; d < total; d++) {
      if (lista[d].etiqueta !== lista[d - 1].etiqueta) {
        wsR.getRange(3 + d, 1, 1, RF_ANCHO)
          .setBorder(true, null, null, null, null, null,
                     "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      }
    }

    // Quien cumplio su objetivo, en verde.
    var regla = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=($G3<>"")*($G3>=1)')
      .setFontColor(rgbToHex(0, 97, 0))
      .setBold(true)
      .setRanges([wsR.getRange(3, 7, total, 1)])
      .build();
    wsR.setConditionalFormatRules([regla]);

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

  var anchos = [75, 235, 110, 85, 165, 95, 110, 120, 85, 85, 105, 90, 100];
  for (var a = 0; a < anchos.length; a++) wsR.setColumnWidth(a + 1, anchos[a]);

  wsR.setFrozenRows(2);
}

/** Pinta la fila de un puesto del podio. */
function pintarPuestoRF_(wsR, fila, ancho, color, tamano) {
  wsR.getRange(fila, 1, 1, ancho)
    .setBackground(color)
    .setFontColor("#000000")
    .setFontWeight("bold")
    .setFontStyle("normal")
    .setFontSize(tamano);
}

/**
 * Aviso por pantalla. Si no hay pantalla no se cae: va al registro.
 */
function avisoRF_(texto) {
  try {
    SpreadsheetApp.getUi().alert(texto);
  } catch (err) {
    console.log(texto);
  }
}
