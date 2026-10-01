/* =====================================================
     CONFIGURAÇÃO DE LOGIN
  ===================================================== */

const LOGIN_USER = "admin";
const LOGIN_PASSWORD = "123456";


/* =====================================================
   ELEMENTOS
===================================================== */

const loginPage = document.getElementById("loginPage");
const adminPage = document.getElementById("adminPage");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const logoutButton = document.getElementById("logoutButton");

const sidebar = document.getElementById("sidebar");
const toggleMenu = document.getElementById("toggleMenu");

const headerTitle = document.getElementById("headerTitle");

const loggedUser = document.getElementById("loggedUser");

const menuItems = document.querySelectorAll(".menu-item");
const pages = document.querySelectorAll(".page");


/* =====================================================
   VERIFICAR SESSÃO
===================================================== */

function checkSession() {

    const logged = sessionStorage.getItem("adminLogged");

    if (logged === "true") {

        showAdmin();

    } else {

        showLogin();

    }

}


/* =====================================================
   MOSTRAR LOGIN
===================================================== */

function showLogin() {

    loginPage.style.display = "flex";
    adminPage.style.display = "none";

}


/* =====================================================
   MOSTRAR ADMIN
===================================================== */

function showAdmin() {

    loginPage.style.display = "none";
    adminPage.style.display = "block";

    loggedUser.textContent =
        sessionStorage.getItem("adminUser") || "Administrador";

}


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    if (
        username === LOGIN_USER &&
        password === LOGIN_PASSWORD
    ) {

        sessionStorage.setItem(
            "adminLogged",
            "true"
        );

        sessionStorage.setItem(
            "adminUser",
            username
        );

        loginError.style.display = "none";

        showAdmin();

    } else {

        loginError.style.display = "block";

    }

});


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener("click", function () {

    sessionStorage.removeItem("adminLogged");
    sessionStorage.removeItem("adminUser");

    showLogin();

});


/* =====================================================
   MENU
===================================================== */

menuItems.forEach(function (item) {

    item.addEventListener("click", function (event) {

        event.preventDefault();

        const pageName =
            item.getAttribute("data-page");

        /* Remove ativo de todos */

        menuItems.forEach(function (menu) {

            menu.classList.remove("active");

        });

        /* Ativa item selecionado */

        item.classList.add("active");

        /* Esconde todas as páginas */

        pages.forEach(function (page) {

            page.classList.remove("active");

        });

        /* Mostra página */

        const selectedPage =
            document.getElementById(
                "page-" + pageName
            );

        if (selectedPage) {

            selectedPage.classList.add("active");

        }

        /* Atualiza título */

        const menuText =
            item.querySelector(".menu-text");

        if (menuText) {

            headerTitle.textContent =
                menuText.textContent;

        }

        /* Fecha menu no celular */

        if (window.innerWidth <= 700) {

            sidebar.classList.remove(
                "mobile-open"
            );

        }

    });

});


/* =====================================================
   MENU LATERAL
===================================================== */

toggleMenu.addEventListener("click", function () {

    if (window.innerWidth <= 700) {

        sidebar.classList.toggle(
            "mobile-open"
        );

    } else {

        sidebar.classList.toggle(
            "collapsed"
        );

    }

});


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

checkSession();