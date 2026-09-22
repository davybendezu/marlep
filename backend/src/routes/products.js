import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// GET /api/products -> catalogo completo con variantes agrupadas
router.get('/', async (_req, res) => {
  try {
    const productsResult = await query(
      `SELECT id, slug, name, short_desc, description, ingredients, benefits, image_url, accent_color
       FROM products WHERE is_active = TRUE ORDER BY id ASC`
    );

    const variantsResult = await query(
      `SELECT id, product_id, sku, size_label, size_grams, price, compare_price, stock
       FROM product_variants WHERE is_active = TRUE ORDER BY size_grams ASC`
    );

    const products = productsResult.rows.map((product) => ({
      ...product,
      variants: variantsResult.rows.filter((v) => v.product_id === product.id),
    }));

    res.json(products);
  } catch (err) {
    console.error('Error listando productos', err);
    res.status(500).json({ error: 'No se pudo obtener el catalogo' });
  }
});

// GET /api/products/:slug -> detalle de un producto
router.get('/:slug', async (req, res) => {
  try {
    const productResult = await query(
      `SELECT id, slug, name, short_desc, description, ingredients, benefits, image_url, accent_color
       FROM products WHERE slug = $1 AND is_active = TRUE`,
      [req.params.slug]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const product = productResult.rows[0];

    const variantsResult = await query(
      `SELECT id, sku, size_label, size_grams, price, compare_price, stock
       FROM product_variants WHERE product_id = $1 AND is_active = TRUE ORDER BY size_grams ASC`,
      [product.id]
    );

    res.json({ ...product, variants: variantsResult.rows });
  } catch (err) {
    console.error('Error obteniendo producto', err);
    res.status(500).json({ error: 'No se pudo obtener el producto' });
  }
});

export default router;
