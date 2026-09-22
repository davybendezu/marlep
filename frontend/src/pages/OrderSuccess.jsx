import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchYapeConfig } from '../api.js';

export default function OrderSuccess() {
  const { code } = useParams();
  const [yapeConfig, setYapeConfig] = useState({ titular: 'Marlep Cosmetics', numero: '' });

  useEffect(() => {
    fetchYapeConfig().then(setYapeConfig);
  }, []);

  const whatsappNumber = yapeConfig.numero.replace(/\D/g, '');

  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-leaf-600 text-3xl text-white">✓</div>
      <h1 className="mt-6 text-3xl font-bold text-leaf-700">¡Pedido recibido!</h1>
      <p className="mt-2 max-w-md text-leaf-700/70">
        Tu numero de pedido es <span className="font-semibold text-honey-600">{code}</span>.
        Estamos verificando tu pago Yape y te confirmaremos por WhatsApp en breve.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={`https://wa.me/51${whatsappNumber}?text=Hola%2C%20quiero%20confirmar%20mi%20pedido%20${code}`}
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
        >
          Enviar comprobante por WhatsApp
        </a>
        <Link to="/" className="btn-secondary">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
