const loginForm = document.getElementById("loginForm");
const loginPage = document.getElementById("loginPage");
const adminPage = document.getElementById("adminPage");
const loginError = document.getElementById("loginError");
const loginButton = document.getElementById("loginButton");

function mostrarPainel() {
    loginPage.classList.add("hidden");
    adminPage.classList.remove("hidden");
}

if (sessionStorage.getItem("loggedIn") === "true") {
    mostrarPainel();
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const originalText = loginButton.innerHTML;

    loginError.textContent = "";
    loginButton.disabled = true;
    loginButton.innerHTML = '<span class="button-loading"><span class="spinner"></span>Entrando...</span>';

    try {
        const data = await loginApi(username, password);

        sessionStorage.setItem("loggedIn", "true");

        if (data?.token) {
            sessionStorage.setItem("token", data.token);
        }

        mostrarPainel();
    } catch (error) {
        /*
         * Para testar a interface sem backend, você pode temporariamente
         * substituir o await loginApi(...) por uma Promise.
         */
        console.error(error);
        loginError.textContent = error.message || "Usuário ou senha inválidos.";
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = originalText;
    }
});
