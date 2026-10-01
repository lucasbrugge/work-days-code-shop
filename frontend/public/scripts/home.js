const GRADIENTS = ["#2b4a9e, #4a7fd6", "#0a6b4a, #22a878", "#135a85, #2694c9", "#4a1a0a, #c2672a"];

const FALLBACK_FEATURED = [
  { id: 1, artist: "Milton Nascimento & Lô Borges", name: "Clube da Esquina", price: 189.9, category_name: "Vinil", color: "#2b4a9e, #4a7fd6" },
  { id: 2, artist: "Novos Baianos", name: "Acabou Chorare", price: 169.9, category_name: "Vinil", color: "#0a6b4a, #22a878" },
  { id: 3, artist: "Pink Floyd", name: "The Dark Side of the Moon", price: 219.9, category_name: "Vinil", color: "#135a85, #2694c9" },
  { id: 4, artist: "Miles Davis", name: "Kind of Blue", price: 159.9, category_name: "Vinil", color: "#4a1a0a, #c2672a" },
];

const money = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function getFeaturedProducts() {
  if (!CONFIG.USE_MOCK) {
    try {
      const res = await api("/products", { params: { per_page: 4, sort: "recent" } });
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.slice(0, 4);
      }
    } catch (e) {
      console.warn("API indisponível na home, buscando dados locais...", e);
    }
  }

  try {
    const raw = localStorage.getItem("admin_mock_products");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 4);
      }
    }
  } catch (e) {}

  return FALLBACK_FEATURED;
}

async function renderFeatured() {
  const container = document.getElementById("featured");
  if (!container) return;

  const products = await getFeaturedProducts();

  container.innerHTML = products.map((p, idx) => {
    const grad = p.color || GRADIENTS[idx % GRADIENTS.length];
    const catName = p.category?.name || p.category_name || "Geral";
    const artistText = p.artist || (p.name.includes(" - ") ? p.name.split(" - ")[0] : "");
    const titleText = p.name.includes(" - ") ? p.name.split(" - ").slice(1).join(" - ") : p.name;

    const cover = p.image_url
      ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" class="img-fluid rounded-3 mb-2" style="aspect-ratio: 1/1; object-fit: cover; width: 100%;" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'cover\\' style=\\'background: linear-gradient(135deg, ${grad})\\'><small>${esc(artistText)}</small><strong>${esc(p.name)}</strong></div>';">`
      : `<div class="cover" style="background: linear-gradient(135deg, ${grad})">
           <small>${esc(artistText)}</small>
           <strong>${esc(p.name)}</strong>
         </div>`;

    return `
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card product-card h-100 p-3">
          <a href="product.html?id=${p.id}" class="text-decoration-none">${cover}</a>
          <div class="pt-3 d-flex flex-column flex-grow-1">
            <span class="tag align-self-start mb-2">${esc(catName)}</span>
            <h3 class="h6 mb-0">${esc(titleText)}</h3>
            ${artistText ? `<p class="text-muted-2 small">${esc(artistText)}</p>` : `<p class="text-muted-2 small">&nbsp;</p>`}
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <strong>${money(p.price)}</strong>
              <a class="btn btn-accent btn-sm" href="product.html?id=${p.id}"><i class="bi bi-plus-lg"></i> Carrinho</a>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", renderFeatured);