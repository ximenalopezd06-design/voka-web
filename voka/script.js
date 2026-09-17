'use strict';

/* CONFIGURACIÓN DE LA MARCA
   Nombre: cambia brand y las menciones editoriales de VOKA en index.html.
   WhatsApp: coloca el número real con código de país, solo dígitos.
   Para México: 52 seguido de los 10 dígitos del teléfono (sin + ni espacios).
   Instagram: coloca la URL completa del perfil real.
   Días y ubicación: se actualizan automáticamente en contacto y formulario. */
const settings = {
  brand: 'VOKA',
  whatsappNumber: '526941166171',
  instagramUrl: 'https://www.instagram.com/voka.bake?stkn=MXQxajJycDQweHMyYQ==',
  serviceDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  location: 'Concordia y Mazatlán, Sinaloa'
};

/* PRODUCTOS, PRECIOS, CATEGORÍAS Y FOTOGRAFÍAS
   Agrega o elimina objetos; cada id debe ser único y no cambiar después.
   Los precios son números en pesos mexicanos. Copia tus fotos en /images
   y escribe su ruta en image. Si faltan, aparece un placeholder de marca. */
// Stock local de ejemplo: ajusta las unidades reales antes de publicar.
const localProducts = [
  // Clásica: cambia price para editar su precio en MXN.
  { id: 8, name: 'Clásica', category: 'Cookies', price: 50, stock: 5, available: true, description: 'Galleta estilo NY con chispas de chocolate.', image: 'images/chipas.jpg' },
  // Hershey: cambia price para editar su precio en MXN.
  { id: 1, name: 'Hershey', category: 'Cookies', price: 55, stock: 5, available: true, description: 'Galleta estilo NY con chocolate Hershey.', image: 'images/hershey-menu.png' },
  // KitKat: cambia price para editar su precio en MXN.
  { id: 2, name: 'KitKat', category: 'Cookies', price: 55, stock: 5, available: true, description: 'Galleta estilo NY con trozos de KitKat.', image: 'images/kitkat-menu.png' },
  // Kinder: cambia price para editar su precio en MXN.
  { id: 3, name: 'Kinder', category: 'Cookies', price: 55, stock: 5, available: true, description: 'Galleta estilo NY con chocolate Kinder.', image: 'images/kinder-menu.png' },
  // Malvavisco: cambia price para editar su precio en MXN.
  { id: 6, name: 'Malvavisco', category: 'Cookies', price: 60, stock: 5, available: true, description: 'Galleta estilo NY con malvavisco.', image: 'images/malvavisco-menu.png' },
  // Chocolate: cambia price para editar su precio en MXN.
  { id: 5, name: 'Chocolate', category: 'Cookies', price: 60, stock: 5, available: true, description: 'Galleta estilo NY con abundante chocolate.', image: 'images/chocolate-menu.png' },
  // Oreo: cambia price para editar su precio en MXN.
  { id: 4, name: 'Oreo', category: 'Cookies', price: 60, stock: 5, available: true, description: 'Galleta estilo NY con galleta Oreo.', image: 'images/oreo-menu.png' },
  // Nutella: cambia price para editar su precio en MXN.
  { id: 7, name: 'Nutella', category: 'Cookies', price: 60, stock: 5, available: true, description: 'Galleta estilo NY con Nutella.', image: 'images/nutella.jpg' }
];
// FUTURA CONEXIÓN CON INVENTARIO EXTERNO
// Reemplaza SOLO el cuerpo de inventorySource.load() por fetch a tu API.
// Debe devolver Promise<Array> con los mismos campos que localProducts.
// Valida la respuesta HTTP y transforma los datos de Sheets/Supabase aquí.
// No incluyas claves privadas. Reservar/descontar stock requiere un servidor;
// agregar al carrito o abrir WhatsApp no confirma ni descuenta inventario.
const inventorySource = {
  async load() { return localProducts.map(product => ({ ...product })); }
};
let products = [];
let categories = [];
let inventoryReady = false;
function isAvailable(product) {
  return Boolean(product && product.available === true && Number.isInteger(product.stock) && product.stock > 0);
}
function productLimit(product) {
  return isAvailable(product) ? Math.min(MAX_QUANTITY, product.stock) : 0;
}
function remainingStock(product) {
  return Math.max(0, productLimit(product) - (cart[product.id] || 0));
}
function reconcileCart() {
  let changed = false;
  for (const [id, quantity] of Object.entries(cart)) {
    const allowed = Math.min(quantity, productLimit(getProduct(id)));
    if (allowed !== quantity) changed = true;
    if (allowed > 0) cart[id] = allowed;
    else delete cart[id];
  }
  if (changed) saveCart();
  return changed;
}
async function initializeInventory() {
  try {
    const loaded = await inventorySource.load();
    if (!Array.isArray(loaded)) throw new Error('Inventario inválido');
    const ids = new Set();
    products = loaded.map(product => {
      if (!product || !Number.isInteger(product.id) || ids.has(product.id) ||
          typeof product.name !== 'string' || typeof product.category !== 'string' ||
          !Number.isFinite(product.price) || product.price < 0) throw new Error('Producto inválido');
      ids.add(product.id);
      return { ...product, stock: Number.isInteger(product.stock) && product.stock >= 0 ? product.stock : 0,
        available: product.available === true };
    });
    categories = [...new Set(['Todos', ...products.map(product => product.category)])];
    inventoryReady = true;
    restoreCart();
    if ($('#products')) { renderFilters(); renderProducts(); }
  } catch {
    inventoryReady = false;
    if ($('#products')) $('#products').textContent = 'No pudimos cargar los antojos. Recarga la página para intentar de nuevo.';
    if (form) form.hidden = true;
    notify('No pudimos verificar la disponibilidad. Recarga para intentar de nuevo.');
  }
}
function restoreCart() {
  if (!inventoryReady) return;
  cart = loadCart();
  const changed = reconcileCart();
  renderCart();
  if ($('#products')) refreshProductControls();
  if (changed) notify('Ajustamos tu pedido según la disponibilidad actual. Revisa las cantidades.');
}
// Nueva versión: evita convertir productos del catálogo anterior en otros sabores.
const STORAGE_KEY = 'voka-cart-v2';
const MAX_QUANTITY = 99;
const $ = selector => document.querySelector(selector);
const money = value => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(value);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const getProduct = id => products.find(product => product.id === Number(id));
const quantities = new Map();
let activeCategory = 'Todos';
let toastTimer;
let storageAvailable = true;

