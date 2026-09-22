# Despliegue en produccion (Neon + Vercel)

Este documento describe como llevar Marlep Cosmetics a produccion usando:

- **Neon** — PostgreSQL serverless, para reemplazar la base de datos local.
- **Vercel** — un unico proyecto (**Services**) que despliega `frontend/` (SPA de Vite) y `backend/` (API Express) juntos, bajo un mismo dominio.

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

## 2. Desplegar en Vercel (un solo proyecto, Services)

### 2.1 Por que un solo proyecto en vez de dos

La primera version de este documento proponia **dos** proyectos Vercel separados (uno para `backend/`, otro para `frontend/`), cada uno con su propio dominio, conectados con un rewrite manual y exponiendo el backend como funcion serverless suelta. Al crear el proyecto en Vercel, la plataforma detecto automaticamente el monorepo y ofrecio el preset **Services**, que es mas simple y es lo que usa este documento ahora:

- **Un solo proyecto** (`marlep`), **un solo dominio** (`https://marlep.vercel.app`).
- Frontend y backend se declaran como "services" dentro de un `vercel.json` en la **raiz del repo**; Vercel construye cada uno con su `root` correspondiente.
- El ruteo se resuelve con `rewrites` a nivel de proyecto: todo lo que matchee `/api(/.*)?` va al service `backend`, el resto va al service `frontend`. El navegador ve todo como same-origin — **no hace falta CORS ni un `frontend/vercel.json` con rewrite manual**.
- El backend se despliega con deteccion **zero-config de Express**: Vercel busca `index.js`/`server.js`/`app.js` (o el mismo dentro de `src/`) en la raiz del service y lo toma automaticamente — no hace falta un `backend/api/index.js` ni un `backend/vercel.json` propios (si los creaste siguiendo una version anterior de esta guia, se pueden borrar).

### 2.2 `vercel.json` en la raiz del repo

Vercel genera este archivo automaticamente al crear el proyecto (aparece en la pantalla "New Project" con boton para copiarlo); hay que agregarlo al repo **antes** de poder desplegar (Vercel no lo inyecta solo, lo lee del repo):

```json
{
  "services": {
    "frontend": {
      "root": "frontend",
      "framework": "vite"
    },
    "backend": {
      "root": "backend",
      "framework": "express",
      "entrypoint": "src/index.js"
    }
  },
  "rewrites": [
    {
      "source": "/api(/.*)?",
      "destination": { "type": "service", "service": "backend" }
    },
    {
      "source": "/(.*)",
      "destination": { "type": "service", "service": "frontend" }
    }
  ]
}
```

El rewrite preserva la ruta completa (no recorta el prefijo `/api`), lo cual calza con que las rutas del propio Express ya estan definidas con ese prefijo (`app.get('/api/health', ...)`, `app.use('/api/products', ...)`, etc. en [`backend/src/index.js`](backend/src/index.js)) — no requiere ningun cambio adicional en las rutas.

> `entrypoint` es obligatorio para el service `backend`: el builder de Express de Vercel busca automaticamente un archivo entre `{app,index,server,src/app,src/index,src/server}.js` en la raiz del service, pero si no logra resolverlo solo (como paso en el primer intento de deploy, con el error `must specify an "entrypoint" for runtime "node"`), hay que indicarlo explicitamente — en este caso `src/index.js` (relativo al `root: "backend"`), que es donde vive la app Express exportada (ver 2.3).

### 2.3 Requisitos que `backend/src/index.js` ya cumple

Para que la deteccion zero-config de Express funcione, el archivo debe exportar la app y no bloquear el arranque con `app.listen()` en el entorno de Vercel — esto ya esta hecho:

```js
// backend/src/index.js (fragmento final)
const PORT = process.env.PORT || 4000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Marlep API escuchando en http://localhost:${PORT}`);
  });
}

export default app;
```

Localmente (`npm run dev`/`npm start`) sigue funcionando igual: `VERCEL` no existe en el entorno local, asi que sigue llamando `app.listen()` como siempre.

> Nota: `orders.js` ya usa `pool.connect()` + una sola transaccion `BEGIN/COMMIT` por request (no mezcla queries sueltas fuera de esa conexion), lo cual es compatible con el modo *transaction pooling* de PgBouncer/Neon. No requiere cambios adicionales.

### 2.4 Crear el proyecto en Vercel

1. Subir el repo a GitHub: **`marlep`**, puede ser **privado** — Vercel (incluso en el plan Hobby/gratuito) soporta repos privados sin costo adicional, solo hay que autorizar la GitHub App de Vercel para ese repo (o para toda la cuenta) al conectar la integracion.
2. En Vercel: **New Project** → importar el repo `marlep`.
3. **Project Name**: `marlep` (un solo proyecto, no hace falta distinguir "backend"/"frontend" en el nombre).
4. **Application Preset**: `Services` — Vercel deberia detectar automaticamente los dos services (`frontend` con framework Vite, `backend` como Web Service Express) y mostrar el `vercel.json` sugerido (ver 2.2). Si la pantalla dice "`vercel.json` required to deploy projects with multiple services", significa que el archivo todavia no esta commiteado en el repo — agregarlo (paso 1) y darle **Refresh** en esa pantalla.
5. Variables de entorno del proyecto (Settings → Environment Variables — se aplican a todo el proyecto, el service `frontend` simplemente no las usa):
   - `DATABASE_URL` = connection string **pooled** de Neon (con `?sslmode=require`, ver 1.3.2 para `verify-full`).
   - `YAPE_TITULAR`
   - `YAPE_NUMERO`
6. Deploy. Anotar la URL resultante, ej. `https://marlep.vercel.app`.
7. Verificar:
   ```bash
   curl https://marlep.vercel.app/api/health
   curl https://marlep.vercel.app/api/config/yape
   curl https://marlep.vercel.app/api/products
   ```
   Y abrir `https://marlep.vercel.app/` en el navegador para confirmar que el frontend carga el catalogo.

