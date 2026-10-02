const API_CONFIG = {

    BASE_URL:
        "http://localhost:8000/api",

    ENDPOINTS: {

        login:
            "/auth/login",

        usuarios:
            "/admin/users",

        produtos:
            "/admin/products",

        categorias:
            "/categories"

    }

};


/**
 * Monta a URL completa da API.
 */
function getApiUrl(endpoint) {

    return `${API_CONFIG.BASE_URL}${endpoint}`;

}


/**
 * Converte o status HTTP em uma mensagem
 * amigável para o usuário.
 */
function getHttpErrorMessage(
    status,
    data
) {

    if (data?.message) {

        return data.message;

    }

    if (data?.error) {

        return data.error;

    }

    switch (status) {

        case 401:

            return (
                "Sua sessão não é válida. " +
                "Faça login novamente."
            );


        case 403:

            return (
                "Você não tem permissão " +
                "para realizar esta ação."
            );


        case 404:

            return (
                "O recurso solicitado " +
                "não foi encontrado."
            );


        case 409:

            return (
                "Não foi possível concluir a ação " +
                "porque existe um conflito com os dados."
            );


        case 422:

            return (
                "Os dados informados são inválidos. " +
                "Verifique os campos e tente novamente."
            );


        case 500:

            return (
                "Ocorreu um erro interno no servidor. " +
                "Tente novamente."
            );


        case 501:

            return (
                "Esta funcionalidade ainda não " +
                "está disponível no servidor."
            );


        default:

            return (
                `Erro na comunicação com o servidor ` +
                `(HTTP ${status}).`
            );

    }

}


/**
 * Faz uma requisição para a API.
 */
async function apiFetch(
    endpoint,
    options = {}
) {

    const token =
        sessionStorage.getItem("token") ||
        localStorage.getItem("auth_token");


    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    let response;


    try {

        response = await fetch(
            getApiUrl(endpoint),
            {
                ...options,
                headers
            }
        );

    } catch (error) {

        const networkError =
            new Error(
                "Não foi possível conectar ao servidor. " +
                "Verifique se a API está funcionando."
            );

        networkError.status = 0;
        networkError.data = null;
        networkError.originalError = error;

        throw networkError;

    }


    let data = null;


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        try {

            data =
                await response.json();

        } catch (error) {

            data = null;

        }

    } else {

        const text =
            await response.text();

        data =
            text || null;

    }


    if (!response.ok) {

        const message =
            getHttpErrorMessage(
                response.status,
                data
            );


        const error =
            new Error(message);


        error.status =
            response.status;


        error.data =
            data;


        throw error;

    }


    return data;

}


/**
 * Login administrativo.
 */
async function loginApi(
    username,
    password
) {

    return apiFetch(
        "/auth/login",
        {

            method: "POST",

            body:
                JSON.stringify({
                    username,
                    password
                })

        }
    );

}


/**
 * Lista usuários.
 *
 * O endpoint ainda não está disponível
 * no backend atual.
 */
async function getUsuarios() {

    return apiFetch(
        "/admin/users",
        {
            method: "GET"
        }
    );

}


/**
 * Cria usuário.
 *
 * O endpoint ainda não está disponível
 * no backend atual.
 */
async function criarUsuario(
    usuario
) {

    return apiFetch(
        "/admin/users",
        {

            method: "POST",

            body:
                JSON.stringify(usuario)

        }
    );

}


/**
 * Lista produtos.
 */
async function getProdutos() {

    return apiFetch(
        "/admin/products",
        {
            method: "GET"
        }
    );

}


/**
 * Lista pedidos para o painel administrativo.
 */
async function getAdminOrders(status = "") {

    const query = status
        ? `?status=${encodeURIComponent(status)}`
        : "";

    return apiFetch(
        `/admin/orders${query}`,
        { method: "GET" }
    );

}


/**
 * Atualiza o status de um pedido no painel administrativo.
 */
async function updateAdminOrderStatus(id, status) {

    return apiFetch(
        `/admin/orders/${encodeURIComponent(id)}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({ status })
        }
    );

}


/**
 * Busca um produto pelo ID.
 */
async function getProduto(
    id
) {

    return apiFetch(
        `/admin/products/${id}`,
        {
            method: "GET"
        }
    );

}


/**
 * Cria um produto.
 */
async function criarProduto(
    produto
) {

    return apiFetch(
        "/admin/products",
        {

            method: "POST",

            body:
                JSON.stringify(produto)

        }
    );

}


/**
 * Atualiza um produto.
 */
async function atualizarProduto(
    id,
    produto
) {

    return apiFetch(
        `/admin/products/${id}`,
        {

            method: "PUT",

            body:
                JSON.stringify(produto)

        }
    );

}


/**
 * Exclui permanentemente um produto,
 * quando o backend permitir.
 *
 * Sem force=true o backend apenas
 * desativa o produto.
 */
async function excluirProduto(
    id
) {

    return apiFetch(
        `/admin/products/${id}?force=true`,
        {
            method: "DELETE"
        }
    );

}


/**
 * Lista categorias.
 */
async function getCategorias() {

    const result =
        await apiFetch(
            "/categories",
            {
                method: "GET"
            }
        );


    if (Array.isArray(result)) {

        return result;

    }


    return result?.data || [];

}
