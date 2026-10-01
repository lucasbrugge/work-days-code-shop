class ApiError extends Error {
  constructor(status, message, errors) {
    super(message || "Erro na requisição");
    this.status = status;
    this.data = { message, errors: errors || {} };
  }
}

const CartToken = {
  get() { return localStorage.getItem("guest_token"); },
  set(t) { localStorage.setItem("guest_token", t); },
  clear() { localStorage.removeItem("guest_token"); },
};

// Único lugar do front que faz fetch (FRONT-19)
async function request(path, { method = "GET", body, params } = {}) {
  const url = new URL(CONFIG.API_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== "" && v != null) url.searchParams.set(k, v);
    });
  }

  const headers = { Accept: "application/json" };
  if (body) headers["Content-Type"] = "application/json";
  if (Auth.getToken()) headers["Authorization"] = `Bearer ${Auth.getToken()}`;
  if (CartToken.get()) headers["X-Guest-Token"] = CartToken.get();

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok || json?.success === false) {
    if (res.status === 401 && Auth.isLoggedIn()) {
      Auth.clear();
      window.location.href = CONFIG.SITE_ROOT + "login.html";
    }
    const err = json?.error;
    const message = typeof err === "string" ? err : err?.message;
    throw new ApiError(res.status, message, err?.errors);
  }
  return json;
}

// Respostas simples: devolve só o "data"
async function api(path, options) {
  const json = await request(path, options);
  return json?.data;
}

// Listas paginadas: devolve { items, meta }
async function apiList(path, options) {
  const json = await request(path, options);
  return { items: json?.data ?? [], meta: json?.meta };
}