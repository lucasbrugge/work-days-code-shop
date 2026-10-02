const form = document.getElementById("login-form");
const alertBox = document.getElementById("alert");
const submit = document.getElementById("submit");

if (Auth.isLoggedIn()) {
  window.location.href = "../index.html";
}

const params = new URLSearchParams(
  window.location.search
);

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

if (
  params.get("cadastro") === "sucesso"
) {
  showSuccess(
    "Conta criada com sucesso. Faça login para continuar."
  );
}

form.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    alertBox.replaceChildren();


    const email =
      form.email.value.trim();

    const password =
      form.password.value;

    if (!email || !password) {
      return showError(
        "Informe e-mail e senha."
      );
    }

    submit.disabled = true;

    submit.textContent =
      "Entrando...";


    try {

      const body = {
        email,
        password
      };

      if (CartToken.get()) {
        body.guest_token =
          CartToken.get();
      }

      const response = await api(
        "/auth/login",
        {
          method: "POST",
          body
        }
      );

      const data =
        response.data ?? response;

      Auth.save(
        data.token,
        data.user
      );

      const next =
        new URLSearchParams(
          window.location.search
        ).get("next");


      if (next) {

        window.location.href =
          next;

        return;
      }


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

      if (err.status === 401) {

        showError(
          "E-mail ou senha inválidos."
        );

        return;
      }

      showError(
        err.message ||
        "Não foi possível realizar o login."
      );


    } finally {

      submit.disabled = false;

      submit.textContent =
        "Entrar";

    }

  }
);