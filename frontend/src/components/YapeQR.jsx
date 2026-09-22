import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Yape no publica una API/formato oficial para generar codigos QR de cobro
 * de forma programatica: el QR real de un negocio se obtiene desde la propia
 * app Yape (Perfil > Mi codigo QR > Compartir) y es una imagen fija.
 *
 * Este componente intenta mostrar esa imagen real si el dueno de la tienda
 * la coloca en frontend/public/images/yape-qr.jpeg. Si todavia no existe,
 * muestra un QR generado como referencia visual (no valido para cobrar) y
 * deja claro que debe reemplazarse.
 */
export default function YapeQR({ titular, numero, monto }) {
  const [realQrFailed, setRealQrFailed] = useState(false);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-honey-500/30 bg-white p-5 text-center">
      <p className="text-sm font-semibold text-leaf-700">Escanea y paga con Yape</p>

      <div className="mt-3 flex h-48 w-48 items-center justify-center rounded-xl bg-cream-100 p-3">
        {!realQrFailed ? (
          <img
            src="/images/yape-qr.png"
            alt={`Codigo QR de Yape de ${titular}`}
            className="h-full w-full object-contain"
            onError={() => setRealQrFailed(true)}
          />
        ) : (
          <QRCodeSVG value={`Yape:${numero}:${monto.toFixed(2)}`} size={160} fgColor="#4B5E4E" />
        )}
      </div>

      {realQrFailed && (
        <p className="mt-2 max-w-xs text-xs text-blush-500">
          QR de referencia. Reemplaza <code>frontend/public/images/yape-qr.jpeg</code> con la
          captura real de tu Yape (Perfil → Mi codigo QR → Compartir) para cobros validos.
        </p>
      )}

      <p className="mt-3 text-sm text-leaf-700/80">
        Titular: <span className="font-semibold">{titular}</span>
      </p>
      <p className="text-sm text-leaf-700/80">
        Numero Yape: <span className="font-semibold">{numero}</span>
      </p>
      <p className="mt-2 text-lg font-bold text-honey-600">Monto: S/ {monto.toFixed(2)}</p>
    </div>
  );
}
