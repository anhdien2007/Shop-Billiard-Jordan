const PRODUCTS = [
  {
    id: "cue-1",
    name: "David Loman Phantom Cue",
    category: "cue",
    price: 609.0,
    rating: 4.99,
    stock: 2,
    tags: ["Carbon", "Low Deflection", "Pro"],
    desc: "Smooth hit, low deflection feel. Great for serious players.",
    image: "images/cue1.jpg"
  },
  {
    id: "cue-2",
    name: "Maple Classic Cue",
    category: "cue",
    price: 799.0,
    rating: 5.0,
    stock: 3,
    tags: ["Maple", "Accurate", "Value"],
    desc: "Classic maple cue with a clean finish and solid control.",
    image: "images/cue2.jpg"
  },
  {
    id: "glove-1",
    name: "Pro Grip Glove",
    category: "glove",
    price: 49.9,
    rating: 4.7,
    stock: 15,
    tags: ["Grip", "Comfort", "Durable"],
    desc: "Enhanced grip for better control and comfort during play.",
    image: "images/glove1.jpg"
  },
  {
    id: "glove-2",
    name: "Different Type Of Glove",
    category: "glove",
    price: 39.9,
    rating: 4.5,
    stock: 10,
    tags: ["Lightweight", "Breathable", "Flexible"],
    desc: "Lightweight glove that offers breathability and flexibility.",
    image: "images/glove2.jpg"
  },
  {
    id: "chalk-1",
    name: "Premium Chalk",
    category: "chalk",
    price: 29.9,
    rating: 4.8,
    stock: 20,
    tags: ["Premium", "Non-Clumping", "Long-lasting"],
    desc: "High-quality chalk for consistent cue ball control.",
    image: "images/chalk1.jpg"
  },
  {
    id: "cue case-1",
    name: "Perfect cue case",
    category: "cue case",
    price: 20.9,
    rating: 4.6,
    stock: 8,
    tags: ["Durable", "Spacious", "Lightweight"],
    desc: "Durable and spacious case for your cue.",
    image: "images/cuecase1.jpg"
  }
];

const cart = new Map();

const gridEl = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");

const backdrop = document.getElementById("backdrop");
const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");
const subTotalEl = document.getElementById("subTotal");
const shipEl = document.getElementById("ship");
const totalEl = document.getElementById("total");
const okMsg = document.getElementById("okMsg");

