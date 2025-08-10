(() => {
  // ===== CONFIGURE SEU WHATSAPP AQUI =====
  // Formato: DDI + DDD + número, apenas dígitos. Ex.: 5518999999999
  const WHATSAPP_PHONE = '5511999999999'; // <-- TROQUE PELO SEU NÚMERO

  const STORAGE_KEY = 'cart';
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const cartBtn     = $('#cartBtn');
  const cartBadge   = $('#cartBadge');
  const cartDrawer  = $('#cartDrawer');
  const cartOverlay = $('#cartOverlay');
  const closeCart   = $('#closeCart');
  const cartItems   = $('#cartItems');
  const cartTotal   = $('#cartTotal');
  const checkoutBtn = $('#checkoutBtn');

  // Estado
  let cart = loadCart();

  // ===== Helpers =====
  function loadCart(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }
  function saveCart(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }
  const fmtBRL = (n) => n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  function getCount(){ return cart.reduce((acc, it) => acc + it.qty, 0); }
  function getTotal(){ return cart.reduce((acc, it) => acc + it.price * it.qty, 0); }

  function syncBadge(){
    const count = getCount();
    if (count > 0){
      cartBadge.textContent = count;
      cartBadge.hidden = false;
    } else {
      cartBadge.hidden = true;
    }
  }

  function openDrawer(){
    cartDrawer.classList.add('open');
    cartOverlay.hidden = false;
    cartDrawer.setAttribute('aria-hidden', 'false');
  }
  function closeDrawer(){
    cartDrawer.classList.remove('open');
    cartOverlay.hidden = true;
    cartDrawer.setAttribute('aria-hidden', 'true');
  }

  function renderCart(){
    if (cart.length === 0){
      cartItems.innerHTML = `<p style="color:#4b5361">Seu carrinho está vazio.</p>`;
      cartTotal.textContent = fmtBRL(0);
      return;
    }
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">${fmtBRL(item.price * item.qty)}</div>
        <div class="cart-item__qty">
          <button class="qty-btn" data-act="dec" aria-label="Diminuir quantidade">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-act="inc" aria-label="Aumentar quantidade">+</button>
          <button class="remove-btn" data-act="rm" aria-label="Remover item">Remover</button>
        </div>
      </div>
    `).join('');
    cartTotal.textContent = fmtBRL(getTotal());
  }

  function addToCart({ id, name, price }){
    const existing = cart.find(i => i.id === id);
    const p = Number(price);
    if (existing) existing.qty += 1;
    else cart.push({ id, name, price: isFinite(p) ? p : 0, qty: 1 });
    saveCart();
    syncBadge();
    renderCart();
  }

  // Monta a mensagem no formato:
  // "Olá! Quero finalizar minha compra:
  //
  // • 1 x Nome — R$ 35,90
  // • 2 x Outro — R$ 59,80
  //
  // Total: R$ 95,70"
  function buildWhatsappMessage(){
    const header = 'Olá! Quero finalizar minha compra:\n';
    const lines = cart.map(it => `• ${it.qty} x ${it.name} — ${fmtBRL(it.price * it.qty)}`).join('\n');
    const total = `\n\nTotal: ${fmtBRL(getTotal())}`;
    return `${header}\n${lines}${total}`;
  }

  function openWhatsapp(){
    if (cart.length === 0){
      alert('Seu carrinho está vazio.');
      return;
    }
    const msg = buildWhatsappMessage();
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  // ===== Eventos globais =====
  document.addEventListener('click', (e) => {
    // Adicionar ao carrinho
    const addBtn = e.target.closest('.add-to-cart');
    if (addBtn){
      addToCart({
        id   : addBtn.dataset.id,
        name : addBtn.dataset.name,
        price: addBtn.dataset.price
      });
      openDrawer(); // abre ao adicionar
      return;
    }

    // Abrir/fechar carrinho
    if (e.target === cartBtn) { openDrawer(); return; }
    if (e.target === closeCart){ closeDrawer(); return; }
    if (e.target === cartOverlay){ closeDrawer(); return; }

    // Controles do item (inc/dec/remover)
    const actBtn = e.target.closest('.qty-btn, .remove-btn');
    if (actBtn){
      const row = e.target.closest('.cart-item');
      const id = row?.dataset.id;
      const action = actBtn.dataset.act;
      const item = cart.find(i => i.id === id);
      if (!item) return;

      if (action === 'inc') item.qty += 1;
      if (action === 'dec') item.qty = Math.max(1, item.qty - 1);
      if (action === 'rm')  cart = cart.filter(i => i.id !== id);

      saveCart();
      syncBadge();
      renderCart();
      return;
    }
  });

  checkoutBtn?.addEventListener('click', openWhatsapp);

  // ===== Init =====
  syncBadge();
  renderCart();
})();
