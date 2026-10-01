/**
 * Work Days Code Shop - Painel de Cadastro e Gestão de Produtos
 */

// Estado Global da Aplicação
const AdminState = {
  products: [],
  filteredProducts: [],
  categories: [
    { id: 1, name: "Vinil", slug: "vinil" },
    { id: 2, name: "CD", slug: "cd" },
    { id: 3, name: "Cassete", slug: "cassete" }
  ],
  currentEditingId: null,
  pendingDeleteId: null,
  search: "",
  categoryFilter: "",
  statusFilter: "all",
  apiUrl: window.API_URL || "http://localhost:8000/api",
  useMock: false
};

// Amostras padrão caso o banco esteja vazio ou em teste inicial
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Pink Floyd - The Dark Side of the Moon",
    description: "Álbum clássico do Pink Floyd em formato vinil.",
    price: 189.90,
    stock: 10,
    image_url: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80",
    is_active: true,
    category_id: 1,
    category_name: "Vinil"
  },
  {
    id: 2,
    name: "Michael Jackson - Thriller",
    description: "Um dos álbuns mais conhecidos de Michael Jackson em vinil.",
    price: 159.90,
    stock: 8,
    image_url: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80",
    is_active: true,
    category_id: 1,
    category_name: "Vinil"
  },
  {
    id: 3,
    name: "Nirvana - Nevermind",
    description: "Álbum Nevermind da banda Nirvana em CD.",
    price: 59.90,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    is_active: true,
    category_id: 2,
    category_name: "CD"
  },
  {
    id: 4,
    name: "The Beatles - Abbey Road",
    description: "Álbum Abbey Road dos Beatles em CD.",
    price: 69.90,
    stock: 12,
    image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    is_active: true,
    category_id: 2,
    category_name: "CD"
  },
  {
    id: 5,
    name: "Metallica - Master of Puppets",
    description: "Álbum Master of Puppets em fita cassete.",
    price: 89.90,
    stock: 5,
    image_url: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80",
    is_active: true,
    category_id: 3,
    category_name: "Cassete"
  },
  {
    id: 6,
    name: "Legião Urbana - Dois",
    description: "Álbum Dois da Legião Urbana em fita cassete.",
    price: 49.90,
    stock: 0,
    image_url: null,
    is_active: true,
    category_id: 3,
    category_name: "Cassete"
  },
  {
    id: 7,
    name: "Produto Inativo - Teste",
    description: "Produto de teste para verificar ocultação no catálogo público.",
    price: 99.90,
    stock: 10,
    image_url: null,
    is_active: false,
    category_id: 1,
    category_name: "Vinil"
  }
];

// Presets de capas de exemplo para preenchimento rápido no cadastro
const SAMPLE_COVERS = [
  { label: "Vinil Clássico", url: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80" },
  { label: "Show / Palco", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80" },
  { label: "Microfone Vintage", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80" },
  { label: "Fita Cassete", url: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80" }
];

// Utilitários
const formatMoney = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const escapeHtml = (str) => String(str ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

function getAuthToken() {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("admin_token") || "";
}

function setAuthToken(token) {
  if (token) {
    localStorage.setItem("auth_token", token.trim());
    sessionStorage.setItem("admin_token", token.trim());
  } else {
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("admin_token");
  }
  updateAuthStatusUI();
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const bgClass = type === "success" ? "text-bg-success" : type === "danger" ? "text-bg-danger" : "text-bg-warning";
  const icon = type === "success" ? "bi-check-circle-fill" : type === "danger" ? "bi-exclamation-octagon-fill" : "bi-info-circle-fill";

  const toastId = "toast_" + Date.now();
  const html = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon} fs-5"></i>
          <div>${message}</div>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);
  const el = document.getElementById(toastId);
  const toast = new bootstrap.Toast(el, { delay: 4000 });
  toast.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initUI();
  loadCategories();
  loadProducts();
  setupEventListeners();
});

function initUI() {
  updateAuthStatusUI();
  renderSampleCoverPresets();
}

function updateAuthStatusUI() {
  const token = getAuthToken();
  const badge = document.getElementById("authStatusBadge");
  const userText = document.getElementById("adminUserDisplay");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("auth_user") || "null");
  } catch (e) {}

  if (userText) {
    userText.textContent = user?.name || (token ? "Administrador" : "Acesso Anônimo");
  }

  if (badge) {
    if (token) {
      badge.className = "badge bg-success-subtle text-success border border-success-subtle";
      badge.innerHTML = '<i class="bi bi-shield-lock-fill me-1"></i> Token Ativo';
    } else {
      badge.className = "badge bg-warning-subtle text-warning-emphasis border border-warning-subtle";
      badge.innerHTML = '<i class="bi bi-shield-slash me-1"></i> Sem Token';
    }
  }
}

