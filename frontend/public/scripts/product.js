/* Página do produto (FRONT-04): detalhe, quantidade limitada ao estoque e adicionar ao carrinho. */
(function () {
  const content = document.getElementById("product-content");
  const alertBox = document.getElementById("product-alert");
  const P = CONFIG.PAGES_ROOT;

  const money = (v) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const GRADIENTS = ["#2b4a9e, #4a7fd6", "#0a6b4a, #22a878", "#135a85, #2694c9", "#4a1a0a, #c2672a", "#5b2a86, #a35bd6"];

  function showAlert(message, type = "danger", withCartLink = false) {
    const div = document.createElement("div");
    div.className = `alert alert-${type}`;
    div.append(message);
    if (withCartLink) {
      const a = document.createElement("a");
      a.href = P + "cart.html";
      a.className = "alert-link ms-2";
      a.textContent = "Ver carrinho";
      div.append(a);
    }
    alertBox.replaceChildren(div);
  }

  function notFound() {
    content.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-exclamation-circle fs-1 text-muted-2"></i>
        <h1 class="h4 mt-3">Produto não encontrado</h1>
        <p class="text-muted-2">Ele pode ter sido removido ou estar indisponível.</p>
        <a href="${P}catalog.html" class="btn btn-accent">Voltar ao catálogo</a>
      </div>`;
  }

  function render(p) {
    const out = p.stock <= 0;
    const grad = GRADIENTS[p.id % GRADIENTS.length];
    const cover = p.image_url
      ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" class="img-fluid rounded-4 w-100">`
      : `<div class="cover rounded-4" style="background: linear-gradient(135deg, ${grad})">
           <small>${esc(p.category?.name)}</small><strong>${esc(p.name)}</strong></div>`;

    document.title = `${p.name} | ${CONFIG.STORE_NAME}`;
    content.innerHTML = `
      <nav aria-label="breadcrumb" class="mb-4 small">
        <a href="${P}catalog.html">Catálogo</a> <span class="text-muted-2">/</span>
        <span class="text-muted-2">${esc(p.name)}</span>
      </nav>
      <div class="row g-5">
        <div class="col-md-6">${cover}</div>
        <div class="col-md-6">
          <span class="tag">${esc(p.category?.name)}</span>
          <h1 class="h2 mt-3">${esc(p.name)}</h1>
          <p class="text-muted-2">${esc(p.description)}</p>
          <p class="fs-3 fw-bold mb-1">${money(p.price)}</p>
          <p class="mb-4 ${out ? "text-danger" : "text-success"}">
            ${out ? "Indisponível no momento" : `${p.stock} em estoque`}
          </p>
          <form id="add-form" class="d-flex flex-wrap gap-3 align-items-end">
            <div>
              <label for="qty" class="form-label small mb-1">Quantidade</label>
              <input type="number" id="qty" class="form-control" style="width:110px;"
                     min="1" max="${Math.max(p.stock, 1)}" value="1" ${out ? "disabled" : ""}>
            </div>
            <button type="submit" id="add-btn" class="btn btn-accent btn-lg" ${out ? "disabled" : ""}>
              <i class="bi bi-bag-plus"></i> ${out ? "Produto esgotado" : "Adicionar ao carrinho"}
            </button>
          </form>
        </div>
      </div>`;

    if (out) return;

    document.getElementById("add-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      alertBox.replaceChildren();

      const qtyInput = document.getElementById("qty");
      const quantity = Math.min(Math.max(parseInt(qtyInput.value, 10) || 1, 1), p.stock);
      qtyInput.value = quantity;

      const btn = document.getElementById("add-btn");
      btn.disabled = true;
      try {
        const cart = await api("/cart/items", {
          method: "POST",
          body: { product_id: p.id, quantity },
        });
        setCartBadge(cart.total_items);
        showAlert(`"${p.name}" foi adicionado ao carrinho.`, "success", true);
      } catch (err) {
        showAlert(err.message);
      } finally {
        btn.disabled = false;
      }
    });
  }

  async function load() {
    const id = Number(new URLSearchParams(location.search).get("id"));
    if (!Number.isInteger(id) || id <= 0) return notFound();

    UI.loading(content);
    try {
      render(await api(`/products/${id}`));
    } catch (err) {
      if (err.status === 404) return notFound();
      UI.error(content, err);
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();