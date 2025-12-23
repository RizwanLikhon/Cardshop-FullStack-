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

  // Start the homepage train animation if the element exists
  startTrainAnimation();
});

/* ================= CART STORAGE ================= */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Resolve a possibly-relative image path into an absolute URL
function resolveImagePath(path) {
  if (!path) return path;
  try {
    return new URL(path, document.baseURI).href;
  } catch (e) {
    return path;
  }
}

/* ================= ADD TO CART (supports qty) ================= */
// Accept optional qty and store resolved image URL
function addToCart(product, qty = 1) {
  const count = parseInt(qty, 10) || 1;
  const cart = getCart();
  const item = cart.find(i => i.id === product.id);

  if (item) {
    item.qty = (item.qty || 0) + count;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: resolveImagePath(product.image),
      qty: count
    });
  }

  saveCart(cart);
  updateCartCount();
  renderCart();
}

// Helper for +/- buttons on product pages (expects an input with id `qty-<id>`)
function changeQty(id, delta) {
  const input = document.getElementById(`qty-${id}`);
  if (!input) return;
  let val = parseInt(input.value, 10) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
}

/* ================= CART COUNT ================= */
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + (i.qty || 0), 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = count;
}

/* ================= TAX CONFIG ================= */
let taxRate = 0.07; // default 7%
function setTaxRate(rate) {
  taxRate = Number(rate) || 0;
  renderCart();
}

/* ================= CART PAGE RENDER ================= */
function renderCart() {
  const container = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-total");
  const taxEl = document.getElementById("cart-tax");
  const taxRateDisplay = document.getElementById("tax-rate-display");
  const finalEl = document.getElementById("cart-final");

  const cart = getCart();
  let subtotal = 0;

  if (container) container.innerHTML = "";

  cart.forEach(item => {
    const qty = Number(item.qty) || 1;
    const price = Number(item.price) || 0;
    const rowTotal = price * qty;
    subtotal += rowTotal;

    const imgSrc = resolveImagePath(item.image);

    if (container) {
      container.innerHTML += `
      <div class="cart-row">
        <div class="cart-product">
          <img src="${imgSrc}" alt="${escapeHtml(item.name)}">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <small>SKU: ${escapeHtml(item.id)}</small>
            <div class="remove" onclick="removeItem('${escapeJs(item.id)}')">✕ Remove</div>
          </div>
        </div>

        <span>In Stock</span>

        <input
          type="number"
          min="1"
          value="${qty}"
          onchange="updateQty('${escapeJs(item.id)}', this.value)"
        >

        <span>$${price.toFixed(2)}</span>
        <span>$${rowTotal.toFixed(2)}</span>
      </div>
    `;
    }
  });

  const tax = subtotal * taxRate;
  const final = subtotal + tax;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (taxRateDisplay) taxRateDisplay.textContent = `${(taxRate * 100).toFixed(2)}%`;
  if (finalEl) finalEl.textContent = `$${final.toFixed(2)}`;
}

/* ================= UPDATE QTY ================= */
function updateQty(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty = parseInt(qty, 10) || 1;
  if (item.qty <= 0) {
    removeItem(id);
    return;
  }

  saveCart(cart);
  updateCartCount();
  renderCart();
}

/* ================= REMOVE ITEM ================= */
function removeItem(id) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  updateCartCount();
  renderCart();
}

/* ================= SMALL HELPERS ================= */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function escapeJs(str) {
  if (!str) return "";
  return String(str).replace(/'/g, "\\'");
}

/* ================= TRAIN / CONTINUOUS SCROLL ANIMATION =================
   Lightweight JS-driven continuous scroll that expects the track to contain
   two copies of the image set (as in Frontend/Index.html). It will animate
   the track to the left and wrap seamlessly.
*/
function startTrainAnimation() {
  const track = document.getElementById("train-track");
  if (!track) return;

  let offset = 0;
  // speed in pixels per second
  const speed = 80;
  let lastTime = performance.now();

  // measure half-width (one set). If there is no duplication, fall back.
  const measure = () => {
    const full = track.scrollWidth;
    // if the content isn't duplicated, we still animate the full width but will loop when offset >= full
    return full / 2 || full;
  };

  let halfWidth = measure();

  // keep track resize to recalc widths
  new ResizeObserver(() => {
    halfWidth = measure();
  }).observe(track);

  function step(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    offset += speed * dt;
    if (offset >= halfWidth) offset -= halfWidth;
    track.style.transform = `translateX(${-offset}px)`;
    requestAnimationFrame(step);
  }

  // set will-change for smoother transform
  track.style.willChange = "transform";
  requestAnimationFrame(step);
}