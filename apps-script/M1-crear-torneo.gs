// ============================================================
// M1 - CREAR TORNEO (CONFIGURACION)
// ============================================================
//
// Cambios respecto a la version anterior:
//   · B5  (Categoria) es una LISTA DESPLEGABLE con cuatro opciones:
//         Primera, Segunda, Mixta y Parejas.
//   · B10 y B11 (carambolas de Semifinal y Final) dejan de ser
//     formulas: se preguntan y se guardan como numeros, asi que
//     despues se pueden cambiar a mano en la hoja.
//
// Lo demas esta igual que estaba.
// ============================================================

// Las opciones de la lista de B5. Para anadir o quitar una, se toca
// aqui y ya: la lista de la hoja sale de esta linea.
var CATEGORIAS_TORNEO = ["Primera", "Segunda", "Mixta", "Parejas"];

function CrearTorneo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  // Crear hoja CONFIGURACION si no existe
  var wsConf = getOrCreateSheet(ss, "CONFIGURACION");
  desprotegerHoja(wsConf);

  // Asegurar textos fijos en A3:A11
  wsConf.getRange("A1").setValue("CONFIGURACION DEL TORNEO");
  wsConf.getRange("A3").setValue("Numero total de jugadores");
  wsConf.getRange("A4").setValue("Jugadores por grupo");
  wsConf.getRange("A5").setValue("Categoria");
  wsConf.getRange("A6").setValue("Carambolas primera categoría");
  wsConf.getRange("A7").setValue("Carambolas segunda categoría");
  wsConf.getRange("A8").setValue("Limite de entradas");
  wsConf.getRange("A9").setValue("Tiempo por entrada (segundos)");
  wsConf.getRange("A10").setValue("Carambolas - Semifinal");
  wsConf.getRange("A11").setValue("Carambolas - Final");

  // Numero total de jugadores
  var response = ui.prompt("Configuracion del Torneo", "Ingrese el numero TOTAL de jugadores:", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() != ui.Button.OK) return;
  var totalJugadores = parseInt(response.getResponseText());

  if (isNaN(totalJugadores) || totalJugadores <= 0) {
    ui.alert("Numero de jugadores invalido.");
    return;
  }

  // Jugadores por grupo
  response = ui.prompt("Configuracion del Torneo", "Ingrese el numero de jugadores por grupo:", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() != ui.Button.OK) return;
  var jugadoresGrupo = parseInt(response.getResponseText());

  if (isNaN(jugadoresGrupo) || jugadoresGrupo <= 1) {
    ui.alert("El grupo debe tener minimo 2 jugadores.");
    return;
  }

  if (totalJugadores % jugadoresGrupo !== 0) {
    ui.alert("ATENCION:\nEl numero total de jugadores NO es multiplo del tamano del grupo.\nLos grupos se ajustaran automaticamente.");
  }

  // Limite de entradas
  response = ui.prompt("Configuracion del Torneo", "Ingrese el limite de entradas por partido:", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() != ui.Button.OK) return;
  var limiteEntradas = parseInt(response.getResponseText());

  if (isNaN(limiteEntradas) || limiteEntradas <= 0) {
    ui.alert("Limite de entradas invalido.");
    return;
  }

  // Tiempo por entrada (segundos)
  response = ui.prompt("Configuracion del Torneo", "Ingrese el tiempo por entrada (segundos):", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() != ui.Button.OK) return;
  var tiempoPorEntrada = parseInt(response.getResponseText());

  if (isNaN(tiempoPorEntrada) || tiempoPorEntrada <= 0) {
    ui.alert("Tiempo por entrada invalido.");
    return;
  }

  // Categoria: ahora son cuatro opciones
  response = ui.prompt(
    "Configuracion del Torneo",
    "Seleccione la categoria:\n" +
    "1. Primera\n2. Segunda\n3. Mixta\n4. Parejas\n\nIngrese 1, 2, 3 o 4:",
    ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() != ui.Button.OK) return;
  var opcionCategoria = parseInt(response.getResponseText());

  if (isNaN(opcionCategoria) || opcionCategoria < 1 || opcionCategoria > CATEGORIAS_TORNEO.length) {
    ui.alert("Opcion invalida. Debe ingresar 1 (Primera), 2 (Segunda), 3 (Mixta) o 4 (Parejas).");
    return;
  }
  var categoria = CATEGORIAS_TORNEO[opcionCategoria - 1];

  // Carambolas PRIMERA categoria
  response = ui.prompt("Configuracion del Torneo", "Ingrese las carambolas de la PRIMERA categoria:", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() != ui.Button.OK) return;
  var carambolasPrimera = parseInt(response.getResponseText());

  if (isNaN(carambolasPrimera) || carambolasPrimera <= 0) {
    ui.alert("Numero de carambolas invalido para la primera categoria.");
    return;
  }

  // Carambolas SEGUNDA categoria
  response = ui.prompt("Configuracion del Torneo", "Ingrese las carambolas de la SEGUNDA categoria:", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() != ui.Button.OK) return;
  var carambolasSegunda = parseInt(response.getResponseText());

  if (isNaN(carambolasSegunda) || carambolasSegunda <= 0) {
    ui.alert("Numero de carambolas invalido para la segunda categoria.");
    return;
  }

  // Carambolas de la SEMIFINAL (antes era una formula fija)
  response = ui.prompt("Configuracion del Torneo", "Ingrese las carambolas de la SEMIFINAL:", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() != ui.Button.OK) return;
  var carambolasSemifinal = parseInt(response.getResponseText());

  if (isNaN(carambolasSemifinal) || carambolasSemifinal <= 0) {
    ui.alert("Numero de carambolas invalido para la semifinal.");
    return;
  }

  // Carambolas de la FINAL (antes era una formula fija)
  response = ui.prompt("Configuracion del Torneo", "Ingrese las carambolas de la FINAL:", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() != ui.Button.OK) return;
  var carambolasFinal = parseInt(response.getResponseText());

  if (isNaN(carambolasFinal) || carambolasFinal <= 0) {
    ui.alert("Numero de carambolas invalido para la final.");
    return;
  }

  // Guardar configuracion
  wsConf.getRange("B3").setValue(totalJugadores);
  wsConf.getRange("B4").setValue(jugadoresGrupo);
  wsConf.getRange("B8").setValue(limiteEntradas);
  wsConf.getRange("B9").setValue(tiempoPorEntrada);

  // Configuracion de categoria y carambolas
  wsConf.getRange("B5").setValue(categoria);
  wsConf.getRange("B6").setValue(carambolasPrimera);
  wsConf.getRange("B7").setValue(carambolasSegunda);

  // Numeros, no formulas: se pueden cambiar a mano cuando haga falta
  wsConf.getRange("B10").setValue(carambolasSemifinal);
  wsConf.getRange("B11").setValue(carambolasFinal);

  // La lista desplegable de B5
  PonerListaCategoria();

  ui.alert("Torneo de Billar 3 bandas configurado");

  // Llamar formato
  FormatoConfiguracion();
}


