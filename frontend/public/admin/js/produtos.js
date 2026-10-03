const productModal =
    document.getElementById(
        "productModal"
    );


const newProductButton =
    document.getElementById(
        "newProductButton"
    );


const productForm =
    document.getElementById(
        "productForm"
    );


const productsTable =
    document.getElementById(
        "productsTable"
    );


const productsTableContainer =
    document.getElementById(
        "productsTableContainer"
    );


const productsLoading =
    document.getElementById(
        "productsLoading"
    );


const productsEmpty =
    document.getElementById(
        "productsEmpty"
    );

const productsListSummary =
    document.getElementById("productsListSummary");


const productMessage =
    document.getElementById(
        "productMessage"
    );


const productModalTitle =
    document.getElementById(
        "productModalTitle"
    );


const productCategory =
    document.getElementById(
        "productCategory"
    );


const productId =
    document.getElementById(
        "productId"
    );



/* FILTROS */

const productSearch =
    document.getElementById(
        "productSearch"
    );


const productFilterCategory =
    document.getElementById(
        "productFilterCategory"
    );


const productFilterStatus =
    document.getElementById(
        "productFilterStatus"
    );


const clearProductFilters =
    document.getElementById(
        "clearProductFilters"
    );



let products = [];


/*
 * Esta variável é exclusiva deste arquivo.
 * Ela não interfere no categorias.js.
 */

let productCategories = [];



function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}



function formatPrice(value) {

    return Number(value || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}



function showMessage(
    message,
    type = "success"
) {

    productMessage.textContent =
        message;


    productMessage.className =
        `message ${type}`;


    setTimeout(() => {

        productMessage.textContent =
            "";


        productMessage.className =
            "message";

    }, 4000);

}



/*
 * Retorna os produtos de acordo
 * com os filtros selecionados.
 */

function getFilteredProducts() {

    const search =
        productSearch.value
            .trim()
            .toLowerCase();


    const category =
        productFilterCategory.value;


    const status =
        productFilterStatus.value;


    return products.filter(
        product => {

            const name =
                String(
                    product.name || ""
                )
                .toLowerCase();


            const matchesSearch =
                !search ||
                name.includes(search);


            const matchesCategory =
                !category ||
                String(
                    product.category_id
                ) === String(category);


            const matchesStatus =
                !status ||
                String(
                    Boolean(
                        product.is_active
                    )
                ) === status;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );

        }
    );

}



