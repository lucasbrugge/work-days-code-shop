const form = document.getElementById("login-form");
const alertBox = document.getElementById("alert");
const submit = document.getElementById("submit");

// Quem já está logado não precisa ver esta página
if (Auth.isLoggedIn()) window.location.href = "index.html";

function showError(msg) {
  const div = document.createElement("div");
  div.className = "alert alert-danger";
  div.textContent = msg; // textContent: nunca interpreta HTML vindo do servidor
  alertBox.replaceChildren(div);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertBox.replaceChildren();

  const email = form.email.value.trim();
  const password = form.password.value;
  if (!email || !password) return showError("Informe e-mail e senha.");

  submit.disabled = true;
  submit.textContent = "Entrando...";
  try {
    const body = { email, password };
    // FRONT-09: envia o carrinho de visitante para o back fazer a fusão
    if (CartToken.get()) body.guest_token = CartToken.get();

    const data = await api("/auth/login", { method: "POST", body });
    Auth.save(data.token, data.user);

    const next = new URLSearchParams(location.search).get("next");
    window.location.href =
      next || (data.user.role === "admin" ? "public/admin/index.html" : "index.html");
  } catch (err) {
    showError(err.status === 401 ? "E-mail ou senha inválidos." : err.message);
  } finally {
    submit.disabled = false;
    submit.textContent = "Entrar";
  }
});