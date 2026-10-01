const loginForm = document.getElementById("loginForm");
const loginPage = document.getElementById("loginPage");
const adminPage = document.getElementById("adminPage");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // LOGIN DEMO
    if (username === "admin" && password === "123456") {

        sessionStorage.setItem("loggedIn", "true");

        loginPage.classList.add("hidden");
        adminPage.classList.remove("hidden");

    } else {

        loginError.textContent =
            "Usuário ou senha inválidos.";

    }

});