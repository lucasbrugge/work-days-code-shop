const LOGIN_USER = "admin";
const LOGIN_PASSWORD = "123456";
const loginPage = document.getElementById("loginPage");
const adminPage = document.getElementById("adminPage");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loggedUser = document.getElementById("loggedUser");
const logoutButton = document.getElementById("logoutButton");

function showLogin() {
    loginPage.style.display = "flex";
    adminPage.style.display = "none";
}
function showAdmin() {
    loginPage.style.display = "none";
    adminPage.style.display = "block";
    loggedUser.textContent = sessionStorage.getItem("adminUser") || "Administrador";
}
loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    if (username === LOGIN_USER && password === LOGIN_PASSWORD) {
        sessionStorage.setItem("adminLogged", "true");
        sessionStorage.setItem("adminUser", username);
        loginError.style.display = "none";
        loginForm.reset();
        showAdmin();
    } else {
        loginError.style.display = "block";
    }
});
logoutButton.addEventListener("click", function () {
    sessionStorage.removeItem("adminLogged");
    sessionStorage.removeItem("adminUser");
    showLogin();
});
if (sessionStorage.getItem("adminLogged") === "true") showAdmin();
else showLogin();
