import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const DISTRICTS_WITH_FREE_SHIPPING = new Set(); // ejemplo: agregar distritos sin costo de envio
const SHIPPING_COST = 8.0;

function generateOrderCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MLP-${timestamp}-${random}`;
}

// POST /api/orders -> crea una orden pendiente de verificacion de pago Yape
router.post('/', async (req, res) => {
  const {
    customerName,
    customerPhone,
    deliveryMethod = 'delivery',
    deliveryAddress,
    deliveryDistrict,
    notes,
    yapeOperationCode,
    items, // [{ variantId, quantity }]
  } = req.body;

  if (!customerName || !customerPhone) {
    return res.status(400).json({ error: 'Nombre y telefono son obligatorios' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El carrito esta vacio' });
  }
  if (deliveryMethod === 'delivery' && !deliveryAddress) {
    return res.status(400).json({ error: 'La direccion es obligatoria para delivery' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      const variantResult = await client.query(
        `SELECT pv.id, pv.price, pv.stock, pv.size_label, p.name AS product_name
         FROM product_variants pv
         JOIN products p ON p.id = pv.product_id
         WHERE pv.id = $1 AND pv.is_active = TRUE
         FOR UPDATE`,
        [item.variantId]
      );

      if (variantResult.rows.length === 0) {
        throw Object.assign(new Error(`Variante ${item.variantId} no existe`), { status: 400 });
      }

      const variant = variantResult.rows[0];
      const quantity = Number(item.quantity) || 0;

      if (quantity <= 0) {
        throw Object.assign(new Error('Cantidad invalida'), { status: 400 });
      }
      if (variant.stock < quantity) {
        throw Object.assign(
          new Error(`Stock insuficiente para ${variant.product_name} (${variant.size_label})`),
          { status: 409 }
        );
      }

      const lineTotal = Number(variant.price) * quantity;
      subtotal += lineTotal;

      resolvedItems.push({
        variantId: variant.id,
        productName: variant.product_name,
        sizeLabel: variant.size_label,
        unitPrice: Number(variant.price),
        quantity,
        lineTotal,
      });
    }

    const shippingCost =
      deliveryMethod === 'pickup' || DISTRICTS_WITH_FREE_SHIPPING.has(deliveryDistrict)
        ? 0
        : SHIPPING_COST;
    const total = subtotal + shippingCost;
    const orderCode = generateOrderCode();

    const orderResult = await client.query(
      `INSERT INTO orders
        (order_code, customer_name, customer_phone, delivery_method, delivery_address,
         delivery_district, notes, subtotal, shipping_cost, total, payment_method,
         yape_operation_code, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'yape',$11,'pendiente_pago')
       RETURNING id, order_code, total, status, created_at`,
      [
        orderCode,
        customerName,
        customerPhone,
        deliveryMethod,
        deliveryAddress || null,
        deliveryDistrict || null,
        notes || null,
        subtotal,
        shippingCost,
        total,
        yapeOperationCode || null,
      ]
    );

    const order = orderResult.rows[0];

    for (const item of resolvedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, variant_id, product_name, size_label, unit_price, quantity, line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [order.id, item.variantId, item.productName, item.sizeLabel, item.unitPrice, item.quantity, item.lineTotal]
      );

      await client.query(
        `UPDATE product_variants SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.variantId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      orderCode: order.order_code,
      status: order.status,
      subtotal,
      shippingCost,
      total,
      createdAt: order.created_at,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creando orden', err);
    res.status(err.status || 500).json({ error: err.message || 'No se pudo crear la orden' });
  } finally {
    client.release();
  }
});

// GET /api/orders/:code -> consultar estado de una orden por su codigo
router.get('/:code', async (req, res) => {
  try {
    const orderResult = await pool.query(
      `SELECT order_code, customer_name, status, subtotal, shipping_cost, total, created_at
       FROM orders WHERE order_code = $1`,
      [req.params.code]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const itemsResult = await pool.query(
      `SELECT product_name, size_label, unit_price, quantity, line_total
       FROM order_items WHERE order_id = (SELECT id FROM orders WHERE order_code = $1)`,
      [req.params.code]
    );

    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    console.error('Error obteniendo orden', err);
    res.status(500).json({ error: 'No se pudo obtener la orden' });
  }
});

export default router;
