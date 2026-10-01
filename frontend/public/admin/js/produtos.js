productForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const submitButton = productForm.querySelector(
        'button[type="submit"]'
    );

    const originalText = submitButton.innerHTML;

    // Ativa loading
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <span class="button-loading">
            <span class="spinner"></span>
            Salvando...
        </span>
    `;

    try {

        const name =
            document.getElementById("productName").value;

        const code =
            document.getElementById("productCode").value;

        const category =
            document.getElementById("productCategory").value;

        const price =
            Number(
                document.getElementById("productPrice").value
            );

        const stock =
            Number(
                document.getElementById("productStock").value
            );

        const status =
            document.getElementById("productStatus").value;

        const description =
            document.getElementById("productDescription").value;


        // ==========================================
        // SEU FETCH
        // ==========================================

        const response = await fetch("/api/produtos", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                code,
                category,
                price,
                stock,
                status,
                description
            })
        });


        if (!response.ok) {
            throw new Error("Erro ao cadastrar produto.");
        }


        const data = await response.json();


        // ==========================================
        // SUCESSO
        // ==========================================

        const statusClass =
            status === "Ativo"
                ? "active"
                : "inactive";


        const formattedPrice =
            price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });


        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${name}</td>
            <td>${code}</td>
            <td>${category}</td>
            <td>${formattedPrice}</td>
            <td>${stock}</td>
            <td>
                <span class="status ${statusClass}">
                    ${status}
                </span>
            </td>
        `;


        productsTable.appendChild(row);


        const currentTotal =
            Number(totalProducts.textContent);

        totalProducts.textContent =
            currentTotal + 1;


        productForm.reset();

        productModal.classList.add("hidden");

        document.body.style.overflow = "";


        console.log("Produto cadastrado:", data);


    } catch (error) {

        console.error(error);

        alert(
            "Não foi possível cadastrar o produto."
        );


    } finally {

        // Sempre executa, sucesso ou erro
        submitButton.disabled = false;

        submitButton.innerHTML =
            originalText;

    }

});