/* Perfil (FRONT-13): dados do usuário e gerenciamento de endereços.
 * Dados:     GET /auth/me (já existe)  +  PUT /profile { name, email }
 * Endereços: GET/POST /addresses  +  PUT/DELETE /addresses/{id}
 */
(function () {
  const P = CONFIG.PAGES_ROOT;

  if (!Auth.isLoggedIn()) {
    window.location.href = P + "login.html?next=pages/profile.html";
    return;
  }

  const profileForm = document.getElementById("profile-form");
  const profileAlert = document.getElementById("profile-alert");
  const addressForm = document.getElementById("address-form");
  const addressAlert = document.getElementById("address-alert");
  const addressList = document.getElementById("address-list");

  let addresses = [];

  function say(box, message, type = "danger") {
    const div = document.createElement("div");
    div.className = `alert alert-${type}`;
    div.textContent = message; // textContent: nunca interpreta HTML
    box.replaceChildren(div);
  }

  // junta as mensagens por campo (422) ou usa a mensagem geral
  function errorText(err) {
    if (err.status === 501)
      return "Esta função ainda não está disponível no servidor.";
    const fields = Object.values(err.data?.errors || {}).flat();
    return err.status === 422 && fields.length ? fields.join(" ") : err.message;
  }

  /* ---------------- dados do usuário ---------------- */

  async function loadProfile() {
    try {
      const user = await api("/profile");
      profileForm.elements.name.value = user.name || "";
      profileForm.elements.email.value = user.email || "";
    } catch (err) {
      say(profileAlert, errorText(err));
    }
  }

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    profileAlert.replaceChildren();

    const name = profileForm.elements.name.value.trim();
    const email = profileForm.elements.email.value.trim();
    if (name.length < 3)
      return say(profileAlert, "O nome deve ter pelo menos 3 caracteres.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return say(profileAlert, "Informe um e-mail válido.");

    const btn = document.getElementById("profile-save");
    btn.disabled = true;
    try {
      const data = await api("/profile", {
        method: "PUT",
        body: { name, email },
      });
      const updated = data?.user ?? data ?? {};
      // mantém a sessão (e a navbar) coerente com os dados novos
      Auth.save(Auth.getToken(), {
        ...Auth.getUser(),
        name,
        email,
        ...updated,
      });
      say(profileAlert, "Dados atualizados.", "success");
    } catch (err) {
      say(
        profileAlert,
        err.status === 409 ? "Este e-mail já está em uso." : errorText(err),
      );
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------------- endereços ---------------- */

  function renderAddresses() {
    if (!addresses.length) {
      UI.empty(addressList, "Você ainda não tem endereços cadastrados.");
      return;
    }
    addressList.innerHTML = addresses
      .map(
        (a) => `
      <div class="d-flex justify-content-between align-items-start gap-3 border rounded-3 p-3 mb-2">
        <div class="small">${Fmt.address(a)}</div>
        <div class="d-flex gap-1 flex-shrink-0">
          <button type="button" class="btn btn-sm btn-outline-secondary" data-edit="${a.id}" aria-label="Editar endereço">
            <i class="bi bi-pencil"></i></button>
          <button type="button" class="btn btn-sm btn-outline-danger" data-delete="${a.id}" aria-label="Excluir endereço">
            <i class="bi bi-trash"></i></button>
        </div>
      </div>`,
      )
      .join("");
  }

  async function loadAddresses() {
    UI.loading(addressList);
    try {
      addresses = (await api("/addresses")) || [];
      renderAddresses();
    } catch (err) {
      addressList.replaceChildren();
      say(
        addressAlert,
        errorText(err),
        err.status === 501 ? "warning" : "danger",
      );
      document.getElementById("btn-new-address").disabled = true;
    }
  }

  const f = (n) => addressForm.elements[n];

  function openForm(address) {
    addressAlert.replaceChildren();
    document.getElementById("address-form-title").textContent = address
      ? "Editar endereço"
      : "Novo endereço";
    f("id").value = address?.id ?? "";
    [
      "zip_code",
      "street",
      "number",
      "complement",
      "neighborhood",
      "city",
      "state",
    ].forEach((n) => {
      f(n).value = address?.[n] ?? "";
    });
    addressForm.hidden = false;
    f("zip_code").focus();
  }

  function closeForm() {
    addressForm.hidden = true;
    addressForm.reset();
  }

  function validate(a) {
    if (!a.zip_code) return "Informe o CEP.";
    if (!a.street) return "Informe a rua.";
    if (!a.number) return "Informe o número.";
    if (!a.neighborhood) return "Informe o bairro.";
    if (!a.city) return "Informe a cidade.";
    if (!/^[A-Z]{2}$/.test(a.state))
      return "Informe o estado com 2 letras (ex.: PR).";
    return null;
  }

  document
    .getElementById("btn-new-address")
    .addEventListener("click", () => openForm(null));
  document
    .getElementById("address-cancel")
    .addEventListener("click", closeForm);

  addressList.addEventListener("click", async (e) => {
    const edit = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-delete]");
    if (edit) {
      openForm(addresses.find((a) => a.id === Number(edit.dataset.edit)));
    } else if (del) {
      if (!confirm("Excluir este endereço?")) return;
      addressAlert.replaceChildren();
      try {
        await api(`/addresses/${del.dataset.delete}`, { method: "DELETE" });
        await loadAddresses();
        say(addressAlert, "Endereço excluído.", "success");
      } catch (err) {
        say(addressAlert, errorText(err));
      }
    }
  });

  addressForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    addressAlert.replaceChildren();

    const data = {
      zip_code: f("zip_code").value.trim(),
      street: f("street").value.trim(),
      number: f("number").value.trim(),
      complement: f("complement").value.trim() || null,
      neighborhood: f("neighborhood").value.trim(),
      city: f("city").value.trim(),
      state: f("state").value.trim().toUpperCase(),
    };
    const problem = validate(data);
    if (problem) return say(addressAlert, problem);

    const id = f("id").value;
    const btn = document.getElementById("address-save");
    btn.disabled = true;
    try {
      await api(id ? `/addresses/${id}` : "/addresses", {
        method: id ? "PUT" : "POST",
        body: data,
      });
      closeForm();
      await loadAddresses();
      say(
        addressAlert,
        id ? "Endereço atualizado." : "Endereço cadastrado.",
        "success",
      );
    } catch (err) {
      say(addressAlert, errorText(err));
    } finally {
      btn.disabled = false;
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadAddresses();
  });
})();