// Los importes almacenados son una copia informativa. Siempre recalculamos
// precios y subtotales desde el catálogo vigente para evitar datos obsoletos.
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return {};
    return Object.fromEntries(saved.filter(item => item && getProduct(item.id) &&
      Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= MAX_QUANTITY)
      .map(item => [getProduct(item.id).id, item.quantity]));
  } catch { return {}; }
}
let cart = {};
const cartEntries = () => Object.entries(cart).map(([id, quantity]) => ({ product: getProduct(id), quantity })).filter(entry => entry.product);
const cartTotal = () => cartEntries().reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);

function notify(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4500);
}
function saveCart() {
  try {
    const saved = cartEntries().map(({ product, quantity }) => ({
      id: product.id, name: product.name, quantity,
      price: product.price, subtotal: product.price * quantity
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
  catch {
    if (storageAvailable) notify('Tu navegador no permite guardar el carrito. El pedido no se conservará al cambiar de página. Habilita el almacenamiento para continuar.');
    storageAvailable = false;
  }
}

// Las imágenes solo reemplazan el diseño provisional cuando cargan bien.
function loadPhotos(root = document) {
  root.querySelectorAll('[data-photo]').forEach(container => {
    const img = new Image();
    img.alt = container.dataset.alt || '';
    img.loading = container.classList.contains('hero-photo') ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.style.opacity = '0';
    img.addEventListener('load', () => {
      img.style.opacity = '1';
      container.replaceChildren(img);
      container.classList.add('has-photo');
    }, { once: true });
    img.addEventListener('error', () => img.remove(), { once: true });
    img.src = container.dataset.photo;
    container.append(img);
  });
}
function renderFilters() {
  $('#filters').innerHTML = categories.map(category => `<button type="button" data-category="${escapeHtml(category)}" aria-pressed="${category === activeCategory}">${escapeHtml(category)}</button>`).join('');
}
function renderProducts() {
  const visible = products.filter(product => activeCategory === 'Todos' || product.category === activeCategory);
  $('#product-count').textContent = `${visible.length} productos en ${activeCategory}`;
  $('#products').innerHTML = visible.length ? visible.map(product => `
    <article class="product ${isAvailable(product) ? '' : 'sold-out'}" data-product="${product.id}">
      <div class="product-image media" data-photo="${escapeHtml(product.image)}" data-alt="${escapeHtml(product.name)}"><span class="product-monogram" aria-hidden="true">voka</span><small>FOTOGRAFÍA PRÓXIMAMENTE</small></div>
      <p class="product-category">${escapeHtml(product.category)}</p><p class="availability ${isAvailable(product) ? 'in-stock' : 'out-of-stock'}">${isAvailable(product) ? 'Disponible' : 'AGOTADO'}</p>
      <div class="product-title"><h3>${escapeHtml(product.name)}</h3><span class="price">${money(product.price)}</span></div>
      <p class="product-description">${escapeHtml(product.description)}</p>
      <div class="product-controls"><div class="quantity" role="group" aria-label="Cantidad de ${escapeHtml(product.name)}"><button data-quantity="-1" aria-label="Disminuir ${escapeHtml(product.name)}" ${(quantities.get(product.id) || 1) === 1 ? 'disabled' : ''}>−</button><output aria-live="polite">${quantities.get(product.id) || 1}</output><button data-quantity="1" aria-label="Aumentar ${escapeHtml(product.name)}" ${quantities.get(product.id) === MAX_QUANTITY ? 'disabled' : ''}>+</button></div><button class="button" data-add="${product.id}" aria-label="Agregar ${escapeHtml(product.name)} al pedido">Agregar al pedido ↗</button></div>
    </article>`).join('') : '<div class="empty-products"><h3>Algo especial está por llegar.</h3><p>Pronto encontrarás nuevos antojos en esta categoría.</p><button class="button outline" data-show-all>Ver todos los productos</button></div>';
  refreshProductControls();
  loadPhotos($('#products'));
}
// Actualiza controles sin reemplazar imágenes ni perder el foco del usuario.
function refreshProductControls() {
  document.querySelectorAll('[data-product]').forEach(card => {
    const product = getProduct(card.dataset.product);
    const remaining = remainingStock(product);
    const quantity = Math.max(1, Math.min(quantities.get(product.id) || 1, remaining));
    quantities.set(product.id, quantity);
    card.querySelector('output').textContent = remaining ? quantity : 0;
    card.querySelector('[data-quantity="-1"]').disabled = !remaining || quantity <= 1;
    card.querySelector('[data-quantity="1"]').disabled = !remaining || quantity >= remaining;
    const add = card.querySelector('[data-add]');
    add.disabled = !remaining;
    add.textContent = !isAvailable(product) ? 'Agotado' : !remaining ? 'Stock en tu pedido' : 'Agregar al pedido ↗';
  });
}
$('#filters')?.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  $('#filters').querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  renderProducts();
});
$('#products')?.addEventListener('click', event => {
  if (event.target.closest('[data-show-all]')) {
    activeCategory = 'Todos'; renderFilters(); renderProducts(); $('#filters button').focus(); return;
  }
  const card = event.target.closest('[data-product]');
  if (!card) return;
  const id = Number(card.dataset.product);
  const product = getProduct(id);
  if (!inventoryReady || !isAvailable(product)) return;
  const quantityButton = event.target.closest('[data-quantity]');
  if (quantityButton) {
    const quantity = Math.max(1, Math.min(remainingStock(product), (quantities.get(id) || 1) + Number(quantityButton.dataset.quantity)));
    quantities.set(id, quantity);
    card.querySelector('output').textContent = quantity;
    card.querySelector('[data-quantity="-1"]').disabled = quantity === 1;
    refreshProductControls();
  }
  if (event.target.closest('[data-add]')) {
    const quantity = quantities.get(id) || 1;
    if (quantity > remainingStock(product)) { notify('No hay más unidades disponibles para agregar.'); return; }
    cart[id] = (cart[id] || 0) + quantity;
    saveCart(); renderCart(); refreshProductControls();
    if (storageAvailable) notify(`${quantity} × ${getProduct(id).name} en tu pedido ♡`);
  }
});


const form = $('#checkout-form');

function renderSummary() {
  $('#order-summary').innerHTML = cartEntries().map(({ product, quantity }) => `<div class="summary-row"><span>${quantity} × ${escapeHtml(product.name)}</span><span>${money(product.price * quantity)}</span></div>`).join('') + `<div class="cart-total"><strong>Total de productos</strong><strong>${money(cartTotal())}</strong></div>`;
}
function renderCart() {
  const entries = cartEntries();
  const count = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  $('#cart-count').textContent = count;
  $('.cart-button').setAttribute('aria-label', `Abrir pedido, ${count} productos`);
  if (!$('#cart-items')) return;
  $('#cart-items').innerHTML = entries.length ? entries.map(({ product, quantity }) => `
    <article class="cart-item" data-cart-id="${product.id}"><div><h3>${escapeHtml(product.name)}</h3><p>${money(product.price)} por unidad</p><div class="quantity"><button data-cart-change="-1" aria-label="Disminuir ${escapeHtml(product.name)}">−</button><output aria-label="Cantidad de ${escapeHtml(product.name)}">${quantity}</output><button data-cart-change="1" aria-label="Aumentar ${escapeHtml(product.name)}" ${quantity >= productLimit(product) ? 'disabled' : ''}>+</button></div></div><div><strong>${money(product.price * quantity)}</strong><button class="remove-item" data-remove aria-label="Eliminar ${escapeHtml(product.name)}">Eliminar</button></div></article>`).join('') : '<div class="cart-empty"><span aria-hidden="true">♡</span><h3>Tu próximo gustito te espera.</h3><p>Elige algo rico para empezar tu pedido.</p><a class="button" href="menu.html">Ver menú ↗</a></div>';
  $('#cart-total').textContent = money(cartTotal());
  form.hidden = entries.length === 0;
  $('#empty-checkout').hidden = entries.length > 0;
  $('#order-feedback').textContent = '';
  renderSummary();
}
$('#cart-items')?.addEventListener('click', event => {
  const row = event.target.closest('[data-cart-id]');
  const action = event.target.closest('[data-cart-change], [data-remove]');
  if (!row || !action) return;
  const id = row.dataset.cartId;
  if (action.hasAttribute('data-remove')) delete cart[id];
  else {
    cart[id] = Math.min(productLimit(getProduct(id)), cart[id] + Number(action.dataset.cartChange));
    if (cart[id] <= 0) delete cart[id];
  }
  saveCart(); renderCart();
  // El render sustituye el botón: restituye el foco dentro del carrito.
  const replacement = document.querySelector(`[data-cart-id="${id}"] [${action.hasAttribute('data-remove') ? 'data-remove' : `data-cart-change="${action.dataset.cartChange}"`}]`);
  (replacement && !replacement.disabled ? replacement : document.querySelector('.order-basket .text-link')).focus();
});
form?.elements.delivery.addEventListener('change', () => {
  const delivery = form.elements.delivery.value === 'Entrega';
  $('#address-field').hidden = !delivery;
  form.elements.address.disabled = !delivery;
  form.elements.address.required = delivery;
});

// Solo se guarda el carrito. Los datos personales permanecen en el formulario.
function createOrderMessage(data) {
  return [
    `Hola ${settings.brand} 🍪`, '', 'Quiero realizar un pedido.', '',
    `Nombre: ${data.name}`, `Teléfono: ${data.phone}`, '', 'Pedido:',
    ...cartEntries().map(({ product, quantity }) => `${quantity} ${product.name} — ${money(quantity * product.price)} (${money(product.price)} c/u)`),
    '', `Total de productos: ${money(cartTotal())} MXN`, 'Entrega y disponibilidad por confirmar.', '',
    `Entrega: ${data.delivery}`, ...(data.delivery === 'Entrega' ? [`Dirección: ${data.address}`] : []),
    `Día: ${data.day}`, `Hora aproximada: ${data.time}`, '',
    `Notas: ${data.notes || 'Sin cambios.'}`, '', 'Gracias.'
  ].join('\n');
}
function whatsappUrl(message) {
  const number = settings.whatsappNumber.trim();
  if (!/^[1-9]\d{9,14}$/.test(number)) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
function openExternal(url) {
  // Enlace activado por el usuario: no se envía automáticamente el mensaje.
  const link = document.createElement('a');
  link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
  document.body.append(link); link.click(); link.remove();
}
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!inventoryReady) return;
  if (reconcileCart()) {
    renderCart();
    $('#order-feedback').textContent = 'Cambió la disponibilidad. Revisa tu pedido antes de enviarlo.';
    return;
  }
  if (!cartEntries().length) return;
  const nameInput = form.elements.name;
  nameInput.setCustomValidity(nameInput.value.trim() ? '' : 'Escribe tu nombre.');
  const phoneInput = form.elements.phone;
  const phoneDigits = phoneInput.value.replace(/\D/g, '');
  phoneInput.setCustomValidity(phoneDigits.length >= 10 && phoneDigits.length <= 15 ? '' : 'Escribe un teléfono de 10 a 15 dígitos.');
  const addressInput = form.elements.address;
  addressInput.setCustomValidity(form.elements.delivery.value === 'Entrega' && !addressInput.value.trim() ? 'Escribe la dirección de entrega.' : '');
  if (!form.reportValidity()) return;
  const data = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
  const url = whatsappUrl(createOrderMessage(data));
  if (!url) {
    $('#order-feedback').textContent = 'El canal de pedidos aún no está disponible. Tu carrito sigue guardado; vuelve cuando VOKA habilite su WhatsApp.';
    return;
  }
  openExternal(url);
  // El mensaje ya contiene el pedido completo antes de limpiar el carrito.
  // WhatsApp no notifica a esta página si el cliente pulsa Enviar allí.
  cart = {};
  saveCart();
  form.reset();
  $('#address-field').hidden = true;
  form.elements.address.disabled = true;
  form.elements.address.required = false;
  renderCart();
  $('#order-feedback').textContent = 'Tu carrito quedó limpio 💗 Revisa el mensaje en WhatsApp y pulsa Enviar para completar tu pedido.';
  $('.order-basket .text-link').focus();
});
form?.addEventListener('input', event => { event.target.setCustomValidity?.(''); $('#order-feedback').textContent = ''; });
function $$(selector) { return document.querySelectorAll(selector); }
// Los enlaces reales funcionan también sin JavaScript. Esta configuración
// permite actualizar todos los destinos desde settings en un solo lugar.
$$('[data-whatsapp]').forEach(link => { link.href = `https://wa.me/${settings.whatsappNumber}`; });
$$('[data-instagram]').forEach(link => { link.href = settings.instagramUrl; });
$$('[data-service-days]').forEach(element => { element.textContent = settings.serviceDays.join(', '); });
$$('[data-location]').forEach(element => { element.textContent = settings.location; });
form?.elements.day.insertAdjacentHTML('beforeend', settings.serviceDays.map(day => `<option value="${escapeHtml(day)}">${escapeHtml(day)}</option>`).join(''));

