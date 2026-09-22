# Despliegue en produccion (Neon + Vercel)

Este documento describe como llevar Marlep Cosmetics a produccion usando:

- **Neon** — PostgreSQL serverless, para reemplazar la base de datos local.
- **Vercel** — hosting del `frontend/` (SPA de Vite) y, opcionalmente, del `backend/` (API Express) como funcion serverless.

## Viabilidad

| Componente | Viable en Vercel | Notas |
|---|---|---|
| Base de datos | N/A (va en Neon) | Postgres estandar, compatible con `pg` sin cambios de esquema |
| Frontend (Vite/React) | Si, directo | Caso de uso nativo de Vercel |
| Backend (Express) | Si, con adaptacion | Express usa `app.listen()` (servidor de larga duracion); Vercel solo ejecuta funciones serverless, asi que hay que exportar la app en vez de levantarla directamente |

Alternativa si no se quiere adaptar el backend a serverless: desplegarlo en Render/Railway/Fly.io (soportan un proceso Node "always-on" tal cual esta hoy) y dejar solo el frontend en Vercel. Este documento cubre la opcion "todo en Vercel".

### Costo de la alternativa (Render/Railway/Fly.io), 2026

Ninguna de las tres es gratis "de verdad" para un backend + base de datos always-on:

| Plataforma | Tier gratuito | Limitaciones |
|---|---|---|
| **Render** | Si, 750 hrs/mes para web services Node, sin tarjeta | El servicio "duerme" tras 15 min de inactividad (cold start 30-60s). El Postgres gratuito **expira a los 30 dias** (14 dias de gracia y se borra) |
| **Railway** | Parcial | Solo $5 de credito unico (trial de 30 dias); luego plan "Free" con $1/mes de credito, insuficiente para un servicio + DB corriendo. En la practica hay que pasar a Hobby ($5/mes) |
| **Fly.io** | No | Sin tier gratuito desde oct-2024. Solo trial de 2 horas de VM o 7 dias; despues todo es pago (desde ~$2-5/mes) |

Si se usa esta alternativa, la opcion mas cercana a gratis es **Render para el backend + Neon para la base de datos** (Neon tiene tier gratuito persistente, a diferencia del Postgres gratuito de Render que caduca a los 30 dias). El backend en Render seguiria usando `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD` apuntando al connection string de Neon (ver seccion 1), con el mismo cambio de SSL descrito en 1.3.

---

## 1. Base de datos en Neon

### 1.1 Crear el proyecto