### 2.5 Verificar el asset del QR de Yape

Confirmar que `frontend/public/images/yape-qr.png` (exportado desde la app Yape del negocio) este presente antes del build. Sin el, el checkout sigue siendo usable pero muestra el QR de referencia generado por `qrcode.react`.

### 2.6 Bitacora del primer deploy (2026-09-21)

Registro de lo que paso al desplegar por primera vez, para referencia futura:

1. **Repo subido a GitHub** como `davybendezu/marlep` (privado) — ver [GITHUB.md](GITHUB.md) para el procedimiento completo (`.gitignore` excluye `backend/.env` con las credenciales reales).
2. **Neon configurado**: proyecto creado, `schema.sql` + `seed.sql` cargados (via SQL directo desde esta sesion, equivalente al contenido actual de esos archivos — incluye las 4 fragancias: Avena, Miel, Vainilla, Lavanda), y el `ALTER ROLE ... SET search_path` de 1.3.1 ya aplicado sobre `neondb_owner`/`neondb`.
3. **Primer intento de deploy en Vercel** fallo con:
   ```
   Error: Service "backend" detected framework "express" in "backend" and must specify an "entrypoint" for runtime "node".
   ```
   Vercel detecto el framework Express pero no pudo resolver solo el archivo de entrada. Se agrego `"entrypoint": "src/index.js"` (y `"framework": "express"` explicito) al service `backend` en `vercel.json` (ver 2.2) — commit `a4c13bc`.
4. **Segundo intento**: el build completo sin errores ("You just deployed a new project to Davy's projects", con preview del frontend renderizando el logo de Marlep Cosmetics).
5. **Problema abierto sin resolver todavia**: al probar `https://marlep.vercel.app` (frontend, `/api/health`, `/api/config/yape`, `/api/products`) todas las rutas devuelven:
   ```
   DEPLOYMENT_NOT_FOUND
   ```
   El build fue exitoso segun la UI de Vercel, pero ese dominio especifico no resuelve a el. Posibles causas a revisar en el dashboard (Settings → Domains del proyecto):
   - El nombre final del proyecto podria no ser exactamente `marlep` (verificar el nombre real asignado).
   - El deploy podria haber quedado como **Preview** en vez de **Production**, y el dominio `*.vercel.app` sin sufijo solo apunta al deployment de Production.
   - El alias de dominio de produccion puede tardar unos segundos en propagarse tras el primer deploy.
   
   Pendiente: confirmar en el dashboard cual es la URL real del deployment y actualizar esta seccion (y los ejemplos de 2.4) si difiere de `marlep.vercel.app`.

---

## 3. Checklist final

- [x] Proyecto Neon creado, `schema.sql` y `seed.sql` cargados.
- [x] `search_path` configurado a nivel de rol en Neon (`ALTER ROLE`, ver 1.3.1).
- [x] `backend/src/db.js` actualizado para soportar `DATABASE_URL` + SSL (sin override que anule `verify-full`, ver 1.3.2).
- [x] `backend/src/index.js` exporta `app` y solo hace `listen` fuera de Vercel.
- [x] Repo subido a GitHub (`davybendezu/marlep`, privado) — ver [GITHUB.md](GITHUB.md).
- [x] `vercel.json` en la raiz del repo con `services` + `rewrites` + `entrypoint` explicito para `backend` (ver 2.2).
- [x] Proyecto Vercel `marlep` creado y desplegado (build exitoso), con `DATABASE_URL` (endpoint **pooled**), `YAPE_TITULAR`, `YAPE_NUMERO`.
- [ ] **Confirmar el dominio real de produccion** — `https://marlep.vercel.app` devuelve `DEPLOYMENT_NOT_FOUND` (ver 2.6, problema abierto).
- [ ] `frontend/public/images/yape-qr.png` presente (QR real, no el de referencia).
- [ ] Prueba end-to-end en produccion: catalogo → carrito → checkout → `POST /api/orders` → `GET /pedido/:code`.

## Riesgos y limitaciones a tener en cuenta

- **Cold starts**: la primera request tras inactividad en el service del backend puede tardar mas (arranque + conexion a Neon). No es critico para un checkout, pero es esperable.
- **Conexiones a Postgres**: usar siempre el endpoint **pooled** de Neon desde Vercel; el endpoint directo tiene un limite de conexiones bajo y se agota rapido con trafico serverless.
- **Verificacion de pago manual**: no cambia con el despliegue — los pedidos siguen quedando en `pendiente_pago` hasta revision manual, no hay panel de administracion en este alcance.
