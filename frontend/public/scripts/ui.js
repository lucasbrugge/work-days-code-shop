const UI = {
  loading(el) {
    el.innerHTML = `<div class="text-center py-5">
      <div class="spinner-border text-secondary" role="status"></div>
      <div class="text-muted-2 mt-2">Carregando...</div></div>`;
  },
  empty(el, msg = "Nenhum resultado encontrado.") {
    el.innerHTML = `<div class="text-center text-muted-2 py-5">
      <i class="bi bi-inbox fs-1"></i><p class="mt-2">${msg}</p></div>`;
  },
  error(el, err) {
    const msgs = {
      403: "Você não tem permissão para acessar isto.",
      404: "Não encontramos o que você procurou.",
      409: "Essa ação não é possível no estado atual.",
    };
    const text = msgs[err.status] || err.message || "Algo deu errado. Tente novamente.";
    el.innerHTML = `<div class="alert alert-danger">${text}</div>`;
  },
  // erros 422: mostra a mensagem embaixo de cada campo do formulário
  fieldErrors(form, err) {
    form.querySelectorAll(".invalid-feedback").forEach((e) => e.remove());
    form.querySelectorAll(".is-invalid").forEach((e) => e.classList.remove("is-invalid"));
    Object.entries(err.data?.errors || {}).forEach(([field, msgs]) => {
      const input = form.querySelector(`[name="${field}"]`);
      if (!input) return;
      input.classList.add("is-invalid");
      input.insertAdjacentHTML("afterend", `<div class="invalid-feedback">${msgs[0]}</div>`);
    });
  },
};