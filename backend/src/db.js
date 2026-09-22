import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const schema = process.env.PGSCHEMA || 'productos';
const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new pg.Pool({
      // Contra el endpoint pooled de Neon (PgBouncer) no se puede pasar
      // `options: -c search_path=...` (rechazado como startup parameter) ni
      // fijarlo por conexion sin condicion de carrera. El search_path para
      // este rol se deja configurado a nivel de base de datos (ver DESPLIEGUE.md 1.3).
      // El modo SSL lo controla `sslmode` dentro de DATABASE_URL; no se fija
      // `ssl` aqui explicitamente porque eso anularia (con rejectUnauthorized:
      // false) la verificacion de certificado sin importar lo que diga la URL.
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
