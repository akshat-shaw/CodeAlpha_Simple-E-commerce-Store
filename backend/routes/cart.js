const express = require('express');
const db = require('../db/database');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

// GET /api/cart
router.get('/', (req, res) => {
  const items = db
    .prepare(
      `SELECT ci.id AS cart_item_id, ci.quantity, p.*
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`
    )
    .all(req.user.id);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json({ items, total });
});

// POST /api/cart  { product_id, quantity }
router.post('/', (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1' });

  const existing = db
    .prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, product_id);

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(
      quantity,
      existing.id
    );
  } else {
    db.prepare(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)'
    ).run(req.user.id, product_id, quantity);
  }
  res.status(201).json({ message: 'Added to cart' });
});

// PUT /api/cart/:cartItemId  { quantity }
router.put('/:cartItemId', (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }
  const item = db
    .prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?')
    .get(req.params.cartItemId, req.user.id);
  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(
    quantity,
    req.params.cartItemId
  );
  res.json({ message: 'Cart updated' });
});

// DELETE /api/cart/:cartItemId
router.delete('/:cartItemId', (req, res) => {
  const result = db
    .prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?')
    .run(req.params.cartItemId, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Cart item not found' });
  res.json({ message: 'Item removed' });
});

module.exports = router;