1. Crear una cuenta/proyecto en [neon.tech](https://neon.tech).
2. Crear una base de datos `marlep`.
3. En el dashboard del proyecto, copiar **dos** connection strings (Neon los muestra en la seccion "Connection Details"):
   - **Directa** (host tipo `ep-xxx.region.aws.neon.tech`) — para uso desde un proceso long-lived (ej. correr las migraciones desde tu maquina).
   - **Pooled / PgBouncer** (host tipo `ep-xxx-pooler.region.aws.neon.tech`) — **esta es la que va a usar el backend en Vercel**, porque cada invocacion de una funcion serverless puede abrir una conexion nueva, y el modo pooled evita agotar el limite de conexiones de Neon.

### 1.2 Cargar el esquema y el seed

Desde tu maquina, usando la connection string **directa**:

```bash
psql "postgresql://usuario:password@ep-xxx.region.aws.neon.tech/marlep?sslmode=require" -f backend/db/schema.sql
psql "postgresql://usuario:password@ep-xxx.region.aws.neon.tech/marlep?sslmode=require" -f backend/db/seed.sql
```

(Alternativa sin `psql` local: pegar el contenido de `schema.sql` y luego `seed.sql` en el SQL Editor de la consola web de Neon.)

`seed.sql` es seguro de re-ejecutar: empieza con `TRUNCATE ... RESTART IDENTITY CASCADE`.

### 1.3 Cambio de codigo requerido: SSL

Neon exige TLS. La configuracion actual de [`backend/src/db.js`](backend/src/db.js) arma el `pg.Pool` con `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD` sueltos y **sin opcion `ssl`**, por lo que la conexion a Neon fallaria tal cual esta.

Cambio necesario (agregar soporte de `DATABASE_URL` + SSL condicional, manteniendo compatibilidad con Postgres local):

```js
// backend/src/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const schema = process.env.PGSCHEMA || 'productos';
const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new pg.Pool({
      // El search_path para Neon NO se fija aqui (ver nota abajo): queda
      // configurado a nivel de rol/base de datos con el ALTER ROLE de 1.3.1.
      // El modo SSL lo controla `sslmode` dentro de DATABASE_URL (ver 1.3.2);
      // no se fija `ssl` aqui explicitamente para no anular esa verificacion.
      connectionString,
    })
  : new pg.Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE || 'marlep',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      options: `-c search_path=${schema},public`,
    });

export const query = (text, params) => pool.query(text, params);
```

> El `search_path` **no** se puede pasar como startup option (`options: '-c search_path=...'`) contra el endpoint pooled de Neon — PgBouncer devuelve `unsupported startup parameter in options: search_path`. Tampoco conviene fijarlo con `pool.on('connect', client => client.query(...))`: el evento no bloquea la entrega del cliente al pool, asi que esa query corre en paralelo con la primera query real del caller y produce el warning `Calling client.query() when the client is already executing a query is deprecated`. La solucion correcta con conexiones pooled es dejar el search_path configurado **a nivel de rol/base de datos** (una sola vez, ver 1.3.1) para que cada conexion nueva lo herede automaticamente.

### 1.3.1 Configurar el search_path a nivel de rol (una sola vez)

Correr una sola vez contra Neon (desde `psql` con la connection string **directa**, o pegado en el SQL Editor de la consola web):

```sql
ALTER ROLE neondb_owner IN DATABASE neondb SET search_path TO productos, public;
```

(Ajustar `neondb_owner` y `neondb` si tu rol o base tienen otro nombre.) Verificar con una conexion nueva:

```sql
SHOW search_path;
-- productos, public
```

Esto persiste en Neon — no hay que repetirlo en cada deploy ni depende de variables de entorno.

### 1.3.2 Modo SSL: `sslmode=require` vs `sslmode=verify-full`

El connection string que da Neon usa `sslmode=require` por defecto, lo cual cifra la conexion pero **no verifica** que el certificado del servidor pertenezca realmente a Neon (vulnerable a man-in-the-middle en una red comprometida). `pg` ademas emite un warning al respecto:

```
SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'...
```

Cambio aplicado: usar `sslmode=verify-full` en `DATABASE_URL`, que si valida el certificado contra la CA publica de Neon:

```
DATABASE_URL=postgresql://usuario:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=verify-full
```

**Importante:** para que `verify-full` tenga efecto, `backend/src/db.js` **no** debe pasar `ssl: { rejectUnauthorized: false }` explicitamente al `pg.Pool` — esa opcion tiene prioridad sobre el `sslmode` de la URL y anularia la verificacion sin importar lo que diga el connection string. Por eso la rama de `DATABASE_URL` solo pasa `connectionString` (ver snippet de 1.3), dejando que `pg` respete el `sslmode` embebido en la URL. Los certificados de Neon son de una CA publica, asi que la verificacion funciona sin configuracion adicional (no hace falta pasar un CA cert propio).

Con esto, en local se sigue usando `PGHOST/PGPORT/...` (sin SSL) y en produccion basta con definir `DATABASE_URL` (con el string **pooled** de Neon) para que se conecte con SSL.

### 1.4 De donde salen los valores de Neon

En [console.neon.tech](https://console.neon.tech), dentro del proyecto: **Dashboard → Connection Details** (tambien accesible desde el boton **Connect** en la barra superior). Ahi Neon muestra un connection string ya armado, por ejemplo:

```
postgresql://neondb_owner:AbC123XyZ@ep-cool-forest-a5xxxxx-pooler.us-east-2.aws.neon.tech/marlep?sslmode=require
```

- El selector **"Pooled connection"** (on/off) en esa misma pantalla alterna entre el host `-pooler` (usar en Vercel/serverless, ver 1.1) y el host directo (usar para `psql` desde tu maquina, ver 1.2).
- El boton **"Show password" / ojo** revela la contrasena generada (no la elige el usuario al crear el proyecto).
- La base de datos (`marlep` en el ejemplo) se crea desde **Databases → New Database** en el dashboard, o se usa la que Neon crea por defecto (`neondb`) renombrando en el connection string.

**Opcion A — usar el string completo (recomendado, requiere el cambio de 1.3):**

`.env` de produccion (o variables de entorno en Vercel):

```
DATABASE_URL=postgresql://neondb_owner:AbC123XyZ@ep-cool-forest-a5xxxxx-pooler.us-east-2.aws.neon.tech/marlep?sslmode=require
YAPE_TITULAR=Marlep Cosmetics (Ana Chamorro)
YAPE_NUMERO=944254076
```

**Opcion B — sin tocar `db.js`, reutilizando las variables sueltas que ya existen en [`backend/.env`](backend/.env):** hay que **agregar `ssl: { rejectUnauthorized: false }` igualmente** al `pg.Pool` (Neon rechaza conexiones sin TLS), y mapear el connection string a las variables ya conocidas:

| Variable actual (`backend/.env`) | Valor que va | De donde sale del connection string de Neon |
|---|---|---|
| `PGHOST` | `ep-cool-forest-a5xxxxx-pooler.us-east-2.aws.neon.tech` | parte entre `@` y `/marlep` |
| `PGPORT` | `5432` | Neon usa el puerto estandar (no aparece en el string) |
| `PGDATABASE` | `marlep` | parte entre `/` y `?` |
| `PGUSER` | `neondb_owner` | parte entre `//` y `:` |
| `PGPASSWORD` | `AbC123XyZ` | parte entre `:` y `@` |
| `PGSCHEMA` | `productos` | no cambia, es propio de este proyecto (ver `db/schema.sql`) |

Ejemplo de `backend/.env` apuntando a Neon (comparar con los valores actuales de `localhost` en [`backend/.env`](backend/.env)):

```
PORT=4000

# Conexion a PostgreSQL (Neon)
PGHOST=ep-cool-forest-a5xxxxx-pooler.us-east-2.aws.neon.tech
PGPORT=5432
PGDATABASE=marlep
PGUSER=neondb_owner
PGPASSWORD=AbC123XyZ
PGSCHEMA=productos

# Numero/alias de Yape del negocio, mostrado como referencia en el checkout
YAPE_TITULAR=Marlep Cosmetics (Ana Chamorro)
YAPE_NUMERO=944254076
```

En Vercel estas mismas claves se cargan como **Environment Variables** del proyecto (Settings → Environment Variables), no como archivo `.env` (Vercel no lee `.env` en produccion salvo que este commiteado, lo cual no se recomienda porque expondria la contrasena en el repo).

---

## 2. Backend en Vercel

### 2.1 Adaptar Express a funcion serverless

Vercel no ejecuta procesos long-lived: no corre `app.listen()`. Hay que exportar la app y solo escuchar en local.

**`backend/src/index.js`** — cambiar el final del archivo:

```js
const PORT = process.env.PORT || 4000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Marlep API escuchando en http://localhost:${PORT}`);
  });
}

