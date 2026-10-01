const CHECKOUT_CART_KEY = "shop_cart";
const ORDER_KEY = "last_order";

const checkoutMoney = (value) =>
  Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const CHECKOUT_PRODUCTS = [
  {
    id: 1,
    name: "Abbey Road",
    artist: "The Beatles",
    price: 149.90,
  },
  {
    id: 2,
    name: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    price: 179.90,
  },
  {
    id: 3,
    name: "Back to Black",
    artist: "Amy Winehouse",
    price: 59.90,
  },
];

function getCheckoutCart() {
  return JSON.parse(
    localStorage.getItem(CHECKOUT_CART_KEY) || "[]"
  );
}

function getCheckoutProduct(id) {
  return CHECKOUT_PRODUCTS.find(
    (product) => product.id === Number(id)
  );
}

function calculateCheckoutTotals() {
  const cart = getCheckoutCart();

  const subtotal = cart.reduce((total, item) => {

    const product = getCheckoutProduct(item.productId);

    if (!product) return total;

    return total + product.price * item.quantity;

  }, 0);

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= 200
        ? 0
        : 24.90;

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

function renderCheckoutSummary() {

  const container =
    document.getElementById("checkout-summary");

  const cart = getCheckoutCart();

  if (!cart.length) {

    container.innerHTML = `
      <div class="text-center py-3">

        <i class="bi bi-bag fs-2 text-muted-2"></i>

        <p class="text-muted-2 mt-2 mb-3">
          Seu carrinho está vazio.
        </p>

        <a href="catalog.html" class="btn btn-accent">
          Ver catálogo
        </a>

      </div>
    `;

    document.getElementById("finish-order").disabled = true;

    return;
  }

  const totals = calculateCheckoutTotals();

  container.innerHTML = `

    ${cart.map((item) => {

      const product = getCheckoutProduct(item.productId);

      if (!product) return "";

      return `
        <div class="d-flex justify-content-between mb-3">

          <div>

            <strong>
              ${product.name}
            </strong>

            <div class="small text-muted-2">
              ${item.quantity} unidade(s)
            </div>

          </div>

          <strong>
            ${checkoutMoney(
              product.price * item.quantity
            )}
          </strong>

        </div>
      `;

    }).join("")}

    <hr>

    <div class="d-flex justify-content-between mb-2">
      <span class="text-muted-2">
        Subtotal
      </span>

      <span>
        ${checkoutMoney(totals.subtotal)}
      </span>
    </div>

    <div class="d-flex justify-content-between mb-3">
      <span class="text-muted-2">
        Frete
      </span>

      <span>
        ${
          totals.shipping === 0
            ? "Grátis"
            : checkoutMoney(totals.shipping)
        }
      </span>
    </div>

    <div class="d-flex justify-content-between">

      <strong>
        Total
      </strong>

      <strong class="fs-5">
        ${checkoutMoney(totals.total)}
      </strong>

    </div>
  `;
}

function showCheckoutError(message) {

  document.getElementById("checkout-alert").innerHTML = `
    <div class="alert alert-danger">
      ${message}
    </div>
  `;
}

function getFormData() {

  const form =
    document.getElementById("checkout-form");

  return {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    zip: form.zip.value.trim(),
    address: form.address.value.trim(),
    city: form.city.value.trim(),
    state: form.state.value.trim(),
    number: form.number.value.trim(),
  };
}

function validateForm(data) {

  if (!data.name) {
    return "Informe seu nome.";
  }

  if (!data.email) {
    return "Informe seu e-mail.";
  }

  if (!data.zip) {
    return "Informe o CEP.";
  }

  if (!data.address) {
    return "Informe o endereço.";
  }

  if (!data.city) {
    return "Informe a cidade.";
  }

  if (!data.state) {
    return "Informe o estado.";
  }

  if (!data.number) {
    return "Informe o número.";
  }

  return null;
}

function createMockOrder(customer, cart, totals) {

  return {
    id: Date.now(),

    status: "pending",

    created_at: new Date().toISOString(),

    customer,

    items: cart.map((item) => {

      const product =
        getCheckoutProduct(item.productId);

      return {
        product_id: product.id,
        name: product.name,
        artist: product.artist,
        price: product.price,
        quantity: item.quantity,
      };

    }),

    subtotal: totals.subtotal,
    shipping: totals.shipping,
    total: totals.total,
  };
}

document
  .getElementById("checkout-form")
  .addEventListener("submit", (event) => {

    event.preventDefault();

    const alert =
      document.getElementById("checkout-alert");

    alert.innerHTML = "";

    const data = getFormData();

    const error = validateForm(data);

    if (error) {
      showCheckoutError(error);
      return;
    }

    const cart = getCheckoutCart();

    if (!cart.length) {
      showCheckoutError(
        "Não é possível finalizar um pedido com o carrinho vazio."
      );

      return;
    }

    const button =
      document.getElementById("finish-order");

    button.disabled = true;
    button.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2"></span>
      Finalizando...
    `;

    const totals = calculateCheckoutTotals();

    const order =
      createMockOrder(data, cart, totals);

    localStorage.setItem(
      ORDER_KEY,
      JSON.stringify(order)
    );

    localStorage.removeItem(CHECKOUT_CART_KEY);

    window.location.href =
      `order.html?id=${order.id}`;
  });

document.addEventListener(
  "DOMContentLoaded",
  renderCheckoutSummary
);