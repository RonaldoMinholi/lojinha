const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem("cart") || "[]"),
  phone: "610405879620"
};
const money = (n) => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
function syncCart(){
  localStorage.setItem("cart", JSON.stringify(state.cart));
  document.getElementById("cartCount").textContent = state.cart.reduce((s,i)=>s+i.qty,0);
  const itemsWrap = document.getElementById("cartItems");
  itemsWrap.innerHTML = "";
  let total = 0;
  state.cart.forEach(item=>{
    total += item.qty * item.price;
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <img src="${item.image}" alt="${item.name}"/>
      <div>
        <h4>${item.name}</h4>
        <div class="meta">${money(item.price)} • ${item.variant || "padrão"}</div>
        <div class="qty">
          <button data-act="dec" data-id="${item.id}">-</button>
          <span>${item.qty}</span>
          <button data-act="inc" data-id="${item.id}">+</button>
          <button class="secondary" data-act="rm" data-id="${item.id}">Remover</button>
        </div>
      </div>
      <strong>${money(item.qty*item.price)}</strong>
    `;
    itemsWrap.appendChild(el);
  });
  document.getElementById("cartItemsCount").textContent = state.cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById("cartTotal").textContent = money(total);
  const orderLines = state.cart.map(i => `• ${i.qty}x ${i.name} (${money(i.price)})`).join("%0A");
  const msg = `Olá! Quero finalizar o pedido:%0A${orderLines}%0A%0ATotal: ${money(total)}`;
  const wa = `https://wa.me/${state.phone}?text=${msg}`;
  document.getElementById("checkoutBtn").href = wa;
}
function addToCart(product){
  const found = state.cart.find(i => i.id === product.id);
  if(found){ found.qty += 1; } else { state.cart.push({...product, qty: 1}); }
  syncCart();
}
function renderProducts(list){
  const wrap = document.getElementById("products");
  wrap.innerHTML = "";
  list.forEach(p=>{
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="media">${p.image ? `<img src="${p.image}" alt="${p.name}">` : "👜"}</div>
      <div class="body">
        <h3>${p.name}</h3>
        <p class="price">${money(p.price)}</p>
        <p style="opacity:.85">${p.description || ""}</p>
        <div class="cta">
          <button data-id="${p.id}" class="add">Adicionar</button>
        </div>
      </div>
    `;
    wrap.appendChild(card);
  });
}
function filterProducts(ev){
  const q = ev.target.value.toLowerCase().trim();
  if(!q) return renderProducts(state.products);
  const f = state.products.filter(p => (p.name+" "+(p.description||"")).toLowerCase().includes(q));
  renderProducts(f);
}
async function load(){
  document.getElementById("year").textContent = new Date().getFullYear();
  const res = await fetch("products.json");
  const data = await res.json();
  state.products = data;
  renderProducts(state.products);
  syncCart();
}
document.addEventListener("click",(ev)=>{
  const t = ev.target;
  if(t.matches("#cartBtn")) document.getElementById("cartModal").showModal();
  if(t.matches("#closeCart")) document.getElementById("cartModal").close();
  if(t.matches("#clearCart")) { state.cart = []; syncCart(); }
  if(t.matches(".add")) {
    const id = t.getAttribute("data-id");
    const p = state.products.find(p=>p.id===id);
    if(p) addToCart(p);
  }
  if(t.dataset.act){
    const id = t.dataset.id;
    const item = state.cart.find(i=>i.id===id);
    if(!item) return;
    if(t.dataset.act==="inc") item.qty++;
    if(t.dataset.act==="dec") item.qty = Math.max(1, item.qty-1);
    if(t.dataset.act==="rm") state.cart = state.cart.filter(i=>i.id!==id);
    syncCart();
  }
});
document.getElementById("search").addEventListener("input", filterProducts);
load();
