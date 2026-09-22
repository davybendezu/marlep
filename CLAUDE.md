# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Lo solicitado

Tienda online para **Marlep Cosmetics**, marca peruana de cremas artesanales para
manos (avena, miel, vainilla). Requisitos originales del proyecto:

- Aplicacion web moderna y responsiva (laptop, tablet, celular).
- Catalogo de productos inspirado en la pagina de listado de Pond's (filtros por
  linea de producto, grilla de tarjetas, selector de presentacion/tamano).
- Carrito de compras.
- Checkout de pago mediante **QR de Yape** (billetera movil peruana), con
  verificacion manual del pago (Yape no expone una API publica de cobro).
- Stack: React en el frontend y PostgreSQL como base de datos.

## Arquitectura

Monorepo con dos aplicaciones independientes que se comunican por HTTP:

```
marlep/
  backend/    API REST — Node.js (ESM) + Express + PostgreSQL (pg)
  frontend/   SPA — React 18 + Vite + Tailwind CSS + react-router-dom
  imagen/     Artes originales de la marca (fuente de los assets en frontend/public/images)
```

### Backend (`backend/`)

- `src/db.js` — pool de conexion `pg`, configurado por variables de entorno (`PGHOST`, `PGPORT`, etc.).
- `src/routes/products.js` — `GET /api/products` y `GET /api/products/:slug`. Cada producto trae sus `variants` (presentaciones/tamanos) embebidas en la respuesta.
- `src/routes/orders.js` — `POST /api/orders` crea el pedido dentro de una transaccion (`BEGIN`/`COMMIT`/`ROLLBACK`): bloquea las filas de `product_variants` con `FOR UPDATE`, **recalcula precios y stock desde la base de datos** (nunca confia en el precio enviado por el cliente), inserta `orders` + `order_items` y descuenta stock. `GET /api/orders/:code` consulta el estado de un pedido.
- `src/index.js` — arma la app Express, expone `GET /api/health` y `GET /api/config/yape` (titular/numero mostrados en el checkout, via env vars `YAPE_TITULAR`/`YAPE_NUMERO`).
- Modelo de datos (`db/schema.sql`): todas las tablas viven en el esquema de PostgreSQL `productos` (no en `public`): `productos.products` (1) → `productos.product_variants` (N, un registro por combinacion tamano/precio/stock) y `productos.orders` (1) → `productos.order_items` (N, snapshot de precio/nombre al momento de la compra, independiente de cambios futuros en `product_variants`). El pool de `pg` (`src/db.js`) fija `search_path=productos,public` (configurable via `PGSCHEMA`), asi que las queries de las rutas usan los nombres de tabla sin prefijo.
- `db/seed.sql` — catalogo real: 3 fragancias (Avena Calmante, Miel Nutritiva, Vainilla Delicada) x 4 tamanos (Mini/Facial, Viaje, Estandar, Familiar).

### Frontend (`frontend/`)

- `src/context/CartContext.jsx` — el carrito vive **solo en el cliente** (React Context + `localStorage`, no hay tabla de carrito en PostgreSQL). Se envia al backend recien en el checkout, como parte del payload de `POST /api/orders`.
- `src/api.js` — capa de acceso a la API. `fetchProducts()` intenta `/api/products` y si falla (backend o PostgreSQL aun no configurados) cae automaticamente a `src/data/fallbackProducts.js`, un catalogo local identico al del seed. Esto permite trabajar en el diseño del frontend sin depender del backend.
- Flujo de paginas (`react-router-dom`, sin rutas anidadas): `Home` (`/`) → `Checkout` (`/checkout`) → `OrderSuccess` (`/pedido/:code`).
- `src/components/ProductModal.jsx` — selector de presentacion (variant) + cantidad; ahi ocurre el `addItem` al carrito.
- `src/components/YapeQR.jsx` — **pieza clave del checkout**: Yape no tiene API/formato publico para generar QR de cobro por monto, asi que el componente intenta cargar una imagen real (`public/images/yape-qr.png`, exportada manualmente desde la app Yape del negocio) y si no existe (`onError`) cae a un QR generado con `qrcode.react` marcado explicitamente como "solo referencia". No asumir que un QR generado por `qrcode.react` es un cobro Yape valido.
- Paleta/tipografia de marca centralizada en `tailwind.config.js` (colores `cream`, `honey`, `leaf`, `blush`) y `src/index.css` (clases `btn-primary`, `btn-secondary`, `chip`).

### Flujo de una compra

1. Frontend lee `GET /api/products` (o el fallback local) y renderiza catalogo/filtros.
2. El carrito se arma y persiste 100% en el navegador (`CartContext` + `localStorage`).
3. En `/checkout`, el cliente ve el QR de Yape, paga desde su app, y escribe el numero de operacion en el formulario.
4. `POST /api/orders` valida stock/precio en el servidor, crea `orders` + `order_items` en una transaccion, descuenta stock, y devuelve `orderCode`.
5. El pedido queda en estado `pendiente_pago` en PostgreSQL — la verificacion del pago y el cambio a `pago_verificado` es **manual** (no existe panel de administracion en este alcance).

## Requerimientos

- Node.js 18+ (usa ESM nativo — ambos `package.json` tienen `"type": "module"`).
- PostgreSQL en ejecucion (local o remoto) con un usuario/clave con permisos para crear tablas.
- npm (o compatible) para instalar dependencias de `backend/` y `frontend/` por separado — son proyectos independientes, cada uno con su propio `package.json`/`node_modules`.
- Variables de entorno del backend en `backend/.env` (ver `backend/.env.example`): `PORT`, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSCHEMA` (esquema de PostgreSQL, por defecto `productos`), `YAPE_TITULAR`, `YAPE_NUMERO`.
- Para que el QR de pago sea funcional de verdad: una imagen `frontend/public/images/yape-qr.png` exportada desde la app Yape del negocio (Perfil → Mi codigo QR → Compartir). Sin ese archivo, el checkout sigue siendo usable pero muestra un QR de referencia.
- No hay suite de tests ni linter configurados en este repositorio todavia; la unica verificacion automatizada disponible es el build de Vite y `node --check` sobre los archivos del backend.

## Procedimiento de ejecucion

### 1. Base de datos

```
createdb -U postgres marlep
psql -U postgres -d marlep -f backend/db/schema.sql
psql -U postgres -d marlep -f backend/db/seed.sql
```

Re-ejecutar `seed.sql` es seguro: empieza con `TRUNCATE ... RESTART IDENTITY CASCADE`.

### 2. Backend

```
cd backend
copy .env.example .env      # ajustar credenciales de PostgreSQL
npm install
npm run dev                 # http://localhost:4000, con --watch (recarga en cada cambio)
npm start                   # variante sin --watch
```

### 3. Frontend

```
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxy /api -> http://localhost:4000, ver vite.config.js)
npm run build                # build de produccion a frontend/dist
npm run preview              # sirve el build de dist localmente
```

### Verificacion rapida sin base de datos

El backend arranca aunque PostgreSQL no este disponible (el pool de `pg` conecta de forma perezosa); sirve para probar rutas que no tocan la base:

```
cd backend && node src/index.js &
curl http://localhost:4000/api/health
curl http://localhost:4000/api/config/yape
```

Chequeo de sintaxis del backend sin levantar el servidor:

```
cd backend
node --check src/index.js
node --check src/routes/products.js
node --check src/routes/orders.js
```
