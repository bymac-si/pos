import { useState, useMemo } from 'react';
import { MENU } from './data/menu';
import { CartItem, Product } from './types';
import { useUsbPrinter } from './hooks/useUsbPrinter';
import { saveSale } from './services/api';
import { Printer, Trash2, CreditCard, Banknote, RefreshCcw } from 'lucide-react';

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { connect, isConnected, printReceipt } = useUsbPrinter();

  // Calcular total dinámicamente
  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.qty), 0), [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const handleCheckout = async (method: 'Efectivo' | 'Tarjeta') => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      // 1. Imprimir Ticket
      if (isConnected) {
        await printReceipt(cart, total, method);
      } else {
        console.warn("Impresora no conectada, saltando impresión.");
      }

      // 2. Guardar en Google Sheets (No bloqueante visualmente, pero esperamos promesa)
      await saveSale({
        items: cart,
        total,
        method,
        date: new Date().toISOString()
      });

      // 3. Limpiar
      setCart([]);
      alert("¡Venta registrada!"); // Opcional: reemplazar con un Toast notification
    } catch (error) {
      alert("Error al guardar la venta, revisa la conexión.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden text-slate-800 font-sans">
      
      {/* SECCIÓN IZQUIERDA: MENÚ (66%) */}
      <div className="w-2/3 p-4 flex flex-col gap-4">
        <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-orange-600">El Carro del Ocho 🥪</h1>
          <button 
            onClick={connect}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            <Printer size={20} />
            {isConnected ? 'Impresora OK' : 'Conectar Impresora'}
          </button>
        </header>

        {/* Grid de Productos */}
        <div className="grid grid-cols-3 gap-4 overflow-y-auto pb-4">
          {MENU.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all flex flex-col justify-between h-40 border border-transparent hover:border-orange-200"
            >
              <span className="font-bold text-lg text-left leading-tight">{product.name}</span>
              <span className="text-orange-600 font-bold text-xl self-end">
                ${product.price.toLocaleString('es-CL')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN DERECHA: TICKET VIRTUAL (33%) */}
      <div className="w-1/3 bg-white shadow-2xl flex flex-col border-l border-gray-200">
        <div className="p-6 bg-slate-800 text-white">
          <h2 className="text-xl font-bold">Orden Actual</h2>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">Selecciona productos...</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div>
                  <div className="font-bold">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.qty} x ${item.price.toLocaleString('es-CL')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">${(item.price * item.qty).toLocaleString('es-CL')}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totales y Botones de Pago */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-end mb-6">
            <span className="text-gray-600 text-lg">Total a Pagar</span>
            <span className="text-4xl font-black text-slate-800">${total.toLocaleString('es-CL')}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              disabled={loading || cart.length === 0}
              onClick={() => handleCheckout('Efectivo')}
              className="flex flex-col items-center justify-center gap-2 bg-green-600 text-white py-6 rounded-xl hover:bg-green-700 active:bg-green-800 disabled:opacity-50 transition-colors"
            >
              {loading ? <RefreshCcw className="animate-spin" /> : <Banknote size={32} />}
              <span className="font-bold text-lg">EFECTIVO</span>
            </button>

            <button
              disabled={loading || cart.length === 0}
              onClick={() => handleCheckout('Tarjeta')}
              className="flex flex-col items-center justify-center gap-2 bg-blue-600 text-white py-6 rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {loading ? <RefreshCcw className="animate-spin" /> : <CreditCard size={32} />}
              <span className="font-bold text-lg">TARJETA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;