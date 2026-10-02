/* Login do administrador (autentica na API de verdade).
 *
 * Ponte com o painel do colega, SEM alterar os arquivos dele:
 * o painel (admin/js/login.js e api.js) considera a sessão aberta quando
 * encontra sessionStorage.loggedIn === "true" e usa sessionStorage.token como
 * Bearer nas chamadas a /api/admin/*. Depois de o servidor confirmar que a conta
 * é admin, gravamos essas duas chaves e abrimos o painel.
 */
const form = document.getElementById("admin-login-form");
const alertBox = document.getElementById("alert");
const submit = document.getElementById("submit");

function openPanel(token) {
  // chaves que o painel (admin/js/login.js e api.js) lê do sessionStorage
  sessionStorage.setItem("loggedIn", "true");
  sessionStorage.setItem("token", token);
  window.location.href = CONFIG.ADMIN_URL;
}

function showError(msg) {
  const div = document.createElement("div");
  div.className = "alert alert-danger";
  div.textContent = msg;
  alertBox.replaceChildren(div);
}

// já está logado como admin: vai direto para o painel
if (Auth.isLoggedIn() && Auth.isAdmin()) openPanel(Auth.getToken());

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertBox.replaceChildren();

  const email = form.email.value.trim();
  const password = form.password.value;
  if (!email || !password) return showError("Informe e-mail e senha.");

  submit.disabled = true;
  submit.textContent = "Entrando...";
  try {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    Auth.save(data.token, data.user);

    if (data.user.role !== "admin") {
      // conta de cliente: desfaz o login que acabou de ser criado
      try { await api("/auth/logout", { method: "POST" }); } catch (e) { /* ignora */ }
      Auth.clear();
      return showError("Esta conta não tem acesso administrativo.");
    }

    openPanel(data.token);
  } catch (err) {
    showError(err.status === 401 ? "E-mail ou senha inválidos." : err.message);
  } finally {
    submit.disabled = false;
    submit.textContent = "Entrar no painel";
  }
});