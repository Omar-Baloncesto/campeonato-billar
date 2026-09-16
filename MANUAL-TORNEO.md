# Manual del Torneo — Billar 3 Bandas, Club Tennis

Todo lo que hay que saber para manejar el torneo: el Google Sheet, la web y
quién puede hacer qué. Está escrito para leerlo el día del torneo, con prisa.

> **Las claves NO están en este archivo.** Este repositorio es público.
> Las claves están en el archivo `CLAVES-TORNEO.txt`, que se guarda aparte
> y nunca se sube a GitHub. Aquí solo se dice **dónde** vive cada clave.

---

## 1 · Las cuatro piezas

| Pieza | Qué es | Dónde |
|---|---|---|
| **Google Sheet** | Donde vive TODO el torneo. La única fuente de datos. | Google Drive de Omar |
| **Apps Script** | El programa dentro del Sheet. Menú "Torneo Billar". | Sheet → Extensiones → Apps Script |
| **Repositorio** | El código de la web. | github.com/Omar-Baloncesto/campeonato-billar |
| **Vercel** | Quien publica la web. | vercel.com → proyecto `campeonato-billar` |

**La web NO guarda datos.** Cada vez que alguien entra, se descarga el Sheet y
lo muestra. Por eso cualquier cambio en el Sheet se ve en la web sin tocar nada.

Dirección pública: **campeonato-billar.vercel.app**

---

## 2 · Antes del torneo: el orden de los pasos

Los pasos del menú **Torneo Billar** hay que correrlos en orden, porque cada
uno usa lo que hizo el anterior:

1. Cargar jugadores desde `Base de Datos`
2. Configuración
3. Armar grupos
4. Generar `FIXTURE_GRUPOS`
5. **Cargar Resultados** — crea la hoja `RESULTADOS` vacía, lista para digitar
6. **Generar GRUPOS** — las tablas de posiciones y el ranking
7. **Crear Eliminación Simple** — el cuadro completo, con fecha y hora
8. **Crear Calendario** — la programación ordenada por fecha y hora

### ⚠️ Lo más importante de todo

**El paso 5 y el paso 7 BORRAN y vuelven a crear su hoja.**

Si los corres con el torneo empezado, **se pierden todos los marcadores ya
digitados**. Una vez empiece a jugarse, esos dos pasos no se tocan.

Los pasos 6 y 8 sí se pueden repetir cuando quieras: solo recalculan.

---

## 3 · Durante el torneo: dónde se digita

Solo hay que escribir en dos hojas. Todo lo demás son fórmulas que se llenan solas.

### Partidos de grupos → hoja `RESULTADOS`

| Columna | Qué se escribe |
|---|---|
| **D** | Carambolas del Jugador A |
| **E** | Entradas del Jugador A |
| **H** | Carambolas del Jugador B |
| **I** | Entradas del Jugador B |
| **L** | Solo si hubo W.O.: escribir `SI` |

### Partidos de la eliminación → hoja `Eliminación Simple`

| Columna | Qué se escribe |
|---|---|
| **D** | Entradas del Jugador A |
| **E** | Carambolas del Jugador A |
| **H** | Entradas del Jugador B |
| **I** | Carambolas del Jugador B |

Ojo: en `RESULTADOS` van primero las carambolas y luego las entradas; en
`Eliminación Simple` es al revés. Así estaban las hojas originales y se
respetó para no mover nada.

### Convención de W.O.

| | Carambolas | Entradas |
|---|---|---|
| El que SÍ se presentó | **1** | **0** |
| El que NO se presentó | **0** | **0** |

Y en la columna L de `RESULTADOS`, `SI`.

### Cómo se decide el ganador

Por **promedio sobre el objetivo**, no por carambolas brutas:

```
promedio = carambolas hechas / carambolas que le tocaba hacer
```

Ejemplo real: Andrés hizo 10 de 20 (0,500) y Jorge hizo 9 de 17 (0,529).
**Gana Jorge.** Las columnas O y P de `RESULTADOS` muestran ese porcentaje
para que cualquiera lo pueda comprobar.

El objetivo de cada jugador sale de su categoría, en `Base de Datos` columna E
(Primera 20, Segunda 17).

---

## 4 · Dar acceso a otra persona para que digite

Se hace todo desde el Sheet. La web no hay que tocarla: una edición hecha por
otra persona vale exactamente igual que una hecha por Omar.

### Paso 1 — Compartir

1. Sheet → botón **Compartir**.
2. Escribir el correo de la persona.
3. Cambiar **Lector** por **Editor**.
4. Antes de enviar: la **rueda ⚙** → **desmarcar** "Los editores pueden
   cambiar los permisos y compartir".
5. Enviar.

### Paso 2 — Bloquear todo menos los marcadores

Sin esto, esa persona puede borrar una fórmula sin querer y dañar el torneo.

**Datos → Proteger hojas y rangos → + Añadir una hoja o rango.**

| Hoja | Excepciones (lo único editable) |
|---|---|
| `RESULTADOS` | `D2:E200`, `H2:I200`, `L2:L200` |
| `Eliminación Simple` | `D1:E200`, `H1:I200` |
| Todas las demás | ninguna — bloqueadas enteras |

