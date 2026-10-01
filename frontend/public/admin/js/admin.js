const sidebar = document.getElementById("sidebar");
const toggleMenu = document.getElementById("toggleMenu");
const headerTitle = document.getElementById("headerTitle");
const menuItems = document.querySelectorAll(".menu-item");
const pages = document.querySelectorAll(".page");

menuItems.forEach(function (item) {
    item.addEventListener("click", function (event) {
        const pageName = item.getAttribute("data-page");
        if (!pageName) return;
        event.preventDefault();
        menuItems.forEach(menu => menu.classList.remove("active"));
        item.classList.add("active");
        pages.forEach(page => page.classList.remove("active"));
        const selectedPage = document.getElementById("page-" + pageName);
        if (selectedPage) selectedPage.classList.add("active");
        const menuText = item.querySelector(".menu-text");
        if (menuText) headerTitle.textContent = menuText.textContent;
        if (window.innerWidth <= 700) sidebar.classList.remove("mobile-open");
    });
});
toggleMenu.addEventListener("click", function () {
    if (window.innerWidth <= 700) sidebar.classList.toggle("mobile-open");
    else sidebar.classList.toggle("collapsed");
});