// Menú, header y animaciones: respeta la preferencia de movimiento reducido.
const menu = $('#navigation');
const menuToggle = $('.menu-toggle');
function closeMenu() { menu.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Abrir menú'); menuToggle.textContent = '☰'; }
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('open', open); menuToggle.setAttribute('aria-expanded', String(open)); menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); menuToggle.textContent = open ? '✕' : '☰';
});
menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('click', event => { if (!$('.header').contains(event.target)) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); menuToggle.focus(); } });
window.matchMedia('(min-width: 851px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
function updateHeader() { $('.header').classList.toggle('scrolled', window.scrollY > 35); }
window.addEventListener('scroll', updateHeader, { passive: true });
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !motionReduced.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .06 });
  document.documentElement.classList.add('motion');
  $$('.reveal').forEach(element => observer.observe(element));
}
window.addEventListener('storage', event => { if (event.key === STORAGE_KEY || event.key === null) { restoreCart(); } });
if (form) form.hidden = true;
if ($('#products')) $('#products').textContent = 'Cargando antojos…';
initializeInventory();
updateHeader();
// El catálogo ya carga sus propias fotografías.
$$('.hero, .story').forEach(section => loadPhotos(section));
// Al volver desde otra página o pestaña, se recupera el carrito actualizado.
window.addEventListener('pageshow', () => { restoreCart(); });