/**
 * Pone en B5 la lista desplegable con las cuatro categorias.
 *
 * Va aparte para poder ejecutarla sola, sin volver a configurar el
 * torneo entero: util cuando la hoja ya esta montada y solo falta el
 * desplegable.
 */
function PonerListaCategoria() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName("CONFIGURACION");
  if (!ws) return;

  desprotegerHoja(ws);

  var regla = SpreadsheetApp.newDataValidation()
    .requireValueInList(CATEGORIAS_TORNEO, true)   // true = enseña la flechita
    .setAllowInvalid(false)                        // no deja escribir otra cosa
    .setHelpText("Escoge una: " + CATEGORIAS_TORNEO.join(", ") + ".")
    .build();

  ws.getRange("B5").setDataValidation(regla);

  // Si lo que hay en B5 no es ninguna de las cuatro, se deja en Primera
  // para que la celda no quede marcada como invalida.
  var actual = (ws.getRange("B5").getValue() + "").trim();
  if (CATEGORIAS_TORNEO.indexOf(actual) === -1) {
    ws.getRange("B5").setValue(CATEGORIAS_TORNEO[0]);
  }
}


function FormatoConfiguracion() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName("CONFIGURACION");
  if (!ws) return;

  desprotegerHoja(ws);

  // Encabezado A1:B1 - merge
  ws.getRange("A1:B1").merge()
    .setFontWeight("bold")
    .setFontStyle("italic")
    .setFontSize(14)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground(rgbToHex(184, 204, 228));

  // Columna A
  ws.getRange("A:A").setFontWeight("bold").setFontStyle("italic");
  ws.setColumnWidth(1, 300); // ~40 chars
  ws.setColumnWidth(2, 80);  // ~10 chars

  // Fondo gris claro B3:B4
  ws.getRange("B3:B4").setBackground(rgbToHex(217, 217, 217));

  // Fondo azul claro B5
  ws.getRange("B5")
    .setBackground(rgbToHex(184, 204, 228))
    .setFontWeight("bold")
    .setFontStyle("italic");

  // Fondo gris claro B6:B11
  ws.getRange("B6:B11").setBackground(rgbToHex(217, 217, 217));

  // Fondo blanco A3:A11
  ws.getRange("A3:A11").setBackground("#FFFFFF");

  // Bordes finos A1:B11
  ws.getRange("A1:B11").setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);

  // Fondo blanco A2:B2
  ws.getRange("A2:B2").setBackground("#FFFFFF");
}
