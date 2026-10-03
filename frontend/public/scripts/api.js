// O back devolve erros de validação como error.fields = { campo: "mensagem" }.
// Normalizamos para { campo: ["mensagem"] }, que é o formato que o UI.fieldErrors espera.
function normalizeFieldErrors(raw) {
  if (!raw || typeof raw !== "object") return {};

  return Object.fromEntries(
    Object.entries(raw).map(
      ([k, v]) => [
        k,
        Array.isArray(v) ? v : [v]
      ]
    )
  );
}


/*
|--------------------------------------------------------------------------
| Mensagens padrão de erro HTTP
|--------------------------------------------------------------------------
*/

function getHttpErrorMessage(status) {

  switch (status) {

    case 400:
      return "A requisição é inválida. Verifique os dados e tente novamente.";

    case 401:
      return "Sua sessão não é válida. Faça login novamente.";

    case 403:
      return "Você não tem permissão para realizar esta ação.";

    case 404:
      return "O recurso solicitado não foi encontrado.";

    case 409:
      return "Não foi possível concluir a ação porque existe um conflito com os dados.";

    case 422:
      return "Os dados informados são inválidos. Verifique os campos e tente novamente.";

    case 500:
      return "Ocorreu um erro interno no servidor. Tente novamente.";

    case 501:
      return "Esta funcionalidade ainda não está disponível no servidor.";

    default:
      return status
        ? `Erro na comunicação com o servidor (HTTP ${status}).`
        : "Não foi possível conectar ao servidor. Verifique se a API está funcionando.";
  }
}


class ApiError extends Error {

  constructor(
    status,
    message,
    fields = {}
  ) {

    super(
      message ||
      getHttpErrorMessage(status)
    );

    this.name =
      "ApiError";

    this.status =
      status;

    this.data = {
      message:
        message ||
        getHttpErrorMessage(status),

      errors:
        normalizeFieldErrors(fields)
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

let guestCartInitialization = null;

async function request(path, options = {}) {
  const cartRequest = path === "/cart" || path.startsWith("/cart/");

  if (!cartRequest || Auth.getToken() || CartToken.get()) {
    return performRequest(path, options);
  }

  if (guestCartInitialization) {
    await guestCartInitialization;
    return request(path, options);
  }

  let releaseInitialization;
  guestCartInitialization = new Promise((resolve) => {
    releaseInitialization = resolve;
  });

  try {
    return await performRequest(path, options);
  } finally {
    guestCartInitialization = null;
    releaseInitialization();
  }
}

async function performRequest(
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

  let response;

  try {

    response = await fetch(
      url,
      {
        method,
        headers,

        body: body
          ? JSON.stringify(body)
          : undefined
      }
    );

  } catch (error) {

    throw new ApiError(
      0,
      getHttpErrorMessage(0)
    );

  }


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
        CONFIG.PAGES_ROOT +
        "login.html";

    }


    const err =
      json?.error;


    const backendMessage =
      typeof err === "string"
        ? err
        : err?.message;


    const message =
      backendMessage ||
      getHttpErrorMessage(
        response.status
      );


    throw new ApiError(
      response.status,
      message,
      err?.errors ??
      err?.fields
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Token do carrinho visitante
  |--------------------------------------------------------------------------
  */

  if (
    json?.data?.guest_token
  ) {

    CartToken.set(
      json.data.guest_token
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

    items:
      json?.data ?? [],

    meta:
      json?.meta

  };

}
