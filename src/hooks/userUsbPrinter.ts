import { useState, useCallback } from 'react';
import { CartItem } from '../types';

export const useUsbPrinter = () => {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    if (!navigator.serial) return alert("Navegador no compatible. Usa Chrome/Edge.");
    try {
      const p = await navigator.serial.requestPort();
      await p.open({ baudRate: 9600 });
      setPort(p);
      setIsConnected(true);
    } catch (err) {
      console.error("Error conectando impresora:", err);
    }
  };

  const printReceipt = useCallback(async (items: CartItem[], total: number, method: string) => {
    if (!port || !port.writable) return;

    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();
    const date = new Date().toLocaleTimeString('es-CL');
    
    // Función helper para centrar texto (asumiendo 32 caracteres de ancho)
    const center = (str: string) => {
      const spaces = Math.max(0, (32 - str.length) / 2);
      return ' '.repeat(Math.floor(spaces)) + str + '\n';
    };

    // Formatear items
    let itemsText = '';
    items.forEach(item => {
      // Formato: 2x Churrasco...... $13000
      const left = `${item.qty}x ${item.name}`;
      const right = `$${(item.price * item.qty).toLocaleString('es-CL')}`;
      const dots = ' '.repeat(Math.max(1, 32 - left.length - right.length)); 
      itemsText += `${left}${dots}${right}\n`;
    });

    const ticket = 
      center("EL CARRO DEL OCHO") +
      center("--- Sandwicheria ---") +
      "\n" +
      `Fecha: ${date}\n` +
      "--------------------------------\n" +
      itemsText +
      "--------------------------------\n" +
      `TOTAL:          $${total.toLocaleString('es-CL')}\n` +
      `PAGO:           ${method.toUpperCase()}\n` +
      "--------------------------------\n" +
      center("Gracias por su preferencia") +
      "\n\n\n" + // Espacio para cortar
      "\x1D\x56\x41\x00"; // Comando ESC/POS Cortar Papel

    await writer.write(encoder.encode(ticket));
    writer.releaseLock();
  }, [port]);

  return { connect, isConnected, printReceipt };
};