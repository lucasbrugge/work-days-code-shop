(function () {
    const table = document.getElementById("usersTable");
    const tableContainer = document.getElementById("usersTableContainer");
    const loading = document.getElementById("usersLoading");
    const empty = document.getElementById("usersEmpty");
    const message = document.getElementById("userMessage");

    const newUserButton = document.getElementById("newUserButton");
    const userModal = document.getElementById("userModal");
    const userModalTitle = document.getElementById("userModalTitle");
    const userForm = document.getElementById("userForm");
    const userId = document.getElementById("userId");
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const userRole = document.getElementById("userRole");
    const userPassword = document.getElementById("userPassword");
    const userPasswordHelp = document.getElementById("userPasswordHelp");
    const saveUserButton = document.getElementById("saveUserButton");

    let currentUsers = [];

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function showMessage(text, type = "success") {
        if (!message) return;
        message.textContent = text;
        message.className = `message ${type}`;
    }

    function renderUsers(users) {
        if (!table || !tableContainer || !empty) return;

        currentUsers = users;
        table.innerHTML = "";
        tableContainer.classList.toggle("hidden", users.length === 0);
        empty.classList.toggle("hidden", users.length !== 0);

        table.innerHTML = users.map((user) => {
            const createdAt = user.created_at
                ? new Date(String(user.created_at).replace(" ", "T")).toLocaleString("pt-BR")
                : "—";

            const isAdmin = user.role === "admin";
            const roleBadge = isAdmin
                ? '<span class="status active">Administrador</span>'
                : '<span class="status" style="background: #f3f4f6; color: #4b5563;">Cliente</span>';

            return `
                <tr>
                    <td>#${escapeHtml(user.id)}</td>
                    <td>${escapeHtml(user.name)}</td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>${roleBadge}</td>
                    <td>${escapeHtml(createdAt)}</td>
                    <td>
                        <div class="actions">
                            <button
                                type="button"
                                class="action-button"
                                data-user-edit="${user.id}"
                            >
                                Editar
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join("");
    }

    async function loadUsers() {
        if (!loading || !tableContainer || !empty) return;

        loading.classList.remove("hidden");
        tableContainer.classList.add("hidden");
        empty.classList.add("hidden");

        try {
            const result = await getUsuarios();
            const users = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
            renderUsers(users);
        } catch (error) {
            showMessage(error.message || "Erro ao carregar usuários.", "error");
        } finally {
            loading.classList.add("hidden");
        }
    }

    function openNewUserModal() {
        if (!userForm || !userModal) return;

        userForm.reset();
        userId.value = "";
        userModalTitle.textContent = "Novo usuário";
        userPassword.required = true;
        userPassword.placeholder = "Mínimo de 6 caracteres";
        userPasswordHelp?.classList.add("hidden");
        userModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    function openEditUserModal(user) {
        if (!userForm || !userModal) return;

        userId.value = user.id;
        userName.value = user.name || "";
        userEmail.value = user.email || "";
        userRole.value = user.role || "customer";
        userPassword.value = "";
        userPassword.required = false;
        userPassword.placeholder = "Preencha apenas para alterar";
        userPasswordHelp?.classList.remove("hidden");
        userModalTitle.textContent = "Editar usuário";
        userModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    function closeUserModal() {
        if (!userModal) return;
        userModal.classList.add("hidden");
        document.body.style.overflow = "";
    }

    async function handleUserSubmit(event) {
        event.preventDefault();

        saveUserButton.disabled = true;
        saveUserButton.textContent = "Salvando...";

        try {
            const isEdit = Boolean(userId.value);
            const data = {
                name: userName.value.trim(),
                email: userEmail.value.trim(),
                role: userRole.value
            };

            if (!data.name) {
                throw new Error("Informe o nome do usuário.");
            }

            if (!data.email) {
                throw new Error("Informe o e-mail do usuário.");
            }

            if (!isEdit && !userPassword.value) {
                throw new Error("Informe a senha do novo usuário.");
            }

            if (userPassword.value) {
                data.password = userPassword.value;
            }

            if (isEdit) {
                await atualizarUsuario(Number(userId.value), data);
                showMessage("Usuário atualizado com sucesso.");
            } else {
                await criarUsuario(data);
                showMessage("Usuário cadastrado com sucesso.");
            }

            closeUserModal();
            await loadUsers();

            if (typeof loadDashboard === "function") {
                loadDashboard();
            }
        } catch (error) {
            showMessage(error.message || "Erro ao salvar usuário.", "error");
        } finally {
            saveUserButton.disabled = false;
            saveUserButton.textContent = "Salvar usuário";
        }
    }

    newUserButton?.addEventListener("click", openNewUserModal);
    userForm?.addEventListener("submit", handleUserSubmit);

    document.querySelectorAll("[data-user-close]").forEach((button) => {
        button.addEventListener("click", closeUserModal);
    });

    table?.addEventListener("click", async (event) => {
        const editButton = event.target.closest("[data-user-edit]");
        if (!editButton) return;

        const id = Number(editButton.dataset.userEdit);
        const user = currentUsers.find((u) => Number(u.id) === id);

        if (user) {
            openEditUserModal(user);
        } else {
            try {
                const result = await getUsuario(id);
                openEditUserModal(result.data || result);
            } catch (error) {
                showMessage(error.message || "Erro ao carregar dados do usuário.", "error");
            }
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            userModal &&
            !userModal.classList.contains("hidden")
        ) {
            closeUserModal();
        }
    });

    document.querySelector('[data-page="usuarios"]')?.addEventListener("click", loadUsers);

    loadUsers();
})();
