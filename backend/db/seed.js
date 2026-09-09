const db = require('./database');

// Images use loremflickr.com, which returns a real photo matching the given
// tags (pulled from Flickr) instead of a random unrelated picture — so each
// product actually looks like what it's named.
const products = [
  ['Wireless Mouse', 'Ergonomic wireless mouse with USB receiver.', 599, 'https://loremflickr.com/400/300/wireless,mouse,computer', 50, 'Electronics'],
  ['Mechanical Keyboard', 'RGB backlit mechanical keyboard, blue switches.', 2499, 'https://loremflickr.com/400/300/mechanical,keyboard', 30, 'Electronics'],
  ['Bluetooth Headphones', 'Over-ear headphones with noise cancellation.', 3499, 'https://loremflickr.com/400/300/headphones', 25, 'Electronics'],
  ['Laptop Stand', 'Adjustable aluminium laptop stand.', 1299, 'https://loremflickr.com/400/300/laptop,stand', 40, 'Accessories'],
  ['USB-C Hub', '7-in-1 USB-C hub with HDMI and card reader.', 1799, 'https://loremflickr.com/400/300/usb,hub,cable', 35, 'Accessories'],
  ['Desk Lamp', 'LED desk lamp with adjustable brightness.', 899, 'https://loremflickr.com/400/300/desk,lamp', 20, 'Home'],
  ['Water Bottle', 'Insulated stainless steel water bottle, 1L.', 449, 'https://loremflickr.com/400/300/water,bottle,steel', 60, 'Home'],
  ['Backpack', 'Water-resistant laptop backpack, 20L.', 1999, 'https://loremflickr.com/400/300/backpack', 15, 'Accessories'],
];

const insert = db.prepare(`
  INSERT INTO products (name, description, price, image_url, stock, category)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const existing = db.prepare('SELECT COUNT(*) AS count FROM products').get();
if (existing.count === 0) {
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(...row);
  });
  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} else {
  console.log('Products already exist, skipping seed.');
}
