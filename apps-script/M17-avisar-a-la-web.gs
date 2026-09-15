// ============================================================
// M17 - AVISAR A LA WEB (tiempo real)
// ============================================================
//
// Cada vez que se edita una celda del torneo, esto le avisa a la web
// para que borre su copia guardada y vuelva a leer el Sheet. El
// cambio se ve en la web en el momento, sin esperar el refresco
// automático.
//
// COMO INSTALARLO
//   1. Pega este bloque al final del Código.gs.
//   2. En el editor de Apps Script: Configuración del proyecto (la
//      rueda de la izquierda) -> Propiedades de la secuencia de
//      comandos -> Agregar propiedad:
//         Propiedad: REVALIDATE_TOKEN
//         Valor:     la misma clave secreta que pusiste en Vercel
//      (La clave la inventas tú. En Vercel: Settings -> Environment
//       Variables -> REVALIDATE_TOKEN, con ese mismo valor.)
//   3. Menú Activadores (el reloj) -> Añadir activador:
//         Función:            onEditAvisarWeb
//         Origen del evento:  Desde la hoja de cálculo
//         Tipo de evento:     Al editar
//
// La clave NO va escrita aquí: se guarda en las propiedades del
// proyecto para que no quede a la vista de quien abra el código.
// ============================================================

var WEB_URL = "https://campeonato-billar.vercel.app";

// Hojas cuyos cambios le importan a la web.
var HOJAS_QUE_AVISAN = [
  "RESULTADOS", "GRUPOS", "Eliminación Simple", "FIXTURE_GRUPOS",
  "JUGADORES", "CONFIGURACION", "Base de Datos",
  "RankingGrupos", "RankingFinal"
];

// No avisar más de una vez cada tantos segundos, para no disparar
// cientos de llamadas cuando alguien digita varias celdas seguidas.
var SEGUNDOS_ENTRE_AVISOS = 5;

function onEditAvisarWeb(e) {
  try {
    if (!e || !e.range) return;
    var hoja = e.range.getSheet().getName();
    if (HOJAS_QUE_AVISAN.indexOf(hoja) === -1) return;
    avisarALaWeb_();
  } catch (err) {
    console.log("onEditAvisarWeb: " + err);
  }
}

/**
 * Llama a la web. Se puede ejecutar a mano desde el editor para
 * comprobar que el token está bien puesto.
 */
function AvisarALaWebAhora() {
  var r = avisarALaWeb_(true);
  SpreadsheetApp.getUi().alert(
    r.ok
      ? "La web quedó avisada.\n\nRespuesta: " + r.texto
      : "No se pudo avisar a la web.\n\n" + r.texto +
        "\n\nRevisa que REVALIDATE_TOKEN esté igual en las Propiedades " +
        "de la secuencia de comandos y en Vercel."
  );
}

function avisarALaWeb_(forzar) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty("REVALIDATE_TOKEN");
  if (!token) return { ok: false, texto: "Falta la propiedad REVALIDATE_TOKEN." };

  if (!forzar) {
    var ultimo = Number(props.getProperty("ULTIMO_AVISO_WEB") || 0);
    var ahora = Date.now();
    if (ahora - ultimo < SEGUNDOS_ENTRE_AVISOS * 1000) return { ok: true, texto: "omitido" };
    props.setProperty("ULTIMO_AVISO_WEB", String(ahora));
  }

  try {
    var res = UrlFetchApp.fetch(WEB_URL + "/api/revalidate", {
      method: "post",
      headers: { "x-revalidate-token": token },
      muteHttpExceptions: true
    });
    var code = res.getResponseCode();
    return { ok: code === 200, texto: code + " " + res.getContentText().slice(0, 200) };
  } catch (err) {
    return { ok: false, texto: String(err) };
  }
}
