-- Datos iniciales para Marlep Cosmetics
-- Ejecutar con: psql -U postgres -d marlep -f db/seed.sql

TRUNCATE productos.order_items, productos.orders, productos.product_variants, productos.products RESTART IDENTITY CASCADE;

INSERT INTO productos.products (slug, name, short_desc, description, ingredients, benefits, image_url, accent_color) VALUES
(
  'avena-calmante',
  'Avena Calmante',
  'Crema exfoliante e hidratante con avena natural para pieles sensibles.',
  'Nuestra crema de Avena Calmante combina harina de avena natural con manteca y aceites vegetales para nutrir e hidratar profundamente. Ideal para manos resecas o sensibles, deja una sensacion de suavidad inmediata sin dejar residuo graso.',
  'Harina de Avena Natural, Manteca hidratante, Extracto de Aloe Vera (puro gel), Aceite de Almendras Dulces (prensado en frio), Vitamina E.',
  'Hidrata profundamente, exfolia suavemente, calma irritaciones y rojeces.',
  '/images/producto-generico.png',
  '#D8C089'
),
(
  'miel-nutritiva',
  'Miel Nutritiva',
  'Crema artesanal con miel de abeja para una nutricion intensa.',
  'Elaborada con miel de abeja de flores silvestres, esta crema repara y nutre la piel de tus manos, dejandolas suaves y con un aroma dulce y natural. Perfecta para el uso diario en climas frios o secos.',
  'Miel de Abeja (de flores silvestres), Harina de Avena Natural, Extracto de Aloe Vera, Aceite de Almendras Dulces, Vitamina E.',
  'Nutre intensamente, repara la piel danada, aporta brillo natural y suavidad duradera.',
  '/images/producto-generico.png',
  '#E7A93C'
),
(
  'vainilla-delicada',
  'Vainilla Delicada',
  'Crema suave de aroma dulce, ideal para piel delicada y rostro.',
  'Con esencia natural de vainilla, esta crema de textura ligera hidrata sin sensacion grasosa. Su aroma delicado la convierte en la favorita para uso diario en manos y como bálsamo facial en su presentacion mini.',
  'Esencia de Vainilla (extracto natural), Harina de Avena Natural, Extracto de Aloe Vera, Aceite de Almendras Dulces.',
  'Hidratacion ligera, aroma relajante, apta para piel delicada y uso facial.',
  '/images/producto-generico.png',
  '#E8A6A0'
),
(
  'lavanda-relajante',
  'Lavanda Relajante',
  'Crema calmante con esencia de lavanda, ideal para relajar las manos antes de dormir.',
  'Con esencia natural de lavanda, esta crema de textura suave calma y relaja la piel de tus manos mientras las hidrata profundamente. Su aroma floral la convierte en la favorita para el ritual de descanso nocturno.',
  'Esencia de Lavanda (extracto natural), Harina de Avena Natural, Manteca hidratante, Extracto de Aloe Vera, Aceite de Almendras Dulces.',
  'Relaja y calma la piel, favorece el descanso nocturno, hidratacion suave y duradera.',
  '/images/producto-generico.png',
  '#B7A6D9'
);

-- Avena Calmante (id 1)
INSERT INTO productos.product_variants (product_id, sku, size_label, size_grams, price, compare_price, stock) VALUES
(1, 'AV-MINI', 'Mini / Facial', 30, 2.00, NULL, 40),
(1, 'AV-VIAJE', 'Tamaño de Viaje', 60, 4.00, NULL, 35),
(1, 'AV-STD', 'Tamaño Estándar', 100, 5.00, 6.00, 50),
(1, 'AV-FAM', 'Tamaño Familiar', 250, 7.00, 8.00, 20);

-- Miel Nutritiva (id 2)
INSERT INTO productos.product_variants (product_id, sku, size_label, size_grams, price, compare_price, stock) VALUES
(2, 'MI-MINI', 'Mini / Facial', 30, 2.00, NULL, 40),
(2, 'MI-VIAJE', 'Tamaño de Viaje', 60, 4.00, NULL, 35),
(2, 'MI-STD', 'Tamaño Estándar', 100, 5.00, 6.00, 50),
(2, 'MI-FAM', 'Tamaño Familiar', 250, 7.00, 8.00, 20);

-- Vainilla Delicada (id 3)
INSERT INTO productos.product_variants (product_id, sku, size_label, size_grams, price, compare_price, stock) VALUES
(3, 'VA-MINI', 'Mini / Facial', 30, 2.00, NULL, 40),
(3, 'VA-VIAJE', 'Tamaño de Viaje', 60, 4.00, NULL, 35),
(3, 'VA-STD', 'Tamaño Estándar', 100, 5.00, NULL, 50),
(3, 'VA-FAM', 'Tamaño Familiar', 250, 7.00, NULL, 20);

-- Lavanda Relajante (id 4)
INSERT INTO productos.product_variants (product_id, sku, size_label, size_grams, price, compare_price, stock) VALUES
(4, 'LAV-MINI', 'Mini / Facial', 30, 2.00, NULL, 40),
(4, 'LAV-VIAJE', 'Tamaño de Viaje', 60, 4.00, NULL, 35),
(4, 'LAV-STD', 'Tamaño Estándar', 100, 5.00, NULL, 50),
(4, 'LAV-FAM', 'Tamaño Familiar', 250, 7.00, NULL, 20);
