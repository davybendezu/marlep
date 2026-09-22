import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { CloseIcon } from './icons.jsx';

export default function ProductModal({ product, onClose }) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  function handleAdd() {
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => onClose(), 700);
  }

  const outOfStock = selectedVariant.stock <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-leaf-700/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-soft sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-honey-500/10 bg-white px-5 py-4">
          <h3 className="font-display text-lg font-semibold text-leaf-700">{product.name}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-leaf-700 hover:bg-cream-100" aria-label="Cerrar">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2">
          <img src={product.image_url} alt={product.name} className="mx-auto w-full max-w-xs rounded-2xl bg-cream-100 object-cover" />

          <div>
            <p className="text-sm text-leaf-700/80">{product.description}</p>

            <div className="mt-5">
              <p className="text-sm font-semibold text-leaf-700">Elige tu tamano</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={variant.stock <= 0}
                    className={`chip ${selectedVariant.id === variant.id ? 'chip-active' : 'bg-cream-50'} ${
                      variant.stock <= 0 ? 'opacity-40 line-through' : ''
                    }`}
                  >
                    {variant.size_label} · {variant.size_grams}g
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-honey-600">S/ {Number(selectedVariant.price).toFixed(2)}</span>
              {selectedVariant.compare_price && Number(selectedVariant.compare_price) > Number(selectedVariant.price) && (
                <span className="text-sm text-leaf-700/50 line-through">
                  S/ {Number(selectedVariant.compare_price).toFixed(2)}
                </span>
              )}
            </div>

            {outOfStock ? (
              <p className="mt-4 text-sm font-semibold text-blush-500">Sin stock en esta presentacion</p>
            ) : (
              <div className="mt-5 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-honey-500/40">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-lg text-leaf-700"
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))}
                    className="px-3 py-1.5 text-lg text-leaf-700"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
                <button onClick={handleAdd} className="btn-primary flex-1">
                  {added ? 'Agregado ✓' : 'Agregar al carrito'}
                </button>
              </div>
            )}

            <details className="mt-6 rounded-xl bg-cream-100 p-3 text-sm text-leaf-700/80">
              <summary className="cursor-pointer font-semibold text-leaf-700">Ingredientes y beneficios</summary>
              <p className="mt-2"><strong>Ingredientes:</strong> {product.ingredients}</p>
              <p className="mt-2"><strong>Beneficios:</strong> {product.benefits}</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
