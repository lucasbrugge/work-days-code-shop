function renderLayout() {
  const page = document.body.dataset.page;
  const active = (name) => (page === name ? "active" : "");
  const logged = Auth.isLoggedIn();

  const links = `
    <li class="nav-item"><a class="nav-link ${active("catalog")}" href="index.html">Catálogo</a></li>
    ${logged ? `
      <li class="nav-item"><a class="nav-link ${active("orders")}" href="orders.html">Meus pedidos</a></li>
      <li class="nav-item"><a class="nav-link ${active("profile")}" href="profile.html">Perfil</a></li>` : ""}
    ${Auth.isAdmin() ? `
      <li class="nav-item"><a class="nav-link ${active("admin")}" href="admin/products.html">Painel</a></li>` : ""}
  `;

  const authButtons = logged
    ? `<button id="btn-logout" class="btn btn-light border">Sair</button>`
    : `<a class="btn btn-light border" href="login.html">Entrar</a>
       <a class="btn btn-accent" href="register.html">Criar conta</a>`;

  document.getElementById("navbar").innerHTML = `
    <nav class="navbar navbar-expand-lg sticky-top bg-white border-bottom py-2">
      <div class="container">
        <a class="navbar-brand fs-4 d-flex align-items-center gap-2" href="index.html">
          <i class="bi bi-vinyl-fill text-accent"></i>
          <span>Groove <span class="text-accent">Discos</span></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#mainnav" aria-controls="mainnav"
                aria-expanded="false" aria-label="Abrir menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainnav">
          <ul class="navbar-nav me-auto ms-lg-3">${links}</ul>
          <div class="d-flex align-items-center gap-2 flex-wrap my-2 my-lg-0">
            ${authButtons}
            <a class="btn btn-outline-accent position-relative" href="cart.html">
              <i class="bi bi-bag"></i> Carrinho
              <span id="cart-count" class="badge rounded-pill cart-badge position-absolute top-0 start-100 translate-middle">0</span>
            </a>
          </div>
        </div>
      </div>
    </nav>`;

  document.getElementById("footer").innerHTML = `
    <footer class="site-footer py-5 mt-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-5">
            <div class="fs-5 fw-bold mb-2"><i class="bi bi-vinyl-fill text-accent"></i> ${CONFIG.STORE_NAME}</div>
            <p class="text-muted-2 small mb-0">Projeto acadêmico de e-commerce. O pagamento é
              <strong>simulado</strong> para fins de estudo: nenhum gateway real e nenhum dado de cartão é solicitado ou armazenado.</p>
          </div>
          <div class="col-6 col-lg-3">
            <h6 class="fw-bold">Loja</h6>
            <ul class="list-unstyled small mb-0">
              <li><a href="index.html">Catálogo</a></li>
              <li><a href="cart.html">Carrinho</a></li>
              <li><a href="orders.html">Meus pedidos</a></li>
              <li><a href="profile.html">Perfil</a></li>
            </ul>
          </div>
          <div class="col-6 col-lg-4">
            <h6 class="fw-bold">Regras</h6>
            <p class="text-muted-2 small mb-0">Frete fixo de R$ 24,90, grátis acima de R$ 200.
              Cancelamento devolve o estoque.</p>
          </div>
        </div>
        <hr>
        <div class="text-muted-2 small">© ${new Date().getFullYear()} ${CONFIG.STORE_NAME} — projeto final.</div>
      </div>
    </footer>`;

  document.getElementById("btn-logout")?.addEventListener("click", () => {
    Auth.clear();
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", renderLayout);