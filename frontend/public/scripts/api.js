// O back devolve erros de validação como error.fields = { campo: "mensagem" }.
// Normalizamos para { campo: ["mensagem"] }, que é o formato que o UI.fieldErrors espera.
function normalizeFieldErrors(raw) {
  if (!raw || typeof raw !== "object") return {};
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v : [v]])
  );
}

class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message || "Erro na requisição");

    this.name = "ApiError";
    this.status = status;
    this.data = { message, errors: normalizeFieldErrors(errors) };
  }
}


/*
|--------------------------------------------------------------------------
| Token do carrinho visitante
|--------------------------------------------------------------------------
*/

const CartToken = {
  get() {
    return localStorage.getItem(
      "guest_token"
    );
  },

  set(token) {
    localStorage.setItem(
      "guest_token",
      token
    );
  },

  clear() {
    localStorage.removeItem(
      "guest_token"
    );
  }
};


/*
|--------------------------------------------------------------------------
| Request
|--------------------------------------------------------------------------
|
| Único local do frontend responsável por realizar fetch.
|
*/

async function request(
  path,
  {
    method = "GET",
    body,
    params
  } = {}
) {

  /*
  |--------------------------------------------------------------------------
  | URL
  |--------------------------------------------------------------------------
  */

  const url = new URL(
    CONFIG.API_URL + path
  );


  /*
  |--------------------------------------------------------------------------
  | Query Params
  |--------------------------------------------------------------------------
  */

  if (params) {
    Object.entries(params).forEach(
      ([key, value]) => {

        if (
          value !== "" &&
          value !== null &&
          value !== undefined
        ) {
          url.searchParams.set(
            key,
            value
          );
        }

      }
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Headers
  |--------------------------------------------------------------------------
  */

  const headers = {
    Accept: "application/json"
  };


  if (body) {
    headers["Content-Type"] =
      "application/json";
  }


  /*
  |--------------------------------------------------------------------------
  | Token de autenticação
  |--------------------------------------------------------------------------
  */

  const authToken =
    Auth.getToken();

  if (authToken) {
    headers["Authorization"] =
      `Bearer ${authToken}`;
  }


  /*
  |--------------------------------------------------------------------------
  | Token do carrinho visitante
  |--------------------------------------------------------------------------
  */

  const guestToken =
    CartToken.get();

  if (guestToken) {
    headers["X-Guest-Token"] =
      guestToken;
  }


  /*
  |--------------------------------------------------------------------------
  | Requisição
  |--------------------------------------------------------------------------
  */

  const response = await fetch(
    url,
    {
      method,
      headers,

      body: body
        ? JSON.stringify(body)
        : undefined
    }
  );


  /*
  |--------------------------------------------------------------------------
  | Token de visitante retornado pelo backend
  |--------------------------------------------------------------------------
  */

  const newGuestToken =
    response.headers.get(
      "X-Guest-Token"
    );

  if (newGuestToken) {
    CartToken.set(
      newGuestToken
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Corpo da resposta
  |--------------------------------------------------------------------------
  */

  const json =
    response.status === 204
      ? null
      : await response
          .json()
          .catch(() => null);


  /*
  |--------------------------------------------------------------------------
  | Tratamento de erros
  |--------------------------------------------------------------------------
  */

  if (
    !response.ok ||
    json?.success === false
  ) {

    /*
    |--------------------------------------------------------------------------
    | Token inválido ou expirado
    |--------------------------------------------------------------------------
    */

    if (
      response.status === 401 &&
      Auth.isLoggedIn()
    ) {
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


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
|
| Respostas comuns:
|
| {
|   success: true,
|   data: {...},
|   error: null
| }
|
| Retornamos apenas "data".
|
*/

async function api(
  path,
  options
) {
  const json =
    await request(
      path,
      options
    );

  return json?.data;
}


async function apiList(
  path,
  options
) {
  const json =
    await request(
      path,
      options
    );

  return {
    items: json?.data ?? [],
    meta: json?.meta
  };
}