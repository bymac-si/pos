// Code.gs
function doPost(e) {
  // 1. Bloque de seguridad y parseo
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 2. Conectar con la Hoja
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ventas");
    
    // 3. Generar Fecha y ID (si no viene del front)
    const fecha = new Date();
    // ID simple basado en timestamp para evitar duplicados rápidos
    const idOrden = data.id || `ORD-${Date.now().toString().slice(-6)}`; 

    // 4. Formatear el detalle de la venta (Array a String para que quepa en una celda)
    // Ejemplo entrada: [{item: "Churrasco", qty: 2}, ...] -> "2x Churrasco, ..."
    const detalleString = data.items.map(p => `${p.qty}x ${p.nombre}`).join(", ");

    // 5. Guardar en la fila
    sheet.appendRow([
      fecha,              // Columna A: Fecha completa
      idOrden,            // Columna B: ID
      data.mesa || "Barra", // Columna C: Mesa o Cliente
      detalleString,      // Columna D: Resumen pedido
      data.total,         // Columna E: Monto
      data.metodoPago     // Columna F: 'Efectivo' o 'Tarjeta'
    ]);

    // 6. Responder éxito a React
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      id: idOrden 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Manejo de errores
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}