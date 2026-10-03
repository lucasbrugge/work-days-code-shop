const form = document.getElementById("login-form");
const alertBox = document.getElementById("alert");
const submit = document.getElementById("submit");

// Quem já está logado não precisa ver esta página
if (Auth.isLoggedIn()) window.location.href = CONFIG.SITE_ROOT + "index.html";

function showError(msg) {
  const div = document.createElement("div");

  div.className =
    "alert alert-danger";

  div.textContent = msg;

  alertBox.replaceChildren(div);
}


function showSuccess(msg) {
  const div = document.createElement("div");

  div.className =
    "alert alert-success";

  div.textContent = msg;

  alertBox.replaceChildren(div);
}

// ?next=... só é aceito se apontar para dentro do próprio site
// (evita redirecionar o usuário para um site externo)
function safeNext() {
  const next = new URLSearchParams(location.search).get("next");
  if (!next) return null;
  try {
    const url = new URL(next, CONFIG.SITE_ROOT);
    return url.href.startsWith(CONFIG.SITE_ROOT) ? url.href : null;
  } catch {
    return null;
  }
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
    CartToken.clear();

    if (
      data.cart_merge_warnings?.length
    ) {

      showWarning(
        data.cart_merge_warnings
      );

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            2000
          )
      );
    }

    window.location.href = safeNext() || CONFIG.SITE_ROOT + "index.html";
  } catch (err) {
    showError(err.status === 401 ? "E-mail ou senha inválidos." : err.message);
  } finally {
    submit.disabled = false;
    submit.textContent = "Entrar";
  }
});