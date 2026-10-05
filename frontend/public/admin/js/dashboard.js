const totalProducts =
    document.getElementById(
        "totalProducts"
    );


async function loadDashboard() {

    try {

        const result =
            await getProdutos();


        const total =
            result.meta?.total ??
            result.items.length;


        totalProducts.textContent =
            total;


        const productCard =
            totalProducts.closest(
                ".card"
            );


        if (productCard) {

            const description =
                productCard.querySelector(
                    "small"
                );

            if (description) {

                description.textContent =
                    "Dados da API";
            }
        }


    } catch (error) {

        console.error(
            "Erro ao carregar dashboard:",
            error
        );


        totalProducts.textContent =
            "—";


        const productCard =
            totalProducts.closest(
                ".card"
            );


        if (productCard) {

            const description =
                productCard.querySelector(
                    "small"
                );

            if (description) {

                description.textContent =
                    "Erro ao consultar API";
            }
        }
    }

    try {
        const result = await getAdminOrders();
        const totalOrders = document.getElementById("totalOrders");
        const orderCard = totalOrders?.closest(".card");
        if (totalOrders) totalOrders.textContent = result.data?.length ?? 0;
        orderCard?.querySelector("small")?.replaceChildren("Todos os pedidos");
    } catch (error) {
        console.error("Erro ao carregar pedidos do dashboard:", error);
    }

    try {
        const result = await getUsuarios();
        const users = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
        const totalUsers = document.getElementById("totalUsers");
        const userCard = totalUsers?.closest(".card");
        if (totalUsers) totalUsers.textContent = users.length;
        userCard?.querySelector("small")?.replaceChildren("Dados da API");
    } catch (error) {
        console.error("Erro ao carregar usuários do dashboard:", error);
    }
}


loadDashboard();
