const productModal = document.getElementById("productModal");
const newProductButton = document.getElementById("newProductButton");
const productForm = document.getElementById("productForm");
const productsTable = document.getElementById("productsTable");
const totalProducts = document.getElementById("totalProducts");

function renderProduct(product) {
    const row = document.createElement("tr");

    const status = product.status || "Ativo";
    const statusClass = status === "Ativo" ? "active" : "inactive";
    const price = Number(product.price || 0);

    row.innerHTML = `
        <td>${escapeHtml(product.name || product.nome || "")}</td>
        <td>${escapeHtml(product.code || product.codigo || "")}</td>
        <td>${escapeHtml(product.category || product.categoria || "")}</td>
        <td>${price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
        <td>${escapeHtml(product.stock ?? product.estoque ?? 0)}</td>
        <td><span class="status ${statusClass}">${escapeHtml(status)}</span></td>
    `;

    productsTable.appendChild(row);
}

if (newProductButton) {
    newProductButton.addEventListener("click", function () {
        productModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    });
}

if (productForm) {
    productForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const submitButton = productForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="button-loading"><span class="spinner"></span>Salvando...</span>';

        try {
            const productData = {
                name: document.getElementById("productName").value.trim(),
                code: document.getElementById("productCode").value.trim(),
                category: document.getElementById("productCategory").value.trim(),
                price: Number(document.getElementById("productPrice").value),
                stock: Number(document.getElementById("productStock").value),
                status: document.getElementById("productStatus").value,
                description: document.getElementById("productDescription").value.trim()
            };

            const data = await criarProduto(productData);
            const savedProduct = data?.product || data?.produto || data || productData;

            renderProduct(savedProduct);
            totalProducts.textContent = Number(totalProducts.textContent || 0) + 1;

            productForm.reset();
            productModal.classList.add("hidden");
            document.body.style.overflow = "";
        } catch (error) {
            console.error(error);
            alert(error.message || "Não foi possível cadastrar o produto.");
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}
