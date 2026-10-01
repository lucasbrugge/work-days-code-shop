/*
 * ============================================================
 * API CENTRAL DO PAINEL
 * ============================================================
 * Altere principalmente API_CONFIG.BASE_URL e os ENDPOINTS.
 * Nenhum outro arquivo precisa conhecer a URL da sua API.
 */

const API_CONFIG = {
    BASE_URL: "http://localhost:8000/api/admin",

    ENDPOINTS: {
        login: "/login",
        usuarios: "/users",
        produtos: "/products"
    }
};

function getApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

async function apiFetch(endpoint, options = {}) {
    const token = sessionStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(getApiUrl(endpoint), {
        ...options,
        headers
    });

    let data = null;

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        data = text || null;
    }

    if (!response.ok) {
        const message =
            data?.message ||
            data?.error ||
            `Erro HTTP ${response.status}`;

        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

/* Login */
async function loginApi(username, password) {
    return apiFetch(API_CONFIG.ENDPOINTS.login, {
        method: "POST",
        body: JSON.stringify({ username, password })
    });
}

/* Usuários */
async function getUsuarios() {
    return apiFetch(API_CONFIG.ENDPOINTS.usuarios, {
        method: "GET"
    });
}

async function criarUsuario(usuario) {
    return apiFetch(API_CONFIG.ENDPOINTS.usuarios, {
        method: "POST",
        body: JSON.stringify(usuario)
    });
}

/* Produtos */
async function getProdutos() {
    return apiFetch(API_CONFIG.ENDPOINTS.produtos, {
        method: "GET"
    });
}

async function criarProduto(produto) {
    return apiFetch(API_CONFIG.ENDPOINTS.produtos, {
        method: "POST",
        body: JSON.stringify(produto)
    });
}
