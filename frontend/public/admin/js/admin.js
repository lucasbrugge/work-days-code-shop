const menuItems = document.querySelectorAll(".menu-item");
const pages = document.querySelectorAll(".page-section");

menuItems.forEach(function (item) {
    item.addEventListener("click", function (event) {
        event.preventDefault();

        const pageName = item.dataset.page;

        menuItems.forEach(menu => menu.classList.remove("active"));
        item.classList.add("active");

        pages.forEach(page => page.classList.add("hidden"));

        const selectedPage = document.getElementById(pageName);
        if (selectedPage) selectedPage.classList.remove("hidden");
    });
});

const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", function () {
    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("token");
    location.reload();
});

document.querySelectorAll("[data-close-modal]").forEach(function (button) {
    button.addEventListener("click", function () {
        const modal = button.closest(".modal-overlay");
        if (modal) modal.classList.add("hidden");
        document.body.style.overflow = "";
    });
});

document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
    overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
            overlay.classList.add("hidden");
            document.body.style.overflow = "";
        }
    });
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal-overlay").forEach(modal => modal.classList.add("hidden"));
        document.body.style.overflow = "";
    }
});
