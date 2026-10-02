(function () {

    const categoriesTable =
        document.getElementById(
            "categoriesTable"
        );


    const categoriesTableContainer =
        document.getElementById(
            "categoriesTableContainer"
        );


    const categoriesLoading =
        document.getElementById(
            "categoriesLoading"
        );


    const categoriesEmpty =
        document.getElementById(
            "categoriesEmpty"
        );


    const categoryMessage =
        document.getElementById(
            "categoryMessage"
        );


    const categoryModal =
        document.getElementById(
            "categoryModal"
        );


    const categoryModalTitle =
        document.getElementById(
            "categoryModalTitle"
        );


    const categoryForm =
        document.getElementById(
            "categoryForm"
        );


    const categoryId =
        document.getElementById(
            "categoryId"
        );


    const categoryName =
        document.getElementById(
            "categoryName"
        );


    const categorySlug =
        document.getElementById(
            "categorySlug"
        );


    const newCategoryButton =
        document.getElementById(
            "newCategoryButton"
        );


    const saveCategoryButton =
        document.getElementById(
            "saveCategoryButton"
        );



    let categories = [];



    function showCategoryMessage(
        message,
        type = "success"
    ) {

        categoryMessage.textContent =
            message;


        categoryMessage.className =
            `message ${type}`;


        setTimeout(() => {

            categoryMessage.textContent =
                "";


            categoryMessage.className =
                "message";

        }, 4000);

    }



    function escapeHtml(value) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            String(value ?? "");


        return div.innerHTML;

    }



    function renderCategories() {

        categoriesTable.innerHTML =
            "";


        if (!categories.length) {

            categoriesTableContainer
                .classList.add(
                    "hidden"
                );


            categoriesEmpty
                .classList.remove(
                    "hidden"
                );


            return;

        }


        categoriesEmpty
            .classList.add(
                "hidden"
            );


        categoriesTableContainer
            .classList.remove(
                "hidden"
            );


        categories.forEach(
            category => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            category.id
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            category.name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            category.slug
                        )}
                    </td>

                    <td>

                        <div class="actions">

                            <button
                                type="button"
                                class="action-button"
                                data-category-edit="${category.id}"
                            >
                                Editar
                            </button>


                            <button
                                type="button"
                                class="action-button danger"
                                data-category-delete="${category.id}"
                            >
                                Excluir
                            </button>

                        </div>

                    </td>

                `;


                categoriesTable.appendChild(
                    row
                );

            }
        );

    }



    async function loadCategories() {

        categoriesLoading
            .classList.remove(
                "hidden"
            );


        categoriesTableContainer
            .classList.add(
                "hidden"
            );


        categoriesEmpty
            .classList.add(
                "hidden"
            );


        try {

            categories =
                await getCategorias();


            renderCategories();


        } catch (error) {

            console.error(
                "Erro ao carregar categorias:",
                error
            );


            categories =
                [];


            categoriesLoading.textContent =
                error.message ||
                "Não foi possível carregar as categorias.";


            showCategoryMessage(
                error.message ||
                "Erro ao carregar categorias.",
                "error"
            );


        } finally {

            categoriesLoading
                .classList.add(
                    "hidden"
                );

        }

    }



    function openNewCategoryModal() {

        categoryForm.reset();


        categoryId.value =
            "";


        categoryModalTitle.textContent =
            "Nova categoria";


        categoryModal
            .classList.remove(
                "hidden"
            );


        document.body.style.overflow =
            "hidden";

    }



    function openEditCategoryModal(
        category
    ) {

        categoryId.value =
            category.id;


        categoryName.value =
            category.name || "";


        categorySlug.value =
            category.slug || "";


        categoryModalTitle.textContent =
            "Editar categoria";


        categoryModal
            .classList.remove(
                "hidden"
            );


        document.body.style.overflow =
            "hidden";

    }



    function closeCategoryModal() {

        categoryModal
            .classList.add(
                "hidden"
            );


        document.body.style.overflow =
            "";

    }



    async function handleCategorySubmit(
        event
    ) {

        event.preventDefault();


        saveCategoryButton.disabled =
            true;


        saveCategoryButton.textContent =
            "Salvando...";


        try {

            const data = {

                name:
                    categoryName.value.trim(),

                slug:
                    categorySlug.value.trim()

            };


            if (!data.name) {

                throw new Error(
                    "Informe o nome da categoria."
                );

            }


            if (!data.slug) {

                throw new Error(
                    "Informe o slug da categoria."
                );

            }


            if (categoryId.value) {

                await atualizarCategoria(
                    Number(
                        categoryId.value
                    ),
                    data
                );


                showCategoryMessage(
                    "Categoria atualizada com sucesso."
                );

            } else {

                await criarCategoria(
                    data
                );


                showCategoryMessage(
                    "Categoria criada com sucesso."
                );

            }


            closeCategoryModal();


            await loadCategories();


        } catch (error) {

            console.error(
                "Erro ao salvar categoria:",
                error
            );


            showCategoryMessage(
                error.message ||
                "Não foi possível salvar a categoria.",
                "error"
            );


        } finally {

            saveCategoryButton.disabled =
                false;


            saveCategoryButton.textContent =
                "Salvar categoria";

        }

    }



    async function deleteCategory(
        id
    ) {

        const category =
            categories.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!category) return;


        const confirmed =
            confirm(
                `Tem certeza que deseja excluir a categoria "${category.name}"?`
            );


        if (!confirmed) return;


        try {

            await excluirCategoria(
                id
            );


            showCategoryMessage(
                "Categoria excluída com sucesso."
            );


            await loadCategories();


        } catch (error) {

            console.error(
                "Erro ao excluir categoria:",
                error
            );


            showCategoryMessage(
                error.message ||
                "Não foi possível excluir a categoria.",
                "error"
            );

        }

    }



    categoriesTable.addEventListener(
        "click",
        event => {

            const editButton =
                event.target.closest(
                    "[data-category-edit]"
                );


            if (editButton) {

                const category =
                    categories.find(
                        item =>
                            Number(item.id) ===
                            Number(
                                editButton.dataset
                                    .categoryEdit
                            )
                    );


                if (category) {

                    openEditCategoryModal(
                        category
                    );

                }


                return;

            }


            const deleteButton =
                event.target.closest(
                    "[data-category-delete]"
                );


            if (deleteButton) {

                deleteCategory(
                    deleteButton.dataset
                        .categoryDelete
                );

            }

        }
    );



    newCategoryButton.addEventListener(
        "click",
        openNewCategoryModal
    );



    categoryForm.addEventListener(
        "submit",
        handleCategorySubmit
    );



    document
        .querySelectorAll(
            "[data-category-close]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    closeCategoryModal
                );

            }
        );



    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !categoryModal.classList.contains(
                    "hidden"
                )
            ) {

                closeCategoryModal();

            }

        }
    );



    loadCategories();

})();