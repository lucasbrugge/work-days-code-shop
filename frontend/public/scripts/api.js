class ApiError extends Error {
  constructor(status, response) {
    const error = response?.error ?? response;

    let message = "Erro na requisição";

    if (typeof error === "string") {
      message = error;
    } else if (error?.message) {
      message = error.message;
    }

    super(message);

    this.status = status;
    this.data = error;
  }
}


const CartToken = {
  get() {
    return localStorage.getItem("cart_token");
  },

  set(token) {
    localStorage.setItem(
      "cart_token",
      token
    );
  },

  clear() {
    localStorage.removeItem(
      "cart_token"
    );
  },
};


async function api(
  path,
  {
    method = "GET",
    body,
    params
  } = {}
) {

  const url = new URL(
    CONFIG.API_URL + path
  );

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

  const headers = {
    Accept: "application/json"
  };

  if (body) {

    headers["Content-Type"] =
      "application/json";

  }


  const authToken = Auth.getToken();

  if (authToken) {

    headers["Authorization"] =
      `Bearer ${authToken}`;

  }

  const cartToken = CartToken.get();

  if (cartToken) {

    headers["X-Cart-Token"] =
      cartToken;

  }

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

  const newCartToken =
    response.headers.get(
      "X-Cart-Token"
    );

  if (newCartToken) {

    CartToken.set(
      newCartToken
    );

  }

  const data =
    response.status === 204
      ? null
      : await response
          .json()
          .catch(() => null);
  if (!response.ok) {
    if (
      response.status === 401 &&
      Auth.isLoggedIn()
    ) {

      Auth.clear();

      window.location.href =
        "login.html";

    }


    throw new ApiError(
      response.status,
      data
    );

  }
  return data;
}