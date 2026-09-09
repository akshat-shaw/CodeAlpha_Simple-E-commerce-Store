# Cartify — Simple E-commerce Store

Full-stack e-commerce app built for Task 1.

**Stack:** Express.js (Node) backend, SQLite database, plain HTML/CSS/JavaScript frontend.

## Features
- Product listings with search & category filter
- Product details page
- Shopping cart (add / update quantity / remove)
- User registration & login (JWT-based auth, passwords hashed with bcrypt)
- Order processing (checkout converts cart → order, decrements stock, stores order history)
- SQLite database storing products, users, carts, and orders

## How to run

```bash
cd backend
npm install
npm run seed     # populates the database with sample products (run once)
npm start
```

Then open **http://localhost:5000** in your browser. The Express server serves the frontend directly, so there's nothing else to start.

## Project structure
```
ecommerce-store/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── db/
│   │   ├── database.js    # SQLite connection + schema
│   │   └── seed.js        # sample product data
│   ├── routes/
│   │   ├── auth.js        # register / login
│   │   ├── products.js    # product listing / details
│   │   ├── cart.js        # cart CRUD
│   │   └── orders.js      # checkout / order history
│   └── middleware/
│       └── auth.js        # JWT verification
└── frontend/
    ├── index.html          # product listing
    ├── product.html        # product details
    ├── login.html / register.html
    ├── cart.html
    ├── checkout.html / order-success.html
    ├── orders.html         # order history
    ├── css/style.css
    └── js/api.js           # shared fetch helper + auth/nav logic
```

## API overview
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | create account |
| POST | /api/auth/login | — | log in |
| GET | /api/products | — | list products (supports `?search=` `?category=`) |
| GET | /api/products/:id | — | product detail |
| GET | /api/cart | ✔ | view cart |
| POST | /api/cart | ✔ | add item |
| PUT | /api/cart/:id | ✔ | update quantity |
| DELETE | /api/cart/:id | ✔ | remove item |
| POST | /api/orders | ✔ | place order (checkout) |
| GET | /api/orders | ✔ | order history |

## Notes
- JWT secret defaults to a dev value; set `JWT_SECRET` in a `.env` file for anything beyond local testing.
- SQLite was chosen over Postgres for zero-config setup — no separate DB server needed to run or demo this.
