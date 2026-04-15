Attribute VB_Name = "ModFiltrarFilas"
Sub FiltrarFilasPorBusqueda()

    Dim cantidadPalabras As Long
    Dim palabras() As String
    Dim filaInicioTitulos As Long
    Dim filaFinTitulos As Long
    Dim hojaOrigen As Worksheet
    Dim hojaEncontrados As Worksheet
    Dim hojaNoEncontrados As Worksheet
    Dim ultimaFila As Long
    Dim ultimaColumna As Long
    Dim filaEncontrados As Long
    Dim filaNoEncontrados As Long
    Dim i As Long
    Dim j As Long
    Dim k As Long
    Dim encontrado As Boolean
    Dim celda As String
    Dim numFilasTitulos As Long
    Dim inputTemp As String
    Dim listaPalabras As String

    inputTemp = InputBox("Cuantas palabras o codigos deseas buscar?" & vbCrLf & vbCrLf & "Se filtraran las filas que contengan CUALQUIERA de ellas." & vbCrLf & "(Si una fila tiene mas de una, solo aparecera una vez)", "Cantidad de palabras", "1")

    If Len(Trim(inputTemp)) = 0 Then
        MsgBox "Cancelado.", vbExclamation, "Cancelado"
        Exit Sub
    End If

    cantidadPalabras = CLng(inputTemp)

    If cantidadPalabras < 1 Then
        MsgBox "Debe buscar al menos 1 palabra.", vbExclamation, "Error"
        Exit Sub
    End If

    ReDim palabras(1 To cantidadPalabras)
    listaPalabras = ""

    For k = 1 To cantidadPalabras
        If listaPalabras = "" Then
            palabras(k) = InputBox("Escribe la palabra o codigo #" & k & " de " & cantidadPalabras & ":", "Palabra " & k & " de " & cantidadPalabras)
        Else
            palabras(k) = InputBox("Escribe la palabra o codigo #" & k & " de " & cantidadPalabras & ":" & vbCrLf & vbCrLf & "Ya ingresadas: " & listaPalabras, "Palabra " & k & " de " & cantidadPalabras)
        End If

        If Len(Trim(palabras(k))) = 0 Then
            MsgBox "No se ingreso la palabra #" & k & ". Macro cancelada.", vbExclamation, "Cancelado"
            Exit Sub
        End If

        If listaPalabras = "" Then
            listaPalabras = palabras(k)
        Else
            listaPalabras = listaPalabras & ", " & palabras(k)
        End If
    Next k

    inputTemp = InputBox("En que fila INICIAN los titulos (encabezados)?" & vbCrLf & vbCrLf & "Ejemplo: si los titulos estan en la fila 1, escribe 1", "Fila inicio de titulos", "1")

    If Len(Trim(inputTemp)) = 0 Then
        MsgBox "Cancelado.", vbExclamation, "Cancelado"
        Exit Sub
    End If
    filaInicioTitulos = CLng(inputTemp)

    inputTemp = InputBox("En que fila TERMINAN los titulos (encabezados)?" & vbCrLf & vbCrLf & "Si solo hay una fila de titulos, escribe el mismo numero." & vbCrLf & "Ejemplo: si van de la fila 1 a la 3, escribe 3", "Fila fin de titulos", CStr(filaInicioTitulos))

    If Len(Trim(inputTemp)) = 0 Then
        MsgBox "Cancelado.", vbExclamation, "Cancelado"
        Exit Sub
    End If
    filaFinTitulos = CLng(inputTemp)

    If filaInicioTitulos > filaFinTitulos Then
        MsgBox "La fila de inicio no puede ser mayor que la fila de fin.", vbExclamation, "Error"
        Exit Sub
    End If

    numFilasTitulos = filaFinTitulos - filaInicioTitulos + 1

    Set hojaOrigen = ActiveSheet

    ultimaFila = hojaOrigen.UsedRange.Row + hojaOrigen.UsedRange.Rows.Count - 1
    ultimaColumna = hojaOrigen.UsedRange.Column + hojaOrigen.UsedRange.Columns.Count - 1

    If ultimaFila <= filaFinTitulos Then
        MsgBox "No hay datos despues de los titulos.", vbExclamation, "Sin datos"
        Exit Sub
    End If

    Application.DisplayAlerts = False
    On Error Resume Next
    ThisWorkbook.Sheets("Encontrados").Delete
    ThisWorkbook.Sheets("No encontrados").Delete
    On Error GoTo 0
    Application.DisplayAlerts = True

    Set hojaEncontrados = ThisWorkbook.Sheets.Add(After:=hojaOrigen)
    hojaEncontrados.Name = "Encontrados"

    Set hojaNoEncontrados = ThisWorkbook.Sheets.Add(After:=hojaEncontrados)
    hojaNoEncontrados.Name = "No encontrados"

    For j = 1 To ultimaColumna
        hojaEncontrados.Columns(j).ColumnWidth = hojaOrigen.Columns(j).ColumnWidth
        hojaNoEncontrados.Columns(j).ColumnWidth = hojaOrigen.Columns(j).ColumnWidth
    Next j

    For i = filaInicioTitulos To filaFinTitulos
        hojaOrigen.Rows(i).Copy
        hojaEncontrados.Rows(i - filaInicioTitulos + 1).PasteSpecial xlPasteAll
        hojaEncontrados.Rows(i - filaInicioTitulos + 1).RowHeight = hojaOrigen.Rows(i).RowHeight
        hojaOrigen.Rows(i).Copy
        hojaNoEncontrados.Rows(i - filaInicioTitulos + 1).PasteSpecial xlPasteAll
        hojaNoEncontrados.Rows(i - filaInicioTitulos + 1).RowHeight = hojaOrigen.Rows(i).RowHeight
    Next i
    Application.CutCopyMode = False

    filaEncontrados = numFilasTitulos + 1
    filaNoEncontrados = numFilasTitulos + 1

    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual

    For i = filaFinTitulos + 1 To ultimaFila
        encontrado = False

        For j = 1 To ultimaColumna
            celda = CStr(hojaOrigen.Cells(i, j).Value)
            For k = 1 To cantidadPalabras
                If InStr(1, celda, palabras(k), vbTextCompare) > 0 Then
                    encontrado = True
                    Exit For
                End If
            Next k
            If encontrado Then Exit For
        Next j

        If encontrado Then
            hojaOrigen.Range(hojaOrigen.Cells(i, 1), hojaOrigen.Cells(i, ultimaColumna)).Copy
            hojaEncontrados.Cells(filaEncontrados, 1).PasteSpecial xlPasteValues
            hojaEncontrados.Cells(filaEncontrados, 1).PasteSpecial xlPasteFormats
            With hojaEncontrados.Range(hojaEncontrados.Cells(filaEncontrados, 1), hojaEncontrados.Cells(filaEncontrados, ultimaColumna))
                .HorizontalAlignment = xlJustify
                .VerticalAlignment = xlCenter
                .WrapText = True
            End With
            filaEncontrados = filaEncontrados + 1
        Else
            hojaOrigen.Range(hojaOrigen.Cells(i, 1), hojaOrigen.Cells(i, ultimaColumna)).Copy
            hojaNoEncontrados.Cells(filaNoEncontrados, 1).PasteSpecial xlPasteValues
            hojaNoEncontrados.Cells(filaNoEncontrados, 1).PasteSpecial xlPasteFormats
            With hojaNoEncontrados.Range(hojaNoEncontrados.Cells(filaNoEncontrados, 1), hojaNoEncontrados.Cells(filaNoEncontrados, ultimaColumna))
                .HorizontalAlignment = xlJustify
                .VerticalAlignment = xlCenter
                .WrapText = True
            End With
            filaNoEncontrados = filaNoEncontrados + 1
        End If
    Next i

    Application.CutCopyMode = False

    If filaEncontrados > numFilasTitulos + 1 Then
        hojaEncontrados.Range(hojaEncontrados.Rows(numFilasTitulos + 1), hojaEncontrados.Rows(filaEncontrados - 1)).EntireRow.AutoFit
    End If
    If filaNoEncontrados > numFilasTitulos + 1 Then
        hojaNoEncontrados.Range(hojaNoEncontrados.Rows(numFilasTitulos + 1), hojaNoEncontrados.Rows(filaNoEncontrados - 1)).EntireRow.AutoFit
    End If

    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True

    hojaOrigen.Activate

    MsgBox "Busqueda completada para: " & listaPalabras & vbCrLf & vbCrLf & "Titulos copiados: filas " & filaInicioTitulos & " a " & filaFinTitulos & vbCrLf & "Filas encontradas: " & (filaEncontrados - numFilasTitulos - 1) & vbCrLf & "Filas no encontradas: " & (filaNoEncontrados - numFilasTitulos - 1) & vbCrLf & vbCrLf & "Hojas creadas:" & vbCrLf & " - Encontrados (filas que coinciden)" & vbCrLf & " - No encontrados (el resto)", vbInformation, "Resultado"

End Sub
