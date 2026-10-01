const newProductButton = document.getElementById("newProductButton");
const productsTableBody = document.getElementById("productsTableBody");

if (newProductButton && productsTableBody) {
    newProductButton.addEventListener("click", function () {
        const name = prompt("Nome do produto:");
        if (!name || !name.trim()) return;
        const category = prompt("Categoria do produto:", "Geral");
        if (category === null) return;
        const priceInput = prompt("Preço (ex.: 49,90):", "0,00");
        if (priceInput === null) return;
        const stockInput = prompt("Quantidade em estoque:", "0");
        if (stockInput === null) return;

        const price = Number(priceInput.trim().replace(",", "."));
        const stock = Number(stockInput);
        if (!Number.isFinite(price) || price < 0) {
            alert("Informe um preço válido.");
            return;
        }
        if (!Number.isInteger(stock) || stock < 0) {
            alert("Informe uma quantidade de estoque válida.");
            return;
        }

        const row = document.createElement("tr");
        const code = "PROD-" + String(productsTableBody.rows.length + 1).padStart(3, "0");
        [code, name.trim(), category.trim() || "Geral",
         "R$ " + price.toFixed(2).replace(".", ","), String(stock)].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        const statusCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = stock > 0 ? "status active" : "status inactive";
        badge.textContent = stock > 0 ? "Ativo" : "Sem estoque";
        statusCell.appendChild(badge);
        row.appendChild(statusCell);
        productsTableBody.appendChild(row);
    });
}
