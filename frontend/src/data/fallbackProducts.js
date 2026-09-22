// Catalogo de respaldo usado solo si la API/PostgreSQL aun no esta disponible,
// para que la interfaz pueda mostrarse durante el desarrollo del frontend.
export const fallbackProducts = [
  {
    id: 1,
    slug: 'avena-calmante',
    name: 'Avena Calmante',
    short_desc: 'Crema exfoliante e hidratante con avena natural para pieles sensibles.',
    description:
      'Nuestra crema de Avena Calmante combina harina de avena natural con manteca y aceites vegetales para nutrir e hidratar profundamente. Ideal para manos resecas o sensibles.',
    ingredients:
      'Harina de Avena Natural, Manteca hidratante, Extracto de Aloe Vera, Aceite de Almendras Dulces, Vitamina E.',
    benefits: 'Hidrata profundamente, exfolia suavemente, calma irritaciones y rojeces.',
    image_url: '/images/producto-generico.png',
    accent_color: '#D8C089',
    variants: [
      { id: 1, size_label: 'Mini Bolsillo', size_grams: 30, price: 12, compare_price: null, stock: 40 },
      { id: 2, size_label: 'Tamaño de Viaje', size_grams: 60, price: 18, compare_price: null, stock: 35 },
      { id: 3, size_label: 'Tamaño Estándar', size_grams: 100, price: 25, compare_price: 29, stock: 50 },
      { id: 4, size_label: 'Tamaño Familiar', size_grams: 250, price: 45, compare_price: 52, stock: 20 },
    ],
  },
  {
    id: 2,
    slug: 'miel-nutritiva',
    name: 'Miel Nutritiva',
    short_desc: 'Crema artesanal con miel de abeja para una nutricion intensa.',
    description:
      'Elaborada con miel de abeja de flores silvestres, esta crema repara y nutre la piel de tus manos, dejandolas suaves y con un aroma dulce y natural.',
    ingredients:
      'Miel de Abeja, Harina de Avena Natural, Extracto de Aloe Vera, Aceite de Almendras Dulces, Vitamina E.',
    benefits: 'Nutre intensamente, repara la piel danada, aporta brillo natural y suavidad duradera.',
    image_url: '/images/producto-generico.png',
    accent_color: '#E7A93C',
    variants: [
      { id: 5, size_label: 'Mini Bolsillo', size_grams: 30, price: 13, compare_price: null, stock: 40 },
      { id: 6, size_label: 'Tamaño de Viaje', size_grams: 60, price: 19, compare_price: null, stock: 35 },
      { id: 7, size_label: 'Tamaño Estándar', size_grams: 100, price: 26, compare_price: 30, stock: 50 },
      { id: 8, size_label: 'Tamaño Familiar', size_grams: 250, price: 47, compare_price: 54, stock: 20 },
    ],
  },
  {
    id: 3,
    slug: 'vainilla-delicada',
    name: 'Vainilla Delicada',
    short_desc: 'Crema suave de aroma dulce, ideal para piel delicada y rostro.',
    description:
      'Con esencia natural de vainilla, esta crema de textura ligera hidrata sin sensacion grasosa. Su aroma delicado la convierte en la favorita para uso diario.',
    ingredients: 'Esencia de Vainilla, Harina de Avena Natural, Extracto de Aloe Vera, Aceite de Almendras Dulces.',
    benefits: 'Hidratacion ligera, aroma relajante, apta para piel delicada y uso facial.',
    image_url: '/images/producto-generico.png',
    accent_color: '#E8A6A0',
    variants: [
      { id: 9, size_label: 'Mini Bolsillo', size_grams: 30, price: 12, compare_price: null, stock: 40 },
      { id: 10, size_label: 'Tamaño de Viaje', size_grams: 60, price: 18, compare_price: null, stock: 35 },
      { id: 11, size_label: 'Tamaño Estándar', size_grams: 100, price: 25, compare_price: null, stock: 50 },
      { id: 12, size_label: 'Tamaño Familiar', size_grams: 250, price: 45, compare_price: null, stock: 20 },
    ],
  },
  {
    id: 4,
    slug: 'lavanda-relajante',
    name: 'Lavanda Relajante',
    short_desc: 'Crema calmante con esencia de lavanda, ideal para relajar las manos antes de dormir.',
    description:
      'Con esencia natural de lavanda, esta crema de textura suave calma y relaja la piel de tus manos mientras las hidrata profundamente. Su aroma floral la convierte en la favorita para el ritual de descanso nocturno.',
    ingredients:
      'Esencia de Lavanda (extracto natural), Harina de Avena Natural, Manteca hidratante, Extracto de Aloe Vera, Aceite de Almendras Dulces.',
    benefits: 'Relaja y calma la piel, favorece el descanso nocturno, hidratacion suave y duradera.',
    image_url: '/images/producto-generico.png',
    accent_color: '#B7A6D9',
    variants: [
      { id: 13, size_label: 'Mini Bolsillo', size_grams: 30, price: 12, compare_price: null, stock: 40 },
      { id: 14, size_label: 'Tamaño de Viaje', size_grams: 60, price: 18, compare_price: null, stock: 35 },
      { id: 15, size_label: 'Tamaño Estándar', size_grams: 100, price: 25, compare_price: null, stock: 50 },
      { id: 16, size_label: 'Tamaño Familiar', size_grams: 250, price: 45, compare_price: null, stock: 20 },
    ],
  },
];
