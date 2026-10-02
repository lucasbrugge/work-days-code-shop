const money = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const GRADIENTS = ["#2b4a9e, #4a7fd6", "#0a6b4a, #22a878", "#135a85, #2694c9", "#4a1a0a, #c2672a"];

async function renderFeatured() {
  const container = document.getElementById("featured");
  if (!container) return;

  try {
    const { items } = await apiList("/products", { params: { per_page: 4, sort: "recent" } });
    if (!items?.length) return;

    container.innerHTML = items.map((p) => {
      const grad = GRADIENTS[p.id % GRADIENTS.length];
      const cover = p.image_url
        ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" class="img-fluid rounded-3">`
        : `<div class="cover" style="background: linear-gradient(135deg, ${grad})">
             <small>${esc(p.category?.name)}</small><strong>${esc(p.name)}</strong></div>`;
      return `
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card product-card h-100 p-3">
            <a href="pages/product.html?id=${p.id}" class="text-decoration-none">${cover}</a>
            <div class="pt-3 d-flex flex-column flex-grow-1">
              <span class="tag align-self-start mb-2">${esc(p.category?.name)}</span>
              <h3 class="h6 mb-0">${esc(p.name)}</h3>
              <p class="text-muted-2 small">${esc(p.description)}</p>
              <div class="d-flex justify-content-between align-items-center mt-auto">
                <strong>${money(p.price)}</strong>
                <a class="btn btn-accent btn-sm" href="pages/product.html?id=${p.id}"><i class="bi bi-plus-lg"></i> Carrinho</a>
              </div>
            </div>
          </div>
        </div>`;
    }).join("");
  } catch (e) {
    console.error("Erro ao carregar destaques:", e);
  }
}

document.addEventListener("DOMContentLoaded", renderFeatured);