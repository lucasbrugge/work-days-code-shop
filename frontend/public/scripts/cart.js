const CART_KEY = "shop_cart";

const money = (value) =>
  Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Abbey Road",
    artist: "The Beatles",
    category: "Vinil",
    price: 149.90,
    stock: 10,
  },
  {
    id: 2,
    name: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    category: "Vinil",
    price: 179.90,
    stock: 5,
  },
  {
    id: 3,
    name: "Back to Black",
    artist: "Amy Winehouse",
    category: "CD",
    price: 59.90,
    stock: 8,
  },
];

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getProduct(productId) {
  return MOCK_PRODUCTS.find(
    (product) => product.id === Number(productId)
  );
}

function addToCart(productId, quantity = 1) {
  const cart = getCart();

  const product = getProduct(productId);

  if (!product) {
    showCartError("Produto não encontrado.");
    return;
  }

  const existing = cart.find(
    (item) => item.productId === product.id
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      quantity,
    });
  }

  saveCart(cart);

  updateCartCount();
  renderCart();
}

function updateQuantity(productId, quantity) {
  const cart = getCart();

  const item = cart.find(
    (item) => item.productId === Number(productId)
  );

  if (!item) return;

  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  item.quantity = quantity;

  saveCart(cart);

  updateCartCount();
  renderCart();
}

function removeFromCart(productId) {
  const cart = getCart();

  const newCart = cart.filter(
    (item) => item.productId !== Number(productId)
  );

  saveCart(newCart);

  updateCartCount();
  renderCart();
}

function calculateSubtotal(cart) {
  return cart.reduce((total, item) => {
    const product = getProduct(item.productId);

    if (!product) return total;

    return total + product.price * item.quantity;
  }, 0);
}

function calculateShipping(subtotal) {
  if (subtotal === 0) return 0;

  return subtotal >= 200 ? 0 : 24.90;
}

function renderCart() {
  const container = document.getElementById("cart-content");

  if (!container) return;

  const cart = getCart();

  if (!cart.length) {
    container.innerHTML = `
      <div class="text-center py-5">

        <i class="bi bi-bag fs-1 text-muted-2"></i>

        <h2 class="h4 mt-3">
          Seu carrinho está vazio
        </h2>

        <p class="text-muted-2">
          Adicione alguns produtos para continuar.
        </p>

        <a href="catalog.html" class="btn btn-accent mt-2">
          Ver catálogo
        </a>

      </div>
    `;

    return;
  }

  const subtotal = calculateSubtotal(cart);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  container.innerHTML = `
    <div class="row g-4">

      <div class="col-lg-8">

        <div class="card border-0 shadow-sm">

          <div class="card-body">

            ${cart.map(renderCartItem).join("")}

          </div>

        </div>

      </div>

      <div class="col-lg-4">

        <div class="card border-0 shadow-sm">

          <div class="card-body">

            <h2 class="h5 mb-4">
              Resumo do pedido
            </h2>

            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted-2">
                Subtotal
              </span>

              <strong>
                ${money(subtotal)}
              </strong>
            </div>

            <div class="d-flex justify-content-between mb-3">
              <span class="text-muted-2">
                Frete
              </span>

              <strong>
                ${shipping === 0 ? "Grátis" : money(shipping)}
              </strong>
            </div>

            <hr>

            <div class="d-flex justify-content-between mb-4">
              <span class="fw-bold">
                Total
              </span>

              <strong class="fs-5">
                ${money(total)}
              </strong>
            </div>

            <a
              href="checkout.html"
              class="btn btn-accent w-100"
            >
              Continuar para checkout
              <i class="bi bi-arrow-right"></i>
            </a>

          </div>

        </div>

      </div>

    </div>
  `;
}

function renderCartItem(item) {
  const product = getProduct(item.productId);

  if (!product) return "";

  const subtotal = product.price * item.quantity;

  return `
    <div class="d-flex gap-3 py-3 border-bottom">

      <div
        class="rounded-3 d-flex align-items-center justify-content-center"
        style="
          width: 90px;
          height: 90px;
          background: var(--accent-soft);
          flex-shrink: 0;
        "
      >
        <i class="bi bi-vinyl fs-2 text-accent"></i>
      </div>

      <div class="flex-grow-1">

        <div class="d-flex justify-content-between">

          <div>
            <span class="tag">
              ${product.category}
            </span>

            <h3 class="h6 mt-2 mb-1">
              ${product.name}
            </h3>

            <p class="text-muted-2 small mb-1">
              ${product.artist}
            </p>

            <strong>
              ${money(product.price)}
            </strong>
          </div>

          <button
            type="button"
            class="btn btn-sm btn-outline-danger"
            data-remove="${product.id}"
            aria-label="Remover produto"
          >
            <i class="bi bi-trash"></i>
          </button>

        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">

          <div class="input-group" style="max-width: 140px;">

            <button
              type="button"
              class="btn btn-outline-secondary"
              data-decrease="${product.id}"
            >
              -
            </button>

            <input
              type="text"
              class="form-control text-center"
              value="${item.quantity}"
              readonly
            >

            <button
              type="button"
              class="btn btn-outline-secondary"
              data-increase="${product.id}"
            >
              +
            </button>

          </div>

          <strong>
            ${money(subtotal)}
          </strong>

        </div>

      </div>

    </div>
  `;
}

function showCartError(message) {
  const alert = document.getElementById("cart-alert");

  alert.innerHTML = `
    <div class="alert alert-danger">
      ${message}
    </div>
  `;
}

function updateCartCount() {
  const cart = getCart();

  const count = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const badge = document.getElementById("cart-count");

  if (badge) {
    badge.textContent = count;
  }
}

document.addEventListener("click", (event) => {

  const increase = event.target.closest("[data-increase]");

  if (increase) {
    const productId = increase.dataset.increase;

    const cart = getCart();

    const item = cart.find(
      (item) => item.productId === Number(productId)
    );

    if (item) {
      updateQuantity(productId, item.quantity + 1);
    }

    return;
  }

  const decrease = event.target.closest("[data-decrease]");

  if (decrease) {
    const productId = decrease.dataset.decrease;

    const cart = getCart();

    const item = cart.find(
      (item) => item.productId === Number(productId)
    );

    if (item) {
      updateQuantity(productId, item.quantity - 1);
    }

    return;
  }

  const remove = event.target.closest("[data-remove]");

  if (remove) {
    removeFromCart(remove.dataset.remove);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartCount();
});