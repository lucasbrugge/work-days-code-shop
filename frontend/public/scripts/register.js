const form =
  document.getElementById("register-form");

const alertBox =
  document.getElementById("register-alert");

const submit =
  document.getElementById("register-button");


if (Auth.isLoggedIn()) {
  window.location.href = "../index.html";
}

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

form.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    alertBox.classList.add(
      "d-none"
    );

    const name =
      form.name.value.trim();

    const email =
      form.email.value.trim();

    const password =
      form.password.value;

    const confirmation =
      form.password_confirmation.value;

    if (
      !name ||
      !email ||
      !password ||
      !confirmation
    ) {
      return showError(
        "Preencha todos os campos."
      );
    }


    if (password.length < 8) {
      return showError(
        "A senha deve ter pelo menos 8 caracteres."
      );
    }


    if (password !== confirmation) {
      return showError(
        "As senhas não coincidem."
      );
    }

    submit.disabled = true;
    submit.textContent = "Criando conta...";


    try {

      await api(
        "/auth/register",
        {
          method: "POST",

          body: {
            name,
            email,
            password,

            password_confirmation:
              confirmation
          }
        }
      );

      const loginBody = {
        email,
        password
      };


      if (CartToken.get()) {
        loginBody.guest_token =
          CartToken.get();
      }


      const response = await api(
        "/auth/login",
        {
          method: "POST",
          body: loginBody
        }
      );

      const data =
        response.data ?? response;

      Auth.save(
        data.token,
        data.user
      );

      if (
        data.user.role === "admin"
      ) {

        window.location.href =
          "../admin/index.html";

        return;
      }


      window.location.href =
        "../index.html";


    } catch (err) {

      if (
        err instanceof ApiError &&
        err.status === 422 &&
        typeof UI !== "undefined"
      ) {

        UI.fieldErrors(
          form,
          err
        );

      }

      if (err.status === 409) {

        showError(
          "Este e-mail já está cadastrado."
        );

        return;
      }

      showError(
        err.message ||
        "Não foi possível criar a conta."
      );


    } finally {

      submit.disabled = false;

      submit.textContent =
        "Criar conta";

    }

  }
);