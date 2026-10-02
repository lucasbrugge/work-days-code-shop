(function () {
    const table = document.getElementById("ordersTable");
    const tableContainer = document.getElementById("ordersTableContainer");
    const loading = document.getElementById("ordersLoading");
    const empty = document.getElementById("ordersEmpty");
    const message = document.getElementById("orderMessage");
    const statusFilter = document.getElementById("orderFilterStatus");

    const statusLabels = {
        pending_payment: "Aguardando pagamento",
        paid: "Pago",
        shipped: "Enviado",
        delivered: "Entregue",
        cancelled: "Cancelado"
    };

    const transitions = {
        pending_payment: ["paid", "cancelled"],
        paid: ["shipped"],
        shipped: ["delivered"],
        delivered: [],
        cancelled: []
    };

    const money = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

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
        message.textContent = text;
        message.className = `message ${type}`;
    }

    function statusActions(order) {
        const nextStatuses = transitions[order.status] ?? [];
        if (!nextStatuses.length) return "—";

        const options = nextStatuses.map((status) =>
            `<option value="${status}">${statusLabels[status]}</option>`
        ).join("");

        return `
            <div class="order-status-action">
                <select aria-label="Novo status do pedido ${order.id}" data-order-status>
                    <option value="">Selecione</option>${options}
                </select>
                <button type="button" class="primary-button" data-save-order-status="${order.id}">
                    Salvar
                </button>
            </div>`;
    }

    function renderOrders(orders) {
        table.innerHTML = "";
        tableContainer.classList.toggle("hidden", orders.length === 0);
        empty.classList.toggle("hidden", orders.length !== 0);

        table.innerHTML = orders.map((order) => {
            const createdAt = order.created_at
                ? new Date(String(order.created_at).replace(" ", "T")).toLocaleString("pt-BR")
                : "—";

            return `
                <tr>
                    <td>#${order.id}<br><small>${escapeHtml(createdAt)}</small></td>
                    <td>${escapeHtml(order.user_name)}<br><small>${escapeHtml(order.user_email)}</small></td>
                    <td>${order.item_count}</td>
                    <td>${money.format(Number(order.total) || 0)}</td>
                    <td>${escapeHtml(statusLabels[order.status] ?? order.status)}</td>
                    <td>${statusActions(order)}</td>
                </tr>`;
        }).join("");
    }

    async function loadOrders() {
        loading.classList.remove("hidden");
        tableContainer.classList.add("hidden");
        empty.classList.add("hidden");

        try {
            const result = await getAdminOrders(statusFilter.value);
            renderOrders(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            showMessage(error.message || "Erro ao carregar pedidos.", "error");
        } finally {
            loading.classList.add("hidden");
        }
    }

    table.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-save-order-status]");
        if (!button) return;

        const row = button.closest("tr");
        const select = row?.querySelector("[data-order-status]");
        const status = select?.value;
        if (!status) {
            showMessage("Selecione o novo status do pedido.", "error");
            return;
        }

        if (status === "cancelled" && !window.confirm("Cancelar este pedido? Os itens disponíveis voltarão ao estoque.")) {
            return;
        }

        button.disabled = true;
        try {
            await updateAdminOrderStatus(button.dataset.saveOrderStatus, status);
            showMessage(`Pedido atualizado para "${statusLabels[status]}".`);
            await loadOrders();
        } catch (error) {
            showMessage(error.message || "Erro ao atualizar pedido.", "error");
            button.disabled = false;
        }
    });

    statusFilter.addEventListener("change", loadOrders);

    document.querySelector('[data-page="pedidos"]')?.addEventListener("click", loadOrders);
})();
