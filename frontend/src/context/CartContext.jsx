import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
// v2: cada item lleva fragancia; los carritos v1 (sin fragancia) se descartan.
const STORAGE_KEY = 'marlep_cart_v2';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Una misma presentacion puede ir en el carrito con distintas fragancias,
// asi que cada linea se identifica por variante + fragancia.
function itemKey(variantId, fragrance) {
  return `${variantId}-${fragrance}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product, variant, fragrance, quantity = 1) {
    const key = itemKey(variant.id, fragrance);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...prev,
        {
          key,
          variantId: variant.id,
          fragrance,
          productSlug: product.slug,
          productName: product.name,
          imageUrl: product.image_url,
          sizeLabel: variant.size_label,
          price: Number(variant.price),
          stock: variant.stock,
          quantity,
        },
      ];
    });
    setIsOpen(true);
  }

  function updateQuantity(key, quantity) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity } : i))
    );
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = {
    items,
    isOpen,
    setIsOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
