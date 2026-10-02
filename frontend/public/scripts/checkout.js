/* Checkout ligado à API (FRONT-10).
 * Fluxo: carrinho (GET /cart) -> endereço (GET/POST /addresses) -> pedido (POST /orders).
 * O servidor valida estoque, congela os preços, baixa o estoque e esvazia o carrinho.
 */
(function () {
  const P = CONFIG.PAGES_ROOT;

  // checkout exige login (a spec); o carrinho continua salvo no servidor
  if (!Auth.isLoggedIn()) {
    window.location.href = P + "login.html?next=pages/checkout.html";
    return;
  }

  const form = document.getElementById("checkout-form");
  const alertBox = document.getElementById("checkout-alert");
  const summary = document.getElementById("checkout-summary");
  const savedBox = document.getElementById("saved-addresses");
  const newBox = document.getElementById("new-address");
  const finish = document.getElementById("finish-order");

  let cart = null;
  let addresses = [];
  let createdAddress = null; // evita criar o mesmo endereço duas vezes se o pedido falhar

  function showAlert(message, type = "danger") {
    const div = document.createElement("div");
    div.className = `alert alert-${type}`;
    div.textContent = message;
    alertBox.replaceChildren(div);
  }

  const friendly = (err) =>
    err.status === 501 ? "Esta função ainda não está disponível no servidor." : err.message;

  const problemOf = (item) =>
    item.stock === 0 ? "sem estoque"
      : item.quantity > item.stock ? `só há ${item.stock} em estoque` : null;

  function renderSummary() {
    if (!cart || !cart.items.length) {
      summary.innerHTML = `
        <div class="text-center py-3">
          <i class="bi bi-bag fs-2 text-muted-2"></i>
          <p class="text-muted-2 mt-2 mb-3">Seu carrinho está vazio.</p>
          <a href="${P}catalog.html" class="btn btn-accent">Ver catálogo</a>
        </div>`;
      finish.disabled = true;
      return;
    }

    const blocked = cart.items.filter(problemOf);
    summary.innerHTML = `
      ${cart.items.map((i) => `
        <div class="d-flex justify-content-between mb-3">
          <div>
            <strong>${Fmt.esc(i.name)}</strong>
            <div class="small text-muted-2">${i.quantity} x ${Fmt.money(i.price)}</div>
            ${problemOf(i) ? `<span class="badge text-bg-warning">${Fmt.esc(problemOf(i))}</span>` : ""}
          </div>
          <strong>${Fmt.money(i.subtotal)}</strong>
        </div>`).join("")}
      <hr>
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted-2">Subtotal</span><span>${Fmt.money(cart.total)}</span>
      </div>
      <div class="d-flex justify-content-between mb-3">
        <span class="text-muted-2">Frete</span>
        <span class="small text-muted-2">calculado ao confirmar</span>
      </div>
      <p class="small text-muted-2 mb-0">
        O total final é calculado pelo servidor ao criar o pedido.
        O pagamento é simulado, para fins acadêmicos.
      </p>`;

    if (blocked.length) {
      showAlert("Ajuste no carrinho os itens sem estoque suficiente para continuar.", "warning");
      finish.disabled = true;
    }
  }

  function renderAddresses() {
    const hasSaved = addresses.length > 0;
    savedBox.innerHTML = hasSaved
      ? addresses.map((a, idx) => `
          <label class="d-flex gap-2 border rounded-3 p-3 mb-2" style="cursor:pointer;">
            <input type="radio" name="address_choice" value="${a.id}" ${idx === 0 ? "checked" : ""}>
            <span class="small">${Fmt.address(a)}</span>
          </label>`).join("") + `
          <label class="d-flex gap-2 border rounded-3 p-3 mb-2" style="cursor:pointer;">
            <input type="radio" name="address_choice" value="new">
            <span class="small fw-semibold">Usar um novo endereço</span>
          </label>`
      : `<input type="hidden" name="address_choice" value="new">`;
    toggleNew();
  }

  const choice = () => form.querySelector('[name="address_choice"]:checked, [name="address_choice"][type="hidden"]')?.value;

  function toggleNew() {
    newBox.hidden = choice() !== "new";
  }

  function readNewAddress() {
    const f = (n) => form.elements[n].value.trim();
    return {
      zip_code: f("zip_code"),
      street: f("street"),
      number: f("number"),
      complement: f("complement") || null,
      neighborhood: f("neighborhood"),
      city: f("city"),
      state: f("state").toUpperCase(),
    };
  }

  function validateAddress(a) {
    if (!a.zip_code) return "Informe o CEP.";
    if (!a.street) return "Informe a rua.";
    if (!a.number) return "Informe o número.";
    if (!a.neighborhood) return "Informe o bairro.";
    if (!a.city) return "Informe a cidade.";
    if (!/^[A-Z]{2}$/.test(a.state)) return "Informe o estado com 2 letras (ex.: PR).";
    return null;
  }

  async function load() {
    UI.loading(summary);
    try {
      cart = await api("/cart");
    } catch (err) {
      return UI.error(summary, err);
    }
    try {
      addresses = (await api("/addresses")) || [];
    } catch (err) {
      addresses = [];
      showAlert(friendly(err), "warning");
      finish.disabled = true;
    }
    renderAddresses();
    renderSummary();
  }

  form.addEventListener("change", (e) => {
    if (e.target.name === "address_choice") toggleNew();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    alertBox.replaceChildren();
    if (!cart || !cart.items.length) return showAlert("Seu carrinho está vazio.");

    const label = finish.innerHTML;
    finish.disabled = true;
    finish.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Finalizando...';

    try {
      let addressId = choice();

      if (addressId === "new") {
        const data = readNewAddress();
        const problem = validateAddress(data);
        if (problem) throw new Error(problem);

        const key = JSON.stringify(data);
        if (!createdAddress || createdAddress.key !== key) {
          const created = await api("/addresses", { method: "POST", body: data });
          createdAddress = { key, id: created.id };
        }
        addressId = createdAddress.id;
      }

      const order = await api("/orders", {
        method: "POST",
        body: { address_id: Number(addressId) },
      });

      // o servidor esvaziou o carrinho: descartamos o token antigo
      CartToken.clear();
      setCartBadge(0);
      window.location.href = `${P}order.html?id=${order.id}&new=1`;
    } catch (err) {
      showAlert(friendly(err));
      finish.disabled = false;
      finish.innerHTML = label;
    }
  });

  document.addEventListener("DOMContentLoaded", load);
})();