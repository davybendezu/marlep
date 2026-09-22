import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { CloseIcon, CartIcon } from './icons.jsx';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-leaf-700/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-honey-500/10 px-5 py-4">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-leaf-700">
            <CartIcon className="h-5 w-5" /> Tu carrito
          </h3>
          <button onClick={() => setIsOpen(false)} className="rounded-full p-1 text-leaf-700 hover:bg-cream-100" aria-label="Cerrar carrito">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-leaf-700/60">Tu carrito esta vacio todavia.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 border-b border-cream-100 pb-4">
                  <img src={item.imageUrl} alt={item.productName} className="h-16 w-16 rounded-xl bg-cream-100 object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-leaf-700">{item.productName}</p>
                    <p className="text-xs text-leaf-700/60">{item.sizeLabel}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-honey-500/40">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2.5 py-0.5 text-leaf-700"
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2.5 py-0.5 text-leaf-700"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-honey-600">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="self-start text-xs font-medium text-blush-500 hover:underline"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-honey-500/10 px-5 py-4">
            <div className="flex items-center justify-between text-sm text-leaf-700/70">
              <span>Subtotal</span>
              <span className="text-lg font-bold text-leaf-700">S/ {subtotal.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-xs text-leaf-700/50">El envio se calcula en el siguiente paso.</p>
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="btn-primary mt-4 block w-full text-center"
            >
              Ir a pagar con Yape
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
