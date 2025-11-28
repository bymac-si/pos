export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Sandwich' | 'Bebida' | 'Agregado';
}

export interface CartItem extends Product {
  qty: number;
}

export interface SaleOrder {
  items: CartItem[];
  total: number;
  method: 'Efectivo' | 'Tarjeta';
  date: string;
}