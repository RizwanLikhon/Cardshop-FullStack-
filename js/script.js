document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();

  const btn = document.getElementById("productsBtn");
  const menu = document.getElementById("productsMenu");

  if (btn && menu) {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      menu.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      menu.classList.remove("show");
    });
  }

  // 🔥 NEW: load products from backend if grid exists
  loadProducts();

  startTrainAnimation();
});

/* ================= BACKEND PRODUCTS ================= */
async function loadProducts() {
  const grid = document.querySelector(".pokemon-grid");
  if (!grid) return;

  const category = grid.dataset.category;
  if (!category) return;

  try {
    const res = await fetch("http://localhost:5000/api/products");
    const products = await res.json();

    grid.innerHTML = "";

    products
      .filter(p => p.category === category)
      .forEach(p => {
        grid.innerHTML += `
          <div class="pokemon-product">
            <img src="${p.image}" alt="${escapeHtml(p.name)}">
            <h3>${escapeHtml(p.name)}</h3>
            <p class="price">$${Number(p.price).toFixed(2)}</p>

            <div class="qty-controls">
              <button type="button" onclick="changeQty('${p.id}', -1)">−</button>
              <input id="qty-${p.id}" type="number" min="1" value="1">
              <button type="button" onclick="changeQty('${p.id}', 1)">+</button>
            </div>

            <button onclick="addToCart({
              id:'${p.id}',
              name:'${escapeJs(p.name)}',
              price:${p.price},
              image:'${p.image}'
            }, document.getElementById('qty-${p.id}').value)">
              Add to Cart
            </button>
          </div>
        `;
      });

  } catch (err) {
    console.error("Failed to load products:", err);
  }
}

/* ================= CART STORAGE ================= */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function resolveImagePath(path) {
  if (!path) return path;
  try {
    return new URL(path, document.baseURI).href;
  } catch {
    return path;
  }
}

/* ================= ADD TO CART ================= */
function addToCart(product, qty = 1) {
  const count = parseInt(qty, 10) || 1;
  const cart = getCart();
  const item = cart.find(i => i.id === product.id);

  if (item) {
    item.qty += count;
  } else {
    cart.push({
      ...product,
      image: resolveImagePath(product.image),
      qty: count
    });
  }

  saveCart(cart);
  updateCartCount();
  renderCart();
}

/* ================= QTY ================= */
function changeQty(id, delta) {
  const input = document.getElementById(`qty-${id}`);
  if (!input) return;
  let val = parseInt(input.value, 10) || 1;
  input.value = Math.max(1, val + delta);
}

/* ================= CART COUNT ================= */
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = count;
}

/* ================= TAX ================= */
let taxRate = 0.07;

/* ================= CART PAGE ================= */
function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const subtotalEl = document.getElementById("cart-total");
  const taxEl = document.getElementById("cart-tax");
  const finalEl = document.getElementById("cart-final");

  const cart = getCart();
  let subtotal = 0;
  container.innerHTML = "";

  cart.forEach(item => {
    const rowTotal = item.price * item.qty;
    subtotal += rowTotal;

    container.innerHTML += `
      <div class="cart-row">
        <div class="cart-product">
          <img src="${item.image}">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <div class="remove" onclick="removeItem('${escapeJs(item.id)}')">Remove</div>
          </div>
        </div>
        <span>In Stock</span>
        <input type="number" min="1" value="${item.qty}"
          onchange="updateQty('${escapeJs(item.id)}', this.value)">
        <span>$${item.price.toFixed(2)}</span>
        <span>$${rowTotal.toFixed(2)}</span>
      </div>
    `;
  });

  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (finalEl) finalEl.textContent = `$${total.toFixed(2)}`;
}

function updateQty(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, parseInt(qty, 10) || 1);
  saveCart(cart);
  updateCartCount();
  renderCart();
}

function removeItem(id) {
  saveCart(getCart().filter(i => i.id !== id));
  updateCartCount();
  renderCart();
}

/* ================= HELPERS ================= */
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])
  );
}

function escapeJs(str) {
  return String(str || "").replace(/'/g, "\\'");
}

/* ================= TRAIN ANIMATION ================= */
function startTrainAnimation() {
  const track = document.getElementById("train-track");
  if (!track) return;

  let offset = 0;
  const speed = 80;
  let last = performance.now();
  let width = track.scrollWidth / 2;

  new ResizeObserver(() => {
    width = track.scrollWidth / 2;
  }).observe(track);

  function step(now) {
    offset += ((now - last) / 1000) * speed;
    last = now;
    if (offset >= width) offset -= width;
    track.style.transform = `translateX(${-offset}px)`;
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
