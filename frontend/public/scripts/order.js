const ORDER_STORAGE_KEY = "last_order";

const orderMoney = (value) =>
  Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function getOrder() {

  try {

    return JSON.parse(
      localStorage.getItem(ORDER_STORAGE_KEY)
    );

  } catch {

    return null;

  }
}

function getStatusLabel(status) {

  const statuses = {
    pending: "Aguardando pagamento",
    paid: "Pago",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };

  return statuses[status] || status;
}

function renderOrder() {

  const container =
    document.getElementById("order-content");

  const order = getOrder();

  if (!order) {

    container.innerHTML = `
      <div class="text-center py-5">

        <i class="bi bi-exclamation-circle fs-1 text-muted-2"></i>

        <h1 class="h4 mt-3">
          Pedido não encontrado
        </h1>

        <p class="text-muted-2">
          Não encontramos um pedido para exibir.
        </p>

        <a
          href="catalog.html"
          class="btn btn-accent"
        >
          Voltar ao catálogo
        </a>

      </div>
    `;

    return;
  }

  container.innerHTML = `

    <div class="text-center mb-5">

      <div class="mb-3">
        <i class="bi bi-check-circle-fill fs-1 text-success"></i>
      </div>

      <h1 class="h2">
        Pedido realizado!
      </h1>

      <p class="text-muted-2">
        Seu pedido foi registrado com sucesso.
      </p>

      <span class="badge text-bg-warning">
        ${getStatusLabel(order.status)}
      </span>

    </div>

    <div class="row g-4">

      <div class="col-lg-8">

        <div class="card border-0 shadow-sm">

          <div class="card-body">

            <div class="d-flex justify-content-between mb-4">

              <div>

                <h2 class="h5 mb-1">
                  Pedido #${order.id}
                </h2>

                <span class="text-muted-2 small">
                  ${new Date(order.created_at).toLocaleString("pt-BR")}
                </span>

              </div>

            </div>

            <h3 class="h6 mb-3">
              Produtos
            </h3>

            ${order.items.map((item) => `

              <div class="d-flex justify-content-between border-bottom py-3">

                <div>

                  <strong>
                    ${item.name}
                  </strong>

                  <div class="small text-muted-2">
                    ${item.artist}
                  </div>

                  <div class="small text-muted-2">
                    Quantidade: ${item.quantity}
                  </div>

                </div>

                <strong>
                  ${orderMoney(
                    item.price * item.quantity
                  )}
                </strong>

              </div>

            `).join("")}

          </div>

        </div>

      </div>

      <div class="col-lg-4">

        <div class="card border-0 shadow-sm mb-4">

          <div class="card-body">

            <h2 class="h5 mb-3">
              Entrega
            </h2>

            <p class="mb-1">
              <strong>${order.customer.name}</strong>
            </p>

            <p class="text-muted-2 small mb-0">
              ${order.customer.address}, 
              ${order.customer.number}<br>
              ${order.customer.city} - 
              ${order.customer.state}<br>
              CEP: ${order.customer.zip}
            </p>

          </div>

        </div>

        <div class="card border-0 shadow-sm">

          <div class="card-body">

            <h2 class="h5 mb-3">
              Resumo
            </h2>

            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted-2">
                Subtotal
              </span>

              <span>
                ${orderMoney(order.subtotal)}
              </span>
            </div>

            <div class="d-flex justify-content-between mb-3">
              <span class="text-muted-2">
                Frete
              </span>

              <span>
                ${
                  order.shipping === 0
                    ? "Grátis"
                    : orderMoney(order.shipping)
                }
              </span>
            </div>

            <hr>

            <div class="d-flex justify-content-between">

              <strong>
                Total
              </strong>

              <strong class="fs-5">
                ${orderMoney(order.total)}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>

    <div class="text-center mt-4">

      <a
        href="catalog.html"
        class="btn btn-accent"
      >
        Continuar comprando
      </a>

      <a
        href="orders.html"
        class="btn btn-outline-secondary ms-2"
      >
        Meus pedidos
      </a>

    </div>
  `;
}

document.addEventListener(
  "DOMContentLoaded",
  renderOrder
);