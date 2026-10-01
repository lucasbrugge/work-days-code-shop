const API_URL = 'http://localhost:3000/api';

function getProducts() {
    return fetch(`${API_URL}/products`)
        .then(response => response.json())
        .catch(error => {
            console.error('Erro ao buscar produtos:', error);
            throw error;
        });
}



function createProduct(productData) {

    // {}
    return fetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Erro ao criar produto:', error);
        throw error;
    });
}