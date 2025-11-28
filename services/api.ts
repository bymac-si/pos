import { SaleOrder } from '../types';

// REEMPLAZA ESTO CON TU URL DE APPS SCRIPT
const API_URL = "https://script.google.com/macros/s/TU_SCRIPT_ID_AQUI/exec";

export const saveSale = async (sale: SaleOrder) => {
  // Usamos 'no-cors' porque Google Scripts es estricto con CORS.
  // La respuesta será opaca, pero los datos se guardarán.
  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale)
  });
};