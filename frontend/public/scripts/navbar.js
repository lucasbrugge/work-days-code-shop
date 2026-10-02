function renderLayout() {
  const page = document.body.dataset.page;

  const active = (name) =>
    page === name ? "active" : "";

  const logged = Auth.isLoggedIn();

  const ROOT = CONFIG.SITE_ROOT;

  const links = `
    <li class="nav-item">
      <a
        class="nav-link ${active("catalog")}"
        href="${ROOT}pages/catalog.html"
      >
        Catálogo
      </a>
    </li>

    ${
      logged
        ? `
          <li class="nav-item">
            <a
              class="nav-link ${active("orders")}"
              href="${ROOT}pages/orders.html"
            >
              Meus pedidos
            </a>
          </li>

          <li class="nav-item">
            <a
              class="nav-link ${active("profile")}"
              href="${ROOT}pages/profile.html"
            >
              Perfil
            </a>
          </li>
        `
        : ""
    }

    ${
      Auth.isAdmin()
        ? `
          <li class="nav-item">
            <a
              class="nav-link ${active("admin")}"
              href="${ROOT}admin/index.html"
            >
              Painel
            </a>
          </li>
        `
        : ""
    }
  `;

  const authButtons = logged
    ? `
      <button
        id="btn-logout"
        class="btn btn-light border"
        type="button"
      >
        Sair
      </button>
    `
    : `
      <a
        class="btn btn-light border"
        href="${ROOT}pages/login.html"
      >
        Entrar
      </a>

      <a
        class="btn btn-accent"
        href="${ROOT}pages/register.html"
      >
        Criar conta
      </a>
    `;
  const navbar =
    document.getElementById("navbar");

  if (navbar) {
    navbar.innerHTML = `
      <nav
        class="navbar navbar-expand-lg sticky-top bg-white border-bottom py-2"
      >
        <div class="container">

          <a
            class="navbar-brand fs-4 d-flex align-items-center gap-2"
            href="${ROOT}index.html"
          >
            <i
              class="bi bi-vinyl-fill text-accent"
            ></i>

            <span>
              Groove
              <span class="text-accent">
                Discos
              </span>
            </span>
          </a>

          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainnav"
            aria-controls="mainnav"
            aria-expanded="false"
            aria-label="Abrir menu"
          >
            <span
              class="navbar-toggler-icon"
            ></span>
          </button>

          <div
            class="collapse navbar-collapse"
            id="mainnav"
          >

            <ul
              class="navbar-nav me-auto ms-lg-3"
            >
              ${links}
            </ul>

            <div
              class="d-flex align-items-center gap-2 flex-wrap my-2 my-lg-0"
            >

              ${authButtons}

              <a
                class="btn btn-outline-accent position-relative"
                href="${ROOT}pages/cart.html"
              >
                <i class="bi bi-bag"></i>

                Carrinho

                <span
                  id="cart-count"
                  class="badge rounded-pill cart-badge position-absolute top-0 start-100 translate-middle"
                >
                  0
                </span>
              </a>

            </div>

          </div>

        </div>
      </nav>
    `;
  }

  const footer =
    document.getElementById("footer");

  if (footer) {
    footer.innerHTML = `
      <footer
        class="site-footer py-5 mt-5"
      >

        <div class="container">

          <div class="row g-4">

            <div class="col-lg-5">

              <div
                class="fs-5 fw-bold mb-2"
              >
                <i
                  class="bi bi-vinyl-fill text-accent"
                ></i>

                ${CONFIG.STORE_NAME}
              </div>

              <p
                class="text-muted-2 small mb-0"
              >
                Projeto acadêmico de e-commerce.

                O pagamento é
                <strong>simulado</strong>
                para fins de estudo:
                nenhum gateway real e nenhum dado
                de cartão é solicitado ou armazenado.
              </p>

            </div>


            <div class="col-6 col-lg-3">

              <h6 class="fw-bold">
                Loja
              </h6>

              <ul
                class="list-unstyled small mb-0"
              >

                <li>
                  <a
                    href="${ROOT}pages/catalog.html"
                  >
                    Catálogo
                  </a>
                </li>

                <li>
                  <a
                    href="${ROOT}pages/cart.html"
                  >
                    Carrinho
                  </a>
                </li>

                <li>
                  <a
                    href="${ROOT}pages/orders.html"
                  >
                    Meus pedidos
                  </a>
                </li>

                <li>
                  <a
                    href="${ROOT}pages/profile.html"
                  >
                    Perfil
                  </a>
                </li>

              </ul>

            </div>


            <div class="col-6 col-lg-4">

              <h6 class="fw-bold">
                Regras
              </h6>

              <p
                class="text-muted-2 small mb-0"
              >
                Frete fixo de R$ 24,90,
                grátis acima de R$ 200.

                Cancelamento devolve o estoque.
              </p>

            </div>

          </div>


          <hr>


          <div class="text-muted-2 small">

            © ${new Date().getFullYear()}
            ${CONFIG.STORE_NAME}
            — projeto final.

          </div>

        </div>

      </footer>
    `;
  }

  document
    .getElementById("btn-logout")
    ?.addEventListener(
      "click",
      async () => {

        try {

          await api(
            "/auth/logout",
            {
              method: "POST"
            }
          );

        } catch (error) {

          console.error(
            "Erro ao realizar logout:",
            error
          );

        } finally {

          Auth.clear();

          window.location.href =
            `${ROOT}index.html`;

        }

      }
    );

  updateCartCount();
}
function updateCartCount() {
  const badge =
    document.getElementById(
      "cart-count"
    );

  if (!badge) {
    return;
  }


  let cart = [];

  try {

    cart = JSON.parse(
      localStorage.getItem(
        "shop_cart"
      ) || "[]"
    );

  } catch (error) {

    console.error(
      "Erro ao ler carrinho:",
      error
    );

    cart = [];

  }


  if (!Array.isArray(cart)) {
    cart = [];
  }


  const count =
    cart.reduce(
      (total, item) => {

        const quantity =
          Number(item.quantity) || 0;

        return total + quantity;

      },
      0
    );


  badge.textContent =
    count;
}
document.addEventListener(
  "DOMContentLoaded",
  renderLayout
);