En cada una: **Establecer permisos → Restringir quién puede editar este rango
→ Solo tú.**

**`FIXTURE_GRUPOS` va bloqueada entera.** Sus columnas D y F no son marcadores:
son las carambolas que cada jugador debe hacer. Si alguien las cambia, cambia
el hándicap de todo el torneo.

### Paso 3 — Avisos

- Con acceso de Editor, esa persona **puede abrir y leer el Apps Script**.
  Revisar que no quede ninguna contraseña escrita dentro del código.
- Si se vuelve a correr el paso 5 o el 7, las protecciones se pierden y hay
  que rehacerlas.
- Desde el celular funciona igual, con la app de Google Sheets.

---

## 5 · Tiempo real (opcional)

Sin nada configurado, la web se refresca **cada 15 segundos**. Eso ya sirve
perfectamente para jugar el torneo.

El módulo **M17** (`apps-script/M17-avisar-a-la-web.gs`) hace que el cambio se
vea **al instante**: cada edición del Sheet le avisa a la web para que bote su
copia guardada.

Para que funcione, la misma clave tiene que estar en **dos sitios**:

| Dónde | Cómo se llama | Cómo llegar |
|---|---|---|
| Vercel | `REVALIDATE_TOKEN` | Proyecto → Settings → Environment Variables |
| Apps Script | `REVALIDATE_TOKEN` | Rueda ⚙ → Propiedades de script |

**El valor está en `CLAVES-TORNEO.txt`, no aquí.**

Después de crear o cambiar la variable en Vercel hay que **Redeploy**
(Deployments → ⋯ del primero que diga *Production* → Redeploy), porque si no,
no entra en funcionamiento.

El activador se llama `onEditAvisarWeb` (reloj ⏰ → Añadir activador → "Desde
la hoja de cálculo" → "Al editar"). Lo instala Omar con su cuenta, pero se
dispara con la edición de **cualquier** persona que tenga acceso.

Para comprobarlo: en el editor, ejecutar la función `AvisarALaWebAhora`. Debe
decir *"La web quedó avisada"*.

---

## 6 · Si algo falla

| Síntoma | Causa más probable | Qué hacer |
|---|---|---|
| La web no muestra un marcador recién digitado | Los 15 s de refresco | Esperar y recargar |
| La web muestra datos de otro torneo | El Sheet no es el que cree | Comprobar el ID en `app/lib/sheets.ts` |
| Una página dice «no hay datos» con la hoja llena | Google devolvió otra pestaña | Meter el gid de esa pestaña en `SHEET_GIDS` |
| `AvisarALaWebAhora` da error | La clave no es idéntica en los dos lados | Revisar espacios sobrantes al final |
| `#DIV/0!` en un promedio | Entradas en 0 sin ser W.O. | Revisar la fila |
| Un partido sin jugar aparece como EMPATE | Fórmula vieja de la columna K | Correr el paso 5 (solo antes de empezar) |
| La web se ve en blanco | Un despliegue falló | Vercel → Deployments → mirar el último |
| Alguien no puede escribir en una celda | Está protegida | Revisar las excepciones del punto 4 |

---

## 7 · Para el torneo siguiente

Todo está automatizado para cualquier número de jugadores. Lo que hay que
cambiar:

- **`Base de Datos`**: los jugadores nuevos y sus categorías.
- **`CONFIGURACION`**: número de grupos, nombre del torneo, etc.
- **`FIXTURE_GRUPOS` columnas G y H**: las fechas y horas de los partidos de
  grupos. La hoja `Calendario` sale de ahí.
- **Arriba de `M7-M9-eliminacion-simple.gs`**, los ajustes de la eliminación:

```javascript
var ELIM_FECHA = "18/09/2026";       // día del cuadro ("" = sin fecha)
var ELIM_HORA_INICIO = 17;           // 17 = 5:00 p. m.
var ELIM_MESAS = 5;                  // mesas a la vez
var ELIM_HORAS_POR_PARTIDA = 1;
var ELIM_HORA_FIN = 23;              // si no cabe, sigue al día siguiente
```

Y luego correr los pasos del 1 al 8 en orden.

---

## 8 · Dónde está cada código

| Archivo | Qué hace |
|---|---|
| `apps-script/M5-resultados.gs` | Crea `RESULTADOS` con sus 16 columnas |
| `apps-script/M7-M9-eliminacion-simple.gs` | El cuadro completo de eliminación |
| `apps-script/M17-avisar-a-la-web.gs` | Tiempo real (opcional) |
| `apps-script/M18-calendario.gs` | La hoja `Calendario` |
| `app/lib/sheets.ts` | Cómo la web lee el Sheet |
| `app/lib/parsers.ts` | Cómo interpreta cada hoja |
| `app/lib/calendar.ts` | Arma el calendario de la web |
| `NOTAS-CAMBIOS-SHEET.md` | Historial de todo lo que se arregló y por qué |

El detalle técnico de cada arreglo está en `NOTAS-CAMBIOS-SHEET.md`.
