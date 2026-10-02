// O back devolve erros de validação como error.fields = { campo: "mensagem" }.
// Normalizamos para { campo: ["mensagem"] }, que é o formato que o UI.fieldErrors espera.
function normalizeFieldErrors(raw) {
  if (!raw || typeof raw !== "object") return {};
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v : [v]])
  );
}

class ApiError extends Error {
  constructor(status, message, errors) {
    super(message || "Erro na requisição");
    this.status = status;
    this.data = { message, errors: normalizeFieldErrors(errors) };
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
      window.location.href = CONFIG.PAGES_ROOT + "login.html";
    }
    const err = json?.error;
    const message = typeof err === "string" ? err : err?.message;
    throw new ApiError(res.status, message, err?.errors ?? err?.fields);
  }
  // o back devolve o token do carrinho de visitante em data.guest_token
  if (json?.data?.guest_token) CartToken.set(json.data.guest_token);

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