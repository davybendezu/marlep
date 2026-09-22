# Marlep Cosmetics — Tienda Online

Aplicacion web responsiva (React + PostgreSQL) para la venta de cremas artesanales
para manos "Marlep Cosmetics", con catalogo por presentaciones, carrito de compras
y pago mediante QR de Yape con verificacion manual del numero de operacion.

## Estructura

```
marlep/
  backend/     API REST (Node.js + Express + PostgreSQL)
  frontend/    App React (Vite + Tailwind CSS)
```

## 1. Base de datos (PostgreSQL)

1. Crea la base de datos:
   ```
   createdb -U postgres marlep
   ```
2. Ejecuta el esquema y los datos iniciales:
   ```
   psql -U postgres -d marlep -f backend/db/schema.sql
   psql -U postgres -d marlep -f backend/db/seed.sql
   ```

## 2. Backend

```
cd backend
copy .env.example .env      # ajusta usuario/clave de tu PostgreSQL
npm install
npm run dev                 # http://localhost:4000
```

Endpoints principales:
- `GET /api/products` — catalogo con variantes (tamanos y precios)
- `GET /api/products/:slug` — detalle de un producto
- `GET /api/config/yape` — titular/numero Yape a mostrar en el checkout
- `POST /api/orders` — crea un pedido (valida stock y calcula totales en servidor)
- `GET /api/orders/:code` — consulta el estado de un pedido

## 3. Frontend

```
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

El frontend usa el proxy de Vite hacia `http://localhost:4000` para las llamadas a `/api`.
Si el backend/PostgreSQL aun no esta corriendo, la tienda muestra un catalogo de
respaldo (`src/data/fallbackProducts.js`) para poder revisar el diseño igual.

## 4. Codigo QR de Yape — importante

Yape **no ofrece una API publica** para generar codigos QR de cobro de forma
programatica: el QR real de un negocio se obtiene desde la propia app
(Perfil → Mi codigo QR → Compartir) y es una imagen fija asociada a esa cuenta.

Por eso el checkout funciona asi:
1. Exporta tu QR real desde la app Yape y guardalo como
   `frontend/public/images/yape-qr.png`.
2. Mientras ese archivo no exista, la app muestra automaticamente un QR de
   referencia (no valido para cobrar) para que el flujo se pueda probar.
3. El cliente escanea tu QR real, paga y luego escribe el numero de operacion
   en el formulario. El pedido se guarda en PostgreSQL con estado
   `pendiente_pago` para que lo verifiques manualmente y lo cambies a
   `pago_verificado` (por ahora vía SQL/admin directo; no se incluyo un panel
   de administracion en este alcance).

## 5. Personalizacion rapida

- Numero/titular de Yape mostrados en el checkout: variables `YAPE_TITULAR` y
  `YAPE_NUMERO` en `backend/.env`.
- Catalogo (nombres, ingredientes, precios, stock): `backend/db/seed.sql`.
- Costo de envio y distritos con envio gratis: `backend/src/routes/orders.js`
  (`SHIPPING_COST`, `DISTRICTS_WITH_FREE_SHIPPING`) y `frontend/src/pages/Checkout.jsx`
  (`SHIPPING_COST`) — mantenlos sincronizados.
- Numero de WhatsApp de contacto: `frontend/src/components/Footer.jsx` y
  `frontend/src/pages/OrderSuccess.jsx`.

## Pendiente para produccion

- Panel de administracion para verificar pagos y actualizar el estado de pedidos.
- Autenticacion si se requiere historial de pedidos por cliente.
- Despliegue: backend (Node) en un servicio tipo Render/Railway, PostgreSQL
  administrado, y frontend (build estatico de `npm run build`) en Vercel/Netlify
  o el mismo servidor detras de un proxy.
