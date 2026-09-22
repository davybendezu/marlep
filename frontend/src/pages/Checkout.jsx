import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { fetchYapeConfig, createOrder } from '../api.js';
import YapeQR from '../components/YapeQR.jsx';

const SHIPPING_COST = 8;

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [yapeConfig, setYapeConfig] = useState({ titular: 'Marlep Cosmetics', numero: '999 999 999' });
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryMethod: 'delivery',
    deliveryAddress: '',
    deliveryDistrict: '',
    notes: '',
    yapeOperationCode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showComprobanteHelp, setShowComprobanteHelp] = useState(false);

  useEffect(() => {
    fetchYapeConfig().then(setYapeConfig);
  }, []);

  const shippingCost = form.deliveryMethod === 'pickup' ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (items.length === 0) return;
    if (!form.yapeOperationCode.trim()) {
      setError('Ingresa el codigo/numero de operacion de tu pago Yape para poder verificarlo.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder({
        ...form,
        items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      });
      clearCart();
      navigate(`/pedido/${result.orderCode}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h2 className="text-2xl font-bold text-leaf-700">Tu carrito esta vacio</h2>
        <p className="mt-2 text-leaf-700/70">Agrega productos antes de continuar con el pago.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Ver productos</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold text-leaf-700">Finalizar compra</h1>
      <p className="mt-1 text-leaf-700/70">Paga con Yape y confirma tu pedido en un par de pasos.</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-honey-500/10">
          <div>
            <h2 className="font-display text-lg font-semibold text-leaf-700">Datos de contacto</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <input
                required
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Nombre completo"
                className="rounded-xl border border-honey-500/30 px-4 py-2.5 text-sm focus:border-leaf-600 focus:outline-none"
              />
              <input
                required
                name="customerPhone"
                value={form.customerPhone}
                onChange={handleChange}
                placeholder="Celular / WhatsApp"
                className="rounded-xl border border-honey-500/30 px-4 py-2.5 text-sm focus:border-leaf-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-leaf-700">Entrega</h2>
            <div className="mt-3 flex gap-3">
              <label className={`chip flex-1 text-center ${form.deliveryMethod === 'pickup' ? 'chip-active' : 'bg-cream-50'}`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={form.deliveryMethod === 'pickup'}
                  onChange={handleChange}
                  className="hidden"
                />
                Recojo en tienda
              </label>
              <label className={`chip flex-1 text-center ${form.deliveryMethod === 'delivery' ? 'chip-active' : 'bg-cream-50'}`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="delivery"
                  checked={form.deliveryMethod === 'delivery'}
                  onChange={handleChange}
                  className="hidden"
                />
                Delivery (S/ {SHIPPING_COST.toFixed(2)})
              </label>
            </div>

            {form.deliveryMethod === 'delivery' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  required
                  name="deliveryAddress"
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  placeholder="Direccion completa"
                  className="rounded-xl border border-honey-500/30 px-4 py-2.5 text-sm focus:border-leaf-600 focus:outline-none sm:col-span-2"
                />
                <input
                  name="deliveryDistrict"
                  value={form.deliveryDistrict}
                  onChange={handleChange}
                  placeholder="Distrito"
                  className="rounded-xl border border-honey-500/30 px-4 py-2.5 text-sm focus:border-leaf-600 focus:outline-none"
                />
              </div>
            )}

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notas para tu pedido (opcional)"
              rows={2}
              className="mt-4 w-full rounded-xl border border-honey-500/30 px-4 py-2.5 text-sm focus:border-leaf-600 focus:outline-none"
            />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-leaf-700">Pago con Yape</h2>
            <p className="mt-1 text-sm text-leaf-700/70">1) Escanea el codigo QR y paga S/ {total.toFixed(2)}.</p>
            <p className="text-sm text-leaf-700/70">2) Copia el numero de operacion que te muestra Yape y pegalo aqui abajo para verificar tu pago.</p>
            <input
              required
              name="yapeOperationCode"
              value={form.yapeOperationCode}
              onChange={handleChange}
              onFocus={() => setShowComprobanteHelp(true)}
              placeholder="Numero / codigo de operacion Yape"
              className="mt-3 w-full rounded-xl border border-honey-500/30 px-4 py-2.5 text-sm focus:border-leaf-600 focus:outline-none"
            />

            {showComprobanteHelp && (
              <div className="mt-3 rounded-xl border border-honey-500/30 bg-cream-50 p-3">
                <p className="text-xs text-leaf-700/70">
                  Copia los datos resaltados de tu comprobante Yape (como en el ejemplo):
                </p>
                <img
                  src="/images/yapeComprobante.png"
                  alt="Ejemplo de donde copiar el numero de operacion en el comprobante de Yape"
                  className="mt-2 w-full max-w-xs rounded-lg border border-honey-500/20"
                />
              </div>
            )}
          </div>

          {error && <p className="text-sm font-medium text-blush-500">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Enviando pedido...' : `Confirmar pedido · S/ ${total.toFixed(2)}`}
          </button>
        </form>

        <div className="space-y-6">
          <YapeQR titular={yapeConfig.titular} numero={yapeConfig.numero} monto={total} />

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-honey-500/10">
            <h2 className="font-display text-lg font-semibold text-leaf-700">Resumen del pedido</h2>
            <ul className="mt-3 space-y-2 text-sm text-leaf-700/80">
              {items.map((item) => (
                <li key={item.variantId} className="flex justify-between">
                  <span>
                    {item.productName} ({item.sizeLabel}) x{item.quantity}
                  </span>
                  <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-cream-100 pt-3 text-sm">
              <div className="flex justify-between text-leaf-700/70">
                <span>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              {form.deliveryMethod !== 'pickup' && (
                <div className="flex justify-between text-leaf-700/70">
                  <span>Envio</span>
                  <span>{shippingCost === 0 ? 'Gratis' : `S/ ${shippingCost.toFixed(2)}`}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-leaf-700">
                <span>Total</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