function renderSampleCoverPresets() {
  const container = document.getElementById("sampleCoversContainer");
  if (!container) return;

  container.innerHTML = SAMPLE_COVERS.map(c => `
    <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" style="font-size: 0.75rem;" data-url="${c.url}">
      ${c.label}
    </button>
  `).join("");

  container.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const urlInput = document.getElementById("prodImageUrl");
      urlInput.value = btn.dataset.url;
      updateCoverPreview();
    });
  });
}

// Carregar Categorias da API ou Fallback
async function loadCategories() {
  try {
    const res = await fetch(`${AdminState.apiUrl}/categories`, {
      headers: { "Accept": "application/json" }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        AdminState.categories = json.data;
      }
    }
  } catch (e) {
    // Mantém fallback das categorias padrão
  }
  populateCategorySelects();
}

function populateCategorySelects() {
  const formSelect = document.getElementById("prodCategory");
  const filterSelect = document.getElementById("filterCategory");

  if (formSelect) {
    formSelect.innerHTML = '<option value="" disabled selected>Selecione uma categoria...</option>' +
      AdminState.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  }

  if (filterSelect) {
    filterSelect.innerHTML = '<option value="">Todas as categorias</option>' +
      AdminState.categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  }
}

// Carregar Produtos da API ou Fallback
async function loadProducts() {
  const tableBody = document.getElementById("productsTableBody");
  const emptyState = document.getElementById("emptyState");
  const loadingIndicator = document.getElementById("tableLoading");

  if (loadingIndicator) loadingIndicator.classList.remove("d-none");
  if (emptyState) emptyState.classList.add("d-none");

  const token = getAuthToken();
  let loadedFromApi = false;

  try {
    const headers = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${AdminState.apiUrl}/admin/products`, { headers });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        AdminState.products = json.data;
        loadedFromApi = true;
      }
    } else if (res.status === 401 || res.status === 403) {
      // Se não autenticado, tenta buscar catálogo público
      const pubRes = await fetch(`${AdminState.apiUrl}/products`, { headers });
      if (pubRes.ok) {
        const pubJson = await pubRes.json();
        if (pubJson.success && Array.isArray(pubJson.data)) {
          AdminState.products = pubJson.data;
          loadedFromApi = true;
        }
      }
    }
  } catch (err) {
    console.warn("Backend indisponível, utilizando dados locais/mock.", err);
  }

  if (!loadedFromApi) {
    // Carrega do localStorage se houver, ou fallback
    const saved = localStorage.getItem("admin_mock_products");
    if (saved) {
      try { AdminState.products = JSON.parse(saved); } catch (e) { AdminState.products = FALLBACK_PRODUCTS; }
    } else {
      AdminState.products = [...FALLBACK_PRODUCTS];
    }
  }

  if (loadingIndicator) loadingIndicator.classList.add("d-none");
  applyFiltersAndRender();
  updateMetrics();
}

function saveLocalMockBackup() {
  localStorage.setItem("admin_mock_products", JSON.stringify(AdminState.products));
}

// Filtragem e Renderização da Tabela
function applyFiltersAndRender() {
  const searchLower = AdminState.search.toLowerCase().trim();
  const categoryId = AdminState.categoryFilter ? Number(AdminState.categoryFilter) : null;
  const status = AdminState.statusFilter;

  AdminState.filteredProducts = AdminState.products.filter(p => {
    // Filtro de busca
    if (searchLower) {
      const matchName = (p.name || "").toLowerCase().includes(searchLower);
      const matchDesc = (p.description || "").toLowerCase().includes(searchLower);
      const matchId = String(p.id).includes(searchLower);
      if (!matchName && !matchDesc && !matchId) return false;
    }
    // Filtro de categoria
    if (categoryId !== null && p.category_id !== categoryId) {
      return false;
    }
    // Filtro de status
    if (status === "active" && !p.is_active) return false;
    if (status === "inactive" && p.is_active) return false;
    if (status === "out_of_stock" && (p.stock > 0 || !p.is_active)) return false;

    return true;
  });

  renderTable();
  updateMetrics();
}

function renderTable() {
  const tbody = document.getElementById("productsTableBody");
  const emptyState = document.getElementById("emptyState");
  const countDisplay = document.getElementById("filteredCount");

  if (countDisplay) {
    countDisplay.textContent = `${AdminState.filteredProducts.length} produto(s) exibido(s)`;
  }

  if (!AdminState.filteredProducts.length) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.classList.remove("d-none");
    return;
  }

  if (emptyState) emptyState.classList.add("d-none");

  tbody.innerHTML = AdminState.filteredProducts.map(p => {
    const isOut = Number(p.stock) === 0;
    const isLow = Number(p.stock) > 0 && Number(p.stock) <= 5;
    const stockBadgeClass = isOut ? "stock-badge-out" : isLow ? "stock-badge-low" : "stock-badge-good";
    const stockText = isOut ? "Esgotado (0)" : `${p.stock} un.`;

    const catName = p.category?.name || p.category_name || (AdminState.categories.find(c => c.id === p.category_id)?.name) || "Geral";

    const thumbHtml = p.image_url
      ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" class="product-thumb" onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Disco';">`
      : `<div class="product-thumb-placeholder"><i class="bi bi-disc"></i></div>`;

    const statusBadge = p.is_active
      ? `<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check2"></i> Ativo</span>`
      : `<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle"><i class="bi bi-pause"></i> Inativo</span>`;

    return `
      <tr data-id="${p.id}">
        <td class="text-muted fw-bold">#${p.id}</td>
        <td>${thumbHtml}</td>
        <td>
          <div class="fw-bold text-dark mb-0">${escapeHtml(p.name)}</div>
          <div class="small text-muted text-truncate" style="max-width: 280px;">${escapeHtml(p.description || "Sem descrição informada")}</div>
        </td>
        <td>
          <span class="category-badge">${escapeHtml(catName)}</span>
        </td>
        <td class="fw-bold text-dark">${formatMoney(p.price)}</td>
        <td>
          <span class="${stockBadgeClass}">${stockText}</span>
        </td>
        <td>
          <div class="form-check form-switch m-0" title="Alternar status do produto">
            <input class="form-check-input btn-toggle-status" type="checkbox" role="switch" data-id="${p.id}" ${p.is_active ? "checked" : ""}>
            <label class="form-check-label small ms-1">${statusBadge}</label>
          </div>
        </td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary btn-edit" data-id="${p.id}" title="Editar produto">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-outline-danger btn-delete" data-id="${p.id}" title="Excluir ou desativar">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  attachTableActionListeners();
}

function attachTableActionListeners() {
  // Editar
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      openEditModal(id);
    });
  });

  // Excluir
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      openDeleteConfirmation(id);
    });
  });

  // Switch de status direto na tabela
  document.querySelectorAll(".btn-toggle-status").forEach(sw => {
    sw.addEventListener("change", async (e) => {
      const id = Number(sw.dataset.id);
      const newStatus = sw.checked;
      await toggleProductStatus(id, newStatus, sw);
    });
  });
}

function updateMetrics() {
  const total = AdminState.products.length;
  const active = AdminState.products.filter(p => p.is_active).length;
  const inactive = total - active;
  const outOfStock = AdminState.products.filter(p => Number(p.stock) === 0).length;

  document.getElementById("metricTotal").textContent = total;
  document.getElementById("metricActive").textContent = active;
  document.getElementById("metricInactive").textContent = inactive;
  document.getElementById("metricOutOfStock").textContent = outOfStock;
}

// Live Preview da Imagem de Capa
function updateCoverPreview() {
  const url = document.getElementById("prodImageUrl").value.trim();
  const name = document.getElementById("prodName").value.trim() || "Nome do Álbum";
  const catSelect = document.getElementById("prodCategory");
  const catName = catSelect.selectedIndex > 0 ? catSelect.options[catSelect.selectedIndex].text : "Música";
  const previewBox = document.getElementById("coverPreviewBox");

  if (!previewBox) return;

  if (url) {
    previewBox.innerHTML = `
      <img src="${escapeHtml(url)}" alt="Preview" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'text-danger p-3 small text-center\\'><i class=\\'bi bi-exclamation-triangle-fill fs-3 d-block mb-1\\'></i>URL da imagem inacessível</div>';">
    `;
  } else {
    previewBox.innerHTML = `
      <div class="cover-preview-vinyl">
        <small class="text-uppercase tracking-wider text-white-50">${escapeHtml(catName)}</small>
        <strong class="fs-5 lh-sm">${escapeHtml(name)}</strong>
      </div>
    `;
  }
}

// Modal de Criação / Edição
function openCreateModal() {
  AdminState.currentEditingId = null;
  const modalTitle = document.getElementById("productModalTitle");
  const form = document.getElementById("productForm");
  const alertBox = document.getElementById("modalAlert");

  modalTitle.innerHTML = '<i class="bi bi-plus-circle text-accent me-2"></i>Cadastrar Novo Produto';
  form.reset();
  form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
  document.getElementById("prodActive").checked = true;
  document.getElementById("prodId").value = "";
  if (alertBox) alertBox.classList.add("d-none");

  updateCoverPreview();
  updateCharCounter();

  const modalEl = document.getElementById("productModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

function openEditModal(productId) {
  const product = AdminState.products.find(p => p.id === productId);
  if (!product) return;

  AdminState.currentEditingId = productId;
  const modalTitle = document.getElementById("productModalTitle");
  const form = document.getElementById("productForm");
  const alertBox = document.getElementById("modalAlert");

  modalTitle.innerHTML = `<i class="bi bi-pencil-square text-accent me-2"></i>Editar Produto #${productId}`;
  form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
  if (alertBox) alertBox.classList.add("d-none");

  document.getElementById("prodId").value = product.id;
  document.getElementById("prodName").value = product.name || "";
  document.getElementById("prodCategory").value = product.category_id || "";
  document.getElementById("prodPrice").value = Number(product.price).toFixed(2);
  document.getElementById("prodStock").value = product.stock ?? 0;
  document.getElementById("prodImageUrl").value = product.image_url || "";
  document.getElementById("prodDesc").value = product.description || "";
  document.getElementById("prodActive").checked = !!product.is_active;

  updateCoverPreview();
  updateCharCounter();

  const modalEl = document.getElementById("productModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

function updateCharCounter() {
  const input = document.getElementById("prodName");
  const counter = document.getElementById("nameCharCount");
  if (input && counter) {
    const len = input.value.trim().length;
    counter.textContent = `${len}/150`;
    if (len < 2 || len > 150) {
      counter.classList.add("text-danger");
    } else {
      counter.classList.remove("text-danger");
    }
  }
}

// Salvar Produto (POST ou PUT)
async function handleSaveProduct(e) {
  e.preventDefault();
  const form = document.getElementById("productForm");
  const saveBtn = document.getElementById("btnSaveProduct");
  const alertBox = document.getElementById("modalAlert");

  form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
  if (alertBox) alertBox.classList.add("d-none");

  // Captura dos valores do formulário
  const name = document.getElementById("prodName").value.trim();
  const categoryId = Number(document.getElementById("prodCategory").value);
  const price = parseFloat(document.getElementById("prodPrice").value);
  const stock = parseInt(document.getElementById("prodStock").value, 10);
  const imageUrl = document.getElementById("prodImageUrl").value.trim() || null;
  const description = document.getElementById("prodDesc").value.trim() || null;
  const isActive = document.getElementById("prodActive").checked;

  // Validação Frontend
  let hasError = false;
  if (!name || name.length < 2 || name.length > 150) {
    markInvalid("prodName", "O nome do produto é obrigatório e deve ter entre 2 e 150 caracteres.");
    hasError = true;
  }

  if (!categoryId || isNaN(categoryId) || categoryId <= 0) {
    markInvalid("prodCategory", "Selecione uma categoria válida.");
    hasError = true;
  }

  if (isNaN(price) || price < 0) {
    markInvalid("prodPrice", "O preço deve ser um valor numérico maior ou igual a zero.");
    hasError = true;
  }

  if (isNaN(stock) || stock < 0) {
    markInvalid("prodStock", "O estoque deve ser um número inteiro maior ou igual a zero.");
    hasError = true;
  }

  if (imageUrl && imageUrl.length > 500) {
    markInvalid("prodImageUrl", "A URL da imagem não pode ultrapassar 500 caracteres.");
    hasError = true;
  }

  if (hasError) return;

  const payload = {
    category_id: categoryId,
    name: name,
    description: description,
    price: Math.round(price * 100) / 100,
    stock: stock,
    image_url: imageUrl,
    is_active: isActive
  };

  const isEditing = AdminState.currentEditingId !== null;
  const url = isEditing
    ? `${AdminState.apiUrl}/admin/products/${AdminState.currentEditingId}`
    : `${AdminState.apiUrl}/admin/products`;
  const method = isEditing ? "PUT" : "POST";

  // Efeito de carregamento no botão
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Salvando...';

  const token = getAuthToken();
  let success = false;
  let responseData = null;

  try {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload)
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.success) {
      success = true;
      responseData = json.data;
      if (responseData) {
        const existingIdx = AdminState.products.findIndex(p => p.id === responseData.id);
        if (existingIdx !== -1) {
          AdminState.products[existingIdx] = responseData;
        } else {
          AdminState.products.unshift(responseData);
        }
        saveLocalMockBackup();
      }
    } else {
      const errorMsg = json?.error || (res.status === 401 ? "Token de administrador não fornecido ou expirado." : res.status === 403 ? "Acesso permitido somente para administradores." : "Erro ao salvar produto.");
      if (alertBox) {
        alertBox.innerHTML = `${escapeHtml(errorMsg)} <div class="mt-2"><button type="button" class="btn btn-sm btn-outline-danger" onclick="document.getElementById('btnOpenAuthModal').click()"><i class="bi bi-key me-1"></i>Configurar Token / Login Rápido</button></div>`;
        alertBox.classList.remove("d-none");
      }
    }
  } catch (err) {
    console.warn("Falha ao comunicar com a API. Salvando localmente...", err);
    // Fallback Mock Local
    if (isEditing) {
      const idx = AdminState.products.findIndex(p => p.id === AdminState.currentEditingId);
      if (idx !== -1) {
        AdminState.products[idx] = { ...AdminState.products[idx], ...payload, id: AdminState.currentEditingId };
        responseData = AdminState.products[idx];
        success = true;
      }
    } else {
      const newId = (AdminState.products.reduce((max, p) => Math.max(max, p.id || 0), 0) || 0) + 1;
      responseData = { ...payload, id: newId };
      AdminState.products.unshift(responseData);
      success = true;
    }
    saveLocalMockBackup();
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Salvar Produto';
  }

  if (success) {
    const modalEl = document.getElementById("productModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    showToast(isEditing ? `Produto #${AdminState.currentEditingId} atualizado!` : "Produto cadastrado com sucesso!", "success");
    await loadProducts();
  }
}

function markInvalid(fieldId, message) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.classList.add("is-invalid");
  const feedback = el.parentElement.querySelector(".invalid-feedback");
  if (feedback) feedback.textContent = message;
}

// Alterar Status (Toggle Ativo/Inativo)
async function toggleProductStatus(productId, newStatus, switchElement) {
  const token = getAuthToken();
  const prod = AdminState.products.find(p => p.id === productId);
  if (!prod) return;

  try {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${AdminState.apiUrl}/admin/products/${productId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ is_active: newStatus })
    });

    if (res.ok) {
      prod.is_active = newStatus;
      showToast(`Produto #${productId} ${newStatus ? "ativado" : "desativado"} com sucesso!`, "success");
      applyFiltersAndRender();
      return;
    }
  } catch (err) {
    // Fallback local
    prod.is_active = newStatus;
    saveLocalMockBackup();
    showToast(`Status do produto #${productId} alterado localmente.`, "warning");
    applyFiltersAndRender();
    return;
  }

  // Se falhou na API
  if (switchElement) switchElement.checked = !newStatus;
  showToast("Não foi possível alterar o status. Verifique suas permissões de administrador.", "danger");
}

