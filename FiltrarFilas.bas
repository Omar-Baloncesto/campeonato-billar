Attribute VB_Name = "ModFiltrarFilas"
'===============================================================================
' Macro: FiltrarFilasPorBusqueda
' Descripcion: Busca un texto en todas las filas de la hoja activa y separa
'              los resultados en dos hojas nuevas:
'              - "Encontrados": filas que contienen el texto buscado
'              - "No encontrados": filas que NO contienen el texto buscado
'              Ambas hojas incluyen la fila de titulos (fila 1).
'              La hoja original permanece intacta.
'===============================================================================
Sub FiltrarFilasPorBusqueda()

    Dim textoBuscar As String
    Dim hojaOrigen As Worksheet
    Dim hojaEncontrados As Worksheet
    Dim hojaNoEncontrados As Worksheet
    Dim ultimaFila As Long
    Dim ultimaColumna As Long
    Dim filaEncontrados As Long
    Dim filaNoEncontrados As Long
    Dim i As Long
    Dim j As Long
    Dim encontrado As Boolean
    Dim celda As String
    Dim nombreEncontrados As String
    Dim nombreNoEncontrados As String
    Dim alturaEstandar As Double

    ' --- Pedir al usuario el texto a buscar ---
    textoBuscar = InputBox( _
        "Escribe la palabra o codigo que deseas buscar:" & vbCrLf & vbCrLf & _
        "Se buscara en TODAS las columnas de cada fila.", _
        "Filtrar filas por busqueda")

    ' Si el usuario cancela o no escribe nada, salir
    If Len(Trim(textoBuscar)) = 0 Then
        MsgBox "No se ingreso ningun texto. La macro se ha cancelado.", _
               vbExclamation, "Cancelado"
        Exit Sub
    End If

    ' --- Referencia a la hoja activa (origen) ---
    Set hojaOrigen = ActiveSheet

    ' Determinar el rango REAL de datos usando UsedRange
    ' Esto garantiza que se capturen TODAS las columnas y filas con datos
    ultimaFila = hojaOrigen.UsedRange.Row + hojaOrigen.UsedRange.Rows.Count - 1
    ultimaColumna = hojaOrigen.UsedRange.Column + hojaOrigen.UsedRange.Columns.Count - 1

    ' Validar que haya datos
    If ultimaFila < 2 Then
        MsgBox "La hoja activa no tiene datos suficientes (se necesitan al menos " & _
               "titulos en la fila 1 y datos a partir de la fila 2).", _
               vbExclamation, "Sin datos"
        Exit Sub
    End If

    ' --- Nombres para las hojas nuevas ---
    nombreEncontrados = "Encontrados"
    nombreNoEncontrados = "No encontrados"

    ' Eliminar hojas previas si existen (para poder re-ejecutar)
    Application.DisplayAlerts = False
    On Error Resume Next
    ThisWorkbook.Sheets(nombreEncontrados).Delete
    ThisWorkbook.Sheets(nombreNoEncontrados).Delete
    On Error GoTo 0
    Application.DisplayAlerts = True

    ' --- Crear las dos hojas nuevas ---
    Set hojaEncontrados = ThisWorkbook.Sheets.Add(After:=hojaOrigen)
    hojaEncontrados.Name = nombreEncontrados

    Set hojaNoEncontrados = ThisWorkbook.Sheets.Add(After:=hojaEncontrados)
    hojaNoEncontrados.Name = nombreNoEncontrados

    ' --- Copiar anchos de columna del origen a ambas hojas ---
    For j = 1 To ultimaColumna
        hojaEncontrados.Columns(j).ColumnWidth = hojaOrigen.Columns(j).ColumnWidth
        hojaNoEncontrados.Columns(j).ColumnWidth = hojaOrigen.Columns(j).ColumnWidth
    Next j

    ' --- Copiar los titulos (fila 1) solo valores y formato ---
    hojaOrigen.Range(hojaOrigen.Cells(1, 1), hojaOrigen.Cells(1, ultimaColumna)).Copy
    hojaEncontrados.Cells(1, 1).PasteSpecial xlPasteAll
    hojaOrigen.Range(hojaOrigen.Cells(1, 1), hojaOrigen.Cells(1, ultimaColumna)).Copy
    hojaNoEncontrados.Cells(1, 1).PasteSpecial xlPasteAll
    Application.CutCopyMode = False

    ' Altura estandar para las filas de datos (15 puntos es el estandar de Excel)
    alturaEstandar = 15

    ' Ajustar altura de la fila de titulos igual en ambas hojas
    hojaEncontrados.Rows(1).RowHeight = hojaOrigen.Rows(1).RowHeight
    hojaNoEncontrados.Rows(1).RowHeight = hojaOrigen.Rows(1).RowHeight

    ' Contadores de filas en las hojas destino (empiezan en 2 por los titulos)
    filaEncontrados = 2
    filaNoEncontrados = 2

    ' --- Desactivar actualizacion de pantalla para mayor velocidad ---
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual

    ' --- Recorrer cada fila de datos (desde fila 2 hasta la ultima) ---
    For i = 2 To ultimaFila
        encontrado = False

        ' Revisar cada celda de la fila en TODAS las columnas
        For j = 1 To ultimaColumna
            celda = CStr(hojaOrigen.Cells(i, j).Value)

            ' Busqueda sin distinguir mayusculas/minusculas
            If InStr(1, celda, textoBuscar, vbTextCompare) > 0 Then
                encontrado = True
                Exit For
            End If
        Next j

        ' Copiar la fila completa (todas las columnas) a la hoja correspondiente
        If encontrado Then
            hojaOrigen.Range(hojaOrigen.Cells(i, 1), hojaOrigen.Cells(i, ultimaColumna)).Copy
            hojaEncontrados.Cells(filaEncontrados, 1).PasteSpecial xlPasteValues
            hojaEncontrados.Cells(filaEncontrados, 1).PasteSpecial xlPasteFormats
            hojaEncontrados.Rows(filaEncontrados).RowHeight = alturaEstandar
            filaEncontrados = filaEncontrados + 1
        Else
            hojaOrigen.Range(hojaOrigen.Cells(i, 1), hojaOrigen.Cells(i, ultimaColumna)).Copy
            hojaNoEncontrados.Cells(filaNoEncontrados, 1).PasteSpecial xlPasteValues
            hojaNoEncontrados.Cells(filaNoEncontrados, 1).PasteSpecial xlPasteFormats
            hojaNoEncontrados.Rows(filaNoEncontrados).RowHeight = alturaEstandar
            filaNoEncontrados = filaNoEncontrados + 1
        End If
    Next i

    Application.CutCopyMode = False

    ' --- Restaurar configuracion ---
    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True

    ' --- Volver a la hoja original ---
    hojaOrigen.Activate

    ' --- Mensaje final con resumen ---
    MsgBox "Busqueda completada para: """ & textoBuscar & """" & vbCrLf & vbCrLf & _
           "Filas encontradas: " & (filaEncontrados - 2) & vbCrLf & _
           "Filas no encontradas: " & (filaNoEncontrados - 2) & vbCrLf & vbCrLf & _
           "Se crearon las hojas:" & vbCrLf & _
           "  - """ & nombreEncontrados & """ (con las filas que coinciden)" & vbCrLf & _
           "  - """ & nombreNoEncontrados & """ (con el resto de filas)", _
           vbInformation, "Resultado"

End Sub
