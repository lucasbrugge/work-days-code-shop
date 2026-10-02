const userModal = document.getElementById("userModal");
const newUserButton = document.getElementById("newUserButton");
const userForm = document.getElementById("userForm");
const usersTable = document.getElementById("usersTable");
const recentUsers = document.getElementById("recentUsers");
const totalUsers = document.getElementById("totalUsers");

function renderUser(user, tableBody) {
    const row = document.createElement("tr");
    const status = user.status || "Ativo";
    const statusClass = status === "Ativo" ? "active" : "inactive";

    row.innerHTML = `
        <td>${escapeHtml(user.name || user.nome || "")}</td>
        <td>${escapeHtml(user.email || "")}</td>
        <td>${escapeHtml(user.profile || user.perfil || "Usuário")}</td>
        <td><span class="status ${statusClass}">${escapeHtml(status)}</span></td>
    `;

    tableBody.appendChild(row);
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

if (newUserButton) {
    newUserButton.addEventListener("click", function () {
        userModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    });
}

if (userForm) {
    userForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const submitButton = userForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="button-loading"><span class="spinner"></span>Salvando...</span>';

        try {
            const userData = {
                name: document.getElementById("userName").value.trim(),
                email: document.getElementById("userEmail").value.trim(),
                password: document.getElementById("userPassword").value,
                profile: document.getElementById("userProfile").value,
                status: document.getElementById("userStatus").value
            };

            const data = await criarUsuario(userData);

            /* A API pode retornar o usuário criado ou simplesmente os dados enviados. */
            const savedUser = data?.user || data?.usuario || data || userData;

            renderUser(savedUser, usersTable);
            renderUser(savedUser, recentUsers);

            totalUsers.textContent = Number(totalUsers.textContent || 0) + 1;

            userForm.reset();
            userModal.classList.add("hidden");
            document.body.style.overflow = "";
        } catch (error) {
            console.error(error);
            alert(error.message || "Não foi possível cadastrar o usuário.");
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}
