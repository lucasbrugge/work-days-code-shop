const state = { search: "", category: "", sort: "recent", page: 1 };

const money = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const GRADIENTS = ["#2b4a9e, #4a7fd6", "#0a6b4a, #22a878", "#135a85, #2694c9", "#4a1a0a, #c2672a", "#5b2a86, #a35bd6"];

/* ---------- MODO DE TESTE (remova quando a API existir) ---------- */
const MOCK_CATEGORIES = [{ id: 1, name: "Vinil" }, { id: 2, name: "CD" }, { id: 3, name: "Cassete" }];
const MOCK_PRODUCTS = [
  { id: 1, name: "Clube da Esquina", artist: "Milton Nascimento & Lô Borges", price: 189.9, stock: 5, category: MOCK_CATEGORIES[0] },
  { id: 2, name: "Acabou Chorare", artist: "Novos Baianos", price: 169.9, stock: 3, category: MOCK_CATEGORIES[0] },
  { id: 3, name: "The Dark Side of the Moon", artist: "Pink Floyd", price: 219.9, stock: 0, category: MOCK_CATEGORIES[0] },
  { id: 4, name: "Kind of Blue", artist: "Miles Davis", price: 159.9, stock: 8, category: MOCK_CATEGORIES[0] },
  { id: 5, name: "Elis & Tom", artist: "Elis Regina", price: 79.9, stock: 10, category: MOCK_CATEGORIES[1] },
  { id: 6, name: "Construção", artist: "Chico Buarque", price: 69.9, stock: 4, category: MOCK_CATEGORIES[1] },
  { id: 7, name: "Transa", artist: "Caetano Veloso", price: 74.9, stock: 6, category: MOCK_CATEGORIES[1] },
  { id: 8, name: "Sgt. Pepper's", artist: "The Beatles", price: 89.9, stock: 2, category: MOCK_CATEGORIES[1] },
  { id: 9, name: "Tropicália", artist: "Vários artistas", price: 49.9, stock: 7, category: MOCK_CATEGORIES[2] },
  { id: 10, name: "Refazenda", artist: "Gilberto Gil", price: 54.9, stock: 5, category: MOCK_CATEGORIES[2] },
  { id: 11, name: "Mutantes", artist: "Os Mutantes", price: 59.9, stock: 1, category: MOCK_CATEGORIES[2] },
];

function mockProducts({ search, category, sort, page }) {
  const perPage = 6;
  let list = MOCK_PRODUCTS.filter((p) =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!category || p.category.id === Number(category)));
  if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => b.id - a.id);
  const last = Math.max(1, Math.ceil(list.length / perPage));
  return { data: list.slice((page - 1) * perPage, page * perPage), meta: { current_page: page, last_page: last } };
}
/* ------------------------------------------------------------------ */

async function getProducts() {
  if (CONFIG.USE_MOCK) return mockProducts(state);
  return api("/products", { params: state });
}
async function getCategories() {
  if (CONFIG.USE_MOCK) return { data: MOCK_CATEGORIES };
  return api("/categories");
}

function cardHTML(p) {
  const out = p.stock === 0;
  const grad = GRADIENTS[p.id % GRADIENTS.length];
  const cover = p.image_url
    ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" class="img-fluid rounded-3">`
    : `<div class="cover" style="background: linear-gradient(135deg, ${grad})">
         <small>${esc(p.artist)}</small><strong>${esc(p.name)}</strong></div>`;
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
          <p class="text-muted-2 small mb-2">${esc(p.artist)}</p>
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
    const { data, meta } = await getProducts();
    if (!data.length) {
      UI.empty(box, "Nenhum produto encontrado. Tente outra busca ou categoria.");
      renderPagination(null);
      return;
    }
    box.innerHTML = `<div class="row g-4">${data.map(cardHTML).join("")}</div>`;
    renderPagination(meta);
  } catch (err) {
    UI.error(box, err);
  }
}

async function init() {
  try {
    const { data } = await getCategories();
    document.getElementById("category").insertAdjacentHTML("beforeend",
      data.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join(""));
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