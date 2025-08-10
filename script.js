// ano no rodapé (mantém seu comportamento)
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
  searchOverlay.hidden = false;
  // pequena espera para focar após render
  setTimeout(() => searchMobile && searchMobile.focus(), 50);
}
function closeSearch() {
  searchOverlay.hidden = true;
}

if (searchOpen && searchOverlay) {
  searchOpen.addEventListener('click', openSearch);
}
if (searchClose) {
  searchClose.addEventListener('click', closeSearch);
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !searchOverlay.hidden) closeSearch();
});
searchOverlay && searchOverlay.addEventListener('click', (e) => {
  if (e.target === searchOverlay) closeSearch();
});

// CARRINHO (mantém sua lógica existente)
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
if (cartBtn && cartModal) {
  cartBtn.addEventListener('click', () => cartModal.showModal());
}
if (closeCart && cartModal) {
  closeCart.addEventListener('click', () => cartModal.close());
}
