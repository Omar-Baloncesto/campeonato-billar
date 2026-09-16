// ============================================================
// M16 - REGISTRO DE W.O.   (trigger instalable)
// ============================================================
//
// POR QUE CAMBIO
//
// La version anterior abria una ventana con ui.prompt() para preguntar
// quien no se presento. Eso funciona cuando editas TU, con la hoja
// abierta en pantalla. Pero un trigger instalable se dispara con la
// edicion de CUALQUIER editor y corre en un servidor de Google en
// nombre del que lo instalo. Ahi no hay pantalla donde abrir ventanas:
// SpreadsheetApp.getUi() falla y la funcion se corta.
//
// Resultado con otra persona digitando: escribe "SI", no pasa nada, y
// nadie ve ningun error. Un W.O. que no se registra en mitad de un
// torneo.
//
// SOLUCION: no preguntar nada. Quien digita escribe DIRECTAMENTE en la
// columna W.O. quien no se presento:
//
//     A    no se presento el Jugador A
//     B    no se presento el Jugador B
//     AB   no se presento ninguno de los dos
//
// El trigger llena las carambolas y las entradas, y deja la celda en
// "SI", que es lo que esperan la formula de Resultado y el paso 6.
// Quien falto queda anotado en las carambolas (1 el que vino, 0 el que
// no) y en la nota de la celda.
//
// Ventajas: funciona con cualquier editor, funciona desde el celular
// (donde las ventanas de Apps Script no existen) y es mas rapido de
// digitar.
// ============================================================

var WO_COL       = 12;   // L - W.O.
var WO_HOJA      = "RESULTADOS";
var WO_PRESENTE  = 1;    // Carambolas del que SI se presento
var WO_AUSENTE   = 0;    // Carambolas del que NO se presento
var WO_ENTRADAS  = 0;    // Entradas: 0 para los dos en un W.O.

/**
 * Instala el trigger automaticamente. Solo hace falta UNA VEZ.
 *
 * Esta funcion SI puede abrir ventanas: la ejecutas tu a mano desde el
 * editor o desde el menu, con la hoja delante. El problema de getUi()
 * es solo dentro del trigger, que corre sin pantalla.
 */
function instalarTriggerWO() {
  // Eliminar triggers anteriores de esta funcion para no duplicar
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onEditResultadosWO") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger("onEditResultadosWO")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();

  SpreadsheetApp.getUi().alert(
    "Trigger W.O. instalado correctamente.\n\n" +
    "Para registrar un W.O., en la columna L (W.O.) de RESULTADOS\n" +
    "se escribe QUIEN NO se presento:\n\n" +
    "   A    no se presento el Jugador A\n" +
    "   B    no se presento el Jugador B\n" +
    "   AB   no se presento ninguno de los dos\n\n" +
    "Las carambolas y las entradas se llenan solas."
  );
}

function onEditResultadosWO(e) {
  if (!e || !e.range) return;

  var range = e.range;
  var sheet = range.getSheet();

  if (sheet.getName() !== WO_HOJA) return;
  if (range.getNumRows() > 1 || range.getNumColumns() > 1) return;
  if (range.getColumn() !== WO_COL) return;

  var fila = range.getRow();
  if (fila < 2) return;                    // la fila 1 son los encabezados

  // Se admite con o sin puntos: "AB", "A.B.", "ab"
  var valor = String(range.getValue()).toUpperCase().replace(/[\.\s]/g, "");

  range.clearNote();

  // ---------- Se borro la celda: se limpia el partido ----------
  if (valor === "") {
    sheet.getRange(fila, 4, 1, 2).clearContent();   // D Carambolas A, E Entradas A
    sheet.getRange(fila, 8, 1, 2).clearContent();   // H Carambolas B, I Entradas B
    return;
  }

  // ---------- Quien no se presento ----------
  var ausente = null;
  if (valor === "A") ausente = "A";
  else if (valor === "B") ausente = "B";
  else if (valor === "AB" || valor === "BA") ausente = "AB";

  if (ausente === null) {
    // "SI" a secas, o cualquier otra cosa: no hay forma de saber quien
    // falto, y ADIVINARLO seria peor que no hacer nada. Se deja dicho
    // en una nota de la celda, que si se puede poner sin pantalla.
    range.setNote(
      "Para registrar el W.O., escribe aquí QUIÉN NO se presentó:\n\n" +
      "   A    no se presentó el Jugador A\n" +
      "   B    no se presentó el Jugador B\n" +
      "   AB   no se presentó ninguno de los dos\n\n" +
      "Las carambolas y las entradas se llenan solas."
    );
    return;
  }

  // ---------- Aplicar el W.O. ----------
  var carA = (ausente === "B") ? WO_PRESENTE : WO_AUSENTE;
  var carB = (ausente === "A") ? WO_PRESENTE : WO_AUSENTE;

  sheet.getRange(fila, 4, 1, 2).setValues([[carA, WO_ENTRADAS]]);   // D y E
  sheet.getRange(fila, 8, 1, 2).setValues([[carB, WO_ENTRADAS]]);   // H e I

  // La celda queda en "SI": es lo que leen la columna Resultado y el
  // paso 6. Escribir desde el script NO vuelve a disparar el trigger.
  range.setValue("SI");
  range.setNote(
    "W.O. · No se presentó: " +
    (ausente === "AB" ? "ninguno de los dos" : "el Jugador " + ausente)
  );
}
