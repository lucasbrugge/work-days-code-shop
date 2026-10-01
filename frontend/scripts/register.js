document.addEventListener(
  "DOMContentLoaded",
  () => {

    const form =
      document.getElementById(
        "register-form"
      );

    const alert =
      document.getElementById(
        "register-alert"
      );

    const button =
      document.getElementById(
        "register-button"
      );

    if (Auth.isLoggedIn()) {

      window.location.href =
        "index.html";

      return;
    }

    form.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();


        alert.classList.add(
          "d-none"
        );


        const name =
          form.name.value.trim();

        const email =
          form.email.value.trim();

        const password =
          form.password.value;

        const passwordConfirmation =
          form.password_confirmation.value;

        if (
          password !==
          passwordConfirmation
        ) {

          alert.textContent =
            "As senhas não coincidem.";

          alert.classList.remove(
            "d-none"
          );

          return;
        }

        button.disabled = true;

        button.textContent =
          "Criando conta...";


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
                  passwordConfirmation
              }
            }
          );

          window.location.href =
            "login.html?cadastro=sucesso";


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
            "Não foi possível criar a conta.";

          alert.classList.remove(
            "d-none"
          );


        } finally {

          button.disabled = false;

          button.textContent =
            "Criar conta";

        }

      }
    );

  }
);