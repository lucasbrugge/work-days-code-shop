const menuItems =
    document.querySelectorAll(
        ".menu-item"
    );

const pages =
    document.querySelectorAll(
        ".page-section"
    );


/*
|--------------------------------------------------------------------------
| Proteção do painel
|--------------------------------------------------------------------------
*/

if (
    !Auth.isLoggedIn() ||
    !Auth.isAdmin()
) {

    window.location.href =
        "../pages/admin-login.html";
}


/*
|--------------------------------------------------------------------------
| Navegação
|--------------------------------------------------------------------------
*/

menuItems.forEach(item => {

    item.addEventListener(
        "click",
        event => {

            event.preventDefault();


            const pageName =
                item.dataset.page;


            menuItems.forEach(
                menu =>
                    menu.classList.remove(
                        "active"
                    )
            );


            item.classList.add(
                "active"
            );


            pages.forEach(
                page =>
                    page.classList.add(
                        "hidden"
                    )
            );


            const selectedPage =
                document.getElementById(
                    pageName
                );


            if (selectedPage) {

                selectedPage.classList.remove(
                    "hidden"
                );
            }

        }
    );

});


/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


logoutButton.addEventListener(
    "click",
    async () => {

        const token =
            Auth.getToken();


        try {

            if (token) {

                await api(
                    "/auth/logout",
                    {
                        method: "POST"
                    }
                );
            }

        } catch (error) {

            console.error(
                "Erro ao realizar logout:",
                error
            );

        } finally {

            Auth.clear();

            sessionStorage.removeItem(
                "loggedIn"
            );

            sessionStorage.removeItem(
                "token"
            );


            window.location.href =
                "../pages/admin-login.html";
        }

    }
);