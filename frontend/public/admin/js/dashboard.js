const userModal = document.getElementById("userModal");
const newUserButton = document.getElementById("newUserButton");
const userForm = document.getElementById("userForm");

const usersTable = document.getElementById("usersTable");
const recentUsers = document.getElementById("recentUsers");
const totalUsers = document.getElementById("totalUsers");


/*
|--------------------------------------------------------------------------
| ABRIR MODAL
|--------------------------------------------------------------------------
*/

if (newUserButton && userModal) {

    newUserButton.addEventListener("click", function () {

        userModal.classList.remove("hidden");

        document.body.style.overflow = "hidden";

    });

}


/*
|--------------------------------------------------------------------------
| CADASTRAR USUÁRIO
|--------------------------------------------------------------------------
*/

if (userForm) {

    userForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        /*
        |--------------------------------------------------------------------------
        | BOTÃO
        |--------------------------------------------------------------------------
        */

        const submitButton =
            userForm.querySelector(
                'button[type="submit"]'
            );


        const originalText =
            submitButton.innerHTML;


        /*
        |--------------------------------------------------------------------------
        | ATIVA LOADING
        |--------------------------------------------------------------------------
        */

        submitButton.disabled = true;

        submitButton.innerHTML = `
            <span class="button-loading">
                <span class="spinner"></span>
                Salvando...
            </span>
        `;


        try {

            /*
            |--------------------------------------------------------------------------
            | PEGA OS DADOS DO FORMULÁRIO
            |--------------------------------------------------------------------------
            */

            const name =
                document.getElementById("userName").value.trim();


            const email =
                document.getElementById("userEmail").value.trim();


            const password =
                document.getElementById("userPassword").value;


            const profile =
                document.getElementById("userProfile").value;


            const status =
                document.getElementById("userStatus").value;


            /*
            |--------------------------------------------------------------------------
            | OBJETO PARA API
            |--------------------------------------------------------------------------
            */

            const userData = {

                name: name,

                email: email,

                password: password,

                profile: profile,

                status: status

            };


            console.log(
                "Enviando usuário:",
                userData
            );


            /*
            |--------------------------------------------------------------------------
            | FETCH
            |--------------------------------------------------------------------------
            |
            | Altere esta URL para a sua API.
            |
            */

            const response = await fetch(
                "/api/usuarios",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(userData)
                }
            );


            /*
            |--------------------------------------------------------------------------
            | VERIFICA ERRO HTTP
            |--------------------------------------------------------------------------
            */

            if (!response.ok) {

                throw new Error(
                    "Erro ao cadastrar usuário."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | RESPOSTA DA API
            |--------------------------------------------------------------------------
            */

            const data =
                await response.json();


            console.log(
                "Usuário cadastrado:",
                data
            );


            /*
            |--------------------------------------------------------------------------
            | STATUS
            |--------------------------------------------------------------------------
            */

            const statusClass =
                status === "Ativo"
                    ? "active"
                    : "inactive";


            /*
            |--------------------------------------------------------------------------
            | ADICIONA NA TABELA DE USUÁRIOS
            |--------------------------------------------------------------------------
            */

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>${name}</td>

                <td>${email}</td>

                <td>${profile}</td>

                <td>
                    <span class="status ${statusClass}">
                        ${status}
                    </span>
                </td>
            `;


            usersTable.appendChild(row);


            /*
            |--------------------------------------------------------------------------
            | ADICIONA NO DASHBOARD
            |--------------------------------------------------------------------------
            */

            if (recentUsers) {

                const recentRow =
                    row.cloneNode(true);

                recentUsers.appendChild(
                    recentRow
                );

            }


            /*
            |--------------------------------------------------------------------------
            | ATUALIZA TOTAL
            |--------------------------------------------------------------------------
            */

            if (totalUsers) {

                const currentTotal =
                    Number(
                        totalUsers.textContent
                    );


                totalUsers.textContent =
                    currentTotal + 1;

            }


            /*
            |--------------------------------------------------------------------------
            | LIMPA FORMULÁRIO
            |--------------------------------------------------------------------------
            */

            userForm.reset();


            /*
            |--------------------------------------------------------------------------
            | FECHA MODAL
            |--------------------------------------------------------------------------
            */

            userModal.classList.add("hidden");

            document.body.style.overflow = "";


        } catch (error) {

            /*
            |--------------------------------------------------------------------------
            | ERRO
            |--------------------------------------------------------------------------
            */

            console.error(
                "Erro ao cadastrar usuário:",
                error
            );


            alert(
                "Não foi possível cadastrar o usuário."
            );


        } finally {

            /*
            |--------------------------------------------------------------------------
            | REMOVE LOADING
            |--------------------------------------------------------------------------
            */

            submitButton.disabled = false;

            submitButton.innerHTML =
                originalText;

        }

    });

}