export default app;
```

**Crear `backend/api/index.js`** (Vercel trata todo lo que esta bajo `/api` como una funcion):

```js
export { default } from '../src/index.js';
```

**Crear `backend/vercel.json`** para que todas las rutas (`/api/products`, `/api/orders`, etc.) caigan en esa unica funcion:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }]
}
```

> Nota: `orders.js` ya usa `pool.connect()` + una sola transaccion `BEGIN/COMMIT` por request (no mezcla queries sueltas fuera de esa conexion), lo cual es compatible con el modo *transaction pooling* de PgBouncer/Neon. No requiere cambios adicionales.

### 2.2 Crear el proyecto en Vercel

1. Subir el repo a GitHub: **`marlep`**, puede ser **privado** — Vercel (incluso en el plan Hobby/gratuito) soporta repos privados sin costo adicional, solo hay que autorizar la GitHub App de Vercel para ese repo (o para toda la cuenta) al conectar la integracion. Conviene dejarlo privado ya que el repo no necesita ser publico para nada del flujo de despliegue. (El directorio de trabajo actual no es un repo Git todavia — inicializarlo con `git init` si hace falta). Es un **monorepo**: contiene `backend/`, `frontend/` e `imagen/`. El proyecto Vercel del backend (creado en el paso 2) se nombra `marlep-backend` — es solo el nombre del *proyecto en Vercel* (de ahi sale la URL `https://marlep-backend.vercel.app` del paso 6), no del repo de GitHub. El proyecto Vercel del frontend (seccion 3.3) importa este mismo repo `marlep`, con **Root Directory**: `frontend/`, y se nombra `marlep` en Vercel.
2. En Vercel: **New Project** → importar el repo `marlep` → nombrar el proyecto `marlep-backend`.
3. **Root Directory**: `backend/`.
4. Framework preset: "Other" (Vercel detecta `api/index.js` automaticamente).
5. Variables de entorno del proyecto (Settings → Environment Variables):
   - `DATABASE_URL` = connection string **pooled** de Neon (con `?sslmode=require`).
   - `YAPE_TITULAR`
   - `YAPE_NUMERO`
