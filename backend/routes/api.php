<?php

require_once __DIR__ . '/Router.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../controllers/NotImplementedController.php';
require_once __DIR__ . '/../controllers/HealthController.php';

$router = new Router();

/*
|--------------------------------------------------------------------------
| HEALTH
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/health',
    function (): never {
        jsonResponse([
            'message' => 'API funcionando'
        ]);
    }
);

$router->get(
    '/api/health/db',
    fn () => HealthController::database()
);

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

$router->post(
    '/api/auth/register',
    fn () => NotImplementedController::handle('POST /api/auth/register')
);

$router->post(
    '/api/auth/login',
    fn () => NotImplementedController::handle('POST /api/auth/login')
);

$router->post(
    '/api/auth/logout',
    fn () => NotImplementedController::handle('POST /api/auth/logout')
);

$router->get(
    '/api/auth/me',
    fn () => NotImplementedController::handle('GET /api/auth/me')
);

/*
|--------------------------------------------------------------------------
| PROFILE
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/profile',
    fn () => NotImplementedController::handle('GET /api/profile')
);

$router->put(
    '/api/profile',
    fn () => NotImplementedController::handle('PUT /api/profile')
);

/*
|--------------------------------------------------------------------------
| ADDRESSES
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/addresses',
    fn () => NotImplementedController::handle('GET /api/addresses')
);

$router->post(
    '/api/addresses',
    fn () => NotImplementedController::handle('POST /api/addresses')
);

$router->put(
    '/api/addresses/{id}',
    fn ($id) => NotImplementedController::handle(
        "PUT /api/addresses/{$id}"
    )
);

$router->delete(
    '/api/addresses/{id}',
    fn ($id) => NotImplementedController::handle(
        "DELETE /api/addresses/{$id}"
    )
);

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/products',
    fn () => NotImplementedController::handle('GET /api/products')
);

$router->get(
    '/api/products/{id}',
    fn ($id) => NotImplementedController::handle(
        "GET /api/products/{$id}"
    )
);

/*
|--------------------------------------------------------------------------
| ADMIN - PRODUCTS
|--------------------------------------------------------------------------
*/

$router->post(
    '/api/admin/products',
    fn () => NotImplementedController::handle(
        'POST /api/admin/products'
    )
);

$router->put(
    '/api/admin/products/{id}',
    fn ($id) => NotImplementedController::handle(
        "PUT /api/admin/products/{$id}"
    )
);

$router->delete(
    '/api/admin/products/{id}',
    fn ($id) => NotImplementedController::handle(
        "DELETE /api/admin/products/{$id}"
    )
);

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/categories',
    fn () => NotImplementedController::handle(
        'GET /api/categories'
    )
);

/*
|--------------------------------------------------------------------------
| ADMIN - CATEGORIES
|--------------------------------------------------------------------------
*/

$router->post(
    '/api/admin/categories',
    fn () => NotImplementedController::handle(
        'POST /api/admin/categories'
    )
);

$router->put(
    '/api/admin/categories/{id}',
    fn ($id) => NotImplementedController::handle(
        "PUT /api/admin/categories/{$id}"
    )
);

$router->delete(
    '/api/admin/categories/{id}',
    fn ($id) => NotImplementedController::handle(
        "DELETE /api/admin/categories/{$id}"
    )
);

/*
|--------------------------------------------------------------------------
| CART
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/cart',
    fn () => NotImplementedController::handle(
        'GET /api/cart'
    )
);

$router->post(
    '/api/cart/items',
    fn () => NotImplementedController::handle(
        'POST /api/cart/items'
    )
);

$router->patch(
    '/api/cart/items/{id}',
    fn ($id) => NotImplementedController::handle(
        "PATCH /api/cart/items/{$id}"
    )
);

$router->delete(
    '/api/cart/items/{id}',
    fn ($id) => NotImplementedController::handle(
        "DELETE /api/cart/items/{$id}"
    )
);

/*
|--------------------------------------------------------------------------
| ORDERS
|--------------------------------------------------------------------------
*/

$router->post(
    '/api/orders',
    fn () => NotImplementedController::handle(
        'POST /api/orders'
    )
);

$router->get(
    '/api/orders',
    fn () => NotImplementedController::handle(
        'GET /api/orders'
    )
);

$router->get(
    '/api/orders/{id}',
    fn ($id) => NotImplementedController::handle(
        "GET /api/orders/{$id}"
    )
);

$router->post(
    '/api/orders/{id}/pay',
    fn ($id) => NotImplementedController::handle(
        "POST /api/orders/{$id}/pay"
    )
);

$router->post(
    '/api/orders/{id}/cancel',
    fn ($id) => NotImplementedController::handle(
        "POST /api/orders/{$id}/cancel"
    )
);

/*
|--------------------------------------------------------------------------
| ADMIN - ORDERS
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/admin/orders',
    fn () => NotImplementedController::handle(
        'GET /api/admin/orders'
    )
);

$router->patch(
    '/api/admin/orders/{id}/status',
    fn ($id) => NotImplementedController::handle(
        "PATCH /api/admin/orders/{$id}/status"
    )
);

/*
|--------------------------------------------------------------------------
| DISPATCH
|--------------------------------------------------------------------------
*/

$method = $_SERVER['REQUEST_METHOD'];

$uri = parse_url(
    $_SERVER['REQUEST_URI'],
    PHP_URL_PATH
);

$router->dispatch($method, $uri);
