import { useEffect, useState } from 'react';
import { WhatsappIcon } from './icons.jsx';
import { fetchYapeConfig } from '../api.js';

export default function Footer() {
  const [yapeConfig, setYapeConfig] = useState({ titular: 'Marlep Cosmetics', numero: '' });

  useEffect(() => {
    fetchYapeConfig().then(setYapeConfig);
  }, []);

  const whatsappNumber = yapeConfig.numero.replace(/\D/g, '');

  return (
    <footer id="contacto" className="mt-20 border-t border-honey-500/20 bg-leaf-700 text-cream-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Marlep Cosmetics" className="h-12 w-12 rounded-full object-cover" />
            <p className="font-display text-lg font-semibold">Marlep Cosmetics</p>
          </div>
          <p className="mt-3 text-sm text-cream-100/80">
            Cremas artesanales para manos, hechas a mano con avena, miel y aceites naturales.
            Suavidad natural, hecha con amor.
          </p>
        </div>

        <div>
          <p className="font-display text-base font-semibold text-honey-400">Contacto</p>
          <ul className="mt-3 space-y-2 text-sm text-cream-100/80">
            <li>WhatsApp: +51 {whatsappNumber || '999 999 999'}</li>
            <li>Instagram: @marlep.cosmetics</li>
            <li>Huancayo, Peru — Delivery y recojo en tienda</li>
          </ul>
          <a
            href={`https://wa.me/51${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-honey-500 px-4 py-2 text-sm font-semibold text-leaf-700 transition hover:bg-honey-400"
          >
            <WhatsappIcon className="h-4 w-4" />
            Escribenos
          </a>
        </div>

        <div>
          <p className="font-display text-base font-semibold text-honey-400">Pagos y envios</p>
          <ul className="mt-3 space-y-2 text-sm text-cream-100/80">
            <li>Pago con Yape (QR) — verificacion manual del pedido.</li>
            <li>Delivery en Huancayo o recojo en tienda.</li>
            <li>Hecho artesanalmente en lotes pequenos.</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-100/10 py-4 text-center text-xs text-cream-100/60">
        © {new Date().getFullYear()} Marlep Cosmetics. Todos los derechos reservados.
      </div>
    </footer>
  );
}
