const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}
function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}
function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

function renderNavbar() {
  const user = getUser();
  const nav = document.getElementById('navbar');
  if (!nav) return;

  nav.innerHTML = `
    <a href="index.html" class="brand">Cartify</a>
    <nav>
      <a href="index.html">Products</a>
      ${user ? `<a href="cart.html">Cart<span class="cart-count" id="cart-count">0</span></a>` : ''}
      ${user ? `<a href="orders.html">Orders</a>` : ''}
      ${user
        ? `<span>Hi, ${user.name}</span><button id="logout-btn">Logout</button>`
        : `<a href="login.html">Login</a><a href="register.html" class="btn">Sign up</a>`
      }
    </nav>
  `;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = 'index.html';
    });
  }

  if (user) updateCartCount();
}

async function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  try {
    const { items } = await api('/cart');
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    el.textContent = count;
  } catch (e) {
    // not logged in or error; ignore
  }
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}
