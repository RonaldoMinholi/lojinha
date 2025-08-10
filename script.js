// ===== util =====
document.getElementById('year').textContent = new Date().getFullYear();

const money = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ===== SEU NÚMERO DE WHATSAPP (E.164) =====
// Ex.: 5511912345678 (Brasil 55 + DDD 11 + número)
const VENDOR_PHONE = '5551993520729';

// ===== menu hambúrguer =====
const menuToggle = document.getElementById('menuToggle');
const mainMenu = document.getElementById('mainMenu');
if (menuToggle && mainMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// ===== busca (overlay no mobile) =====
const searchOpen = document.getElementById('searchOpen');
const searchOverlay = document.getElementById('searchOverlay');
const searchClose = document.getElementById('searchClose');
const searchMobile = document.getElementById('searchMobile');

function openSearch() {
  if (!searchOverlay) return;
  searchOverlay.hidden = false;
  setTimeout(() => searchMobile && searchMobile.focus(), 40);
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

// ===== estados & refs =====
let PRODUCTS = [];
let CART = [];

const els = {
  grid: document.getElementById('products'),

  // busca
  searchDesktop: document.getElementById('search'),
  searchMobile: document.getElementById('searchMobile'),

  // carrinho
  cartModal: document.getElementById('cartModal'),
  cartItems: document.getElementById('cartItems'),
  cartItemsCount: document.getElementById('cartItemsCount'),
  cartTotal: document.getElementById('cartTotal'),
  closeCart: document.getElementById('closeCart'),
  clearCart: document.getElementById('clearCart'),
  checkoutBtn: document.getElementById('checkoutBtn'),

  // botões/contadores (desktop e mobile)
  cartBtn: document.getElementById('cartBtn'),
  cartBtnMobile: document.getElementById('cartBtnMobile'),
  cartCount: document.getElementById('cartCount'),
  cartCountMobile: document.getElementById('cartCountMobile'),
};

// ===== carregar produtos (raiz com fallbacks) =====
const CANDIDATE_JSON_PATHS = [
  '/products.json',
  './products.json',
  '/assets/products.json',
  './assets/products.json',
  '/data/products.json',
  './data/products.json',
];

async function loadProducts() {
  let lastErr = null;
  for (const url of CANDIDATE_JSON_PATHS) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error(`JSON não é array em ${url}`);
      PRODUCTS = data;
      renderProducts(PRODUCTS);
      console.log(`Produtos carregados de: ${url}`);
      return;
    } catch (e) {
      lastErr = e;
      console.warn(`Falha carregando ${url}:`, e?.message || e);
    }
  }
  console.error('Não consegui carregar products.json de nenhum caminho.', lastErr);
  if (els.grid) {
    els.grid.innerHTML =
      `<p style="grid-column:1/-1;opacity:.7">Não foi possível carregar os produtos.</p>`;
  }
}

// ===== renderização =====
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
  if (!list || list.length === 0) {
    els.grid.innerHTML =
      `<p style="grid-column:1/-1;opacity:.7">Nenhum produto encontrado.</p>`;
    return;
  }
  els.grid.innerHTML = list.map(productCard).join('');

  // bind botões de adicionar
  els.grid.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(btn.getAttribute('data-add')));
  });
}

// ===== carrinho =====
function addToCart(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  const item = CART.find((x) => x.id === id);
  if (item) item.qty += 1;
  else CART.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 });
  updateCartUI();
  els.cartModal && els.cartModal.showModal();
}

function changeQty(id, delta) {
  const i = CART.findIndex((x) => x.id === id);
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
    els.cartItems.innerHTML =
      CART.map(
        (it) => `
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
      </div>`
      ).join('') || `<p style="opacity:.7">Seu carrinho está vazio.</p>`;

    // binds de quantidade
    els.cartItems.querySelectorAll('[data-inc]').forEach((b) => {
      b.addEventListener('click', () => changeQty(b.getAttribute('data-inc'), +1));
    });
    els.cartItems.querySelectorAll('[data-dec]').forEach((b) => {
      b.addEventListener('click', () => changeQty(b.getAttribute('data-dec'), -1));
    });
  }

  // ===== WhatsApp (formato desejado + conversa com seu número) =====
  if (els.checkoutBtn) {
    const lines = CART.map(
      (it) => `• ${it.qty} x ${it.name} — ${money(it.qty * it.price)}`
    );
    const plainMsg =
`Olá! Quero finalizar minha compra:

${lines.join('\n')}

Total: ${money(totalPrice)}`;
    const encoded = encodeURIComponent(plainMsg);
    els.checkoutBtn.href = `https://wa.me/${VENDOR_PHONE}?text=${encoded}`;
  }
}

// binds carrinho
els.cartBtn && els.cartBtn.addEventListener('click', () => els.cartModal && els.cartModal.showModal());
els.cartBtnMobile && els.cartBtnMobile.addEventListener('click', () => els.cartModal && els.cartModal.showModal());
els.closeCart && els.closeCart.addEventListener('click', () => els.cartModal && els.cartModal.close());
els.clearCart && els.clearCart.addEventListener('click', () => { CART = []; updateCartUI(); });

// ===== busca (filtrar produtos) =====
function hookSearch(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener('input', (e) => {
    const q = String(e.target.value || '').toLowerCase();
    const filtered = PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
    renderProducts(filtered);
  });
}
hookSearch(els.searchDesktop);
hookSearch(els.searchMobile);

// ===== start =====
loadProducts();