function renderProducts() {

    productsTable.innerHTML =
        "";


    const filteredProducts =
        getFilteredProducts();

    if (productsListSummary) {
        productsListSummary.textContent =
            `Exibindo ${filteredProducts.length} de ${products.length} produto(s).`;
    }


    if (!filteredProducts.length) {

        productsTableContainer
            .classList.add(
                "hidden"
            );


        productsEmpty
            .classList.remove(
                "hidden"
            );


        productsEmpty.textContent =
            products.length
                ? "Nenhum produto corresponde aos filtros."
                : "Nenhum produto encontrado.";


        return;

    }


    productsEmpty
        .classList.add(
            "hidden"
        );


    productsTableContainer
        .classList.remove(
            "hidden"
        );


    filteredProducts.forEach(
        product => {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                Boolean(
                    product.is_active
                );


            const statusText =
                status
                    ? "Ativo"
                    : "Inativo";


            const statusClass =
                status
                    ? "active"
                    : "inactive";


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        product.name
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        product.category_name ||
                        product.category?.name ||
                        getCategoryName(
                            product.category_id
                        ) ||
                        "Sem categoria"
                    )}
                </td>

                <td>
                    ${formatPrice(
                        product.price
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        product.stock
                    )}
                </td>

                <td>
                    <span
                        class="status ${statusClass}"
                    >
                        ${statusText}
                    </span>
                </td>

                <td>

                    <div class="actions">

                        <button
                            type="button"
                            class="action-button"
                            data-edit="${product.id}"
                        >
                            Editar
                        </button>


                        <button
                            type="button"
                            class="action-button danger"
                            data-toggle="${product.id}"
                        >
                            ${
                                status
                                    ? "Desativar"
                                    : "Ativar"
                            }
                        </button>


                        <button
                            type="button"
                            class="action-button danger"
                            data-delete="${product.id}"
                        >
                            Excluir
                        </button>

                    </div>

                </td>

            `;


            productsTable.appendChild(
                row
            );

        }
    );

}



function getCategoryName(
    categoryId
) {

    const category =
        productCategories.find(
            item =>
                Number(item.id) ===
                Number(categoryId)
        );


    return category?.name || "";

}



async function loadProducts() {

    productsLoading
        .classList.remove(
            "hidden"
        );


    productsTableContainer
        .classList.add(
            "hidden"
        );


    productsEmpty
        .classList.add(
            "hidden"
        );


    try {

        const firstPage = await getProdutos(1, 100);
        products = Array.isArray(firstPage.data) ? firstPage.data : [];

        const lastPage = Math.max(1, Number(firstPage.meta?.last_page) || 1);
        for (let page = 2; page <= lastPage; page += 1) {
            const result = await getProdutos(page, 100);
            if (Array.isArray(result.data)) products.push(...result.data);
        }


        renderProducts();


    } catch (error) {

        console.error(error);


        products = [];


        productsTable.innerHTML =
            "";


        productsLoading.textContent =
            error.message ||
            "Não foi possível carregar os produtos.";


        showMessage(
            error.message ||
            "Erro ao carregar produtos.",
            "error"
        );


    } finally {

        productsLoading
            .classList.add(
                "hidden"
            );

    }

}



async function loadCategories() {

    try {

        productCategories =
            await getCategorias();


        /*
         * Categorias do formulário
         */

        productCategory.innerHTML =
            `
                <option value="">
                    Selecione uma categoria
                </option>
            `;


        /*
         * Categorias do filtro
         */

        productFilterCategory.innerHTML =
            `
                <option value="">
                    Todas as categorias
                </option>
            `;


        productCategories.forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category.id;


                option.textContent =
                    category.name;


                productCategory.appendChild(
                    option
                );


                const filterOption =
                    document.createElement(
                        "option"
                    );


                filterOption.value =
                    category.id;


                filterOption.textContent =
                    category.name;


                productFilterCategory.appendChild(
                    filterOption
                );

            }
        );


    } catch (error) {

        console.error(error);


        productCategory.innerHTML =
            `
                <option value="">
                    Erro ao carregar categorias
                </option>
            `;


        productFilterCategory.innerHTML =
            `
                <option value="">
                    Erro ao carregar categorias
                </option>
            `;


        showMessage(
            "Não foi possível carregar as categorias.",
            "error"
        );

    }

}



function openNewProductModal() {

    productForm.reset();


    productId.value =
        "";


    productModalTitle.textContent =
        "Novo produto";


    productModal
        .classList.remove(
            "hidden"
        );


    document.body.style.overflow =
        "hidden";

}



function openEditProductModal(
    product
) {

    productId.value =
        product.id;


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    productCategory.value =
        product.category_id || "";


    document.getElementById(
        "productPrice"
    ).value =
        product.price ?? "";


    document.getElementById(
        "productStock"
    ).value =
        product.stock ?? 0;


    document.getElementById(
        "productStatus"
    ).value =
        String(
            Boolean(
                product.is_active
            )
        );


    document.getElementById(
        "productImage"
    ).value =
        product.image_url || "";


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    productModalTitle.textContent =
        "Editar produto";


    productModal
        .classList.remove(
            "hidden"
        );


    document.body.style.overflow =
        "hidden";

}



function closeProductModal() {

    productModal
        .classList.add(
            "hidden"
        );


    document.body.style.overflow =
        "";

}



async function handleProductSubmit(
    event
) {

    event.preventDefault();


    const submitButton =
        document.getElementById(
            "saveProductButton"
        );


    submitButton.disabled =
        true;


    submitButton.textContent =
        "Salvando...";


    try {

        const data = {

            name:
                document.getElementById(
                    "productName"
                ).value.trim(),

            category_id:
                Number(
                    productCategory.value
                ),

            price:
                Number(
                    document.getElementById(
                        "productPrice"
                    ).value
                ),

            stock:
                Number(
                    document.getElementById(
                        "productStock"
                    ).value
                ),

            is_active:
                document.getElementById(
                    "productStatus"
                ).value === "true",

            image_url:
                document.getElementById(
                    "productImage"
                ).value.trim() ||
                null,

            description:
                document.getElementById(
                    "productDescription"
                ).value.trim() ||
                null

        };


        if (!data.category_id) {

            throw new Error(
                "Selecione uma categoria."
            );

        }


        let savedProduct;


        if (productId.value) {

            savedProduct =
                await atualizarProduto(
                    Number(
                        productId.value
                    ),
                    data
                );


            showMessage(
                "Produto atualizado com sucesso."
            );

        } else {

            savedProduct =
                await criarProduto(
                    data
                );


            showMessage(
                "Produto criado com sucesso."
            );

        }


        console.log(
            "Produto salvo pela API:",
            savedProduct
        );


        closeProductModal();


        await loadProducts();


    } catch (error) {

        console.error(error);


        showMessage(
            error.message ||
            "Não foi possível salvar o produto.",
            "error"
        );


    } finally {

        submitButton.disabled =
            false;


        submitButton.textContent =
            "Salvar produto";

    }

}



async function toggleProduct(
    id
) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!product) return;


    try {

        if (
            product.is_active
        ) {

            /*
             * DELETE sem force desativa
             * o produto no backend.
             */

            await apiFetch(
                `/admin/products/${id}`,
                {
                    method: "DELETE"
                }
            );


            showMessage(
                "Produto desativado com sucesso."
            );


        } else {

            await atualizarProduto(
                id,
                {
                    is_active: true
                }
            );


            showMessage(
                "Produto ativado com sucesso."
            );

        }


        await loadProducts();


    } catch (error) {

        console.error(error);


        showMessage(
            error.message ||
            "Não foi possível alterar o status.",
            "error"
        );

    }

}



async function deleteProduct(
    id
) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!product) return;


    const confirmed =
        confirm(
            `Tem certeza que deseja excluir o produto "${product.name}"?`
        );


    if (!confirmed) return;


    try {

        const result =
            await excluirProduto(
                id
            );


        const data =
            result?.data ??
            result;


        if (
            data?.deleted === true
        ) {

            showMessage(
                "Produto excluído permanentemente com sucesso."
            );


        } else if (
            data?.deactivated === true
        ) {

            showMessage(
                "O produto possui registros vinculados e foi desativado em vez de excluído permanentemente.",
                "error"
            );


        } else {

            showMessage(
                data?.message ||
                "O produto não foi excluído permanentemente.",
                "error"
            );

        }


        await loadProducts();


    } catch (error) {

        console.error(error);


        showMessage(
            error.message ||
            "Não foi possível excluir o produto.",
            "error"
        );

    }

}



/* EVENTOS DA TABELA */

productsTable.addEventListener(
    "click",
    async event => {

        const editButton =
            event.target.closest(
                "[data-edit]"
            );


        if (editButton) {

            const product =
                products.find(
                    item =>
                        Number(item.id) ===
                        Number(
                            editButton.dataset.edit
                        )
                );


            if (product) {

                openEditProductModal(
                    product
                );

            }


            return;

        }


        const toggleButton =
            event.target.closest(
                "[data-toggle]"
            );


        if (toggleButton) {

            await toggleProduct(
                toggleButton.dataset.toggle
            );


            return;

        }


        const deleteButton =
            event.target.closest(
                "[data-delete]"
            );


        if (deleteButton) {

            await deleteProduct(
                deleteButton.dataset.delete
            );

        }

    }
);



/* FILTROS */

productSearch.addEventListener(
    "input",
    renderProducts
);


productFilterCategory.addEventListener(
    "change",
    renderProducts
);


productFilterStatus.addEventListener(
    "change",
    renderProducts
);


clearProductFilters.addEventListener(
    "click",
    () => {

        productSearch.value =
            "";


        productFilterCategory.value =
            "";


        productFilterStatus.value =
            "";


        renderProducts();

    }
);



/* MODAL */

newProductButton.addEventListener(
    "click",
    openNewProductModal
);


productForm.addEventListener(
    "submit",
    handleProductSubmit
);


document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                closeProductModal
            );

        }
    );



document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !productModal.classList.contains(
                "hidden"
            )
        ) {

            closeProductModal();

        }

    }
);



loadCategories();

loadProducts();
