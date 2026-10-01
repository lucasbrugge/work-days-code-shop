const form = document.getElementById("register-form");
const alertBox = document.getElementById("alert");
const submit = document.getElementById("submit");

if (Auth.isLoggedIn()) window.location.href = "index.html";

function showError(msg) {
  const div = document.createElement("div");
  div.className = "alert alert-danger";
  div.textContent = msg;
  alertBox.replaceChildren(div);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertBox.replaceChildren();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmation = form.password_confirmation.value;

  // validações que o front consegue fazer sozinho
  if (!name || !email || !password) return showError("Preencha todos os campos.");
  if (password.length < 6) return showError("A senha deve ter pelo menos 6 caracteres.");
  if (password !== confirmation) return showError("As senhas não conferem.");

  submit.disabled = true;
  submit.textContent = "Criando...";
  try {
    // 1) cria a conta (o back responde só com o usuário, sem token)
    await api("/auth/register", { method: "POST", body: { name, email, password } });

    // 2) entra automaticamente, enviando o carrinho de visitante
    const body = { email, password };
    if (CartToken.get()) body.guest_token = CartToken.get();
    const data = await api("/auth/login", { method: "POST", body });
    Auth.save(data.token, data.user);

    window.location.href = "index.html";
  } catch (err) {
    showError(err.status === 409 ? "Este e-mail já está cadastrado." : err.message);
  } finally {
    submit.disabled = false;
    submit.textContent = "Criar conta";
  }
});