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
        const orders = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
        const totalOrders = document.getElementById("totalOrders");
        const orderCard = totalOrders?.closest(".card");
        if (totalOrders) totalOrders.textContent = orders.length;
        orderCard?.querySelector("small")?.replaceChildren("Todos os pedidos");

        const salesOrders = orders.filter((order) =>
            ["paid", "shipped", "delivered"].includes(order.status)
        );
        const totalSalesAmount = salesOrders.reduce(
            (sum, order) => sum + (Number(order.total) || 0),
            0
        );

        const totalSales = document.getElementById("totalSales");
        const salesCard = totalSales?.closest(".card");
        const money = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
        if (totalSales) totalSales.textContent = money.format(totalSalesAmount);
        salesCard?.querySelector("small")?.replaceChildren("");
    } catch (error) {
        console.error("Erro ao carregar pedidos do dashboard:", error);
        const totalSales = document.getElementById("totalSales");
        const salesCard = totalSales?.closest(".card");
        if (totalSales) totalSales.textContent = "—";
        salesCard?.querySelector("small")?.replaceChildren("Erro ao consultar API");
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
