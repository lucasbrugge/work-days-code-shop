/* Detalhe do pedido (FRONT-11 e 12): itens, endereço, status, pagamento simulado e cancelamento. */
(function () {
  const P = CONFIG.PAGES_ROOT;
  const params = new URLSearchParams(location.search);
  const id = Number(params.get("id"));
  const isNew = params.get("new") === "1";
  const content = document.getElementById("order-content");

  if (!Auth.isLoggedIn()) {
    window.location.href = P + "login.html?next=" + encodeURIComponent("pages/order.html" + location.search);
    return;
  }

  function showAlert(message, type = "danger") {
    const box = document.getElementById("order-alert");
    if (!box) return;
    const div = document.createElement("div");
    div.className = `alert alert-${type}`;
    div.textContent = message;
    box.replaceChildren(div);
  }

  function notFound(text = "Não encontramos este pedido.") {
    content.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-exclamation-circle fs-1 text-muted-2"></i>
        <h1 class="h4 mt-3">Pedido não encontrado</h1>
        <p class="text-muted-2">${Fmt.esc(text)}</p>
        <a href="${P}orders.html" class="btn btn-accent">Meus pedidos</a>
      </div>`;
  }

  function render(order) {
    const st = Fmt.status(order.status);
    const items = (order.items || []).map(Fmt.item);
    const pending = st.key === "pending_payment";

    content.innerHTML = `
      <div id="order-alert"></div>

      ${isNew ? `
        <div class="text-center mb-5">
          <i class="bi bi-check-circle-fill fs-1 text-success"></i>
          <h1 class="h2 mt-2">Pedido realizado!</h1>
          <p class="text-muted-2 mb-0">Seu pedido foi registrado e aguarda o pagamento.</p>
        </div>` : ""}

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm"><div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h2 class="h5 mb-1">Pedido #${order.id}</h2>
                <span class="text-muted-2 small">${Fmt.date(order.created_at)}</span>
              </div>
              <span class="badge text-bg-${st.color}">${Fmt.esc(st.label)}</span>
            </div>
            <h3 class="h6 mb-3">Produtos</h3>
            ${items.map((i) => `
              <div class="d-flex justify-content-between border-bottom py-3">
                <div>
                  <strong>${Fmt.esc(i.name)}</strong>
                  <div class="small text-muted-2">${i.quantity} x ${Fmt.money(i.price)}</div>
                </div>
                <strong>${Fmt.money(i.subtotal)}</strong>
              </div>`).join("")}
          </div></div>
        </div>

        <div class="col-lg-4">
          ${order.address ? `
          <div class="card border-0 shadow-sm mb-4"><div class="card-body">
            <h2 class="h5 mb-3">Entrega</h2>
            <p class="text-muted-2 small mb-0">${Fmt.address(order.address)}</p>
          </div></div>` : ""}

          <div class="card border-0 shadow-sm mb-4"><div class="card-body">
            <h2 class="h5 mb-3">Resumo</h2>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted-2">Subtotal</span><span>${Fmt.money(order.subtotal)}</span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span class="text-muted-2">Frete</span>
              <span>${Number(order.shipping) === 0 ? "Grátis" : Fmt.money(order.shipping)}</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between">
              <strong>Total</strong><strong class="fs-5">${Fmt.money(order.total)}</strong>
            </div>
            ${order.paid_at ? `<p class="small text-muted-2 mt-3 mb-0">Pago em ${Fmt.date(order.paid_at)}</p>` : ""}
          </div></div>

          ${pending ? `
          <div class="card border-0 shadow-sm"><div class="card-body">
            <h2 class="h5 mb-2">Pagamento</h2>
            <p class="small text-muted-2">
              <strong>Pagamento simulado, apenas para fins acadêmicos.</strong>
              Nenhum dado de cartão é solicitado: o botão só marca o pedido como pago.
            </p>
            <button id="btn-pay" class="btn btn-accent w-100 mb-2">Confirmar pagamento</button>
            <button id="btn-cancel" class="btn btn-outline-danger w-100">Cancelar pedido</button>
          </div></div>` : ""}
        </div>
      </div>

      <div class="text-center mt-4">
        <a href="${P}catalog.html" class="btn btn-accent">Continuar comprando</a>
        <a href="${P}orders.html" class="btn btn-outline-secondary ms-2">Meus pedidos</a>
      </div>`;

    document.getElementById("btn-pay")?.addEventListener("click", () =>
      act("pay", "Pagamento confirmado."));
    document.getElementById("btn-cancel")?.addEventListener("click", () => {
      if (confirm("Cancelar este pedido? Os itens voltam ao estoque.")) act("cancel", "Pedido cancelado.");
    });
  }

  async function act(action, successMessage) {
    document.querySelectorAll("#btn-pay, #btn-cancel").forEach((b) => (b.disabled = true));
    try {
      await api(`/orders/${id}/${action}`, { method: "POST" });
      await load(false);
      showAlert(successMessage, "success");
    } catch (err) {
      const text = err.status === 409 ? "Este pedido não pode mais ser alterado (status mudou)." : err.message;
      await load(false).catch(() => {});
      showAlert(text);
    }
  }

  async function load(showSpinner = true) {
    if (!Number.isInteger(id) || id <= 0) return notFound();
    if (showSpinner) UI.loading(content);
    try {
      render(await api(`/orders/${id}`));
    } catch (err) {
      if (err.status === 403 || err.status === 404) return notFound();
      UI.error(content, err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => load());
})();