// Exclusão / Desativação
function openDeleteConfirmation(productId) {
  const prod = AdminState.products.find(p => p.id === productId);
  if (!prod) return;

  AdminState.pendingDeleteId = productId;
  document.getElementById("deleteProductName").textContent = prod.name;
  document.getElementById("deleteProductId").textContent = `#${prod.id}`;

  const modalEl = document.getElementById("deleteModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

async function handleDeleteProduct(force = false) {
  const productId = AdminState.pendingDeleteId;
  if (!productId) return;

  const token = getAuthToken();
  const url = `${AdminState.apiUrl}/admin/products/${productId}${force ? "?force=true" : ""}`;

  try {
    const headers = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, { method: "DELETE", headers });
    const json = await res.json().catch(() => null);

    if (res.ok) {
      showToast(force ? "Produto excluído definitivamente!" : "Produto desativado com sucesso!", "success");
      await loadProducts();
    } else {
      showToast(json?.error || "Erro ao excluir produto.", "danger");
    }
  } catch (err) {
    // Fallback local
    if (force) {
      AdminState.products = AdminState.products.filter(p => p.id !== productId);
    } else {
      const prod = AdminState.products.find(p => p.id === productId);
      if (prod) prod.is_active = false;
    }
    saveLocalMockBackup();
    showToast(force ? "Produto excluído da lista local." : "Produto desativado localmente.", "warning");
    applyFiltersAndRender();
  } finally {
    const modalEl = document.getElementById("deleteModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    AdminState.pendingDeleteId = null;
  }
}

// Configuração de Event Listeners
function setupEventListeners() {
  // Botão "+ Novo Produto"
  document.getElementById("btnNewProduct")?.addEventListener("click", openCreateModal);

  // Formulário de Cadastro
  document.getElementById("productForm")?.addEventListener("submit", handleSaveProduct);

  // Monitoramento de digitação para preview
  document.getElementById("prodImageUrl")?.addEventListener("input", updateCoverPreview);
  document.getElementById("prodName")?.addEventListener("input", () => {
    updateCoverPreview();
    updateCharCounter();
  });
  document.getElementById("prodCategory")?.addEventListener("change", updateCoverPreview);

  // Filtros
  const searchInput = document.getElementById("filterSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AdminState.search = e.target.value;
      applyFiltersAndRender();
    });
  }

  document.getElementById("filterCategory")?.addEventListener("change", (e) => {
    AdminState.categoryFilter = e.target.value;
    applyFiltersAndRender();
  });

  document.querySelectorAll("input[name='filterStatus']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      AdminState.statusFilter = e.target.value;
      applyFiltersAndRender();
    });
  });

  // Modal de Exclusão: Botões de Ação
  document.getElementById("btnConfirmSoftDelete")?.addEventListener("click", () => handleDeleteProduct(false));
  document.getElementById("btnConfirmForceDelete")?.addEventListener("click", () => handleDeleteProduct(true));

  // Modal de Token / Auth
  document.getElementById("btnOpenAuthModal")?.addEventListener("click", () => {
    const tokenInput = document.getElementById("inputAuthToken");
    if (tokenInput) tokenInput.value = getAuthToken();
    const modalEl = document.getElementById("authModal");
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  });

  document.getElementById("btnSaveToken")?.addEventListener("click", () => {
    const tokenInput = document.getElementById("inputAuthToken");
    setAuthToken(tokenInput.value);
    showToast("Token de autenticação atualizado!", "success");
    bootstrap.Modal.getInstance(document.getElementById("authModal"))?.hide();
    loadProducts();
  });

  document.getElementById("btnClearToken")?.addEventListener("click", () => {
    setAuthToken("");
    document.getElementById("inputAuthToken").value = "";
    showToast("Token removido.", "warning");
    bootstrap.Modal.getInstance(document.getElementById("authModal"))?.hide();
    loadProducts();
  });

  // Login Rápido Simulado como Admin
  document.getElementById("btnQuickLoginAdmin")?.addEventListener("click", async () => {
    try {
      const res = await fetch(`${AdminState.apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@workdays.com", password: "sua_senha_aqui" })
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data?.token) {
        setAuthToken(json.data.token);
        if (json.data.user) localStorage.setItem("auth_user", JSON.stringify(json.data.user));
        showToast("Login de administrador realizado com sucesso!", "success");
        bootstrap.Modal.getInstance(document.getElementById("authModal"))?.hide();
        loadProducts();
      } else {
        showToast("Não foi possível efetuar o login automático com as credenciais padrão.", "danger");
      }
    } catch (e) {
      showToast("API de autenticação indisponível.", "danger");
    }
  });

  // Botão Atualizar Tabela
  document.getElementById("btnRefreshTable")?.addEventListener("click", () => {
    loadProducts();
    showToast("Lista de produtos atualizada!", "info");
  });
}
