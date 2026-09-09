const express = require('express');
const db = require('../db/database');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

// POST /api/orders  { shipping_name, shipping_address }
// Converts the user's current cart into an order.
router.post('/', (req, res) => {
  const { shipping_name, shipping_address } = req.body;
  if (!shipping_name || !shipping_address) {
    return res.status(400).json({ error: 'shipping_name and shipping_address are required' });
  }

  const cartItems = db
    .prepare(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`
    )
    .all(req.user.id);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  for (const item of cartItems) {
    if (item.quantity > item.stock) {
      return res.status(400).json({ error: `Not enough stock for ${item.name}` });
    }
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const placeOrder = db.transaction(() => {
    const orderInfo = db
      .prepare(
        `INSERT INTO orders (user_id, total, shipping_name, shipping_address)
         VALUES (?, ?, ?, ?)`
      )
      .run(req.user.id, total, shipping_name, shipping_address);

    const orderId = orderInfo.lastInsertRowid;
    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
       VALUES (?, ?, ?, ?)`
    );
    const decrementStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.quantity, item.price);
      decrementStock.run(item.quantity, item.product_id);
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    return orderId;
  });

  const orderId = placeOrder();
  res.status(201).json({ message: 'Order placed', order_id: orderId, total });
});

// GET /api/orders — order history for the logged-in user
router.get('/', (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);

  const itemStmt = db.prepare(
    `SELECT oi.*, p.name, p.image_url
     FROM order_items oi JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`
  );

  const withItems = orders.map((o) => ({ ...o, items: itemStmt.all(o.id) }));
  res.json(withItems);
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db
    .prepare(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`
    )
    .all(order.id);

  res.json({ ...order, items });
});

module.exports = router;
