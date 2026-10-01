const newUserButton = document.getElementById("newUserButton");
const usersTableBody = document.getElementById("usersTableBody");

if (newUserButton && usersTableBody) {
    newUserButton.addEventListener("click", function () {
        const name = prompt("Nome do novo usuário:");
        if (!name || !name.trim()) return;
        const email = prompt("E-mail do novo usuário:");
        if (!email || !email.trim()) return;

        const row = document.createElement("tr");
        [ "#NEW", name.trim(), email.trim(), "Usuário" ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        const statusCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "status active";
        badge.textContent = "Ativo";
        statusCell.appendChild(badge);
        row.appendChild(statusCell);
        usersTableBody.appendChild(row);
    });
}
