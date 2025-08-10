// Ano no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// MENU hambúrguer
const menuToggle = document.getElementById('menuToggle');
const mainMenu = document.getElementById('mainMenu');
if (menuToggle && mainMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// BUSCA (overlay no mobile)
const searchOpen = document.getElementById('searchOpen');
const searchOverlay = document.getElementById('searchOverlay');
const searchClose = document.getElementById('searchClose');
const searchMobile = document.getElementById('searchMobile');

function openSearch() {
  if (!searchOverlay) return;
  searchOverlay.hidden = false;
  setTimeout(() => searchMobile && searchMobile.focus(), 50);
}
function closeSearch() {
  if (!searchOverlay) return;
  searchOverlay.hidden = true;
}

searchOpen && searchOpen.addEventListener('click', openSearch);
searchClose && searchClose.addEventListener('click', closeSearch);
searchOverlay && searchOverlay.addEventListener('click', (e) => {
  if (e.target === searchOverlay) closeSearch();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && searchOverlay && !searchOverlay.hidden) closeSearch();
});

// --------- PRODUTOS ---------
const PRODUCTS_JSON_URL = './products.json'; // deixe o products.json na raiz

const money = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

let PRODUCTS = [];
let CART = [];

const els = {
  grid: document.getElementById('products'),
  cartModal: document.getElementById('cartModal'),
  closeCart: document.getElementById('closeCart'),
  cartItems: document.getElementById('cartItems'),
  cartItemsCount: document.getElementById('cartItemsCount'),
  cartTotal: document.getElementById('cartTotal'),
  clearCart: document.getElementById('clearCart'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  searchDesktop: document.getElementById('search'),
  searchMobile: document.getElementById('searchMobile'),
  // botões/contadores de carrinho: desktop + mobile
  cartBtn: document.getElementById('cartBtn'),
  cartBtnMobile: document.getElementById('cartBtnMobile'),
  cartCount: document.getElementById('cartCount'),
  cartCountMobile: document.getElementById('cartCountMobile'),
};

async function loadProducts() {
  try {
    const res = await fetch(PRODUCTS_JSON_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    PRODUCTS = await res.json();
    renderProducts(PRODUCTS);
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
    if (els.grid) {
      els.grid.innerHTML = `<p style="grid-column:1/-1;opacity:.7">Não foi possível carregar os produtos.</p>`;
    }
  }
}

function productCard(p) {
  return `
  <article class="card">
    <div class="media">
      <img src="${p.image}" alt="${p.name}">
    </div>
    <div class="body">
      <h3>${p.name}</h3>
      <div class="price">${money(p.price)}</div>
      <div class="cta">
        <button class="primary" data-add="${p.id}">Adicionar</button>
      </div>
    </div>
  </article>`;
}

function renderProducts(list) {
  if (!els.grid) return;
  if (!Array.isArray(list) || list.length === 0) {
    els.grid.innerHTML = `<p style="grid-column:1/-1;opacity:.7">Nenhum produto encontrado.</p>`;
    return;
  }
  els.grid.innerHTML = list.map(productCard).join('');
  // binds
  els.grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.getAttribute('data-add')));
  });
}

// --------- CARRINHO ---------
function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const item = CART.find(x => x.id === id);
  if (item) item.qty += 1;
  else CART.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 });
  updateCartUI();
  els.cartModal && els.cartModal.showModal();
}

function changeQty(id, delta) {
  const i = CART.findIndex(x => x.id === id);
  if (i < 0) return;
  CART[i].qty += delta;
  if (CART[i].qty <= 0) CART.splice(i, 1);
  updateCartUI();
}

function updateCartUI() {
  const totalItems = CART.reduce((s, it) => s + it.qty, 0);
  const totalPrice = CART.reduce((s, it) => s + it.qty * it.price, 0);

  if (els.cartCount) els.cartCount.textContent = String(totalItems);
  if (els.cartCountMobile) els.cartCountMobile.textContent = String(totalItems);
  if (els.cartItemsCount) els.cartItemsCount.textContent = String(totalItems);
  if (els.cartTotal) els.cartTotal.textContent = money(totalPrice);

  if (els.cartItems) {
    els.cartItems.innerHTML = CART.map(it => `
      <div class="cart-item">
        <img src="${it.image}" alt="${it.name}">
        <div>
          <h4>${it.name}</h4>
          <div class="meta">${money(it.price)} un.</div>
        </div>
        <div class="qty">
          <button data-dec="${it.id}">−</button>
          <strong>${it.qty}</strong>
          <button data-inc="${it.id}">+</button>
        </div>
      </div>
    `).join('') || `<p style="opacity:.7">Seu carrinho está vazio.</p>`;

    // bind qty buttons
    els.cartItems.querySelectorAll('[data-inc]').forEach(b => {
      b.addEventListener('click', () => changeQty(b.getAttribute('data-inc'), +1));
    });
    els.cartItems.querySelectorAll('[data-dec]').forEach(b => {
      b.addEventListener('click', () => changeQty(b.getAttribute('data-dec'), -1));
    });
  }

  // WhatsApp checkout
  if (els.checkoutBtn) {
    const lines = CART.map(it => `• ${it.name} x${it.qty} — ${money(it.qty * it.price)}`);
    const msg = `Olá! Quero finalizar minha compra:%0A%0A${lines.join('%0A')}%0A%0ATotal: ${money(totalPrice)}`;
    els.checkoutBtn.href = `https://wa.me/?text=${msg}`;
  }
}

// binds carrinho (desktop e mobile)
els.cartBtn && els.cartBtn.addEventListener('click', () => els.cartModal && els.cartModal.showModal());
els.cartBtnMobile && els.cartBtnMobile.addEventListener('click', () => els.cartModal && els.cartModal.showModal());
els.closeCart && els.closeCart.addEventListe
