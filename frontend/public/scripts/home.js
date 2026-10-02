/* Destaques da home: os 4 produtos mais recentes, vindos da API (nada de dados fixos). */
(function () {
  const P = CONFIG.PAGES_ROOT;
  const box = document.getElementById("featured");

  const money = (v) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const GRADIENTS = ["#2b4a9e, #4a7fd6", "#0a6b4a, #22a878", "#135a85, #2694c9", "#4a1a0a, #c2672a", "#5b2a86, #a35bd6"];

  function card(p) {
    const out = Number(p.stock) === 0;
    const cover = p.image_url
      ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" class="img-fluid rounded-3">`
      : `<div class="cover" style="background: linear-gradient(135deg, ${GRADIENTS[p.id % GRADIENTS.length]})">
           <small>${esc(p.category?.name)}</small><strong>${esc(p.name)}</strong></div>`;
    return `
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card product-card h-100 p-3">
          <a href="${P}product.html?id=${p.id}" class="text-decoration-none">${cover}</a>
          <div class="pt-3 d-flex flex-column flex-grow-1">
            <div class="mb-2">
              <span class="tag">${esc(p.category?.name)}</span>
              ${out ? '<span class="badge text-bg-secondary ms-1">Esgotado</span>' : ""}
            </div>
            <h3 class="h6 mb-0">${esc(p.name)}</h3>
            <p class="text-muted-2 small text-truncate">${esc(p.description)}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <strong>${money(p.price)}</strong>
              <a class="btn btn-accent btn-sm" href="${P}product.html?id=${p.id}">Ver produto</a>
            </div>
          </div>
        </div>
      </div>`;
  }

  async function load() {
    UI.loading(box);
    try {
      const { items } = await apiList("/products", { params: { per_page: 4, sort: "recent" } });
      if (!items.length) return UI.empty(box, "Ainda não há produtos em destaque.");
      box.innerHTML = items.map(card).join("");
    } catch (err) {
      UI.error(box, err);
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();