import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/config/yape', (_req, res) => {
  res.json({
    titular: process.env.YAPE_TITULAR || 'Marlep Cosmetics',
    numero: process.env.YAPE_NUMERO || '999999999',
  });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Marlep API escuchando en http://localhost:${PORT}`);
  });
}

export default app;
