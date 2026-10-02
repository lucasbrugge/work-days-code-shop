/* Meus pedidos (FRONT-12): listagem do usuário. */
(function () {
  const P = CONFIG.PAGES_ROOT;
  const content = document.getElementById("orders-content");

  if (!Auth.isLoggedIn()) {
    window.location.href = P + "login.html?next=pages/orders.html";
    return;
  }

  async function load() {
    UI.loading(content);
    try {
      const orders = (await api("/orders")) || [];
      if (!orders.length) {
        content.innerHTML = `
          <div class="text-center py-5">
            <i class="bi bi-receipt fs-1 text-muted-2"></i>
            <h2 class="h4 mt-3">Você ainda não fez pedidos</h2>
            <p class="text-muted-2">Quando finalizar uma compra, ela aparece aqui.</p>
            <a href="${P}catalog.html" class="btn btn-accent">Ver catálogo</a>
          </div>`;
        return;
      }
      content.innerHTML = `
        <div class="card border-0 shadow-sm"><div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead><tr><th>Pedido</th><th>Data</th><th>Total</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${orders.map((o) => {
                const st = Fmt.status(o.status);
                return `<tr>
                  <td>#${o.id}</td>
                  <td>${Fmt.date(o.created_at)}</td>
                  <td>${Fmt.money(o.total)}</td>
                  <td><span class="badge text-bg-${st.color}">${Fmt.esc(st.label)}</span></td>
                  <td class="text-end"><a class="btn btn-sm btn-outline-accent" href="${P}order.html?id=${o.id}">Detalhes</a></td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div></div>`;
    } catch (err) {
      if (err.status === 501) {
        content.innerHTML = `<div class="alert alert-warning">Os pedidos ainda não estão disponíveis no servidor.</div>`;
      } else {
        UI.error(content, err);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();