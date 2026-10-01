document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const alert = document.getElementById("login-alert");
  const button = document.getElementById("login-button");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (alert) alert.classList.add("d-none");

    const email = form.email.value.trim();
    const password = form.password.value;

    if (button) {
      button.disabled = true;
      button.textContent = "Entrando...";
    }

    try {
      const response = await api("/auth/login", {
        method: "POST",
        body: { email, password }
      });

      const token = response?.data?.token;
      const user = response?.data?.user;

      if (token) {
        Auth.set(token, user);
        // Redireciona para o painel se for admin, ou para a loja
        if (user?.role === "admin") {
          window.location.href = "admin/index.html";
        } else {
          window.location.href = "index.html";
        }
      } else {
        throw new Error("Resposta inválida do servidor.");
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        UI.fieldErrors(form, error);
      }
      if (alert) {
        alert.textContent = error.message || "Não foi possível realizar o login.";
        alert.classList.remove("d-none");
      }
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Entrar";
      }
    }
  });
});
