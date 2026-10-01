class ApiError extends Error {
  constructor(status, data) {
    super(data?.message || "Erro na requisição");
    this.status = status;
    this.data = data;           // { message, errors: { campo: [msgs] } }
  }
}

const CartToken = {
  get() { return localStorage.getItem("cart_token"); },
  set(t) { localStorage.setItem("cart_token", t); },
  clear() { localStorage.removeItem("cart_token"); },
};

async function api(path, { method = "GET", body, params } = {}) {
  const url = new URL(CONFIG.API_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== "" && v != null) url.searchParams.set(k, v);
    });
  }

  const headers = { Accept: "application/json" };
  if (body) headers["Content-Type"] = "application/json";
  if (Auth.getToken()) headers["Authorization"] = `Bearer ${Auth.getToken()}`;
  if (CartToken.get()) headers["X-Cart-Token"] = CartToken.get();

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // a API pode devolver o token do carrinho de visitante no header
  const newCartToken = res.headers.get("X-Cart-Token");
  if (newCartToken) CartToken.set(newCartToken);

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && Auth.isLoggedIn()) {
      Auth.clear();
      window.location.href = "login.html";
    }
    throw new ApiError(res.status, data);
  }
  return data;
}