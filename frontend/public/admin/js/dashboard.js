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
}


loadDashboard();