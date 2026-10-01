document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("login-form");

  const alert = document.getElementById("login-alert");

  const button = document.getElementById("login-button");

  const params = new URLSearchParams(window.location.search);
    if (
    params.get("cadastro") === "sucesso"
    ) {

    alert.textContent =
        "Conta criada com sucesso. Faça login para continuar.";

    alert.classList.remove(
        "d-none"
    );

    alert.classList.remove(
        "alert-danger"
    );

    alert.classList.add(
        "alert-success"
    );

    }


  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    alert.classList.add("d-none");

    alert.classList.remove("alert-success");

    alert.classList.add("alert-danger");

    const email = form.email.value.trim();

    const password = form.password.value;


    button.disabled = true;
    button.textContent = "Entrando...";

    try {

      const response = await api(
        "/auth/login",
        {
          method: "POST",

          body: {
            email,
            password
          }
        }
      );


      const token = response.data.token;

      const user = response.data.user;


      Auth.set(
        token,
        user
      );


      window.location.href = "index.html";

    } catch (error) {

      if (
        error instanceof ApiError &&
        error.status === 422
      ) {

        UI.fieldErrors(
          form,
          error
        );

      }


      alert.textContent =
        error.message ||
        "Não foi possível realizar o login.";

      alert.classList.remove("d-none");

    } finally {

      button.disabled = false;
      button.textContent = "Entrar";

    }

  });

});