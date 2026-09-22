import { fallbackProducts } from './data/fallbackProducts.js';

const API_BASE = '/api';

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('API no disponible');
    return await res.json();
  } catch (err) {
    console.warn('Usando catalogo local: la API/PostgreSQL no responde todavia.', err.message);
    return fallbackProducts;
  }
}

export async function fetchYapeConfig() {
  try {
    const res = await fetch(`${API_BASE}/config/yape`);
    if (!res.ok) throw new Error('API no disponible');
    return await res.json();
  } catch {
    return { titular: 'Marlep Cosmetics', numero: '999 999 999' };
  }
}

export async function createOrder(payload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'No se pudo registrar el pedido');
  }
  return data;
}
