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
});

/* ================= CART STORAGE ================= */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ================= CART COUNT ================= */
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = count;
}

/* ================= ADD TO CART ================= */
function addToCart(product, qty = 1) {
  const count = parseInt(qty, 10) || 1;
  const cart = getCart();
  const item = cart.find(i => i.id === product.id);

  if (item) {
    item.qty += count;
  } else {
    cart.push({ ...product, qty: count });
  }

  saveCart(cart);
  updateCartCount();
  renderCart();
}

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
            <strong>${item.name}</strong>
            <div class="remove" onclick="removeItem(${item.id})">Remove</div>
          </div>
        </div>
        <span>In Stock</span>
        <input type="number" min="1" value="${item.qty}"
          onchange="updateQty(${item.id}, this.value)">
        <span>$${item.price.toFixed(2)}</span>
        <span>$${rowTotal.toFixed(2)}</span>
      </div>
    `;
  });

  const tax = subtotal * 0.07;
  const total = subtotal + tax;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (finalEl) finalEl.textContent = `$${total.toFixed(2)}`;
}

/* ================= QTY / REMOVE ================= */
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

/* ================= STRIPE CHECKOUT ================= */
async function checkout() {
  const cart = getCart();

  if (!cart.length) {
    alert("Your cart is empty");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart })
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Checkout failed");
      console.error(data);
    }
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Something went wrong with checkout");
  }
}

/* ================= EXPOSE FOR HTML ================= */
window.addToCart = addToCart;
window.removeItem = removeItem;
window.updateQty = updateQty;
window.checkout = checkout;
