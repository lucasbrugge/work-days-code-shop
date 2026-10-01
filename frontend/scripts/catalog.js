const state = { search: "", category: "", sort: "recent", page: 1 };

const money = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const GRADIENTS = ["#2b4a9e, #4a7fd6", "#0a6b4a, #22a878", "#135a85, #2694c9", "#4a1a0a, #c2672a", "#5b2a86, #a35bd6"];

// TEMPORÁRIO: usado só enquanto GET /api/categories devolver 501.
// Os ids batem com o seeder (1 Vinil, 2 CD, 3 Cassete). Remover quando o back implementar.
const SEED_CATEGORIES = [
  { id: 1, name: "Vinil" },
  { id: 2, name: "CD" },
  { id: 3, name: "Cassete" },
];

async function getProducts() {
  return apiList("/products", {
    params: {
      search: state.search,
      category_id: state.category,
      sort: state.sort,
      page: state.page,
    },
  });
}

async function getCategories() {
  try {
    return await api("/categories");
  } catch (e) {
    if (e.status === 501) return SEED_CATEGORIES;
    throw e;
  }
}

function cardHTML(p) {
  const out = Number(p.stock) === 0;
  const grad = GRADIENTS[p.id % GRADIENTS.length];
  const cover = p.image_url
    ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" class="img-fluid rounded-3">`
    : `<div class="cover" style="background: linear-gradient(135deg, ${grad})">
         <small>${esc(p.category?.name)}</small><strong>${esc(p.name)}</strong></div>`;
  return `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="card product-card h-100 p-3">
        <a href="product.html?id=${p.id}" class="text-decoration-none">${cover}</a>
        <div class="pt-3 d-flex flex-column flex-grow-1">
          <div class="mb-2">
            <span class="tag">${esc(p.category?.name)}</span>
            ${out ? `<span class="badge text-bg-secondary ms-1">Esgotado</span>` : ""}
          </div>
          <h3 class="h6 mb-0">${esc(p.name)}</h3>
          <p class="text-muted-2 small mb-2 text-truncate">${esc(p.description)}</p>
          <div class="small text-muted-2 mb-2">${out ? "Indisponível" : `${p.stock} em estoque`}</div>
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <strong>${money(p.price)}</strong>
            <a class="btn btn-sm ${out ? "btn-outline-secondary" : "btn-accent"}" href="product.html?id=${p.id}">
              ${out ? "Ver" : `<i class="bi bi-plus-lg"></i> Carrinho`}
            </a>
          </div>
        </div>
      </div>
    </div>`;
}

function renderPagination(meta) {
  const nav = document.getElementById("pagination");
  if (!meta || meta.last_page <= 1) { nav.innerHTML = ""; return; }
  const { current_page: cur, last_page: last } = meta;
  let items = `<li class="page-item ${cur === 1 ? "disabled" : ""}">
    <a class="page-link" href="#" data-page="${cur - 1}">Anterior</a></li>`;
  for (let i = 1; i <= last; i++) {
    items += `<li class="page-item ${i === cur ? "active" : ""}">
      <a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  items += `<li class="page-item ${cur === last ? "disabled" : ""}">
    <a class="page-link" href="#" data-page="${cur + 1}">Próxima</a></li>`;
  nav.innerHTML = `<ul class="pagination justify-content-center">${items}</ul>`;
}

async function loadProducts() {
  const box = document.getElementById("products");
  UI.loading(box);
  try {
    const { items, meta } = await getProducts();
    if (!items.length) {
      UI.empty(box, "Nenhum produto encontrado. Tente outra busca ou categoria.");
      renderPagination(null);
      return;
    }
    box.innerHTML = `<div class="row g-4">${items.map(cardHTML).join("")}</div>`;
    renderPagination(meta);
  } catch (err) {
    UI.error(box, err);
    renderPagination(null);
  }
}

async function init() {
  try {
    const categories = await getCategories();
    document.getElementById("category").insertAdjacentHTML("beforeend",
      categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join(""));
  } catch (e) { /* sem categorias, o filtro fica só com "Todas" */ }

  document.getElementById("filters").addEventListener("submit", (e) => {
    e.preventDefault();
    state.search = document.getElementById("search").value.trim();
    state.page = 1;
    loadProducts();
  });
  ["category", "sort"].forEach((id) =>
    document.getElementById(id).addEventListener("change", (e) => {
      state[id] = e.target.value;
      state.page = 1;
      loadProducts();
    }));
  document.getElementById("pagination").addEventListener("click", (e) => {
    const link = e.target.closest("[data-page]");
    if (!link) return;
    e.preventDefault();
    state.page = Number(link.dataset.page);
    loadProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  loadProducts();
}

document.addEventListener("DOMContentLoaded", init);