const openCartBtn = document.getElementById("openCart");
const openCartBtn2 = document.getElementById("openCart2");
const closeCartBtn = document.getElementById("closeCart");
const clearBtn = document.getElementById("clearBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

const money = (n) => "$" + n.toFixed(2);

function cartQty(){
  return [...cart.values()].reduce((a,b)=>a+b,0);
}

function calcTotals(){
  let subtotal = 0;
  for (const [id, qty] of cart.entries()){
    const p = PRODUCTS.find(x => x.id === id);
    if (p) subtotal += p.price * qty;
  }
  const shipping = subtotal === 0 ? 0 : (subtotal >= 150 ? 0 : 6.90);
  const total = subtotal + shipping;

  subTotalEl.textContent = money(subtotal);
  shipEl.textContent = (shipping === 0 && subtotal > 0) ? "FREE" : money(shipping);
  totalEl.textContent = money(total);
  cartCount.textContent = String(cartQty());
}

function openCart(){
  okMsg.style.display = "none";
  backdrop.style.display = "flex";
  renderCart();
  calcTotals();
}
function closeCart(){
  backdrop.style.display = "none";
}

function addToCart(id, btnEl){
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const qty = cart.get(id) || 0;
  if (qty >= p.stock) return alert("Not enough stock.");

  // ✅ Update cart data
  cart.set(id, qty + 1);
  calcTotals();

  // ✅ Fly animation
  flyToCart(btnEl);

  // ✅ Tiny cart bump
  const cartBtn = document.getElementById("openCart");
  cartBtn.classList.remove("cart-bump");
  void cartBtn.offsetWidth; // restart animation
  cartBtn.classList.add("cart-bump");
}
function flyToCart(btnEl){
  const card = btnEl.closest(".card");
  if (!card) return;

  const img = card.querySelector(".thumb img");
  const cartBtn = document.getElementById("openCart");
  if (!img || !cartBtn) return;

  // Get start & end positions
  const imgRect = img.getBoundingClientRect();
  const cartRect = cartBtn.getBoundingClientRect();

  // Create a clone image
  const clone = img.cloneNode(true);
  clone.classList.add("fly-img");

  clone.style.left = imgRect.left + "px";
  clone.style.top = imgRect.top + "px";
  clone.style.width = imgRect.width + "px";
  clone.style.height = imgRect.height + "px";

  document.body.appendChild(clone);

  // Move it to cart
  const endX = cartRect.left + cartRect.width / 2 - imgRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2 - imgRect.height / 2;

  requestAnimationFrame(() => {
    clone.style.transform = `translate(${endX - imgRect.left}px, ${endY - imgRect.top}px) scale(0.2)`;
    clone.style.opacity = "0.2";
  });

  // Remove after animation
  setTimeout(() => clone.remove(), 800);
}

function setQty(id, next){
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if (next <= 0) cart.delete(id);
  else cart.set(id, Math.min(next, p.stock));
  renderCart();
  calcTotals();
}

function getFiltered(){
  const q = searchInput.value.trim().toLowerCase();
  const cat = categorySelect.value;

  let items = PRODUCTS.filter(p => {
    const matchesQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.tags.join(" ").toLowerCase().includes(q);

    const matchesCat = (cat === "all" || p.category === cat);
    return matchesQ && matchesCat;
  });

  const sort = sortSelect.value;
  if (sort === "low") items.sort((a,b)=>a.price-b.price);
  if (sort === "high") items.sort((a,b)=>b.price-a.price);
  if (sort === "rating") items.sort((a,b)=>b.rating-a.rating);

  return items;
}

function renderProducts(){
  const items = getFiltered();
  gridEl.innerHTML = items.map(p => `
    <article class="card">
      <div class="thumb">
        <img src="${p.image}" alt="${p.name}"
          onerror="this.style.display='none'; console.log('Missing image:', this.src)">
        <div class="badge">${p.category.toUpperCase()}</div>
        <div class="priceTag">${money(p.price)}</div>
      </div>

      <div class="body">
        <div class="top">
          <h3>${p.name}</h3>
          <div class="rating">⭐ ${p.rating.toFixed(1)}</div>
        </div>
        <div class="desc">${p.desc}</div>
        <div class="tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>

        <div class="bottom">
          <div class="stock">Stock: <b>${p.stock}</b></div>
          <button class="add" onclick="addToCart('${p.id}', this)">+ Add</button>

        </div>
      </div>
    </article>
  `).join("");
}

function renderCart(){
  if (cart.size === 0){
    cartList.innerHTML = `<div style="padding:14px; color:var(--muted); font-weight:900">Cart is empty ✨</div>`;
    return;
  }

  const rows = [];
  for (const [id, qty] of cart.entries()){
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) continue;
    rows.push(`
      <div class="item">
        <div>
          <div class="name">${p.name}</div>
          <div class="mini">${money(p.price)} • ${p.category.toUpperCase()}</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="qty">
            <button class="qbtn" onclick="setQty('${id}', ${qty-1})">−</button>
            <b>${qty}</b>
            <button class="qbtn" onclick="setQty('${id}', ${qty+1})">+</button>
          </div>
          <button class="rbtn" onclick="setQty('${id}', 0)">Remove</button>
        </div>
      </div>
    `);
  }
  cartList.innerHTML = rows.join("");
}

searchInput.addEventListener("input", renderProducts);
categorySelect.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);

openCartBtn.addEventListener("click", openCart);
openCartBtn2.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeCart(); });

clearBtn.addEventListener("click", () => {
  cart.clear();
  okMsg.style.display = "none";
  renderCart();
  calcTotals();
});

checkoutBtn.addEventListener("click", () => {
  if (cart.size === 0) return alert("Cart is empty.");
  okMsg.style.display = "block";
});

renderProducts();
calcTotals();