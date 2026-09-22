-- Esquema de base de datos para Marlep Cosmetics
-- Ejecutar con: psql -U postgres -d marlep -f db/schema.sql
-- Todas las tablas viven en el esquema "productos" (no en "public").

CREATE SCHEMA IF NOT EXISTS productos;

CREATE TABLE IF NOT EXISTS productos.products (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(80)  NOT NULL UNIQUE,
  name          VARCHAR(120) NOT NULL,
  short_desc    VARCHAR(240) NOT NULL,
  description   TEXT NOT NULL,
  ingredients   TEXT NOT NULL,
  benefits      TEXT NOT NULL,
  image_url     VARCHAR(255) NOT NULL,
  accent_color  VARCHAR(20)  NOT NULL DEFAULT '#C89B3C',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos.product_variants (
  id            SERIAL PRIMARY KEY,
  product_id    INTEGER NOT NULL REFERENCES productos.products(id) ON DELETE CASCADE,
  sku           VARCHAR(40) NOT NULL UNIQUE,
  size_label    VARCHAR(40) NOT NULL,   -- Mini/Facial, Viaje, Estandar, Familiar
  size_grams    INTEGER NOT NULL,
  price         NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),          -- precio tachado, opcional
  stock         INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS productos.orders (
  id                 SERIAL PRIMARY KEY,
  order_code         VARCHAR(20) NOT NULL UNIQUE,
  customer_name      VARCHAR(120) NOT NULL,
  customer_phone     VARCHAR(20)  NOT NULL,
  delivery_method    VARCHAR(20)  NOT NULL DEFAULT 'delivery', -- delivery | pickup
  delivery_address   VARCHAR(255),
  delivery_district  VARCHAR(120),
  notes              TEXT,
  subtotal           NUMERIC(10,2) NOT NULL,
  shipping_cost      NUMERIC(10,2) NOT NULL DEFAULT 0,
  total              NUMERIC(10,2) NOT NULL,
  payment_method     VARCHAR(20) NOT NULL DEFAULT 'yape',
  yape_operation_code VARCHAR(40),
  status             VARCHAR(30) NOT NULL DEFAULT 'pendiente_pago', -- pendiente_pago | pago_verificado | en_preparacion | enviado | entregado | cancelado
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos.order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES productos.orders(id) ON DELETE CASCADE,
  variant_id   INTEGER NOT NULL REFERENCES productos.product_variants(id),
  product_name VARCHAR(120) NOT NULL,
  size_label   VARCHAR(40) NOT NULL,
  unit_price   NUMERIC(10,2) NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  line_total   NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON productos.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON productos.order_items(order_id);
