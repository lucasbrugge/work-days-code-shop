const form =
  document.getElementById("register-form");

if (Auth.isLoggedIn()) window.location.href = CONFIG.SITE_ROOT + "index.html";

function showError(msg) {
  alertBox.classList.remove(
    "d-none"
  );

  alertBox.classList.remove(
    "alert-success"
  );

  alertBox.classList.add(
    "alert-danger"
  );

  alertBox.textContent = msg;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertBox.replaceChildren();

  const name = form.elements.name.value.trim(); // form.name colide com a propriedade nativa do <form>
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;
  const confirmation = form.elements.password_confirmation.value;

  // validações que o front consegue fazer sozinho
  if (!name || !email || !password) return showError("Preencha todos os campos.");
  if (password.length < 8) return showError("A senha deve ter pelo menos 8 caracteres.");
  if (password !== confirmation) return showError("As senhas não conferem.");

  submit.disabled = true;
  submit.textContent = "Criando...";
  try {
    // 1) cria a conta (o back responde só com o usuário, sem token)
    await api("/auth/register", { method: "POST", body: { name, email, password, password_confirmation: confirmation } });

    // 2) entra automaticamente, enviando o carrinho de visitante
    const body = { email, password };
    if (CartToken.get()) body.guest_token = CartToken.get();
    const data = await api("/auth/login", { method: "POST", body });
    Auth.save(data.token, data.user);

    window.location.href = CONFIG.SITE_ROOT + "index.html";
  } catch (err) {
    const fields = Object.values(err.data?.errors || {}).flat();
    if (err.status === 409) showError("Este e-mail já está cadastrado.");
    else if (err.status === 422 && fields.length) showError(fields.join(" "));
    else showError(err.message);
  } finally {
    submit.disabled = false;
    submit.textContent = "Criar conta";
  }
);