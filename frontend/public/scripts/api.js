class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message || "Erro na requisição");

    this.name = "ApiError";
    this.status = status;

    this.data = {
      message: message || "Erro na requisição",
      fields
    };
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

      window.location.href =
        `${CONFIG.SITE_ROOT}pages/login.html`;
    }


    /*
    |--------------------------------------------------------------------------
    | Formato de erro da API
    |--------------------------------------------------------------------------
    |
    | Pode chegar:
    |
    | error: "E-mail ou senha inválidos"
    |
    | ou:
    |
    | error: {
    |   message: "Dados inválidos.",
    |   fields: {
    |     email: "...",
    |     password: "..."
    |   }
    | }
    |
    */

    const error =
      json?.error;


    const message =
      typeof error === "string"
        ? error
        : error?.message;


    /*
    |--------------------------------------------------------------------------
    | Compatibilidade
    |--------------------------------------------------------------------------
    |
    | Nosso backend usa "fields".
    | Mantemos fallback para "errors" caso outra rota use esse formato.
    |
    */

    const fields =
      error?.fields ??
      error?.errors ??
      {};


    throw new ApiError(
      response.status,
      message,
      fields
    );
  }


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