6. Deploy. Anotar la URL resultante, ej. `https://marlep-backend.vercel.app`.
7. Verificar:
   ```bash
   curl https://marlep-backend.vercel.app/api/health
   curl https://marlep-backend.vercel.app/api/config/yape
   curl https://marlep-backend.vercel.app/api/products
   ```

---

## 3. Frontend en Vercel

### 3.1 Resolver las llamadas a `/api`

[`frontend/src/api.js`](frontend/src/api.js) llama a rutas **relativas** (`/api/products`, `/api/orders`, `/api/config/yape`). En dev funciona por el proxy de `vite.config.js`; en produccion, frontend y backend viven en dominios `*.vercel.app` distintos.

Solucion recomendada (sin tocar `api.js`): agregar un rewrite en el proyecto del frontend que reenvie `/api/*` al dominio del backend.

**Crear `frontend/vercel.json`**:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://marlep-backend.vercel.app/api/:path*" }
  ]
}
```

Con esto el navegador ve todo como same-origin (no hace falta configurar CORS en el backend).

### 3.2 Verificar el asset del QR de Yape

Confirmar que `frontend/public/images/yape-qr.png` (exportado desde la app Yape del negocio) este presente antes del build. Sin el, el checkout sigue siendo usable pero muestra el QR de referencia generado por `qrcode.react`.

### 3.3 Crear el proyecto en Vercel

1. En Vercel: **New Project** → importar el mismo repo `marlep` (ver nota de 2.2) → nombrar el proyecto `marlep`.
2. **Root Directory**: `frontend/`.
3. Framework preset: **Vite** (autodetectado).
4. Build command: `npm run build` (default). Output directory: `dist` (default).
5. Sin variables de entorno adicionales (se usa el rewrite de `vercel.json`, no un `VITE_API_URL`).
6. Deploy. Anotar la URL resultante, ej. `https://marlep.vercel.app`.

---

## 4. Checklist final

- [ ] Proyecto Neon creado, `schema.sql` y `seed.sql` cargados.
- [ ] `backend/src/db.js` actualizado para soportar `DATABASE_URL` + SSL.
- [x] `backend/src/index.js` exporta `app` y solo hace `listen` fuera de Vercel.
- [x] `backend/api/index.js` y `backend/vercel.json` creados.
- [ ] Proyecto Vercel del backend desplegado, con `DATABASE_URL` (endpoint **pooled**), `YAPE_TITULAR`, `YAPE_NUMERO`.
- [ ] `frontend/vercel.json` con el rewrite `/api/:path*` apuntando a la URL real del backend.
- [ ] `frontend/public/images/yape-qr.png` presente (QR real, no el de referencia).
- [ ] Proyecto Vercel del frontend desplegado.
- [ ] Prueba end-to-end en produccion: catalogo → carrito → checkout → `POST /api/orders` → `GET /pedido/:code`.

## Riesgos y limitaciones a tener en cuenta

- **Cold starts**: la primera request tras inactividad en la funcion del backend puede tardar mas (arranque de funcion + conexion a Neon). No es critico para un checkout, pero es esperable.
- **Conexiones a Postgres**: usar siempre el endpoint **pooled** de Neon desde Vercel; el endpoint directo tiene un limite de conexiones bajo y se agota rapido con trafico serverless.
- **Verificacion de pago manual**: no cambia con el despliegue — los pedidos siguen quedando en `pendiente_pago` hasta revision manual, no hay panel de administracion en este alcance.
