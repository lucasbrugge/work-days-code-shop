<?php

require_once __DIR__ . '/Router.php';
require_once __DIR__ . '/../helpers/response.php';

require_once __DIR__ . '/../controllers/NotImplementedController.php';
require_once __DIR__ . '/../controllers/HealthController.php';
require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../controllers/AuthController.php';

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/AdminMiddleware.php';

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
    fn () => AuthController::register()
);

$router->post(
    '/api/auth/login',
    fn () => AuthController::login()
);

$router->post(
    '/api/auth/logout',
    fn () => AuthController::logout(),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

$router->get(
    '/api/auth/me',
    fn () => AuthController::me(),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

/*
|--------------------------------------------------------------------------
| PROFILE
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/profile',
    fn () => NotImplementedController::handle(
        'GET /api/profile'
    ),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

$router->put(
    '/api/profile',
    fn () => NotImplementedController::handle(
        'PUT /api/profile'
    ),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

/*
|--------------------------------------------------------------------------
| ADDRESSES
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/addresses',
    fn () => NotImplementedController::handle(
        'GET /api/addresses'
    ),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

$router->post(
    '/api/addresses',
    fn () => NotImplementedController::handle(
        'POST /api/addresses'
    ),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

$router->put(
    '/api/addresses/{id}',
    fn ($id) => NotImplementedController::handle(
        "PUT /api/addresses/{$id}"
    ),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

$router->delete(
    '/api/addresses/{id}',
    fn ($id) => NotImplementedController::handle(
        "DELETE /api/addresses/{$id}"
    ),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/products',
    fn () => ProductController::index()
);

$router->get(
    '/api/products/{id}',
    fn ($id) => ProductController::show($id)
);

/*
|--------------------------------------------------------------------------
| ADMIN - PRODUCTS
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/admin/products',
    fn () => ProductController::adminIndex()
);

$router->get(
    '/api/admin/products/{id}',
    fn ($id) => ProductController::adminShow($id)
);

$router->post(
    '/api/admin/products',
    fn () => ProductController::store()
);

$router->put(
    '/api/admin/products/{id}',
    fn ($id) => ProductController::update($id)
);

$router->delete(
    '/api/admin/products/{id}',
    fn ($id) => ProductController::destroy($id)
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
    ),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

$router->get(
    '/api/orders',
    fn () => NotImplementedController::handle(
        'GET /api/orders'
    ),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

$router->get(
    '/api/orders/{id}',
    fn ($id) => NotImplementedController::handle(
        "GET /api/orders/{$id}"
    ),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

$router->post(
    '/api/orders/{id}/pay',
    fn ($id) => NotImplementedController::handle(
        "POST /api/orders/{$id}/pay"
    ),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);

$router->post(
    '/api/orders/{id}/cancel',
    fn ($id) => NotImplementedController::handle(
        "POST /api/orders/{$id}/cancel"
    ),
    [
        fn () => AuthMiddleware::requireAuth()
    ]
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
