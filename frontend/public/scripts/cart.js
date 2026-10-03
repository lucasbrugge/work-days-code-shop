/* Carrinho ligado à API (FRONT-07, 08, 18).
 * O carrinho vive no servidor; aqui só guardamos o token do visitante (api.js).
 * Os valores exibidos (preço, subtotal, total) vêm sempre da resposta da API.
 */
(function () {
  const content = document.getElementById("cart-content");
  const alertBox = document.getElementById("cart-alert");
  const P = CONFIG.PAGES_ROOT;

  const money = (v) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let cart = null;
  let busy = false;

  function showAlert(message, type = "danger") {
    const div = document.createElement("div");
    div.className = `alert alert-${type}`;
    div.textContent = message; // textContent: nunca interpreta HTML
    alertBox.replaceChildren(div);
  }

  function applyCart(next) {
    cart = next;
    setCartBadge(cart.total_items);
    render();
  }

  async function load() {
    UI.loading(content);
    try {
      applyCart(await api("/cart"));
    } catch (err) {
      UI.error(content, err);
    }
  }

  // Executa uma ação (PATCH/DELETE) e redesenha com o carrinho devolvido
  async function run(request) {
    if (busy) return;
    busy = true;
    alertBox.replaceChildren();
    try {
      applyCart(await request());
    } catch (err) {
      showAlert(err.message);
      try { applyCart(await api("/cart")); } catch (e) { /* mantém a tela atual */ }
    } finally {
      busy = false;
    }
  }

  const problemOf = (item) =>
    item.stock === 0
      ? "Sem estoque"
      : item.quantity > item.stock
        ? `Só há ${item.stock} em estoque`
        : null;

  function itemHTML(item) {
    const problem = problemOf(item);
    const image = item.image_url
      ? `<img src="${esc(item.image_url)}" alt="${esc(item.name)}" class="rounded-3" style="width:90px;height:90px;object-fit:cover;">`
      : `<div class="rounded-3 d-flex align-items-center justify-content-center"
              style="width:90px;height:90px;background:var(--accent-soft);flex-shrink:0;">
           <i class="bi bi-vinyl fs-2 text-accent"></i></div>`;
    return `
      <div class="d-flex gap-3 py-3 border-bottom">
        ${image}
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between gap-2">
            <div>
              <h3 class="h6 mb-1">
                <a class="text-decoration-none text-reset" href="${P}product.html?id=${item.product_id}">${esc(item.name)}</a>
              </h3>
              <div class="text-muted-2 small">${money(item.price)} cada</div>
              ${problem ? `<span class="badge text-bg-warning mt-1">${esc(problem)}</span>` : ""}
            </div>
            <div>
              <button type="button" class="btn btn-sm btn-outline-danger"
                      data-action="remove" data-id="${item.id}" aria-label="Remover ${esc(item.name)}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="input-group" style="max-width:140px;">
              <button type="button" class="btn btn-outline-secondary" data-action="dec" data-id="${item.id}"
                      ${item.quantity <= 1 ? "disabled" : ""} aria-label="Diminuir">-</button>
              <input type="text" class="form-control text-center" value="${item.quantity}" readonly aria-label="Quantidade">
              <button type="button" class="btn btn-outline-secondary" data-action="inc" data-id="${item.id}"
                      ${item.quantity >= item.stock ? "disabled" : ""} aria-label="Aumentar">+</button>
            </div>
            <strong>${money(item.subtotal)}</strong>
          </div>
        </div>
      </div>`;
  }

  function checkoutHTML(blocked) {
    if (blocked) {
      return `<button class="btn btn-accent w-100" disabled>Ajuste os itens para continuar</button>`;
    }
    if (Auth.isLoggedIn()) {
      return `<a href="${P}checkout.html" class="btn btn-accent w-100">
                Continuar para o checkout <i class="bi bi-arrow-right"></i></a>`;
    }
    // visitante: vai ao login e volta para o checkout, sem perder o carrinho (ele fica no servidor)
    return `<p class="small text-muted-2">Para finalizar a compra, entre na sua conta. Seu carrinho continua salvo.</p>
            <a href="${P}login.html?next=pages/checkout.html" class="btn btn-accent w-100 mb-2">Entrar para finalizar</a>
            <a href="${P}register.html" class="btn btn-outline-secondary w-100">Criar conta</a>`;
  }

  function render() {
    if (!cart.items.length) {
      content.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-bag fs-1 text-muted-2"></i>
          <h2 class="h4 mt-3">Seu carrinho está vazio</h2>
          <p class="text-muted-2">Adicione alguns produtos para continuar.</p>
          <a href="${P}catalog.html" class="btn btn-accent mt-2">Ver catálogo</a>
        </div>`;
      return;
    }

    const blocked = cart.items.some((i) => problemOf(i));
    content.innerHTML = `
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm"><div class="card-body">
            ${cart.items.map(itemHTML).join("")}
          </div></div>
        </div>
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm"><div class="card-body">
            <h2 class="h5 mb-4">Resumo</h2>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted-2">Itens</span><strong>${cart.total_items}</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted-2">Frete</span>
              <span class="small text-muted-2">calculado no checkout</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between mb-4">
              <span class="fw-bold">Subtotal</span>
              <strong class="fs-5">${money(cart.total)}</strong>
            </div>
            ${checkoutHTML(blocked)}
            <a href="${P}catalog.html" class="d-block text-center mt-3 small">Continuar comprando</a>
          </div></div>
        </div>
      </div>`;
  }

  content.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action]");
    if (!btn || btn.disabled) return;
    const id = Number(btn.dataset.id);
    const item = cart.items.find((i) => i.id === id);
    if (!item) return;

    if (btn.dataset.action === "remove") {
      run(() => api(`/cart/items/${id}`, { method: "DELETE" }));
    } else if (btn.dataset.action === "inc") {
      run(() => api(`/cart/items/${id}`, { method: "PATCH", body: { quantity: item.quantity + 1 } }));
    } else if (btn.dataset.action === "dec") {
      run(() => api(`/cart/items/${id}`, { method: "PATCH", body: { quantity: item.quantity - 1 } }));
    }
  });

  document.addEventListener("DOMContentLoaded", load);
})();